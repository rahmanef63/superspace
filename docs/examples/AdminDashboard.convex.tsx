"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, FileText, Image, TrendingUp, Activity } from "lucide-react";
import { Loading } from "@/frontend/features/cms-lite/shared/components/Loading";
import { SearchBar } from "@/frontend/features/cms-lite/features/admin/components/SearchBar";

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
  id: string;
  title: string;
  type: 'product' | 'post' | 'portfolio';
  status: string;
  updatedAt?: string;
  createdAt: string;
}

/**
 * AdminDashboard - Convex Version
 * 
 * This is the migrated version using Convex hooks instead of REST API.
 * 
 * Key changes:
 * 1. workspaceId from params
 * 2. useQuery for reactive data fetching
 * 3. No manual refresh needed - Convex auto-updates
 * 4. Simplified loading states
 */
export default function AdminDashboardConvex({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  // Get workspaceId from params
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.workspaceId as Id<"workspaces">;

  // Convex queries - reactive and auto-updating!
  // Note: These queries don't need workspaceId - it's implicit from auth context
  const productsData = useQuery(api.features.cms_lite.products.api.queries.listAllProducts, {});
  const postsData = useQuery(api.features.cms_lite.posts.api.queries.listAllPosts, { locale: "en" });
  const portfolioData = useQuery(api.features.cms_lite.portfolio.api.queries.listAllPortfolio, { locale: "en" });

  // Extract arrays from response objects
  const products = productsData?.products || [];
  const posts = postsData?.posts || [];
  const portfolio = portfolioData?.items || [];

  const [filteredItems, setFilteredItems] = useState<RecentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "product" | "post" | "portfolio">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  // Loading state - Convex returns undefined while loading
  const isLoading = productsData === undefined || postsData === undefined || portfolioData === undefined;

  // Calculate stats from Convex data
  const stats: DashboardStats | null = isLoading ? null : {
    totalProducts: products.length,
    totalPosts: posts.length,
    totalPortfolio: portfolio.length,
    publishedProducts: products.filter((p: any) => p.status === "published").length,
    publishedPosts: posts.filter((p: any) => p.status === "published").length,
    publishedPortfolio: portfolio.filter((p: any) => p.item?.status === "published").length,
    draftProducts: products.filter((p: any) => p.status === "draft").length,
    draftPosts: posts.filter((p: any) => p.status === "draft").length,
    draftPortfolio: portfolio.filter((p: any) => p.item?.status === "draft").length,
  };

  // Build recent items list
  const recentItems: RecentItem[] = isLoading ? [] : [
    ...(products?.map((p: any) => ({
      id: p._id,
      title: p.titleEn || p.titleId || p.titleAr || "Untitled",
      type: 'product' as const,
      status: p.status,
      createdAt: new Date(p._creationTime).toISOString(),
      updatedAt: p.lastModified ? new Date(p.lastModified).toISOString() : undefined,
    })) || []),
    ...(posts?.map((p: any) => ({
      id: p._id,
      title: p.title || "Untitled",
      type: 'post' as const,
      status: p.status,
      createdAt: new Date(p._creationTime).toISOString(),
      updatedAt: p.lastModified ? new Date(p.lastModified).toISOString() : undefined,
    })) || []),
    ...(portfolio?.map((p: any) => ({
      id: p._id,
      title: p.title || "Untitled",
      type: 'portfolio' as const,
      status: p.status,
      createdAt: new Date(p._creationTime).toISOString(),
      updatedAt: p.lastModified ? new Date(p.lastModified).toISOString() : undefined,
    })) || []),
  ].sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt;
    const bTime = b.updatedAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  }).slice(0, 20);

  // Filter recent items based on search and filters
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

  if (isLoading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: "Products",
      total: stats?.totalProducts || 0,
      published: stats?.publishedProducts || 0,
      draft: stats?.draftProducts || 0,
      icon: Package,
      link: `/dashboard/${workspaceId}/cms-admin/products`,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Blog Posts",
      total: stats?.totalPosts || 0,
      published: stats?.publishedPosts || 0,
      draft: stats?.draftPosts || 0,
      icon: FileText,
      link: `/dashboard/${workspaceId}/cms-admin/posts`,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Portfolio",
      total: stats?.totalPortfolio || 0,
      published: stats?.publishedPortfolio || 0,
      draft: stats?.draftPortfolio || 0,
      icon: Image,
      link: `/dashboard/${workspaceId}/cms-admin/portfolio`,
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
              <span className="font-semibold">
                {(stats?.totalProducts || 0) + (stats?.totalPosts || 0) + (stats?.totalPortfolio || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-foreground/70">Total Published</span>
              <span className="font-semibold text-green-600">
                {(stats?.publishedProducts || 0) + (stats?.publishedPosts || 0) + (stats?.publishedPortfolio || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground/70">Total Drafts</span>
              <span className="font-semibold text-yellow-600">
                {(stats?.draftProducts || 0) + (stats?.draftPosts || 0) + (stats?.draftPortfolio || 0)}
              </span>
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
                  href={`/dashboard/${workspaceId}/cms-admin/${item.type === 'post' ? 'posts' : item.type === 'product' ? 'products' : 'portfolio'}`}
                  className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                          {item.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'published' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-foreground/60 whitespace-nowrap">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
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
