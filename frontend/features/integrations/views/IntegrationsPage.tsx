"use client"

import React from "react"
import { Plug, Plus, Settings, CheckCircle, ExternalLink } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useIntegrations } from "../hooks/useIntegrations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
]

const AVAILABLE_INTEGRATIONS = [
  { id: "slack", name: "Slack", icon: "💬", category: "communication", description: "Team communication" },
  { id: "discord", name: "Discord", icon: "🎮", category: "communication", description: "Community chat" },
  { id: "gdrive", name: "Google Drive", icon: "📁", category: "storage", description: "Cloud storage" },
  { id: "dropbox", name: "Dropbox", icon: "📦", category: "storage", description: "File sync" },
  { id: "salesforce", name: "Salesforce", icon: "☁️", category: "crm", description: "CRM platform" },
  { id: "hubspot", name: "HubSpot", icon: "🟠", category: "crm", description: "Marketing & sales" },
  { id: "mailchimp", name: "Mailchimp", icon: "📧", category: "marketing", description: "Email marketing" },
  { id: "stripe", name: "Stripe", icon: "💳", category: "payment", description: "Payment processing" },
  { id: "zapier", name: "Zapier", icon: "⚡", category: "automation", description: "Workflow automation" },
  { id: "github", name: "GitHub", icon: "🐙", category: "development", description: "Code repository" },
]

/**
 * Integrations Page Component
 */
export default function IntegrationsPage({ workspaceId }: IntegrationsPageProps) {
  const { isLoading, integrations } = useIntegrations(workspaceId)
  const [selectedCategory, setSelectedCategory] = React.useState("all")

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
    (i) => selectedCategory === "all" || i.category === selectedCategory
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Plug className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Integrations</h1>
            <p className="text-sm text-muted-foreground">
              {integrations.length} connected
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="connected">
              Connected ({integrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {/* Category Filter */}
            <div className="mb-4 flex gap-2 flex-wrap">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => {
                const isConnected = connectedIds.includes(integration.id)
                return (
                  <Card key={integration.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription>{integration.description}</CardDescription>
                          </div>
                        </div>
                        {isConnected && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full gap-2" 
                        variant={isConnected ? "outline" : "default"}
                      >
                        {isConnected ? (
                          <>
                            <Settings className="h-4 w-4" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading integrations...</p>
              </div>
            ) : integrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Plug className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No integrations connected</p>
                <Button>Browse Integrations</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration: any) => {
                  const info = AVAILABLE_INTEGRATIONS.find(i => i.id === integration.integrationId)
                  return (
                    <Card key={integration._id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{info?.icon || "🔌"}</span>
                          <div>
                            <h4 className="font-medium">{info?.name || integration.integrationId}</h4>
                            <p className="text-sm text-muted-foreground">
                              Connected {new Date(integration.connectedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
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
    </div>
  )
}
