"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

interface PageProps {
  params: {
    slug?: string[];
  };
}

/**
 * Public CMS Dynamic Route Handler
 * 
 * This is a catch-all route for CMS Lite public pages.
 * Pages are dynamically fetched from the database based on slug.
 * 
 * Note: This is a simplified version that shows "Coming Soon" state
 * until CMS Lite is fully integrated.
 */
export default function CmsPublicPage({ params }: PageProps) {
  const slug = params.slug ? params.slug.join("/") : "";
  
  // Try to fetch page configuration from database
  const page = useQuery(api.features.cms_lite.pages.api.queries.getPageBySlug, {
    slug: slug || "home",
  });
  
  // Loading state
  if (page === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }
  
  // Page not found in database - show Coming Soon for CMS Lite
  if (page === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Construction className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">CMS Lite - Coming Soon</h1>
            <p className="text-muted-foreground mb-4">
              This public website feature is currently under development.
            </p>
            <p className="text-sm text-muted-foreground">
              Requested page: <code className="bg-muted px-2 py-1 rounded">/{slug || "home"}</code>
            </p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  // Page found - render basic content
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>{page.title || page.slug}</h1>
          {page.description && <p className="lead">{page.description}</p>}
          
          {/* Render page content based on pageType */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Page Type: <code>{page.pageType}</code>
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
