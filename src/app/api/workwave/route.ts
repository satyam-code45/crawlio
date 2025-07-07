import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { ExtractedResult, Match } from "@/lib/types";


async function extractContentWithPuppeteer(
  url: string,
  query?: string
): Promise<ExtractedResult> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    const title = await page.title();

    const metaDescription = await page
      .$eval(
        'meta[name="description"]',
        (el) => el.getAttribute("content") || ""
      )
      .catch(() => "");

    const metaKeywords = await page
      .$eval('meta[name="keywords"]', (el) => el.getAttribute("content") || "")
      .catch(() => "");

    let headings: string[] = [];
    const lastPageNumber = 10;

    for (let index = 0; index < lastPageNumber; index++) {
      await new Promise((res) => setTimeout(res, 1000));

      headings = headings.concat(
        await page.$$eval("h1, h2, h3, h4, h5, h6", (els) =>
          els.map((el) => el.textContent?.trim() || "")
        )
      );

      if (index !== lastPageNumber - 1) {
        const nextBtn = await page.$(
          'a[aria-label="Go to next page"]:not(.pointer-events-none)'
        );
        if (nextBtn) {
          await nextBtn.click();
        } else {
          break;
        }
      }
    }

    const contactInfo = await page.$$eval("a", (els) => {
      const email: string[] = [];
      const phone: string[] = [];

      for (const el of els) {
        const href = el.getAttribute("href");
        if (!href) continue;
        if (href.startsWith("mailto:")) email.push(href.replace("mailto:", ""));
        if (href.startsWith("tel:")) phone.push(href.replace("tel:", ""));
      }

      return { email, phone };
    });

    const images = await page.$$eval(
      "img",
      (els) =>
        els.map((el) => el.getAttribute("src")).filter(Boolean) as string[]
    );

    const scripts = await page.$$eval(
      "script",
      (els) =>
        els.map((el) => el.getAttribute("src")).filter(Boolean) as string[]
    );

    const schemaMarkup = await page.$$eval(
      "[itemscope][itemtype]",
      (els) =>
        els.map((el) => el.getAttribute("itemtype")).filter(Boolean) as string[]
    );

    const matches: Match[] = [];

    if (query) {
      const keyword = query.toLowerCase();

      const textSnippets = await page.$$eval("p, li, span", (els) =>
        els.map((el) => el.textContent?.trim() || "")
      );

      for (const snippet of textSnippets) {
        if (snippet.toLowerCase().includes(keyword)) {
          matches.push({
            text: snippet.slice(0, 200),
            link: url,
          });
        }
      }
    }

    await browser.close();

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
  } catch (error) {
    console.error(` Error scraping ${url}:`, error);
    await browser.close();
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
      techStack: [],
      error: true,
    };
  }
}

export async function POST(req: NextRequest) {
  const { urls, query } = await req.json();

  if (!Array.isArray(urls)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const results = await Promise.all(
    urls.map((url) => extractContentWithPuppeteer(url, query))
  );

  return NextResponse.json(results);
}
