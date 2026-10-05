import wordpressImport from "./content/wordpress-import.json";

export type ImportedFile = {
  href: string;
  text: string;
};

export type ImportedContent = {
  title: string;
  slug: string;
  type: string;
  sourceUrl: string;
  text: string;
  files: ImportedFile[];
};

export const importedSections = [
  { slug: "about", title: "Դպրոցի մասին" },
  { slug: "councils", title: "Խորհուրդներ" },
  { slug: "learning", title: "Ուսումնական գործընթաց" },
  { slug: "events", title: "Դպրոցի անցուդարձ" },
  { slug: "review", title: "Ընդհանուր նյութեր" },
] as const;

const importedPages = wordpressImport.pages as ImportedContent[];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function haystack(page: ImportedContent) {
  return normalize(`${page.title} ${page.slug} ${page.text}`);
}

function titleFromSlug(slug: string) {
  if (/^\d+-\d+$/.test(slug) || /^\d+$/.test(slug)) {
    return "";
  }

  return slug
    .replace(/-\d+$/, "")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromFiles(files: ImportedFile[]) {
  const firstNamedFile = files.find((file) => file.text && !file.text.startsWith("http"));
  return firstNamedFile?.text?.trim() ?? "";
}

export function cleanImportedTitle(page: Pick<ImportedContent, "title" | "slug" | "files">) {
  const title = page.title
    .replace(/\s*\|\s*Եւս մեկ կայք Armenian Schools Sites ցանցում\s*$/, "")
    .replace(/\s*\|\s*Պեմզաշենի\s+միջնակարգ\s+դպրոց\s*$/, "")
    .replace(/\s*\|\s*$/, "")
    .trim();

  if (!title || title === "|" || title === "Պեմզաշենի միջնակարգ դպրոց") {
    return titleFromSlug(page.slug) || titleFromFiles(page.files) || "Նյութ";
  }

  return title;
}

export function getImportedExcerpt(text: string, length = 180) {
  const cleaned = text
    .replace(/Պեմզաշենի միջնակարգ դպրոց/g, "")
    .replace(/Եւս մեկ կայք Armenian Schools Sites ցանցում/g, "")
    .replace(/This entry was posted.*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= length) {
    return cleaned;
  }

  return `${cleaned.slice(0, length).trim()}...`;
}

export function classifyImportedPage(page: ImportedContent) {
  const value = haystack(page);

  if (page.title.includes("թեստ")) {
    return "test";
  }

  if (page.slug === "home" || page.slug === "hello-world") {
    return "review";
  }

  if (
    value.includes("քննություններ") ||
    value.includes("քննություն") ||
    value.includes("նախագծային") ||
    value.includes("դասացուցակ") ||
    value.includes("ուսումնական")
  ) {
    return "learning";
  }

  if (
    value.includes("խորհուրդ") ||
    value.includes("արձանագր") ||
    value.includes("ծխ") ||
    value.includes("ախ ")
  ) {
    return "councils";
  }

  if (value.includes("միջոցառում") || value.includes("էքսկուրս")) {
    return "events";
  }

  if (
    value.includes("հայտարար") ||
    value.includes("հաշվետվ") ||
    value.includes("եռամսյակ") ||
    value.includes("թափուր") ||
    value.includes("ընդունել")
  ) {
    return "about";
  }

  return "review";
}

export function getSubsectionTitle(page: ImportedContent) {
  const value = haystack(page);

  if (value.includes("հայտարար")) return "Հայտարարություններ";
  if (value.includes("հաշվետվ") || value.includes("եռամսյակ")) return "Հաշվետվություններ";
  if (value.includes("միացյալ կառավարման")) return "Միացյալ կառավարման խորհուրդ";
  if (value.includes("մանկավարժական")) return "Մանկավարժական խորհուրդ";
  if (value.includes("ծնողական") || value.includes("ծխ")) return "Ծնողական խորհուրդ";
  if (value.includes("աշակերտական") || value.includes("ախ ")) return "Աշակերտական խորհուրդ";
  if (value.includes("մ/մ") || value.includes("մ-մ")) return "Մ/Մ արձանագրություններ";
  if (value.includes("քնն")) return "Քննություններ";
  if (value.includes("նախագծային")) return "Նախագծային աշխատանքներ";
  if (value.includes("միջոցառում")) return "Միջոցառումներ";
  return "Այլ նյութեր";
}

export function getImportedPages() {
  return importedPages.filter((page) => classifyImportedPage(page) !== "test");
}

export function getImportedPagesBySection(sectionSlug: string) {
  return getImportedPages().filter((page) => classifyImportedPage(page) === sectionSlug);
}

export function getGroupedImportedPages() {
  return importedSections.map((section) => ({
    ...section,
    pages: getImportedPagesBySection(section.slug),
  }));
}

export function groupImportedBySubsection(pages: ImportedContent[]) {
  return pages.reduce<Record<string, ImportedContent[]>>((groups, page) => {
    const title = getSubsectionTitle(page);
    groups[title] = groups[title] ?? [];
    groups[title].push(page);
    return groups;
  }, {});
}

export function getFileYear(file: ImportedFile) {
  const value = `${file.text} ${decodeURIComponent(file.href)}`;
  return value.match(/20\d{2}/)?.[0] ?? "Տարեթիվ չնշված";
}

export function groupFilesByYear(files: ImportedFile[]) {
  const groups = files.reduce<Record<string, ImportedFile[]>>((result, file) => {
    const year = getFileYear(file);
    result[year] = result[year] ?? [];
    result[year].push(file);
    return result;
  }, {});

  return Object.entries(groups).sort(([yearA], [yearB]) => {
    if (yearA === "Տարեթիվ չնշված") return 1;
    if (yearB === "Տարեթիվ չնշված") return -1;
    return Number(yearB) - Number(yearA);
  });
}
