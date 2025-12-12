'use client'

import React, { useState } from 'react'
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Plus, Mail, Phone, Building, Trash2, Edit } from 'lucide-react'
import { useCrmCustomers } from '../../hooks'
import type { CustomerStatus, CreateCustomerInput } from '../../hooks'

interface ContactsOverviewProps {
  workspaceId?: Id<"workspaces"> | null
}

const STATUS_OPTIONS: { value: CustomerStatus; label: string; color: string }[] = [
  { value: "lead", label: "Lead", color: "bg-blue-500/10 text-blue-600" },
  { value: "prospect", label: "Prospect", color: "bg-amber-500/10 text-amber-600" },
  { value: "customer", label: "Customer", color: "bg-emerald-500/10 text-emerald-600" },
  { value: "inactive", label: "Inactive", color: "bg-slate-500/10 text-slate-600" },
]

const DEFAULT_NEW_CUSTOMER: CreateCustomerInput = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "lead",
}

export default function ContactsOverview({ workspaceId }: ContactsOverviewProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>(DEFAULT_NEW_CUSTOMER)

  const {
    customers,
    stats,
    isLoading,
    isCreating,
    isDeleting,
    createCustomer,
    deleteCustomer,
    hasWorkspace,
  } = useCrmCustomers(workspaceId as Id<"workspaces"> | undefined)

  if (!hasWorkspace) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Select a workspace to view contacts.</p>
        </CardContent>
      </Card>
    )
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      toast.error("Name and email are required")
      return
    }

    try {
      await createCustomer(newCustomer)
      toast.success("Contact created successfully")
      setNewCustomer(DEFAULT_NEW_CUSTOMER)
      setDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create contact")
    }
  }

  const handleDeleteCustomer = async (customerId: any, name: string) => {
    const confirmed = window.confirm(`Delete contact "${name}"?`)
    if (!confirmed) return

    try {
      await deleteCustomer(customerId)
      toast.success("Contact deleted")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete contact")
    }
  }

  const getStatusBadge = (status: CustomerStatus) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status)
    return (
      <Badge className={statusConfig?.color ?? "bg-slate-500/10"}>
        {statusConfig?.label ?? status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts
            </CardTitle>
            <CardDescription>
              Manage your customer and business contacts
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Create a new customer or lead in your CRM.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone ?? ""}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newCustomer.company ?? ""}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={newCustomer.status}
                    onValueChange={(value: CustomerStatus) => setNewCustomer(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomer} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Contact"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.leads}</div>
            <div className="text-xs text-muted-foreground">Leads</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.prospects}</div>
            <div className="text-xs text-muted-foreground">Prospects</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Customers</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading contacts...
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-50" />
            <p>No contacts yet. Add your first contact to get started.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.company ? (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {customer.company}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
