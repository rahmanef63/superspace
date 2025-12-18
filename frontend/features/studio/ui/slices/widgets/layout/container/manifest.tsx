import type { WidgetConfig } from '@/frontend/features/studio/ui/types';
import { ContainerWidget } from './ContainerWidget';
import { cn } from '@/lib/utils';
import React from 'react';

const TW = {
  justify: { start: "justify-start", center: "justify-center", between: "justify-between", end: "justify-end", around: "justify-around", evenly: "justify-evenly" },
  items: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" },
  gap: (n?: string) => (n ? `gap-${n}` : ""),
  p: (n?: string) => (n ? `p-${n}` : ""),
  m: (n?: string) => (n ? `m-${n}` : ""),
  w: { auto: "w-auto", full: "w-full", screen: "w-screen" },
  h: { auto: "h-auto", full: "h-full", screen: "h-screen" },
  pos: { static: "static", relative: "relative", absolute: "absolute", fixed: "fixed", sticky: "sticky" },
};

export const containerManifest: WidgetConfig = {
  label: "Container",
  category: "Layout",
  description: "A flexible container for layout and routing.",
  icon: "Container",
  defaults: { 
    path: "/", // route when linked from a Menu
    display: "flex", // flex | block
    direction: "col", // col | row
    justify: "start", // start | center | between | end | around | evenly
    items: "start", // start | center | end | stretch
    gap: "4", // tailwind scale
    p: "6",
    m: "0",
    w: "full", // auto | full | screen
    h: "auto", // auto | full | screen
    position: "static", // static|relative|absolute|fixed|sticky
    className: "max-w-6xl mx-auto",
  },
  render: (p, children) => {
    const cls = cn(
      p.className,
      p.display === "flex" ? "flex" : "block",
      p.display === "flex" && (p.direction === "row" ? "flex-row" : "flex-col"),
      p.display === "flex" && TW.justify[p.justify as keyof typeof TW.justify],
      p.display === "flex" && TW.items[p.items as keyof typeof TW.items],
      TW.gap(p.gap),
      TW.p(p.p),
      TW.m(p.m),
      TW.w[p.w as keyof typeof TW.w],
      TW.h[p.h as keyof typeof TW.h],
      TW.pos[p.position as keyof typeof TW.pos]
    );
    return <div className={cls}>{children}</div>;
  },
  inspector: {
    fields: [
      {
        key: 'path',
        label: 'Route Path',
        type: 'text',
        placeholder: '/'
      },
      {
        key: 'display',
        label: 'Display',
        type: 'select',
        options: ['flex', 'block']
      },
      {
        key: 'direction',
        label: 'Direction (flex)',
        type: 'select',
        options: ['col', 'row']
      },
      {
        key: 'justify',
        label: 'Justify (flex)',
        type: 'select',
        options: ["start", "center", "between", "end", "around", "evenly"]
      },
      {
        key: 'items',
        label: 'Align Items (flex)',
        type: 'select',
        options: ["start", "center", "end", "stretch"]
      },
      {
        key: 'gap',
        label: 'Gap',
        type: 'select',
        options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']
      },
      {
        key: 'p',
        label: 'Padding',
        type: 'select',
        options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']
      },
      {
        key: 'className',
        label: 'Custom CSS Classes',
        type: 'text',
        placeholder: 'Additional CSS classes'
      }
    ]
  }
};
