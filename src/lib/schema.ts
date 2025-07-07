import { z } from "zod";

export const scraperSchema = z
  .object({
    query: z.string().optional(),
    seedUrls: z
      .string()
      .min(1, "Please enter at least one URL.")
      .refine((value) => {
        const urls = value.split(",").map((url) => url.trim());
        return urls.every((url) => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === "https:" || parsed.protocol === "http:";
          } catch {
            return false;
          }
        });
      }, {
        message: "All URLs must be valid (http or https) and comma-separated."
      }),
  })
  .refine((data) => {
    const hasQuery = data.query && data.query.trim().length > 0;
    const hasUrls = data.seedUrls && data.seedUrls.trim().length > 0;
    return hasQuery || hasUrls;
  }, {
    message: "You must provide at least a search query or one valid URL."
  });
