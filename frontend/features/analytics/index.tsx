import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { BarChart3, TrendingUp, LineChart, Construction } from 'lucide-react';

// Note: Analytics feature is in development
// When ready, this will fetch real data from Convex queries

export default function AnalyticsFeature() {
  const renderDashboard = () => (
    <div className="h-full p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Analytics Dashboard</h2>
        
        {/* Coming Soon State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
  );

  const renderReports = () => (
    <div className="h-full p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Analytics Reports</h2>
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
  );

  const renderRealtime = () => (
    <div className="h-full p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Real-time Analytics</h2>
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
