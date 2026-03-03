import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Layout, Globe, Clock, MoreVertical, Edit, ExternalLink, Trash2 } from "lucide-react";
import type { BuilderData, BuilderProject } from "../ui/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface BuilderDashboardProps {
    data: BuilderData;
    onOpenProject: (project: BuilderProject) => void;
    onCreateProject: () => void;
}

export const BuilderDashboard: React.FC<BuilderDashboardProps> = ({ data, onOpenProject, onCreateProject }) => {
    const { projects, templates, isLoading } = data;

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Loading projects...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Your Sites</h2>
                <Button onClick={onCreateProject}>
                    <Plus className="mr-2 h-4 w-4" /> New Site
                </Button>
            </div>

            <Tabs defaultValue="projects" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="space-y-6">
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                            <Layout className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No projects yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start building your first website today.</p>
                            <Button onClick={onCreateProject}>Create Project</Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg">
                                    <div
                                        className="aspect-video w-full bg-muted cursor-pointer relative overflow-hidden"
                                        onClick={() => onOpenProject(project)}
                                    >
                                        {project.thumbnail ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${project.thumbnail})` }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-accent/50">
                                                <Layout className="h-12 w-12 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button variant="secondary" size="sm" className="gap-2">
                                                <Edit className="h-4 w-4" /> Edit
                                            </Button>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base truncate">{project.name}</CardTitle>
                                                <CardDescription className="text-xs truncate flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3" /> {new Date(project.lastModified).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onOpenProject(project)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    {project.url && (
                                                        <DropdownMenuItem onClick={() => window.open(project.url, '_blank')}>
                                                            <ExternalLink className="h-4 w-4 mr-2" /> Visit
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                        <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                                            {project.status === 'published' ? <Globe className="h-3 w-3 mr-1" /> : null}
                                            {project.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{project.pageCount} Pages</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {templates.map(template => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-all">
                                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                    {/* Placeholder for template thumb */}
                                    <div className="w-full h-full flex items-center justify-center bg-accent/20">
                                        <Layout className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                </div>
                                <CardHeader className="p-3">
                                    <CardTitle className="text-sm">{template.name}</CardTitle>
                                    <CardDescription className="text-xs">{template.category}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
