import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { BarChart3, TrendingUp, LineChart, Construction } from 'lucide-react';
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

// Note: Analytics feature is in development
// When ready, this will fetch real data from Convex queries

export default function AnalyticsFeature() {
  const renderDashboard = () => (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={BarChart3}
        title="Analytics Dashboard"
        subtitle="Insights on usage, performance, and trends"
        badge={{ text: "Development", variant: "secondary" }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Coming Soon State */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-5 w-5" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground/50">--</div>
                <div className="text-sm text-muted-foreground">Data will appear here</div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-5 w-5" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground/50">--</div>
                <div className="text-sm text-muted-foreground">Data will appear here</div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <LineChart className="h-5 w-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground/50">--</div>
                <div className="text-sm text-muted-foreground">Data will appear here</div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Coming Soon Notice */}
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Construction className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Analytics Coming Soon</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                We're building powerful analytics tools to help you understand your workspace activity.
                Check back soon for insights on usage, performance, and trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={BarChart3}
        title="Analytics Reports"
        subtitle="Generate detailed reports on your workspace activity"
        badge={{ text: "Development", variant: "secondary" }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Construction className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Reports Coming Soon</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Generate detailed reports on your workspace activity.
                This feature is currently in development.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRealtime = () => (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={BarChart3}
        title="Real-time Analytics"
        subtitle="Monitor your workspace activity in real-time"
        badge={{ text: "Development", variant: "secondary" }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Construction className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Real-time Monitoring Coming Soon</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Monitor your workspace activity in real-time.
                This feature is currently in development.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Determine view based on current path
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  
  if (path.includes('/analytics/reports')) {
    return renderReports();
  } else if (path.includes('/analytics/realtime')) {
    return renderRealtime();
  } else {
    return renderDashboard();
  }
}
