export interface Match {
  text: string;
  link: string;
}

export interface ExtractedResult {
  url: string;
  title: string;
  meta: {
    description: string;
    keywords: string;
  };
  headings: string[];
  contactInfo: {
    email: string[];
    phone: string[];
  };
  images: string[];
  scripts: string[];
  schemaMarkup: string[];
  matches: Match[]; 
  error?: boolean;
}
