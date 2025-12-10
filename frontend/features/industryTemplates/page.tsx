"use client";

import dynamic from "next/dynamic";

const IndustryTemplatesPage = dynamic(
  () => import("@/frontend/features/industryTemplates/views/IndustryTemplatesPage"),
  { ssr: false }
);

export default function IndustryTemplatesPageWrapper() {
  return <IndustryTemplatesPage />;
}
