"use client"

import React, { useState } from "react"
import { 
  Plug, 
  Plus, 
  Settings, 
  CheckCircle, 
  ExternalLink, 
  Search,
  Trash2,
  Power,
  RefreshCw,
  AlertCircle,
  Zap,
  Clock
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useIntegrations } from "../hooks/useIntegrations"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface IntegrationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const INTEGRATION_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "communication", name: "Communication" },
  { id: "storage", name: "Storage" },
  { id: "crm", name: "CRM" },
  { id: "marketing", name: "Marketing" },
  { id: "payment", name: "Payment" },
  { id: "development", name: "Development" },
  { id: "automation", name: "Automation" },
]

const AVAILABLE_INTEGRATIONS = [
  { id: "slack", name: "Slack", icon: "💬", category: "communication", description: "Team communication and notifications", color: "bg-purple-500" },
  { id: "discord", name: "Discord", icon: "🎮", category: "communication", description: "Community chat and updates", color: "bg-indigo-500" },
  { id: "gdrive", name: "Google Drive", icon: "📁", category: "storage", description: "Cloud storage and file sync", color: "bg-yellow-500" },
  { id: "dropbox", name: "Dropbox", icon: "📦", category: "storage", description: "File sync and backup", color: "bg-blue-500" },
  { id: "salesforce", name: "Salesforce", icon: "☁️", category: "crm", description: "CRM and sales platform", color: "bg-blue-600" },
  { id: "hubspot", name: "HubSpot", icon: "🟠", category: "crm", description: "Marketing and sales CRM", color: "bg-orange-500" },
  { id: "mailchimp", name: "Mailchimp", icon: "📧", category: "marketing", description: "Email marketing automation", color: "bg-yellow-400" },
  { id: "stripe", name: "Stripe", icon: "💳", category: "payment", description: "Payment processing", color: "bg-purple-600" },
  { id: "zapier", name: "Zapier", icon: "⚡", category: "automation", description: "Workflow automation", color: "bg-orange-600" },
  { id: "github", name: "GitHub", icon: "🐙", category: "development", description: "Code repository and CI/CD", color: "bg-gray-800" },
  { id: "notion", name: "Notion", icon: "📝", category: "productivity", description: "Docs and knowledge base", color: "bg-gray-700" },
  { id: "jira", name: "Jira", icon: "🎯", category: "development", description: "Issue tracking", color: "bg-blue-700" },
]

/**
 * Integrations Page Component
 * Manage third-party integrations with OAuth support
 */
export default function IntegrationsPage({ workspaceId }: IntegrationsPageProps) {
  const { isLoading, integrations, connectIntegration, disconnectIntegration } = useIntegrations(workspaceId)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to manage integrations
          </p>
        </div>
      </div>
    )
  }

  const connectedIds = integrations.map((i: any) => i.integrationId)
  
  const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (i) => {
      const matchesCategory = selectedCategory === "all" || i.category === selectedCategory
      const matchesSearch = !searchQuery || 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    }
  )

  const handleConnect = async () => {
    if (!workspaceId || !selectedIntegration) return
    setIsProcessing(true)

    try {
      await connectIntegration({
        workspaceId,
        integrationId: selectedIntegration.id,
        name: selectedIntegration.name,
      })
      setConnectDialogOpen(false)
      setSelectedIntegration(null)
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!workspaceId || !selectedIntegration) return
    setIsProcessing(true)

    try {
      const connectedIntegration = integrations.find(
        (i: any) => i.integrationId === selectedIntegration.id
      )
      if (connectedIntegration) {
        await disconnectIntegration({
          workspaceId,
          integrationId: connectedIntegration._id,
        })
      }
      setDisconnectDialogOpen(false)
      setSelectedIntegration(null)
    } catch (error) {
      console.error("Failed to disconnect:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openConnectDialog = (integration: any) => {
    setSelectedIntegration(integration)
    setConnectDialogOpen(true)
  }

  const openDisconnectDialog = (integration: any) => {
    setSelectedIntegration(integration)
    setDisconnectDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col p-6 gap-6">
      <FeatureHeader
        icon={Plug}
        title="Integrations"
        subtitle={`${integrations.length} connected`}
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Browse All",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "refresh",
            label: "Refresh",
            icon: RefreshCw,
            onClick: () => {},
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="available" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="available">
                <Plug className="h-4 w-4 mr-2" />
                Available
              </TabsTrigger>
              <TabsTrigger value="connected">
                <CheckCircle className="h-4 w-4 mr-2" />
                Connected ({integrations.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="available" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {INTEGRATION_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Integrations Grid */}
            {filteredIntegrations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">No integrations found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try a different search or category
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations.map((integration) => {
                  const isConnected = connectedIds.includes(integration.id)
                  return (
                    <Card key={integration.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${integration.color} text-white text-xl`}>
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {integration.name}
                                {isConnected && (
                                  <Badge variant="default" className="gap-1 text-xs">
                                    <CheckCircle className="h-3 w-3" />
                                    Connected
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">
                                {integration.category}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {integration.description}
                        </p>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        {isConnected ? (
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Sync Now
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => openDisconnectDialog(integration)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Disconnect
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <Button 
                            className="w-full gap-2"
                            onClick={() => openConnectDialog(integration)}
                          >
                            <Plus className="h-4 w-4" />
                            Connect
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading integrations...</p>
              </div>
            ) : integrations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <Plug className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">No integrations connected</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse available integrations to get started
                    </p>
                  </div>
                  <Button onClick={() => document.querySelector('[value="available"]')?.dispatchEvent(new Event('click'))}>
                    Browse Integrations
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration: any) => {
                  const info = AVAILABLE_INTEGRATIONS.find(i => i.id === integration.integrationId)
                  return (
                    <Card key={integration._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${info?.color || "bg-gray-500"} text-white text-xl`}>
                            {info?.icon || "🔌"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{info?.name || integration.name}</h4>
                              <Badge 
                                variant={integration.status === "active" ? "default" : "secondary"}
                                className="gap-1"
                              >
                                {integration.status === "active" ? (
                                  <><Power className="h-3 w-3" /> Active</>
                                ) : integration.status === "error" ? (
                                  <><AlertCircle className="h-3 w-3" /> Error</>
                                ) : (
                                  <><Clock className="h-3 w-3" /> Inactive</>
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>Connected {new Date(integration.createdAt).toLocaleDateString()}</span>
                              {integration.lastSyncAt && (
                                <span>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Sync
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Zap className="h-4 w-4 mr-2" />
                                  View Logs
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open in {info?.name}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedIntegration(info)
                                    setDisconnectDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Disconnect
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedIntegration && (
                <span className="text-2xl">{selectedIntegration.icon}</span>
              )}
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">What this integration does:</p>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      <li>• Sync data between your workspace and {selectedIntegration?.name}</li>
                      <li>• Receive real-time notifications</li>
                      <li>• Automate workflows</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-sm text-muted-foreground">
              You'll be redirected to {selectedIntegration?.name} to authorize access. 
              You can disconnect this integration at any time.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isProcessing}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {isProcessing ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect {selectedIntegration?.name}?</DialogTitle>
            <DialogDescription>
              This will remove the connection between your workspace and {selectedIntegration?.name}. 
              Any synced data will remain, but future syncs will stop.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={isProcessing}>
              {isProcessing ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
