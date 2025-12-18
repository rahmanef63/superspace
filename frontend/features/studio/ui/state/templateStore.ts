const BUILTIN_TEMPLATES: Record<string, () => any> = {
  'Hero L→R': () => {
    // Minimal schema for hero layout
    const id = (p: string) => p;
    return {
      version: '0.4',
      root: ['section-hero'],
      nodes: {
        'section-hero': { type: 'section', props: { path: '/', className: 'max-w-6xl mx-auto p-8' }, children: ['title', 'subtitle', 'cta', 'hero-img'] },
        'title': { type: 'text', props: { tag: 'h1', content: 'Build faster with your Super Workspace', className: 'text-3xl md:text-4xl font-bold' }, children: [] },
        'subtitle': { type: 'text', props: { tag: 'p', content: 'Composable widgets, live JSON schema, and shadcn-style UI.', className: 'text-muted-foreground' }, children: [] },
        'cta': { type: 'button', props: { text: 'Open Dashboard', size: 'lg', variant: 'primary', href: '/dashboard' }, children: [] },
        'hero-img': { type: 'image', props: { src: 'https://picsum.photos/seed/hero/800/600', className: 'w-full h-auto rounded-2xl shadow-sm' }, children: [] },
      }
    };
  },
  'About Card': () => ({
    version: '0.4',
    root: ['section-about'],
    nodes: {
      'section-about': { type: 'section', props: { className: 'max-w-3xl mx-auto p-6' }, children: ['card-about'] },
      'card-about': { type: 'card', props: { title: 'About', description: 'Company profile' }, children: [] }
    }
  }),
};

const ASSET_KEY = 'cms-asset-templates';

export function getDefaultTemplates() {
  return { ...BUILTIN_TEMPLATES };
}

export function isBuiltinKey(key: string) {
  return !!BUILTIN_TEMPLATES[key];
}

export function instantiateDefaultTemplate(key: string) {
  const fn = BUILTIN_TEMPLATES[key];
  return fn ? fn() : null;
}

export function listAssetTemplates(): Record<string, any> {
  try {
    const raw = localStorage.getItem(ASSET_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveAssetTemplate(name: string, schema: any) {
  const all = listAssetTemplates();
  all[name] = schema;
  localStorage.setItem(ASSET_KEY, JSON.stringify(all));
}

export function deleteAssetTemplate(name: string) {
  const all = listAssetTemplates();
  delete all[name];
  localStorage.setItem(ASSET_KEY, JSON.stringify(all));
}

export function getTemplateByKey(key: string) {
  // key may be "builtin:Name" or "asset:Name" or plain name for backward-compat
  if (key.startsWith('builtin:')) {
    const name = key.slice('builtin:'.length);
    return instantiateDefaultTemplate(name);
  }
  if (key.startsWith('asset:')) {
    const name = key.slice('asset:'.length);
    const all = listAssetTemplates();
    return all[name] || null;
  }
  // plain
  return instantiateDefaultTemplate(key) || listAssetTemplates()[key] || null;
}
