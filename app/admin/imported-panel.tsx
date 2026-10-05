"use client";

import { useEffect, useState } from "react";

type ImportedItem = {
  sourceUrl: string;
  slug: string;
  cleanTitle: string;
  section: string;
  fileCount: number;
  isHidden: boolean;
  override: { title?: string } | null;
};

const SECTION_LABELS: Record<string, string> = {
  about: "Դպրոցի մասին",
  councils: "Խորհուրդներ",
  learning: "Ուսումնական գործընթաց",
  events: "Դպրոցի անցուդարձ",
  staff: "Անձնակազմ",
  resources: "Շենք և ռեսուրսներ",
  students: "Աշակերտներ",
  creativity: "Ստեղծագործություններ",
  competitions: "Մրցույթներ",
  contact: "Կապ",
};

const ALL_SECTIONS = ["about", "councils", "learning", "events", "staff", "resources", "students", "creativity", "competitions", "contact"] as const;

export function ImportedPanel() {
  const [items, setItems] = useState<ImportedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [filterSection, setFilterSection] = useState("all");

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/imported");
      const data = (await res.json()) as ImportedItem[];
      setItems(data);
    } catch {
      setMessage("Չհաջողվեց բեռնել նյութերը։");
    } finally {
      setLoading(false);
    }
  }

  async function toggleHide(item: ImportedItem) {
    const url = new URL("/api/imported", window.location.href);
    url.searchParams.set("sourceUrl", item.sourceUrl);
    if (item.isHidden) url.searchParams.set("restore", "true");

    const res = await fetch(url.toString(), { method: "DELETE" });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i.sourceUrl === item.sourceUrl ? { ...i, isHidden: !i.isHidden } : i,
        ),
      );
      setMessage(
        item.isHidden
          ? "Նյութը վերականգնվեց հանրային կայքում։"
          : "Նյութը թաքցվեց հանրային կայքից։",
      );
    }
  }

  function startEdit(item: ImportedItem) {
    setEditingUrl(item.sourceUrl);
    setEditTitle(item.override?.title ?? item.cleanTitle);
    setMessage("");
  }

  async function saveEdit(sourceUrl: string) {
    const res = await fetch("/api/imported", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl, title: editTitle }),
    });
    if (res.ok) {
      const trimmed = editTitle.trim();
      setItems((prev) =>
        prev.map((i) =>
          i.sourceUrl === sourceUrl
            ? { ...i, override: trimmed ? { title: trimmed } : null }
            : i,
        ),
      );
      setEditingUrl(null);
      setMessage("Վերնագիրը փոխվեց։");
    }
  }

  const filtered = items.filter((item) => {
    if (!showHidden && item.isHidden) return false;
    if (filterSection !== "all" && item.section !== filterSection) return false;
    return true;
  });

  const hiddenCount = items.filter((i) => i.isHidden).length;

  if (loading) return <p className="empty-files">Բեռնվում է...</p>;

  return (
    <div className="imported-panel">
      {/* Toolbar */}
      <div className="imported-toolbar">
        <div className="imported-filters">
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option value="all">Բոլոր բաժինները ({items.length})</option>
            {ALL_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {SECTION_LABELS[s]} ({items.filter((i) => i.section === s).length})
              </option>
            ))}
          </select>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            Ցույց տալ թաքցվածները ({hiddenCount})
          </label>
        </div>
        {message ? (
          <p className="admin-hint" style={{ margin: 0 }}>
            {message}
          </p>
        ) : null}
      </div>

      {/* Ցանկ */}
      <div className="imported-list">
        {filtered.length === 0 && (
          <p className="empty-files">Ընտրված զտիչով նյութեր չկան։</p>
        )}

        {filtered.map((item) => (
          <article
            key={item.sourceUrl}
            className={`imported-item${item.isHidden ? " imported-item--hidden" : ""}`}
          >
            <div className="imported-item-main">
              <div className="imported-item-meta">
                <span className="imported-badge">
                  {SECTION_LABELS[item.section] ?? item.section}
                </span>
                {item.isHidden && (
                  <span className="imported-badge imported-badge--hidden">Թաքցված</span>
                )}
                {item.override?.title && (
                  <span className="imported-badge imported-badge--edited">Փոփոխված</span>
                )}
                {item.fileCount > 0 && (
                  <span className="imported-file-count">{item.fileCount} ֆայլ</span>
                )}
              </div>

              {editingUrl === item.sourceUrl ? (
                <div className="imported-edit-row">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Նոր վերնագիր..."
                    autoFocus
                  />
                  <div className="admin-item-actions">
                    <button type="button" onClick={() => saveEdit(item.sourceUrl)}>
                      Պահպանել
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditingUrl(null)}
                    >
                      Չեղարկել
                    </button>
                  </div>
                </div>
              ) : (
                <h4 className="imported-item-title">
                  {item.override?.title ?? item.cleanTitle}
                </h4>
              )}
            </div>

            <div className="admin-item-actions">
              {editingUrl !== item.sourceUrl && (
                <button type="button" onClick={() => startEdit(item)}>
                  Խմբագրել
                </button>
              )}
              <button
                type="button"
                className={item.isHidden ? "secondary-button" : "danger-button"}
                onClick={() => toggleHide(item)}
              >
                {item.isHidden ? "Վերականգնել" : "Թաքցնել"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
