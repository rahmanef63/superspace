import React, { useState } from 'react';
import { BuilderDashboard } from '../components/BuilderDashboard';
import { BuilderData, BuilderProject } from '../types';

export const BuilderPreview = () => {
    const [data, setData] = useState<BuilderData>({
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
    });

    const createProject = () => {
        const newProject: BuilderProject = {
            id: Math.random().toString(),
            name: 'New Site',
            lastModified: Date.now(),
            pageCount: 1,
            status: 'draft'
        };
        setData(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
    };

    return (
        <div className="p-6">
            <BuilderDashboard
                data={data}
                onOpenProject={(p) => alert(`Opening project: ${p.name}`)}
                onCreateProject={createProject}
            />
        </div>
    );
};

export default BuilderPreview;
