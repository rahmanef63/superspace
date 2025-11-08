/**
 * Property Menu Configuration Registry
 * 
 * Central registry for all property type menu configurations
 */

import type { PropertyTypeMenuConfig } from '../components/PropertyMenu/menu-config';
import { DEFAULT_PROPERTY_MENU_CONFIG } from '../components/PropertyMenu/menu-config';

// Import all property menu configs
import { selectPropertyMenuConfig } from './select/menu-config';
import { multiSelectPropertyMenuConfig } from './multi_select/menu-config';
import { numberPropertyMenuConfig } from './number/menu-config';
import { datePropertyMenuConfig } from './date/menu-config';
import { textPropertyMenuConfig } from './text/menu-config';
import { titlePropertyMenuConfig } from './title/menu-config';
import { checkboxPropertyMenuConfig } from './checkbox/menu-config';
import { createdTimePropertyMenuConfig } from './created_time/menu-config';
import { createdByPropertyMenuConfig } from './created_by/menu-config';

/**
 * Property Type to Menu Config Mapping
 */
export const PROPERTY_MENU_REGISTRY: Record<string, PropertyTypeMenuConfig> = {
  // Text types
  text: textPropertyMenuConfig,
  title: titlePropertyMenuConfig,
  rich_text: textPropertyMenuConfig, // Same as text
  
  // Number types
  number: numberPropertyMenuConfig,
  
  // Select types
  select: selectPropertyMenuConfig,
  multi_select: multiSelectPropertyMenuConfig,
  status: selectPropertyMenuConfig, // Similar to select
  
  // Date types
  date: datePropertyMenuConfig,
  
  // Boolean types
  checkbox: checkboxPropertyMenuConfig,
  
  // Auto properties
  created_time: createdTimePropertyMenuConfig,
  created_by: createdByPropertyMenuConfig,
  last_edited_time: createdTimePropertyMenuConfig, // Same as created_time
  last_edited_by: createdByPropertyMenuConfig, // Same as created_by
  
  // People
  people: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-unique', label: 'Count unique', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  
  // Contact types (url, email, phone)
  url: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-count', label: 'Count all', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
          { id: 'calculate-unique', label: 'Count unique', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  email: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-count', label: 'Count all', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
          { id: 'calculate-unique', label: 'Count unique', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  phone: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-count', label: 'Count all', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
          { id: 'calculate-unique', label: 'Count unique', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  
  // Files
  files: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-count', label: 'Count files', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  
  // Advanced types (read-only in most cases)
  formula: {
    typeSpecificItems: [],
    overrides: {},
    hidden: ['duplicate'],
    disabled: ['toggleRequired'],
  },
  
  rollup: {
    typeSpecificItems: [],
    overrides: {},
    hidden: ['duplicate'],
    disabled: ['toggleRequired'],
  },
  
  relation: {
    typeSpecificItems: [],
    overrides: {
      calculate: {
        submenu: [
          { id: 'calculate-count', label: 'Count relations', icon: undefined },
          { id: 'calculate-empty', label: 'Count empty', icon: undefined },
          { id: 'calculate-filled', label: 'Count filled', icon: undefined },
        ],
      },
    },
    hidden: [],
    disabled: [],
  },
  
  unique_id: {
    typeSpecificItems: [],
    overrides: {},
    hidden: ['delete', 'duplicate'],
    disabled: ['toggleRequired'],
  },
};

/**
 * Get menu configuration for a property type
 */
export function getPropertyMenuConfig(propertyType: string): PropertyTypeMenuConfig {
  return PROPERTY_MENU_REGISTRY[propertyType] || DEFAULT_PROPERTY_MENU_CONFIG;
}

/**
 * Check if a menu item should be visible for a property type
 */
export function isMenuItemVisible(
  propertyType: string,
  menuItemId: string
): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return !config.hidden?.includes(menuItemId as any);
}

/**
 * Check if a menu item should be disabled for a property type
 */
export function isMenuItemDisabled(
  propertyType: string,
  menuItemId: string
): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return config.disabled?.includes(menuItemId as any) ?? false;
}
