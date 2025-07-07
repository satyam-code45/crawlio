import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { ExtractedResult, Match } from "@/lib/types";

// Extract structured content from a webpage
function extractBasicContent(
  $: cheerio.CheerioAPI,
  url: string,
  query?: string
): ExtractedResult {
  const title = $("title").text();

  const headings: string[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    headings.push($(el).text().trim());
  });

  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const metaKeywords = $('meta[name="keywords"]').attr("content") || "";

  const contactInfo: { email: string[]; phone: string[] } = {
    email: [],
    phone: [],
  };
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href?.startsWith("mailto:"))
      contactInfo.email.push(href.replace("mailto:", ""));
    if (href?.startsWith("tel:"))
      contactInfo.phone.push(href.replace("tel:", ""));
  });

  const images: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) images.push(src);
  });

  const scripts: string[] = [];
  $("script").each((_, el) => {
    const src = $(el).attr("src");
    if (src) scripts.push(src);
  });

  const schemaMarkup: string[] = [];
  $("[itemscope][itemtype]").each((_, el) => {
    const type = $(el).attr("itemtype");
    if (type) schemaMarkup.push(type);
  });

  const matches: Match[] = [];
  if (query) {
    const keyword = query.toLowerCase();
    $("p, li, span").each((_, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes(keyword)) {
        matches.push({
          text: text.slice(0, 200),
          link: url,
        });
      }
    });
  }

  return {
    url,
    title,
    meta: {
      description: metaDescription,
      keywords: metaKeywords,
    },
    headings,
    contactInfo,
    images,
    scripts,
    schemaMarkup,
    matches,
  };
}

export async function POST(req: NextRequest) {
  const { urls, query } = await req.json();

  if (!Array.isArray(urls)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const fetchPromises = urls.map(async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      const extracted = extractBasicContent($, url, query);
      return extracted;
    } catch (error) {
      console.error("❌ Error fetching:", url, error);
      return {
        url,
        title: "",
        meta: { description: "", keywords: "" },
        headings: [],
        contactInfo: { email: [], phone: [] },
        images: [],
        scripts: [],
        schemaMarkup: [],
        matches: [],
        error: true,
      } satisfies ExtractedResult;
    }
  });

  const results = await Promise.all(fetchPromises);
  return NextResponse.json(results);
}
