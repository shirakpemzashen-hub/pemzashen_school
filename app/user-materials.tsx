"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { groupFilesByYear, type ImportedFile } from "./imported-content";

export type AdminEntry = {
  id: string;
  title: string;
  sectionSlug: string;
  sectionTitle: string;
  pageSlug: string;
  pageTitle: string;
  body: string;
  date: string;
  files: ImportedFile[];
};

export type UploadFile = ImportedFile & {
  name?: string;
  size?: number;
};

export function parseFileLinks(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [text, ...urlParts] = line.split("|").map((item) => item.trim());
      const href = urlParts.join("|") || text;
      return {
        text: urlParts.length > 0 ? text : "Բացել ֆայլը",
        href,
      };
    });
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function isImageFile(href: string) {
  const ext = href.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSIONS.has(`.${ext}`) : false;
}

function FileOrImage({ file, entryId }: { file: ImportedFile; entryId: string }) {
  if (isImageFile(file.href)) {
    return (
      <figure className="material-image" key={`${entryId}-${file.href}`}>
        <a href={file.href} target="_blank" rel="noreferrer">
          <img src={file.href} alt={file.text || "նկար"} loading="lazy" />
        </a>
      </figure>
    );
  }
  return (
    <a
      href={file.href}
      target="_blank"
      rel="noreferrer"
      key={`${entryId}-${file.href}`}
    >
      {file.text}
    </a>
  );
}

export function UserMaterials({
  sectionSlug,
  pageSlug,
}: {
  sectionSlug: string;
  pageSlug: string;
}) {
  const t = useTranslations("userMaterials");
  const [entries, setEntries] = useState<AdminEntry[]>([]);

  useEffect(() => {
    fetch("/api/materials")
      .then((response) => response.json())
      .then((data: AdminEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  const pageEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.sectionSlug === sectionSlug && entry.pageSlug === pageSlug,
      ),
    [entries, pageSlug, sectionSlug],
  );

  return (
    <section className="section-wrap">
      {pageEntries.length === 0 ? (
        <p className="no-materials-hint">Այս բաժնում նյութեր դեռ չկան։</p>
      ) : null}
      <div className="material-list">
        {pageEntries.map((entry) => {
          const imageFiles = entry.files.filter((f) => isImageFile(f.href));
          const otherFiles = entry.files.filter((f) => !isImageFile(f.href));
          return (
            <article className="material-card" key={entry.id}>
              <div>
                <span className="material-date">{entry.date}</span>
                <h4>{entry.title}</h4>
                <p>{entry.body}</p>
              </div>
              {imageFiles.length > 0 ? (
                <div className="material-images">
                  {imageFiles.map((file) => (
                    <FileOrImage file={file} entryId={entry.id} key={`${entry.id}-${file.href}`} />
                  ))}
                </div>
              ) : null}
              {otherFiles.length > 0 ? (
                <div className="year-file-groups">
                  {groupFilesByYear(otherFiles).map(([year, files]) => (
                    <div className="year-file-group" key={year}>
                      <strong>{year}</strong>
                      <div className="file-list">
                        {files.map((file) => (
                          <FileOrImage file={file} entryId={entry.id} key={`${entry.id}-${file.href}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
