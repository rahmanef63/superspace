import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FileText, Image, Activity, TrendingUp, Search, Filter } from "lucide-react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Loading } from "../../../shared/components/Loading";
import { SearchBar } from "../components/SearchBar";

interface DashboardStats {
  totalProducts: number;
  totalPosts: number;
  totalPortfolio: number;
  publishedProducts: number;
  publishedPosts: number;
  publishedPortfolio: number;
  draftProducts: number;
  draftPosts: number;
  draftPortfolio: number;
}

interface RecentItem {
  id: number;
  title: string;
  type: 'product' | 'post' | 'portfolio';
  status: string;
  updatedAt?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const backend = useBackend();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RecentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "product" | "post" | "portfolio">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, posts, portfolio] = await Promise.all([
        backend.products.listAll({}),
        backend.posts.listAll({}),
        backend.portfolio.listAll({}),
      ]);

      const draftProducts = products.products.filter((p: any) => p.status === "draft").length;
      const draftPosts = posts.posts.filter((p: any) => p.status === "draft").length;
      const draftPortfolio = portfolio.items.filter((p: any) => p.status === "draft").length;

      setStats({
        totalProducts: products.products.length,
        totalPosts: posts.posts.length,
        totalPortfolio: portfolio.items.length,
        publishedProducts: products.products.filter((p: any) => p.status === "published").length,
        publishedPosts: posts.posts.filter((p: any) => p.status === "published").length,
        publishedPortfolio: portfolio.items.filter((p: any) => p.status === "published").length,
        draftProducts,
        draftPosts,
        draftPortfolio,
      });

      const recent: RecentItem[] = [
        ...products.products.map((p: any) => ({
          id: p.id,
          title: p.titleEn || p.titleId || p.titleAr,
          type: 'product' as const,
          status: p.status,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        ...posts.posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: 'post' as const,
          status: p.status,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        ...portfolio.items.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: 'portfolio' as const,
          status: p.status,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 20);

      setRecentItems(recent);
      setFilteredItems(recent);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = recentItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredItems(filtered);
  }, [searchQuery, filterType, filterStatus, recentItems]);

  if (loading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: "Products",
      total: stats?.totalProducts || 0,
      published: stats?.publishedProducts || 0,
      draft: stats?.draftProducts || 0,
      icon: Package,
      link: "/admin/products",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Blog Posts",
      total: stats?.totalPosts || 0,
      published: stats?.publishedPosts || 0,
      draft: stats?.draftPosts || 0,
      icon: FileText,
      link: "/admin/posts",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Portfolio",
      total: stats?.totalPortfolio || 0,
      published: stats?.publishedPortfolio || 0,
      draft: stats?.draftPortfolio || 0,
      icon: Image,
      link: "/admin/portfolio",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.link}
              href={card.link}
              className="border rounded-lg p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">{card.title}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Total</span>
                  <span className="font-semibold">{card.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Published</span>
                  <span className="font-semibold text-green-600">{card.published}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Draft</span>
                  <span className="font-semibold text-yellow-600">{card.draft}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Quick Stats</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-foreground/70">Total Content Items</span>
              <span className="font-semibold">{(stats?.totalProducts || 0) + (stats?.totalPosts || 0) + (stats?.totalPortfolio || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-foreground/70">Total Published</span>
              <span className="font-semibold text-green-600">{(stats?.publishedProducts || 0) + (stats?.publishedPosts || 0) + (stats?.publishedPortfolio || 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground/70">Total Drafts</span>
              <span className="font-semibold text-yellow-600">{(stats?.draftProducts || 0) + (stats?.draftPosts || 0) + (stats?.draftPortfolio || 0)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <span className="text-sm text-foreground/60">{filteredItems.length} items</span>
          </div>

          <div className="space-y-3 mb-4">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search recent items..."
            />

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              >
                <option value="all">All Types</option>
                <option value="product">Products</option>
                <option value="post">Posts</option>
                <option value="portfolio">Portfolio</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-foreground/60 text-center py-4">No items found</p>
            ) : (
              filteredItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/admin/${item.type === 'post' ? 'posts' : item.type === 'product' ? 'products' : 'portfolio'}`}
                  className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.type === 'product' ? 'bg-blue-500/10 text-blue-500' :
                          item.type === 'post' ? 'bg-green-500/10 text-green-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          {item.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
