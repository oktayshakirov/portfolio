#!/usr/bin/env node
// Builds the /prompts catalogue and one static page per prompt from
// data/prompts.json, so every prompt has its own URL that search engines can
// read without running JavaScript. Run it after editing a prompt:
//
//   node scripts/build-prompts.mjs
//
// Writes prompts/index.html, prompts/<id>/index.html and the prompts block in
// sitemap.xml. The site itself still has no build step: the output is
// committed like any other page.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://oktayshakirov.com";
const AUTHOR = { "@type": "Person", name: "Oktay Shakirov", url: `${SITE}/` };

const prompts = JSON.parse(readFileSync(join(ROOT, "data/prompts.json"), "utf8"))
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const ld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

const fmtDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB",
  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const thumb = (p) => p.video?.id ? `https://i.ytimg.com/vi/${p.video.id}/maxresdefault.jpg`
  : `${SITE}/assets/images/og-image.jpg`;

function head({ title, description, url, image, depth, type = "website" }) {
  const up = "../".repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#276aa5">
  <meta name="author" content="Oktay Shakirov">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Oktay Shakirov">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:creator" content="@oktayshakirov">
  <link rel="icon" href="${up}assets/images/logo.ico" sizes="16x16 32x32 48x48">
  <link rel="apple-touch-icon" href="${up}assets/images/apple-touch-icon.png">
  <link rel="stylesheet" href="${up}assets/css/style.css">
  <link rel="stylesheet" href="${up}assets/css/prompts.css">
  <link rel="preload" href="${up}assets/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${up}assets/fonts/poppins-600.woff2" as="font" type="font/woff2" crossorigin>`;
}

function tail(depth) {
  const up = "../".repeat(depth);
  return `  <script type="module" src="${up}assets/js/prompts.js"></script>
</body>

</html>
`;
}

// --- the catalogue ----------------------------------------------------------

function catalogue() {
  const url = `${SITE}/prompts/`;
  const aliases = {};
  for (const p of prompts) for (const a of p.aliases || []) aliases[a] = `${p.id}/`;
  const cards = prompts.map((p) => `        <li class="prompt-item content-card${p.video?.id ? " has-thumb" : ""}">
          <div class="prompt-item-text">
            <a class="prompt-item-link" href="${esc(p.id)}/">
              <h2 class="prompt-item-title">${esc(p.title)}</h2>
            </a>
            <p class="prompt-summary">${esc(p.summary)}</p>
            <div class="prompt-meta">
              ${(p.tags || []).map((t) => `<span class="prompt-tag">${esc(t)}</span>`).join("")}
              <time datetime="${p.date}">${fmtDate(p.date)}</time>
            </div>
            <a class="prompt-open" href="${esc(p.id)}/">Open the prompt <span aria-hidden="true">&rarr;</span></a>
          </div>${p.video?.id ? `
          <a class="prompt-item-thumb" href="${esc(p.id)}/" tabindex="-1" aria-hidden="true">
            <img src="https://i.ytimg.com/vi/${esc(p.video.id)}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">
          </a>` : ""}
        </li>`).join("\n");

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free AI prompts from my videos",
    url,
    author: AUTHOR,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: prompts.map((p, i) => ({
        "@type": "ListItem", position: i + 1, url: `${SITE}/prompts/${p.id}/`, name: p.title,
      })),
    },
  };

  return `${head({
    title: "Free AI Prompts from My Videos - Oktay Shakirov",
    description: "A catalogue of free prompts from my videos about building with AI. Each one has its own page: what it does, how to use it, and a copy button.",
    url, image: `${SITE}/assets/images/og-image.jpg`, depth: 1,
  })}
  ${ld(data)}
</head>

<body>
  <main class="prompts-page">
    <article class="active">
      <header>
        <h1 class="h2 article-title">Prompts</h1>
      </header>
      <section class="prompts-intro">
        <p>Free prompts from my videos about building with AI. Each one is the check or the
          method from a video, written so you can run it on your own work in Claude, ChatGPT or
          any AI chat. No sign-up, nothing to install.</p>
      </section>
      <ul class="prompt-list" data-aliases='${esc(JSON.stringify(aliases))}'>
${cards}
      </ul>
      <p class="prompts-foot">New prompts are added with each video.</p>
    </article>
  </main>
${tail(1)}`;
}

// --- one page per prompt ----------------------------------------------------

function page(p) {
  const url = `${SITE}/prompts/${p.id}/`;
  const body = p.body ? readFileSync(join(ROOT, p.body), "utf8").trim() : "";
  const v = p.video || {};
  const graph = [
    {
      "@type": "Article",
      headline: p.headline || p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      author: AUTHOR,
      publisher: AUTHOR,
      image: thumb(p),
      mainEntityOfPage: url,
      keywords: (p.tags || []).join(", "),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Oktay Shakirov", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Prompts", item: `${SITE}/prompts/` },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];
  if (v.id) {
    graph.push({
      "@type": "VideoObject",
      name: v.title,
      description: p.description,
      thumbnailUrl: thumb(p),
      uploadDate: v.uploadDate || p.date,
      contentUrl: v.url,
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
    });
  }

  const video = v.id ? `
      <section class="prompt-video">
        <h2>The video</h2>
        <button class="yt-lite" type="button" data-id="${esc(v.id)}" aria-label="Play: ${esc(v.title)}">
          <img src="${thumb(p)}" alt="${esc(v.title)}" loading="lazy" width="1280" height="720">
          <span class="yt-play" aria-hidden="true"></span>
        </button>
        <p class="prompt-video-title"><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a></p>
      </section>` : "";

  return `${head({
    title: p.seoTitle || p.title, description: p.description, url,
    image: thumb(p), depth: 2, type: "article",
  })}
  <meta property="article:published_time" content="${p.date}">
  <meta property="article:modified_time" content="${p.updated || p.date}">
  ${ld({ "@context": "https://schema.org", "@graph": graph })}
</head>

<body>
  <main class="prompts-page">
    <article class="active prompt-article">
      <nav class="prompt-topbar" aria-label="Breadcrumb">
        <a class="prompt-back" href="../">All prompts</a>
        <time datetime="${p.date}">${fmtDate(p.date)}</time>
      </nav>
      <header>
        <h1 class="prompt-h1">${esc(p.headline || p.title)}</h1>
        ${v.url ? `<p class="prompt-meta"><span>From the video <a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a></span></p>` : ""}
      </header>
      <p class="prompt-lead">${esc(p.description)}</p>

      <section class="prompt-card content-card" aria-label="The prompt">
        <div class="prompt-box">
          <pre class="prompt-text" id="prompt-text">${esc(p.prompt)}</pre>
        </div>
        <div class="prompt-actions">
          <button class="prompt-copy" type="button" data-copy="#prompt-text">Copy prompt</button>
          <button class="prompt-toggle" type="button">Show all</button>
        </div>
      </section>

      <div class="prompt-body">
${body}
      </div>
${video}
      <p class="prompts-foot"><a href="../">More free prompts</a></p>
    </article>
  </main>
${tail(2)}`;
}

// --- sitemap ----------------------------------------------------------------

function sitemap() {
  const path = join(ROOT, "sitemap.xml");
  const xml = readFileSync(path, "utf8");
  const start = "<!-- prompts:start -->", end = "<!-- prompts:end -->";
  if (!xml.includes(start)) throw new Error("sitemap.xml has no prompts markers");
  const newest = prompts.map((p) => p.updated || p.date).sort().pop();
  const entry = (loc, mod, freq, pri) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${mod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
  const block = [entry(`${SITE}/prompts/`, newest, "weekly", "0.6"),
    ...prompts.map((p) => entry(`${SITE}/prompts/${p.id}/`, p.updated || p.date, "monthly", "0.6"))];
  const out = xml.replace(new RegExp(`${start}[\\s\\S]*${end}`),
    `${start}\n${block.join("\n")}\n  ${end}`);
  writeFileSync(path, out);
}

writeFileSync(join(ROOT, "prompts/index.html"), catalogue());
for (const p of prompts) {
  const dir = join(ROOT, "prompts", p.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(p));
}
sitemap();
console.log(`Built the catalogue and ${prompts.length} prompt page(s).`);
