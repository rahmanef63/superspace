interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

/**
 * Public CMS Dynamic Route Handler
 * 
 * This is a catch-all route for CMS Lite public pages.
 * CMS Lite is an optional feature for Superspace users who want to create websites.
 * 
 * Routes:
 * - / -> HomePage (root of CMS site)
 * - /about -> AboutPage
 * - /products -> ProductsPage
 * - /products/[slug] -> ProductDetailPage
 * - /blog -> BlogPage
 * - /blog/[slug] -> BlogPostPage
 * - /portfolio -> PortfolioPage
 * - /hello -> HelloPage
 * 
 * Admin Interface:
 * - Access via /dashboard with slug 'cms-admin' or similar dynamic route
 * - Not all users need this feature - it's optional for those building websites
 * 
 * TODO: Complete integration
 * The CMS Lite pages need backend integration and proper data fetching.
 * Current pages use a mock backend client (~backend/client) that needs to be
 * replaced with Convex or your actual backend.
 */
export default async function CmsPublicPage({ params }: PageProps) {
  const { slug = [] } = await params;
  
  // Build the path for display
  const path = slug.length === 0 ? "/" : `/${slug.join("/")}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">CMS Lite Public Site</h1>
        <p className="text-xl text-muted-foreground">
          Path: <code className="px-2 py-1 bg-muted rounded">{path}</code>
        </p>
        
        <div className="bg-card border rounded-lg p-6 text-left space-y-4">
          <h2 className="text-2xl font-semibold">Feature Coming Soon</h2>
          <p className="text-muted-foreground">
            CMS Lite is an optional website builder feature for Superspace users.
            The public site pages will be integrated here once the backend is configured.
          </p>
          
          <div className="space-y-2">
            <p className="font-medium">Planned Public Routes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code>/</code> - Home Page</li>
              <li><code>/about</code> - About Page</li>
              <li><code>/products</code> - Products Catalog</li>
              <li><code>/products/[slug]</code> - Product Details</li>
              <li><code>/blog</code> - Blog Posts</li>
              <li><code>/blog/[slug]</code> - Individual Post</li>
              <li><code>/portfolio</code> - Portfolio Gallery</li>
              <li><code>/hello</code> - Contact/Hello Page</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>For Admin:</strong> Access the CMS admin panel through the dashboard.
              This is an optional feature - not all Superspace users need a public website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
