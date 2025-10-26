// frontend/features/cms/manifest.ts (Konten yang Diperbaiki)

import type { FeatureManifest } from '../../shared/types/manifest';

const cmsManifest: FeatureManifest = {
  id: 'cms',
  name: 'CMS Builder',
  description: 'Build and manage your content management system',
  icon: '🏗️',
  path: '/cms', // Path utama sekarang langsung ke builder
  category: 'content',
  order: 1,
  children: [
    // Kita bisa menambahkan halaman preview di sini jika diperlukan nanti
    {
      id: 'cms-preview',
      name: 'Live Preview',
      description: 'Preview your built interfaces',
      icon: '👁️',
      path: '/cms/preview', // Path yang jelas untuk preview
      category: 'content',
      order: 2
    }
  ]
};

export default cmsManifest;