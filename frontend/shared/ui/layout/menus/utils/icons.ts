import { Folder, FileText, Hash, Layers } from "lucide-react";
import { MenuItemType } from "../types";

/**
 * Get default icon component based on menu item type
 */
export function getDefaultIconForType(type: MenuItemType) {
  switch (type) {
    case "folder":
      return Folder;
    case "group":
      return Layers;
    case "document":
      return FileText;
    default:
      return Hash;
  }
}

/**
 * Generate slug from name
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Ensure unique slug within workspace
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
