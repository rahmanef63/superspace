/**
 * ERP Inventory Module Main Page
 *
 * Main entry point for the Inventory Management module
 */

'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Edit3,
  ArrowRightLeft,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react'

// Import sub-components (will be created)
import ItemsOverview from './items/ItemsOverview'
import StockOverview from './stock/StockOverview'
import WarehousesOverview from './warehouses/WarehousesOverview'
import PurchaseOrdersOverview from './purchase-orders/PurchaseOrdersOverview'
import SuppliersOverview from './suppliers/SuppliersOverview'
import AdjustmentsOverview from './adjustments/AdjustmentsOverview'
import TransfersOverview from './transfers/TransfersOverview'
import InventoryReports from './reports/InventoryReports'

interface InventoryPageProps {
  workspaceId?: string | null
}

export default function InventoryPage({ workspaceId }: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Quick stats (will be fetched from API)
  const stats = {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    pendingPOs: 0,
    warehouses: 0,
    totalSuppliers: 0,
    expiringSoon: 0,
    outOfStock: 0,
  }

  // Low stock alerts (will be fetched)
  const lowStockAlerts = []

  // Recent activities (will be fetched)
  const recentActivities = []

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage inventory, warehouses, purchase orders, and suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.warehouses} warehouses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.outOfStock} out of stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPOs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSuppliers} suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">
            Items
            <Badge variant="secondary" className="ml-2">{stats.totalItems}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stock">
            Stock
            <Badge variant="secondary" className="ml-2">{stats.lowStockItems}</Badge>
          </TabsTrigger>
          <TabsTrigger value="warehouses">
            Warehouses
            <Badge variant="secondary" className="ml-2">{stats.warehouses}</Badge>
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            Purchase Orders
            <Badge variant="secondary" className="ml-2">{stats.pendingPOs}</Badge>
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            Suppliers
            <Badge variant="secondary" className="ml-2">{stats.totalSuppliers}</Badge>
          </TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Low Stock Alerts
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>
                Items that need to be reordered soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockAlerts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockAlerts.slice(0, 5).map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{alert.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {alert.current} / Min: {alert.min}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.current === 0 ? "destructive" : "secondary"}>
                          {alert.current === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.warehouse}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Low Stock Items</h3>
                  <p className="text-muted-foreground">
                    All items are adequately stocked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common inventory operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Stock Adjustment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer Stock
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest inventory-related activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity, i) => (
                      <div key={i} className="flex items-center space-x-4 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>{activity.action}</span>
                        <span className="text-muted-foreground ml-auto">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Value by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>
                Stock value distribution across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Inventory analytics and insights coming soon
                </p>
                <Button variant="outline">View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <ItemsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="stock">
          <StockOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="warehouses">
          <WarehousesOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <PurchaseOrdersOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="adjustments">
          <AdjustmentsOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="transfers">
          <TransfersOverview workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="reports">
          <InventoryReports workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}