import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui';

export default function AnalyticsFeature() {
  const renderDashboard = () => (
    <div className="h-full p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="text-3xl font-bold">1,234</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="text-3xl font-bold">$45,678</div>
              <div className="text-sm text-gray-500">+8% from last month</div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <div className="p-4">
              <div className="text-3xl font-bold">23</div>
              <div className="text-sm text-gray-500">+3 new this week</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="h-full p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Reports</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Report</CardTitle>
            </CardHeader>
            <div className="p-4">
              <p className="text-gray-600">Detailed monthly analytics report will be displayed here.</p>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <div className="p-4">
              <p className="text-gray-600">User engagement metrics and trends.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRealtime = () => (
    <div className="h-full p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Analytics</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Metrics</CardTitle>
            </CardHeader>
            <div className="p-4">
              <p className="text-gray-600">Real-time data monitoring dashboard.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // Determine view based on current path
  const path = window.location.pathname;
  
  if (path.includes('/analytics/reports')) {
    return renderReports();
  } else if (path.includes('/analytics/realtime')) {
    return renderRealtime();
  } else {
    return renderDashboard();
  }
}
