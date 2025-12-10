/**
 * Inventory Feature Preview
 * 
 * Uses the REAL InventoryPage layout with mock data
 * showing items, stock, warehouses, and purchase orders
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
    Package,
    Warehouse,
    ShoppingCart,
    Truck,
    AlertTriangle,
    TrendingUp,
    Plus,
    Search,
    Filter,
    Download,
    ArrowRightLeft,
    BarChart3,
    Edit3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface InventoryMockData {
    stats: {
        totalItems: number
        totalValue: number
        lowStockItems: number
        pendingPOs: number
        warehouses: number
        outOfStock: number
    }
    lowStockAlerts: Array<{ itemName: string; current: number; min: number; warehouse: string }>
}

function InventoryPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as InventoryMockData
    const [activeTab, setActiveTab] = useState('overview')

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Inventory</span>
                    </div>
                    <Badge variant="secondary">{data.stats.totalItems} items</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold text-orange-500">{data.stats.lowStockItems}</p>
                        <p className="text-[10px] text-muted-foreground">Low Stock</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md text-center">
                        <p className="text-lg font-bold">{data.stats.warehouses}</p>
                        <p className="text-[10px] text-muted-foreground">Warehouses</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">Inventory Management</h2>
                        <p className="text-xs text-muted-foreground">Manage inventory, warehouses, and suppliers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="gap-2" disabled={!interactive}>
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.stats.totalItems.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Across {data.stats.warehouses} warehouses</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${data.stats.totalValue.toLocaleString()}</div>
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
                                <div className="text-2xl font-bold text-orange-600">{data.stats.lowStockItems}</div>
                                <p className="text-xs text-muted-foreground">{data.stats.outOfStock} out of stock</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.stats.pendingPOs}</div>
                                <p className="text-xs text-muted-foreground">Awaiting delivery</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)}>
                        <TabsList className="flex-wrap">
                            <TabsTrigger value="overview" disabled={!interactive}>Overview</TabsTrigger>
                            <TabsTrigger value="items" disabled={!interactive}>
                                Items <Badge variant="secondary" className="ml-1 text-xs">{data.stats.totalItems}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="stock" disabled={!interactive}>
                                Stock <Badge variant="secondary" className="ml-1 text-xs">{data.stats.lowStockItems}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="warehouses" disabled={!interactive}>
                                Warehouses <Badge variant="secondary" className="ml-1 text-xs">{data.stats.warehouses}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="purchase-orders" disabled={!interactive}>POs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-4">
                            {/* Low Stock Alerts */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            Low Stock Alerts
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" disabled={!interactive}>View All</Button>
                                    </div>
                                    <CardDescription>Items that need to be reordered</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {data.lowStockAlerts.map((alert, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{alert.itemName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Current: {alert.current} / Min: {alert.min}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={alert.current === 0 ? "destructive" : "secondary"}>
                                                        {alert.current === 0 ? "Out of Stock" : "Low Stock"}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground mt-1">{alert.warehouse}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <Button variant="outline" className="justify-start" disabled={!interactive}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Item
                                        </Button>
                                        <Button variant="outline" className="justify-start" disabled={!interactive}>
                                            <ShoppingCart className="mr-2 h-4 w-4" /> Create PO
                                        </Button>
                                        <Button variant="outline" className="justify-start" disabled={!interactive}>
                                            <Edit3 className="mr-2 h-4 w-4" /> Adjustment
                                        </Button>
                                        <Button variant="outline" className="justify-start" disabled={!interactive}>
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {['items', 'stock', 'warehouses', 'purchase-orders'].map((tab) => (
                            <TabsContent key={tab} value={tab} className="mt-4">
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium capitalize">{tab.replace('-', ' ')} Management</p>
                                        <p className="text-sm">Manage your {tab.replace('-', ' ')} here</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </ScrollArea>
        </div>
    )
}

export default defineFeaturePreview({
    featureId: 'inventory',
    name: 'Inventory',
    description: 'Manage inventory, warehouses, and purchase orders',
    component: InventoryPreview,
    category: 'business',
    tags: ['inventory', 'warehouse', 'stock', 'purchase-orders', 'suppliers'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Inventory Dashboard',
            description: 'Sample inventory with stock alerts',
            data: {
                stats: {
                    totalItems: 2456,
                    totalValue: 1250000,
                    lowStockItems: 12,
                    pendingPOs: 8,
                    warehouses: 3,
                    outOfStock: 3,
                },
                lowStockAlerts: [
                    { itemName: 'Widget A - Blue', current: 5, min: 50, warehouse: 'Main Warehouse' },
                    { itemName: 'Gadget Pro X', current: 0, min: 25, warehouse: 'East Storage' },
                    { itemName: 'Component C-100', current: 12, min: 100, warehouse: 'Main Warehouse' },
                ],
            },
        },
    ],
})
