"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { scraperSchema } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { saveAs } from "file-saver";
import { ExtractedResult } from "@/lib/types";

type FormData = z.infer<typeof scraperSchema>;

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExtractedResult[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(scraperSchema),
    defaultValues: {
      query: "",
      seedUrls: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    const urls = values.seedUrls
      ? values.seedUrls.split(",").map((url) => url.trim())
      : [];

    setLoading(true);
    try {
      const res = await axios.post("/api/cheerioscrap", {
        query: values.query,
        urls,
      });
      setResults(res.data as ExtractedResult[]);
    } catch (err) {
      console.error("Scraping failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: "json" | "csv") => {
    if (!results.length) return;

    if (type === "json") {
      const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "scraped_results.json");
    } else {
      const csvRows: string[] = ["URL,Title,Meta Description,Emails,Phones"];
      results.forEach((result) => {
        csvRows.push(
          `"${result.url}","${result.title || ""}","${
            result.meta.description || ""
          }","${result.contactInfo.email.join(
            " | "
          )}","${result.contactInfo.phone.join(" | ")}"`
        );
      });
      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, "scraped_results.csv");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Query</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter text to search for (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seedUrls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seed URLs</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter comma-separated URLs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs text-gray-500">
            Provide a search term, seed URLs, or both.
          </p>

          <Button type="submit" disabled={loading}>
            {loading ? "Scraping..." : "Scrape Web"}
          </Button>
        </form>
      </Form>

      {results.length > 0 && (
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => handleDownload("json")}>
            Download JSON
          </Button>
          <Button variant="outline" onClick={() => handleDownload("csv")}>
            Download CSV
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="mt-10 space-y-8">
        {results.length > 0
          ? results.map((result, idx) => (
              <div key={idx} className="border p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-2">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {result.title || result.url}
                  </a>
                </h2>

                {result.meta.description && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Description:</strong> {result.meta.description}
                  </p>
                )}

                {result.headings.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Headings:</strong> {result.headings.join(", ")}
                  </p>
                )}

                {result.contactInfo.email.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Emails:</strong>{" "}
                    {result.contactInfo.email.join(", ")}
                  </p>
                )}

                {result.contactInfo.phone.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Phones:</strong>{" "}
                    {result.contactInfo.phone.join(", ")}
                  </p>
                )}

                {result.images.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Images:</strong> {result.images.length} images found
                  </p>
                )}

                {result.scripts.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Scripts:</strong> {result.scripts.length} script
                    tags found
                  </p>
                )}

                {result.schemaMarkup.length > 0 && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Schema Markup:</strong>{" "}
                    {result.schemaMarkup.join(", ")}
                  </p>
                )}
              </div>
            ))
          : !loading && (
              <p className="text-center text-sm text-gray-300">
                No results yet.
              </p>
            )}
      </div>
    </div>
  );
}
