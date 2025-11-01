/**
 * CMS Lite Public Pages Layout
 * 
 * This layout is for the optional CMS Lite feature that allows Superspace users
 * to create public-facing websites. Not all users will need this feature.
 * 
 * TODO: Add context providers when CMS Lite backend is integrated
 * Currently providers reference ~backend/client which needs to be replaced
 * with Convex or the actual backend implementation.
 * 
 * Required providers (once backend is ready):
 * - ThemeProvider - Dark/light mode
 * - LanguageProvider - i18n support
 * - CurrencyProvider - Multi-currency for e-commerce
 * - CartProvider - Shopping cart functionality
 */
export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cms-lite-public">
      {children}
    </div>
  );
}

export const metadata = {
  title: {
    default: "Website",
    template: "%s | Website",
  },
  description: "Content managed website powered by Superspace CMS Lite",
};
