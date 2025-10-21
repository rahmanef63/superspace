// Secondary Sidebar Components
export * from "./components/SecondarySidebarLayout";
export * from "./components/SecondarySidebarHeader";
export * from "./components/SecondarySidebar";
export * from "./components/SecondarySidebarTools";

// Barrel export for easier access
import { SecondarySidebarLayout } from "./components/SecondarySidebarLayout";
import { SecondarySidebarHeader } from "./components/SecondarySidebarHeader";
import { SecondarySidebar } from "./components/SecondarySidebar";
import { SecondarySidebarTools } from "./components/SecondarySidebarTools";

export const SecondarySidebarLayoutNamespace = SecondarySidebarLayout;

export default {
  Layout: SecondarySidebarLayout,
  Header: SecondarySidebarHeader,
  Sidebar: SecondarySidebar,
  Tools: SecondarySidebarTools,
};
