// Debug script to check which modules are being loaded
const modules = import.meta.glob([
  "../convex/auth/auth.ts",
  "../convex/components/**/*.ts",
  "../convex/features/**/*.ts",
  "../convex/menu/chat/*.ts",
  "../convex/menu/cms/*.ts",
  "../convex/menu/database/*.ts",
  "../convex/menu/page/documents.ts",
  "../convex/menu/page/presence.ts",
  "../convex/menu/page/prosemirror.ts",
  "../convex/menu/page/db/fields.ts",
  "../convex/menu/page/db/rows.ts",
  "../convex/menu/page/db/tables.ts",
  "../convex/features/menus/itemComponents.ts",
  "../convex/features/menus/menuItems.ts",
  "../convex/features/menus/menus.ts",
  "../convex/features/menus/sets.ts",
  "../convex/payment/paymentAttempts.ts",
  "../convex/user/**/*.ts",
  "../convex/workspace/**/*.ts",
  "../convex/_generated/**/*.js",
], { eager: true });


for (const path of Object.keys(modules).sort()) {
  const mod = modules[path] as any;
  const exports = Object.keys(mod);

}
