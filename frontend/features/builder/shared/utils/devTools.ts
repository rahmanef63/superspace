import { cmsWidgetRegistry, widgetStats, widgetCategories } from '../../widgets/registry';
import { validateWidgetRegistry, printValidationResults } from './widgetValidation';

/**
 * Development tools for CMS widget registry
 * Only available in development mode
 */

/**
 * Prints comprehensive registry statistics
 */
export const printRegistryStats = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group(' CMS Widget Registry Statistics');
  
  Object.entries(widgetStats.byCategory).forEach(([category, count]) => {
    const percentage = ((count / widgetStats.total) * 100).toFixed(1);
  });
  Object.entries(widgetCategories).forEach(([category, widgets]) => {
    if (widgets.length > 0) {
      console.group(`${category} (${widgets.length})`);
      widgets.forEach(widget => {
        const config = cmsWidgetRegistry[widget];
      });
      console.groupEnd();
    }
  });

  console.groupEnd();
};

/**
 * Validates and prints registry validation results
 */
export const validateAndPrintRegistry = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const results = validateWidgetRegistry(cmsWidgetRegistry);
  printValidationResults(results);
};

/**
 * Prints widget details for debugging
 */
export const printWidgetDetails = (widgetKey: string) => {
  if (process.env.NODE_ENV !== 'development') return;

  const widget = cmsWidgetRegistry[widgetKey];
  if (!widget) {
    console.error(`❌ Widget "${widgetKey}" not found in registry`);
    return;
  }

  console.group(`🔧 Widget Details: ${widget.label} (${widgetKey})`);
  if (widget.inspector?.fields) {
    widget.inspector.fields.forEach((field, index) => {
      if (field.options) {
      }
    });
  } else {
  }
  
  if (widget.autoConnect) {
    Object.entries(widget.autoConnect).forEach(([key, config]) => {
    });
  }

  console.groupEnd();
};

/**
 * Prints all widgets in a category
 */
export const printCategoryWidgets = (category: string) => {
  if (process.env.NODE_ENV !== 'development') return;

  const widgets = widgetCategories[category as keyof typeof widgetCategories];
  if (!widgets) {
    console.error(`❌ Category "${category}" not found`);
    return;
  }

  console.group(`📂 ${category} Widgets (${widgets.length})`);
  
  widgets.forEach(widgetKey => {
    const widget = cmsWidgetRegistry[widgetKey];
  });

  console.groupEnd();
};

/**
 * Searches widgets by term
 */
export const searchWidgets = (searchTerm: string) => {
  if (process.env.NODE_ENV !== 'development') return;

  const term = searchTerm.toLowerCase();
  const results = Object.entries(cmsWidgetRegistry).filter(([key, widget]) => {
    const searchableText = [
      key,
      widget.label,
      widget.description,
      widget.category,
      ...(widget.tags || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(term);
  });

  console.group(`🔍 Search Results for "${searchTerm}" (${results.length})`);
  
  if (results.length === 0) {
  } else {
    results.forEach(([key, widget]) => {
    });
  }

  console.groupEnd();
};

/**
 * Exports all development tools for easy access
 */
export const CMSDevTools = {
  printStats: printRegistryStats,
  validate: validateAndPrintRegistry,
  widget: printWidgetDetails,
  category: printCategoryWidgets,
  search: searchWidgets,
  registry: cmsWidgetRegistry,
  stats: widgetStats,
  categories: widgetCategories,
};

// Add to global scope in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).CMSDevTools = CMSDevTools;
}
