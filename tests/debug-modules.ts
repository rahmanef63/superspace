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
  "../convex/menu/store/itemComponents.ts",
  "../convex/menu/store/menuItems.ts",
  "../convex/menu/store/menus.ts",
  "../convex/menu/store/sets.ts",
  "../convex/payment/paymentAttempts.ts",
  "../convex/user/**/*.ts",
  "../convex/workspace/**/*.ts",
  "../convex/_generated/**/*.js",
], { eager: true });

console.log("Loaded modules:");
for (const path of Object.keys(modules).sort()) {
  const mod = modules[path] as any;
  const exports = Object.keys(mod);
  console.log(`  ${path} -> exports: ${exports.join(", ")}`);
}
