/**
 * Builder Feature Preview
 * 
 * Shows a mock builder dashboard using the real BuilderDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import { BuilderDashboard } from '../components/BuilderDashboard'
import type { BuilderData, BuilderProject } from '../types'

// Mock Data for Preview
const MOCK_DATA: BuilderData = {
    isLoading: false,
    projects: [
        {
            id: '1',
            name: 'Corporate Site',
            lastModified: Date.now() - 1000 * 60 * 60 * 5,
            pageCount: 8,
            status: 'published',
            thumbnail: '',
            url: '#'
        },
        {
            id: '2',
            name: 'Q3 Landing Page',
            lastModified: Date.now() - 1000 * 60 * 60 * 24 * 1,
            pageCount: 1,
            status: 'draft',
            thumbnail: ''
        },
        {
            id: '3',
            name: 'Blog Redesign',
            lastModified: Date.now() - 1000 * 60 * 60 * 24 * 7,
            pageCount: 15,
            status: 'draft',
            thumbnail: ''
        }
    ],
    templates: [
        { id: 't1', name: 'SaaS Startup', category: 'Business', description: 'Modern SaaS landing page', thumbnail: '' },
        { id: 't2', name: 'Portfolio Simple', category: 'Portfolio', description: 'Minimalist portfolio', thumbnail: '' },
        { id: 't3', name: 'E-commerce Store', category: 'Store', description: 'Online shop template', thumbnail: '' },
        { id: 't4', name: 'Blog Personal', category: 'Blog', description: 'Personal blog theme', thumbnail: '' },
    ]
}

function BuilderPreview({ compact }: FeaturePreviewProps) {
    const [data, setData] = React.useState<BuilderData>(MOCK_DATA)

    const createProject = () => {
        const newProject: BuilderProject = {
            id: Math.random().toString(),
            name: 'New Site',
            lastModified: Date.now(),
            pageCount: 1,
            status: 'draft'
        }
        setData(prev => ({ ...prev, projects: [newProject, ...prev.projects] }))
    }

    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Builder</h3>
                <p className="text-2xl font-bold mt-2">{data.projects.length}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <BuilderDashboard
                    data={data}
                    onOpenProject={(p) => alert(`Opening project: ${p.name}`)}
                    onCreateProject={createProject}
                />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'builder',
    name: 'Website Builder',
    description: 'Visual page and site builder',
    component: BuilderPreview,
    category: 'productivity',
    tags: ['builder', 'website', 'pages', 'design', 'visual'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Agency Portfolio',
            description: 'Sample projects and templates',
            data: MOCK_DATA,
        },
    ],
})
