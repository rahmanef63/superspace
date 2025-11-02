"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";

// Import all available page components
import HomePage from "@/frontend/features/cms-lite/pages/HomePage";
import AboutPage from "@/frontend/features/cms-lite/pages/AboutPage";
import ProductsPage from "@/frontend/features/cms-lite/pages/ProductsPage";
import ProductDetailPage from "@/frontend/features/cms-lite/pages/ProductDetailPage";
import BlogPage from "@/frontend/features/cms-lite/pages/BlogPage";
import BlogPostPage from "@/frontend/features/cms-lite/pages/BlogPostPage";
import PortfolioPage from "@/frontend/features/cms-lite/pages/PortfolioPage";
import HelloPage from "@/frontend/features/cms-lite/pages/HelloPage";

interface PageProps {
  params: {
    slug?: string[];
  };
}

/**
 * Public CMS Dynamic Route Handler
 * 
 * This is a catch-all route for CMS Lite public pages with multi-language support.
 * Pages are dynamically mapped from the database based on slug.
 * 
 * Features:
 * - Multi-language slugs (English, Arabic, Russian, Indonesian, etc.)
 * - Dynamic page type mapping
 * - SEO metadata from database
 * - No hardcoded routes needed
 * 
 * Example routes:
 * - / -> HomePage
 * - /about or /tentang-kami or /حول -> AboutPage
 * - /products or /produk or /المنتجات -> ProductsPage
 * - /hello or /halo or /مرحبا or /привет -> HelloPage
 * 
 * Admin can create new pages with any slug in any language!
 */
export default function CmsPublicPage({ params }: PageProps) {
  const slug = params.slug ? params.slug.join("/") : "";
  
  // Fetch page configuration from database
  const page = useQuery(api.features.cms_lite.pages.api.queries.getPageBySlug, {
    slug: slug || "home", // Empty slug = home page
  });
  
  // Loading state
  if (page === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/60">Loading page...</p>
        </div>
      </div>
    );
  }
  
  // Page not found
  if (page === null) {
    notFound();
  }
  
  // Map page type to component
  const pageComponents = {
    home: HomePage,
    about: AboutPage,
    products: ProductsPage,
    "product-detail": ProductDetailPage,
    blog: BlogPage,
    "blog-post": BlogPostPage,
    portfolio: PortfolioPage,
    hello: HelloPage,
    custom: HomePage, // Fallback for custom pages
  };
  
  const PageComponent = pageComponents[page.pageType] || HomePage;
  
  return <PageComponent />;
}
