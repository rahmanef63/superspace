"use client";

import { LanguageProvider } from "@/frontend/features/cms-lite/contexts/LanguageContext";

/**
 * CMS Lite Public Pages Layout
 * 
 * This layout is for the optional CMS Lite feature that allows Superspace users
 * to create public-facing websites. 
 * 
 * Note: Currently using LanguageProvider only. 
 * Cart and Currency providers require workspaceId which isn't available in public routes.
 */
export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="cms-lite-public min-h-screen bg-background">
        {children}
      </div>
    </LanguageProvider>
  );
}
