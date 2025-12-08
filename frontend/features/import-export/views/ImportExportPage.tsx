"use client"

import React from "react"
import { ArrowUpDown, Upload, Download, FileSpreadsheet, Clock, CheckCircle, XCircle } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useImportExport } from "../hooks/useImportExport"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImportExportPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Import/Export Page Component
 */
export default function ImportExportPage({ workspaceId }: ImportExportPageProps) {
  const { isLoading, history } = useImportExport(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use import/export
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <ArrowUpDown className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Import / Export</h1>
            <p className="text-sm text-muted-foreground">
              Manage data import and export
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="import">
          <TabsList>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:bg-accent">
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <CardTitle className="mt-2">CSV Import</CardTitle>
                  <CardDescription>
                    Import data from CSV files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent">
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <CardTitle className="mt-2">Excel Import</CardTitle>
                  <CardDescription>
                    Import data from Excel files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Excel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {["Contacts", "Tasks", "Projects", "Inventory"].map((item) => (
                <Card key={item}>
                  <CardHeader>
                    <CardTitle className="text-base">{item}</CardTitle>
                    <CardDescription>
                      Export all {item.toLowerCase()} data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Clock className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No import/export history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item: any) => (
                  <Card key={item._id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {item.type === "import" ? (
                          <Upload className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Download className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.recordCount} records • {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.status === "completed" ? "default" :
                          item.status === "failed" ? "destructive" : "secondary"
                        }
                      >
                        {item.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {item.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                        {item.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
