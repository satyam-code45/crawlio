# 🕸️ Web Scraping Tool — WorkWave

A powerful, flexible web scraping tool that extracts structured data from websites using both static and JavaScript-rendered strategies. Built with Next.js, Puppeteer, Cheerio, and TailwindCSS — it supports keyword-based search, multi-page crawling, and outputs in both JSON and CSV formats.

![image](https://github.com/user-attachments/assets/2ed94886-eaef-49d8-8ec4-5cc56620662f)


---

## 🚀 Features

### ✅ Core Features (Minimal Requirements)
- [x] Accepts **search queries** and/or **seed URLs**
- [x] Extracts:
  - Title
  - Meta tags (description, keywords)
  - Headings (H1–H6)
  - Emails & Phone numbers
- [x] Supports both:
  - Static scraping (Cheerio)
  - Dynamic scraping (Puppeteer)
- [x] JSON and CSV download of scraped results
- [x] Simple, responsive UI built in Next.js

### 🌟 Optional Enhancements Implemented
- [x] Pagination scraping (e.g., clicking "Next" buttons automatically)
- [x] Dynamic content scraping (images, script tags, schema markup)
- [x] Tech stack detection (React, Vue, Angular, Tailwind, jQuery, Bootstrap)
- [x] Client-side switching between scraping modes
- [x] File download via `file-saver`
- [x] Error handling and graceful fallback for failed URLs

---


## 🧠 How It Works

This tool provides 3 scraping strategies via UI buttons:

1. **Cheerio Scraper**
   - Uses `axios` + `cheerio` to parse static HTML
   - Fastest and lightweight
   - Ideal for non-JavaScript websites

2. **Puppeteer Scraper**
   - Uses a headless Chromium browser
   - Supports dynamic JavaScript-rendered content

3. **WorkWave Scraper (Paginated)**
   - Hardcoded to scrape [WorkWave](https://workwave-phi.vercel.app)
   - Handles pagination up to 10 pages

Each scraper extracts:
- Title, Meta Description, Keywords
- Headings (H1–H6)
- Contact info (Email & Phone)
- Images, Scripts, Schema.org Markup
- Matches for keyword queries
- Frontend Tech Stack used

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend API**: Edge functions (for cheerio), Puppeteer (Node.js backend)
- **State Management**: React Hook Form + Zod
- **Libraries**:
  - `axios` for HTTP requests
  - `cheerio` for static HTML parsing
  - `puppeteer` for headless browser automation
  - `file-saver` for downloading results
  - `zod` for input validation

---

## 📦 Installation & Setup

```bash
# Clone the repo
git clone https://github.com/your-username/web-scraper.git
cd web-scraper

# Install dependencies
npm install

# Run locally
npm run dev
