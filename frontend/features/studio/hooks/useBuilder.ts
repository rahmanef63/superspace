import { useState } from 'react';
import { BuilderData, BuilderProject } from '../types';

export function useBuilder() {
    const [data, setData] = useState<BuilderData>({
        isLoading: false,
        projects: [
            {
                id: '1',
                name: 'Main Website',
                lastModified: Date.now() - 1000 * 60 * 60 * 2,
                pageCount: 12,
                status: 'published',
                thumbnail: '', // Could be a real URL in prod
                url: 'https://mysite.com'
            },
            {
                id: '2',
                name: 'Landing Page Campaign',
                lastModified: Date.now() - 1000 * 60 * 60 * 24 * 3,
                pageCount: 1,
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
        // Mock create
        const newProject: BuilderProject = {
            id: Math.random().toString(),
            name: 'Untitled Project ' + (data.projects.length + 1),
            lastModified: Date.now(),
            pageCount: 1,
            status: 'draft'
        };
        setData(prev => ({
            ...prev,
            projects: [newProject, ...prev.projects]
        }));
    };

    return {
        data,
        createProject
    };
}
