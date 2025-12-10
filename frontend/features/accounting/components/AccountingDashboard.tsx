"use client"

import React, { useState } from "react"
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AccountingData } from "../types"

interface AccountingDashboardProps {
    data: AccountingData
    isLoading?: boolean
}

export default function AccountingDashboard({ data, isLoading }: AccountingDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading accounting data...</div>
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +12.5%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.stats.netProfit.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +8.2%
                            </span>
                            margin
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.stats.expenses.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-500 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +2.1%
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{data.stats.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            Waiting for payment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Recent Transactions */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                                <CardDescription>Latest financial activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.recentTransactions.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tx.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.date} • {tx.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-foreground'
                                                    }`}>
                                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] h-5">{tx.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Invoices */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Invoices</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                                <CardDescription>Status of sent invoices</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.recentInvoices.slice(0, 5).map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{inv.customer}</p>
                                                    <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold">${inv.amount.toLocaleString()}</p>
                                                <Badge variant={
                                                    inv.status === 'paid' ? 'default' :
                                                        inv.status === 'overdue' ? 'destructive' : 'secondary'
                                                } className="text-[10px] h-5">
                                                    {inv.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Plus className="h-5 w-5" />
                                    <span>New Transaction</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Create Invoice</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Record Expense</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                                    <Download className="h-5 w-5" />
                                    <span>Export Report</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Transactions</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Transaction history view coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Invoice management view coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
