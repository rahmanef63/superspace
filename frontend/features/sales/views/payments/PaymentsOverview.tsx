/**
 * Payments Overview Component
 * Placeholder for the payments sub-module
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Plus, DollarSign, Clock, CheckCircle } from 'lucide-react'

interface PaymentsOverviewProps {
  workspaceId?: string | null
}

export default function PaymentsOverview({ workspaceId }: PaymentsOverviewProps) {
  const [activeTab, setActiveTab] = useState('all')
  const payments: unknown[] = [] // Will be populated from database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Track and manage payment transactions</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending"><Clock className="h-3 w-3 mr-1" />Pending</TabsTrigger>
            <TabsTrigger value="completed"><CheckCircle className="h-3 w-3 mr-1" />Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg border text-center">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground">Total Received</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <CreditCard className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium text-foreground">No payments recorded</p>
                <p className="text-sm text-muted-foreground">Record payments as they come in</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
