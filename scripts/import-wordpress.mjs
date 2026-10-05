import { writeFile, mkdir } from "node:fs/promises";

const baseUrl = "https://pemzashen.schoolsite.am";
const sitemaps = [
  `${baseUrl}/wp-sitemap-posts-page-1.xml`,
  `${baseUrl}/wp-sitemap-posts-post-1.xml`,
];

function decodeHtml(value) {
  return value
    .replaceAll("&#8212;", "-")
    .replaceAll("&rarr;", "→")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extract(regex, value) {
  return regex.exec(value)?.[1]?.trim() ?? "";
}

function extractLinks(html) {
  return Array.from(html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi))
    .map((match) => ({
      href: decodeHtml(match[1]),
      text: stripTags(match[2]),
    }))
    .filter((link) => link.href && !link.href.includes("addtoany.com"));
}

function extractFiles(links) {
  return links.filter((link) => /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|webp)$/i.test(link.href));
}

function slugFromUrl(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts.at(-1) ?? "home");
}

function typeFromUrl(url) {
  return /\/\d{4}\//.test(new URL(url).pathname) ? "post" : "page";
}

async function getText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
}

async function getUrls() {
  const urls = [];
  for (const sitemap of sitemaps) {
    const xml = await getText(sitemap);
    urls.push(...Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => decodeHtml(match[1])));
  }
  return Array.from(new Set(urls));
}

async function importPage(url) {
  const html = await getText(url);
  const title = stripTags(extract(/<title>([\s\S]*?)<\/title>/i, html)).replace(/\s*\|\s*Պեմզաշենի\s+միջնակարգ\s+դպրոց\s*$/, "");
  const mainHtml =
    extract(
      /<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]+class="[^"]*entry-utility|<div\s+id="post-|<div\s+id="nav-below)/i,
      html,
    ) || extract(/<article[\s\S]*?>([\s\S]*?)<\/article>/i, html);
  const headings = Array.from(mainHtml.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)).map((match) => stripTags(match[1]));
  const links = extractLinks(mainHtml);
  const files = extractFiles(links);

  return {
    title,
    slug: slugFromUrl(url),
    type: typeFromUrl(url),
    sourceUrl: url,
    headings,
    text: stripTags(mainHtml),
    links,
    files,
  };
}

async function main() {
  const urls = await getUrls();
  const pages = [];

  for (const url of urls) {
    try {
      pages.push(await importPage(url));
      console.log(`Imported ${url}`);
    } catch (error) {
      console.error(`Failed ${url}`);
      console.error(error);
    }
  }

  const payload = {
    importedAt: new Date().toISOString(),
    source: baseUrl,
    pages,
  };

  await mkdir("app/content", { recursive: true });
  await writeFile("app/content/wordpress-import.json", JSON.stringify(payload, null, 2), "utf8");
  console.log(`Saved ${pages.length} items to app/content/wordpress-import.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
