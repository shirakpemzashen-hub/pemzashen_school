import { getTranslations } from "next-intl/server";
import { SiteShell } from "../../components";
import {
  cleanImportedTitle,
  getGroupedImportedPages,
  getImportedExcerpt,
  getImportedPages,
  groupFilesByYear,
  groupImportedBySubsection,
} from "../../imported-content";
import { applyOverrides, readOverrides } from "../../imported-overrides";

export const dynamic = "force-dynamic";

export default async function ImportedPage() {
  const t = await getTranslations();
  const overrides = await readOverrides();

  const meaningfulPages = applyOverrides(getImportedPages(), overrides);
  const groupedPages = getGroupedImportedPages().map((section) => ({
    ...section,
    pages: applyOverrides(section.pages, overrides),
  }));

  return (
    <SiteShell>
      <section className="admin-hero">
        <p className="eyebrow">{t("archive.eyebrow")}</p>
        <h1>{t("archive.title")}</h1>
        <p>{t("archive.description")}</p>
      </section>

      <section className="import-summary">
        <article>
          <strong>{meaningfulPages.length}</strong>
          <span>{t("archive.statMaterials")}</span>
        </article>
        <article>
          <strong>
            {meaningfulPages.reduce((total, page) => total + page.files.length, 0)}
          </strong>
          <span>{t("archive.statFiles")}</span>
        </article>
        <article>
          <strong>5</strong>
          <span>{t("archive.statGroups")}</span>
        </article>
      </section>

      <section className="import-list">
        {groupedPages.map((section) => {
          const subsectionGroups = groupImportedBySubsection(section.pages);
          return (
            <div className="import-group" key={section.slug}>
              <div className="section-heading">
                <p className="eyebrow">{t("archive.sectionEyebrow")}</p>
                <h2>{section.title}</h2>
              </div>
              {Object.keys(subsectionGroups).length > 0 ? (
                <div className="content-groups">
                  {Object.entries(subsectionGroups).map(([groupTitle, pages]) => (
                    <section className="content-group" key={groupTitle}>
                      <h3>{groupTitle}</h3>
                      <div className="material-list">
                        {pages.map((page) => {
                          const excerpt = getImportedExcerpt(page.text);
                          return (
                            <article className="material-card" key={page.sourceUrl}>
                              <div>
                                <h4>{cleanImportedTitle(page)}</h4>
                                {excerpt ? <p>{excerpt}</p> : null}
                              </div>
                              {page.files.length > 0 ? (
                                <div className="year-file-groups">
                                  {groupFilesByYear(page.files).map(
                                    ([year, files]) => (
                                      <div className="year-file-group" key={year}>
                                        <strong>{year}</strong>
                                        <div
                                          className="file-list"
                                          aria-label={`${cleanImportedTitle(page)} ${year} ֆայլեր`}
                                        >
                                          {files.map((file, i) => (
                                            <a
                                              href={file.href}
                                              target="_blank"
                                              rel="noreferrer"
                                              key={`${file.href}-${i}`}
                                            >
                                              {file.text || t("section.openFile")}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="empty-files">{t("archive.noMaterials")}</p>
              )}
            </div>
          );
        })}
      </section>
    </SiteShell>
  );
}
