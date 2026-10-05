"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { groupFilesByYear, type ImportedFile } from "../imported-content";
import { sections } from "../data";
import { parseFileLinks, type AdminEntry, type UploadFile } from "../user-materials";

const firstSection = sections[0];
const firstPage = firstSection.links[0];

type FormState = {
  title: string;
  sectionSlug: string;
  pageSlug: string;
  body: string;
  files: string; // manual links textarea
};

const emptyForm: FormState = {
  title: "",
  sectionSlug: firstSection.slug,
  pageSlug: firstPage.slug,
  body: "",
  files: "",
};

/** Renders a material card exactly as it appears on the public page */
function MaterialPreviewCard({ entry }: { entry: AdminEntry }) {
  return (
    <article className="material-card material-card--preview">
      <div>
        <span className="material-date">{entry.date}</span>
        <h4>{entry.title}</h4>
        <p>{entry.body}</p>
      </div>
      {entry.files.length > 0 ? (
        <div className="year-file-groups">
          {groupFilesByYear(entry.files).map(([year, files]) => (
            <div className="year-file-group" key={year}>
              <strong>{year}</strong>
              <div className="file-list">
                {files.map((file) => (
                  <a
                    href={file.href}
                    target="_blank"
                    rel="noreferrer"
                    key={`${entry.id}-${file.href}`}
                  >
                    {file.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function AdminPanel() {
  const router = useRouter();
  const [activeTab] = useState<"materials">("materials");
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Files kept from the original entry (chips with ×)
  const [keptFiles, setKeptFiles] = useState<ImportedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [showOnlySelectedPage, setShowOnlySelectedPage] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  const selectedSection =
    sections.find((section) => section.slug === form.sectionSlug) ?? firstSection;
  const selectedPage =
    selectedSection.links.find((page) => page.slug === form.pageSlug) ??
    selectedSection.links[0];

  const visibleEntries = useMemo(() => {
    let result = showOnlySelectedPage
      ? entries.filter(
          (entry) =>
            entry.sectionSlug === selectedSection.slug &&
            entry.pageSlug === selectedPage.slug,
        )
      : entries;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.body.toLowerCase().includes(q) ||
          entry.sectionTitle.toLowerCase().includes(q) ||
          entry.pageTitle.toLowerCase().includes(q),
      );
    }
    return result;
  }, [entries, selectedPage.slug, selectedSection.slug, showOnlySelectedPage, searchQuery]);

  // Warn before leaving with unsaved form data
  useEffect(() => {
    const hasData = form.title.trim() || form.body.trim() || form.files.trim();
    if (!hasData) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.title, form.body, form.files]);

  useEffect(() => {
    fetch("/api/materials")
      .then((response) => response.json())
      .then((data: AdminEntry[]) => setEntries(data))
      .catch(() => setMessage("Չհաջողվեց բեռնել նյութերը։"));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  function updateSection(sectionSlug: string) {
    const section = sections.find((item) => item.slug === sectionSlug) ?? firstSection;
    setForm((current) => ({
      ...current,
      sectionSlug: section.slug,
      pageSlug: section.links[0].slug,
    }));
  }

  async function uploadSelectedFiles(files: FileList | null) {
    if (!files || files.length === 0) return [];
    const uploaded: UploadFile[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Upload failed: ${file.name}`);
      const result = (await response.json()) as UploadFile;
      uploaded.push({ text: result.name ?? file.name, href: result.href });
    }
    return uploaded;
  }

  /** Remove one file chip and delete the physical file if it was uploaded */
  async function removeKeptFile(file: ImportedFile) {
    setKeptFiles((prev) => prev.filter((f) => f.href !== file.href));
    if (file.href.startsWith("/uploads/")) {
      await fetch(`/api/upload?href=${encodeURIComponent(file.href)}`, {
        method: "DELETE",
      });
    }
  }

  function resetForm() {
    setEditingId(null);
    setKeptFiles([]);
    setSavedEntryId(null);
    setForm((current) => ({
      ...emptyForm,
      sectionSlug: current.sectionSlug,
      pageSlug: current.pageSlug,
    }));
  }

  function startEdit(entry: AdminEntry) {
    setEditingId(entry.id);
    setKeptFiles([...entry.files]); // existing files shown as chips
    setSavedEntryId(null);
    setPreviewId(null);
    setForm({
      title: entry.title,
      sectionSlug: entry.sectionSlug,
      pageSlug: entry.pageSlug,
      body: entry.body,
      files: "", // textarea only for NEW manual links
    });
    setMessage("Խմբագրելի Վիչակ։ կարող ես նաև ավելացնել նոր ֆայլեր։");
  }

  async function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setMessage("Լրացրեծ Վերնագիրը և Բովանդակությունը։");
      return;
    }
    const formElement = event.currentTarget;
    const fileInput = formElement.elements.namedItem("uploadFiles") as HTMLInputElement | null;
    setIsSaving(true);
    setMessage("");
    try {
      const uploadedFiles = await uploadSelectedFiles(fileInput?.files ?? null);
      const manualFiles = parseFileLinks(form.files);
      // Final file list = kept (original minus removed) + new uploads + new manual links
      const allFiles = [...keptFiles, ...uploadedFiles, ...manualFiles];
      const payload = {
        title: form.title.trim(),
        sectionSlug: selectedSection.slug,
        sectionTitle: selectedSection.title,
        pageSlug: selectedPage.slug,
        pageTitle: selectedPage.title,
        body: form.body.trim(),
        files: allFiles,
      };
      const response = await fetch("/api/materials", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? {
                ...payload,
                id: editingId,
                date:
                  entries.find((entry) => entry.id === editingId)?.date ??
                  new Date().toISOString().slice(0, 10),
              }
            : payload,
        ),
      });
      if (!response.ok) throw new Error("Save failed");
      const savedEntry = (await response.json()) as AdminEntry;
      setEntries((current) =>
        editingId
          ? current.map((entry) =>
              entry.id === savedEntry.id ? savedEntry : entry,
            )
          : [savedEntry, ...current],
      );
      if (fileInput) fileInput.value = "";
      setSavedEntryId(savedEntry.id);
      setEditingId(null);
      setKeptFiles([]);
      setForm((current) => ({
        ...emptyForm,
        sectionSlug: current.sectionSlug,
        pageSlug: current.pageSlug,
      }));
      setMessage(
        editingId ? "Նյութը թարմացվեց։" : "Նյութը Պահպանվեց։",
      );
    } catch {
      setMessage("Չի հաջողվեց Պահպանել նյութը։");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEntry(entry: AdminEntry) {
    const confirmed = window.confirm(
      `Հեռացնե՞լ «${entry.title}» նյութը։`,
    );
    if (!confirmed) return;
    try {
      const response = await fetch(
        `/api/materials?id=${encodeURIComponent(entry.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Delete failed");

      // Once the material has been removed, clean up any files it had uploaded.
      await Promise.all(
        entry.files
          .filter((file) => file.href.startsWith("/uploads/"))
          .map((file) =>
            fetch(`/api/upload?href=${encodeURIComponent(file.href)}`, {
              method: "DELETE",
            }),
          ),
      );
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      if (editingId === entry.id) resetForm();
      if (savedEntryId === entry.id) setSavedEntryId(null);
      setMessage("Նյութը ջնջվեց։");
    } catch {
      setMessage("Չհաջողվեց հեռացնել նյութը։ Կրկին մուտք գործեք admin էջ և փորձեք նորից։ ");
    }
  }

  const savedEntry = savedEntryId
    ? entries.find((e) => e.id === savedEntryId)
    : null;

  return (
    <div>
      {/* Tab bar + Logout */}
      <div className="admin-tab-bar">
        <div className="admin-tabs">
          <button
            type="button"
            className="admin-tab admin-tab--active"
          >
            Ավելացված նյութեր
          </button>
        </div>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Ելք
        </button>
      </div>

      <section className="admin-grid">
          <form className="admin-form" onSubmit={saveEntry}>
            <fieldset>
              <legend>1. Որտեղ տեղադրել</legend>
              <label>
                Բաժին
                <select
                  value={form.sectionSlug}
                  onChange={(event) => updateSection(event.target.value)}
                >
                  {sections.map((section) => (
                    <option value={section.slug} key={section.slug}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Էջ
                <select
                  value={form.pageSlug}
                  onChange={(event) =>
                    setForm({ ...form, pageSlug: event.target.value })
                  }
                >
                  {selectedSection.links.map((page) => (
                    <option value={page.slug} key={page.slug}>
                      {page.title}
                    </option>
                  ))}
                </select>
              </label>
              <a
                className="preview-link"
                href={`/hy/section/${selectedSection.slug}/${selectedPage.slug}`}
                target="_blank"
              >
                Դիտել Ընտրված էջը
              </a>
            </fieldset>

            <fieldset>
              <legend>2. Նյութի բովանդակություն</legend>
              <label>
                Վերնագիր
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Օրինակ՝ 2025 թ. Հաշվետռություն"
                />
              </label>
              <label>
                Բովանդակություն
                <textarea
                  value={form.body}
                  onChange={(event) =>
                    setForm({ ...form, body: event.target.value })
                  }
                  placeholder="Գրել նյութերի կարծ Նկարագրությունա"
                  rows={6}
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>3. Ֆայլեր</legend>

              {/* Existing files as removable chips (edit mode only) */}
              {editingId && keptFiles.length > 0 && (
                <div className="file-chips-section">
                  <p className="file-chips-label">Արդեն կցված ֆայլեր (× — հանել)</p>
                  <div className="file-chips">
                    {keptFiles.map((file) => (
                      <span className="file-chip" key={file.href}>
                        <a href={file.href} target="_blank" rel="noreferrer">
                          {file.text || "Ֆայլ"}
                        </a>
                        <button
                          type="button"
                          className="file-chip-remove"
                          title="Հանել ֆայլը"
                          onClick={() => void removeKeptFile(file)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <label className="upload-box">
                <strong>{editingId ? "Ավելացնել նոր ֆայլեր" : "Վերբեռնել ֆայլեր"}</strong>
                <span>Ընտրել PDF, Word, Excel կամ նկարներ համակարգիչից</span>
                <input name="uploadFiles" type="file" multiple />
              </label>
              <label>
                ձերքով հղումներ (արտակին կայկեր)
                <textarea
                  value={form.files}
                  onChange={(event) =>
                    setForm({ ...form, files: event.target.value })
                  }
                  placeholder={
                    "Մեկ տողին Մեկ ֆայլ\nՕրինակ՝ 2025 Հաշվետռություն | https://example.com/file.pdf"
                  }
                  rows={4}
                />
              </label>
            </fieldset>

            <p className="admin-hint">
              Նյութը կերա այստեղ{" "}
              <a
                href={`/hy/section/${selectedSection.slug}/${selectedPage.slug}`}
                target="_blank"
                className="admin-page-link"
              >
                /section/{selectedSection.slug}/{selectedPage.slug}
              </a>
            </p>
            {message ? <p className="admin-hint">{message}</p> : null}

            <div className="admin-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Պահպանվում ե..."
                  : editingId
                    ? "Թարմացնել նյութը"
                    : "Ավելացնել նյութ"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Չեղարկել
                </button>
              ) : null}
            </div>

            {/* Preview card — shown right after save */}
            {savedEntry && !editingId && (
              <div className="admin-save-preview">
                <p className="admin-hint" style={{ marginBottom: "0.5rem" }}>
                  ✓ Նյութը Պահպանվեց — այսպիսին ե երևում հանրային կայկում:{" "}
                  <a
                    href={`/hy/section/${savedEntry.sectionSlug}/${savedEntry.pageSlug}`}
                    target="_blank"
                    className="admin-page-link"
                  >
                    Դիտել էջը
                  </a>
                </p>
                <MaterialPreviewCard entry={savedEntry} />
              </div>
            )}
          </form>

          <div className="admin-list">
            <div className="admin-search">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Որոնել նյութեր..."
                className="admin-search-input"
                aria-label="Որոնել նյութեր"
              />
            </div>
            <div className="admin-list-header">
              <div>
                <h2>Ավելացված նյութեր</h2>
                <p>
                  {showOnlySelectedPage
                    ? `${selectedSection.title} / ${selectedPage.title}`
                    : "Բոլոր էջեր"}
                </p>
              </div>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showOnlySelectedPage}
                  onChange={(event) =>
                    setShowOnlySelectedPage(event.target.checked)
                  }
                />
                Միայն Ընտրված էջ
              </label>
            </div>

            {visibleEntries.length === 0 ? (
              <p className="empty-files">Այս ինթրության համար նյութեր չկան։</p>
            ) : null}

            {visibleEntries.map((entry) => (
              <article className="admin-item" key={entry.id}>
                <span className="admin-item-location">
                  {`${sections.find((s) => s.slug === entry.sectionSlug)?.title ?? entry.sectionTitle} / ${sections.find((s) => s.slug === entry.sectionSlug)?.links.find((p) => p.slug === entry.pageSlug)?.title ?? entry.pageTitle}`}
                </span>
                <h3>{entry.title}</h3>
                <p>{entry.body}</p>
                <small>{entry.date}</small>

                {/* File list */}
                {entry.files.length > 0 ? (
                  <div className="file-list admin-file-list">
                    {entry.files.map((file) => (
                      <a
                        href={file.href}
                        key={`${entry.id}-${file.href}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📄 {file.text}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="empty-files" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>
                    Ֆայլեր չկան
                  </p>
                )}

                <div className="admin-item-actions">
                  <button type="button" onClick={() => startEdit(entry)}>
                    Խմբագրել
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewId(previewId === entry.id ? null : entry.id)
                    }
                    className="secondary-button"
                  >
                    {previewId === entry.id ? "Փակել preview" : "Preview"}
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => void removeEntry(entry)}
                  >
                    Հեռացնել
                  </button>
                </div>

                {/* Inline preview card */}
                {previewId === entry.id && (
                  <div className="admin-inline-preview">
                    <p className="file-chips-label">
                      Այսպիսին ե երևում հանրային կայկում →
                    </p>
                    <MaterialPreviewCard entry={entry} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

    </div>
  );
}

