import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const toLastMod = (d?: Date) => {
  if (!d) return "";
  // sitemap 协议允许只写日期 YYYY-MM-DD
  return d.toISOString().slice(0, 10);
};

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString() || "https://www.chexlizarddecor.com";

  const items = await getCollection("products", (p) => p.data.published);

  // 静态页面（你也可以给它们固定 lastmod，或直接不写 lastmod）
  const staticUrls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${base}/` },
  ];

  // 产品页 lastmod：优先用 frontmatter 的 updated（你 schema 里是可选 Date）
  const productUrls = items.map((p) => ({
    loc: `${base}/p/${p.slug}/`,
    lastmod: toLastMod(p.data.updated),
  }));

  // 分类/标签页一般是聚合页：这里用“最新产品更新时间”作为 lastmod（没有就不写）
  const latest = items
    .map((p) => p.data.updated)
    .filter(Boolean)
    .sort((a, b) => (b!.getTime() - a!.getTime()))[0];

  const categories = Array.from(new Set(items.map((p) => p.data.category)));
  const categoryUrls = categories.map((c) => ({
    loc: `${base}/c/${encodeURIComponent(c)}/`,
    lastmod: toLastMod(latest),
  }));

  const tags = Array.from(new Set(items.flatMap((p) => p.data.tags)));
  const tagUrls = tags.map((t) => ({
    loc: `${base}/t/${encodeURIComponent(t)}/`,
    lastmod: toLastMod(latest),
  }));

  const all = [...staticUrls, ...productUrls, ...categoryUrls, ...tagUrls];

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(({ loc, lastmod }) => {
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  return `  <url><loc>${loc}</loc>${lastmodTag}</url>`;
}).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
