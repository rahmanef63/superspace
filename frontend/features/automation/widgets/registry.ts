import type { ComponentConfig } from '@/frontend/shared/registry/CrossFeatureRegistry';

// Modular automation widget registry placeholder.
// Populate this by exporting ComponentConfig objects keyed by unique keys.
export const automationWidgetRegistry: Record<string, ComponentConfig> = {
  // Example to add later:
  // 'auto-s3-upload': {
  //   key: 'auto-s3-upload',
  //   label: 'S3 Upload',
  //   category: 'Integration',
  //   feature: 'automation',
  //   description: 'Upload a file to S3',
  //   icon: '🗂️',
  //   defaults: { bucket: '', key: '', contentType: '' },
  //   inspector: { fields: [ { key: 'bucket', label: 'Bucket', type: 'text' } ] },
  // },
};
