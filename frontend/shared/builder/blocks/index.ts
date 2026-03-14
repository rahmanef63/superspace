/**
 * Shared Builder Blocks
 *
 * Generic block registry + convenience re-exports.
 *
 * Architecture:
 *   - Registry API:  blockRegistry, getBlockWrapper, getAllBlockWrappers
 *   - Studio blocks: imported directly from @/frontend/features/studio/ui/widgets/blocks
 *
 * If you need Studio UI blocks, import from the feature directly:
 *   import { StatsBlock } from '@/frontend/features/studio/ui/widgets/blocks'
 */

// Generic registry (for feature auto-discovery tests)
export {
  blockRegistry,
  getBlockWrapper,
  getAllBlockWrappers,
  registerAllBlocks,
} from './registry';
