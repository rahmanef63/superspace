/**
 * Div Widget — Universal container/section/group
 *
 * Replaces the old "container" and "section" widgets with one unified element.
 * Choose the semantic tag (div/section/article/header/footer/main/aside/nav)
 * and optionally set a route path for page navigation.
 */
import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/features/studio/ui/inspector/standardFields';
import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const TAG_MAP: Record<string, string> = {
    div: 'div',
    section: 'section',
    article: 'article',
    header: 'header',
    footer: 'footer',
    main: 'main',
    aside: 'aside',
    nav: 'nav',
};

const DISPLAY_MAP: Record<string, string> = {
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    'inline-flex': 'inline-flex',
};

const divRender = (p: Record<string, any>, children?: React.ReactNode) => {
    const Tag = (TAG_MAP[p.tag] || 'div') as any;
    const cls = cn(
        DISPLAY_MAP[p.display] || 'block',
        p.display === 'flex' && p.flexDirection === 'row' ? 'flex-row' : p.display === 'flex' ? 'flex-col' : '',
        p.display === 'flex' && p.justify ? `justify-${p.justify}` : '',
        p.display === 'flex' && p.align ? `items-${p.align}` : '',
        p.display === 'flex' && p.wrap ? `flex-${p.wrap}` : '',
        p.gap ? `gap-${p.gap}` : '',
        p.padding ? `p-${p.padding}` : '',
        p.margin ? `m-${p.margin}` : '',
        p.width === 'full' ? 'w-full' : p.width === 'auto' ? 'w-auto' : '',
        p.height === 'full' ? 'h-full' : p.height === 'auto' ? 'h-auto' : '',
        p.maxWidth ? `max-w-${p.maxWidth}` : '',
        p.className || '',
    );
    return <Tag className={cls}>{children}</Tag>;
};

export const divManifest: WidgetConfig = {
    label: "Div",
    category: "Layout",
    description: "Universal container. Choose the HTML tag (div, section, article…) and layout mode.",
    icon: Square,
    defaults: {
        tag: 'div',
        path: '',          // route path — leave empty unless this is a page root
        display: 'block',
        flexDirection: 'col',
        justify: 'start',
        align: 'start',
        wrap: 'nowrap',
        gap: '4',
        padding: '4',
        margin: '0',
        width: 'full',
        height: 'auto',
        maxWidth: '',
        className: '',
    },
    render: divRender,
    autoConnect: {
        text: { type: 'text', props: { content: 'Content goes here', tag: 'p' } },
    },
    inspector: {
        fields: combineFields(
            [
                createCustomField({
                    key: 'tag',
                    label: 'HTML Tag',
                    type: 'select',
                    options: ['div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav'],
                }),
                createCustomField({
                    key: 'path',
                    label: 'Route Path (page navigation)',
                    type: 'text',
                    placeholder: 'e.g. /dashboard',
                }),
                createCustomField({
                    key: 'display',
                    label: 'Display',
                    type: 'select',
                    options: ['block', 'flex', 'grid', 'inline-flex'],
                }),
            ],
            createInspectorFieldGroups.layout(),
        ),
    },
};
