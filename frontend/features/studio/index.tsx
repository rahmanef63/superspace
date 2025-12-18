/**
 * Studio Feature - Unified Visual Builder
 * 
 * Combines CMS Builder and Automation into a single canvas experience.
 */

export { studioConfig, default as config } from './config';
export { initStudio } from './init';
export * from './registry';

// Re-export page component
export { StudioPage } from './pages/StudioPage';
