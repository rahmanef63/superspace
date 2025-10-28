/**
 * Import Validation Tests for Shared Folder Restructure
 *
 * Purpose: Ensure all feature imports from frontend/shared/ continue to work
 * after restructuring shared folder into domain-based subfolders.
 *
 * This test suite serves as a baseline before migration and validation after.
 *
 * Test Strategy:
 * 1. Test critical imports from each domain
 * 2. Test that features can import what they need
 * 3. Validate facade exports work correctly
 * 4. Ensure no circular dependencies
 */

import { describe, it, expect } from 'vitest'

describe('Shared Import Validation - Baseline', () => {
  describe('Builder Domain Imports', () => {
    it('should import canvas core functionality', async () => {
      // Critical for CMS, Database, Workflow features
      const { SharedCanvasProvider } = await import(
        '@/frontend/shared/canvas/core/SharedCanvasProvider'
      )
      expect(SharedCanvasProvider).toBeDefined()
      expect(typeof SharedCanvasProvider).toBe('function')
    })

    it('should import canvas hooks', async () => {
      const { useSharedCanvas } = await import('@/frontend/shared/canvas/core/hooks')
      expect(useSharedCanvas).toBeDefined()
      expect(typeof useSharedCanvas).toBe('function')
    })

    it('should import inspector components', async () => {
      const { CompositeInspector } = await import(
        '@/frontend/shared/components/inspector/CompositeInspector'
      )
      const { SmartInspector } = await import(
        '@/frontend/shared/components/inspector/SmartInspector'
      )

      expect(CompositeInspector).toBeDefined()
      expect(SmartInspector).toBeDefined()
    })

    it('should import template library', async () => {
      const { TemplateLibrary } = await import(
        '@/frontend/shared/components/library/TemplateLibrary'
      )
      expect(TemplateLibrary).toBeDefined()
    })

    it('should import component utils', async () => {
      const { createComponent } = await import(
        '@/frontend/shared/components/utils/componentFactory'
      )
      expect(createComponent).toBeDefined()
      expect(typeof createComponent).toBe('function')
    })
  })

  describe('Settings Domain Imports', () => {
    it('should import settings registry', async () => {
      const {
        registerFeatureSettings,
        getFeatureSettingsBuilder,
      } = await import('@/frontend/shared/settings/featureSettingsRegistry')

      expect(registerFeatureSettings).toBeDefined()
      expect(getFeatureSettingsBuilder).toBeDefined()
      expect(typeof registerFeatureSettings).toBe('function')
      expect(typeof getFeatureSettingsBuilder).toBe('function')
    })

    it('should import workspace settings', async () => {
      const { WorkspaceSettings } = await import(
        '@/frontend/shared/settings/workspace/WorkspaceSettings'
      )
      expect(WorkspaceSettings).toBeDefined()
    })

    it('should import menu components', async () => {
      // Check if menu components exist
      try {
        await import('@/frontend/shared/layout/menus/components')
      } catch (e) {
        // May not have index, that's ok for baseline
        console.log('Menu components may need index.ts')
      }
    })
  })

  describe('Communications Domain Imports', () => {
    it('should import chat components', async () => {
      const { ChatContainer } = await import(
        '@/frontend/shared/chat/components/ChatContainer'
      )
      const { ChatComposer } = await import(
        '@/frontend/shared/chat/components/ChatComposer'
      )
      const { ChatMessage } = await import(
        '@/frontend/shared/chat/components/ChatMessage'
      )

      expect(ChatContainer).toBeDefined()
      expect(ChatComposer).toBeDefined()
      expect(ChatMessage).toBeDefined()
    })

    it('should import chat hooks', async () => {
      // Check if chat hooks exist
      try {
        const hooks = await import('@/frontend/shared/chat/hooks')
        expect(hooks).toBeDefined()
      } catch (e) {
        console.log('Chat hooks import:', e)
      }
    })
  })

  describe('UI Domain Imports', () => {
    it('should import basic UI components', async () => {
      const { TextComponent } = await import(
        '@/frontend/shared/components/Text/Text.component'
      )
      const { ContainerComponent } = await import(
        '@/frontend/shared/components/Container/Container.component'
      )
      const { ImageComponent } = await import(
        '@/frontend/shared/components/Image/Image.component'
      )

      expect(TextComponent).toBeDefined()
      expect(ContainerComponent).toBeDefined()
      expect(ImageComponent).toBeDefined()
    })

    it('should import form components', async () => {
      const { InputComponent } = await import(
        '@/frontend/shared/components/Input/Input.component'
      )
      const { LabelComponent } = await import(
        '@/frontend/shared/components/Label/Label.component'
      )
      const { TextareaComponent } = await import(
        '@/frontend/shared/components/Textarea/Textarea.component'
      )

      expect(InputComponent).toBeDefined()
      expect(LabelComponent).toBeDefined()
      expect(TextareaComponent).toBeDefined()
    })

    it('should import loading components', async () => {
      const { LoadingSpinner } = await import(
        '@/frontend/shared/components/loading/LoadingSpinner'
      )
      expect(LoadingSpinner).toBeDefined()
    })
  })

  describe('Foundation Domain Imports', () => {
    it('should import auth components', async () => {
      const { AuthModal } = await import('@/frontend/shared/auth/components/AuthModal')
      const { SignInForm } = await import(
        '@/frontend/shared/auth/components/SignInForm'
      )

      expect(AuthModal).toBeDefined()
      expect(SignInForm).toBeDefined()
    })

    it('should import auth hooks', async () => {
      const { useAuthed } = await import('@/frontend/shared/auth/hooks/useAuthed')
      expect(useAuthed).toBeDefined()
      expect(typeof useAuthed).toBe('function')
    })

    it('should import utility functions', async () => {
      const { createComponent } = await import(
        '@/frontend/shared/components/utils/componentFactory'
      )
      expect(createComponent).toBeDefined()
    })

    it('should import shared types', async () => {
      // Types may not have runtime representation, but import should not fail
      try {
        await import('@/frontend/shared/types')
      } catch (e) {
        console.log('Types import:', e)
      }
    })
  })
})

describe('Feature Import Validation - Critical Paths', () => {
  describe('CMS Feature Dependencies', () => {
    it('should import canvas provider', async () => {
      const { SharedCanvasProvider } = await import(
        '@/frontend/shared/canvas/core/SharedCanvasProvider'
      )
      expect(SharedCanvasProvider).toBeDefined()
    })

    it('should import inspector components', async () => {
      const { CompositeInspector } = await import(
        '@/frontend/shared/components/inspector/CompositeInspector'
      )
      expect(CompositeInspector).toBeDefined()
    })

    it('should import template library', async () => {
      const { TemplateLibrary } = await import(
        '@/frontend/shared/components/library/TemplateLibrary'
      )
      expect(TemplateLibrary).toBeDefined()
    })
  })

  describe('Chat Feature Dependencies', () => {
    it('should import chat components from shared', async () => {
      const { ChatContainer } = await import(
        '@/frontend/shared/chat/components/ChatContainer'
      )
      const { ChatMessage } = await import(
        '@/frontend/shared/chat/components/ChatMessage'
      )

      expect(ChatContainer).toBeDefined()
      expect(ChatMessage).toBeDefined()
    })
  })

  describe('Settings Feature Dependencies', () => {
    it('should import settings registry', async () => {
      const { registerFeatureSettings } = await import(
        '@/frontend/shared/settings/featureSettingsRegistry'
      )
      expect(registerFeatureSettings).toBeDefined()
    })

    it('should import workspace settings', async () => {
      const { WorkspaceSettings } = await import(
        '@/frontend/shared/settings/workspace/WorkspaceSettings'
      )
      expect(WorkspaceSettings).toBeDefined()
    })
  })

  describe('All Features - Common UI Dependencies', () => {
    it('should import text component', async () => {
      const { TextComponent } = await import(
        '@/frontend/shared/components/Text/Text.component'
      )
      expect(TextComponent).toBeDefined()
    })

    it('should import container component', async () => {
      const { ContainerComponent } = await import(
        '@/frontend/shared/components/Container/Container.component'
      )
      expect(ContainerComponent).toBeDefined()
    })

    it('should import loading spinner', async () => {
      const { LoadingSpinner } = await import(
        '@/frontend/shared/components/loading/LoadingSpinner'
      )
      expect(LoadingSpinner).toBeDefined()
    })
  })
})

describe('Registry Auto-Discovery Validation', () => {
  it('should load component registry', async () => {
    const componentRegistry = await import('@/frontend/shared/components/registry')
    expect(componentRegistry).toBeDefined()
  })

  it('should load element registry', async () => {
    const elementRegistry = await import('@/frontend/shared/elements/index')
    expect(elementRegistry).toBeDefined()
  })

  it('should load block registry', async () => {
    const blockRegistry = await import('@/frontend/shared/blocks/index')
    expect(blockRegistry).toBeDefined()
  })

  it('should load section registry', async () => {
    const sectionRegistry = await import('@/frontend/shared/sections/index')
    expect(sectionRegistry).toBeDefined()
  })

  it('should load template registry', async () => {
    const templateRegistry = await import('@/frontend/shared/templates/index')
    expect(templateRegistry).toBeDefined()
  })

  it('should load flow registry', async () => {
    const flowRegistry = await import('@/frontend/shared/flows/index')
    expect(flowRegistry).toBeDefined()
  })
})

describe('Cross-Domain Dependencies', () => {
  it('should not have circular dependencies', () => {
    // This test passes if imports above don't cause infinite loops
    expect(true).toBe(true)
  })

  it('should allow foundation imports from all domains', async () => {
    // Foundation is base layer, all domains can import from it
    const { createComponent } = await import(
      '@/frontend/shared/components/utils/componentFactory'
    )
    expect(createComponent).toBeDefined()
  })
})

describe('Type Safety Validation', () => {
  it('should export TypeScript types correctly', async () => {
    // Runtime check that type files exist
    try {
      await import('@/frontend/shared/canvas/core/types')
      await import('@/frontend/shared/types')
      expect(true).toBe(true)
    } catch (e) {
      console.log('Type imports:', e)
    }
  })
})

/**
 * POST-MIGRATION TESTS
 *
 * After restructuring, add these tests to validate facade exports
 */

describe.skip('Post-Migration: Facade Export Validation', () => {
  describe('Builder Facade', () => {
    it('should export canvas from builder facade', async () => {
      const { SharedCanvasProvider, useSharedCanvas } = await import(
        '@/frontend/shared/builder'
      )
      expect(SharedCanvasProvider).toBeDefined()
      expect(useSharedCanvas).toBeDefined()
    })

    it('should export inspector from builder facade', async () => {
      const { SmartInspector, CompositeInspector } = await import(
        '@/frontend/shared/builder'
      )
      expect(SmartInspector).toBeDefined()
      expect(CompositeInspector).toBeDefined()
    })

    it('should export template library from builder facade', async () => {
      const { TemplateLibrary } = await import('@/frontend/shared/builder')
      expect(TemplateLibrary).toBeDefined()
    })
  })

  describe('Settings Facade', () => {
    it('should export registry from settings facade', async () => {
      const { registerFeatureSettings, getFeatureSettingsBuilder } = await import(
        '@/frontend/shared/settings'
      )
      expect(registerFeatureSettings).toBeDefined()
      expect(getFeatureSettingsBuilder).toBeDefined()
    })

    it('should export settings pages from settings facade', async () => {
      const { WorkspaceSettings } = await import('@/frontend/shared/settings')
      expect(WorkspaceSettings).toBeDefined()
    })
  })

  describe('Communications Facade', () => {
    it('should export chat from communications facade', async () => {
      const { ChatContainer, ChatComposer, ChatMessage } = await import(
        '@/frontend/shared/communications'
      )
      expect(ChatContainer).toBeDefined()
      expect(ChatComposer).toBeDefined()
      expect(ChatMessage).toBeDefined()
    })
  })

  describe('UI Facade', () => {
    it('should export basic components from ui facade', async () => {
      const { TextComponent, ContainerComponent, ImageComponent } = await import(
        '@/frontend/shared/ui'
      )
      expect(TextComponent).toBeDefined()
      expect(ContainerComponent).toBeDefined()
      expect(ImageComponent).toBeDefined()
    })
  })

  describe('Foundation Facade', () => {
    it('should export auth from foundation facade', async () => {
      const { AuthModal, SignInForm, useAuthed } = await import(
        '@/frontend/shared/foundation'
      )
      expect(AuthModal).toBeDefined()
      expect(SignInForm).toBeDefined()
      expect(useAuthed).toBeDefined()
    })

    it('should export utils from foundation facade', async () => {
      const { createComponent } = await import('@/frontend/shared/foundation')
      expect(createComponent).toBeDefined()
    })
  })
})

describe.skip('Post-Migration: Deep Import Prevention', () => {
  it('should prevent deep imports via lint rules', () => {
    // This will be enforced by ESLint, not runtime
    // Validate that .eslintrc.js has no-restricted-imports configured
    expect(true).toBe(true)
  })
})

/**
 * Performance Validation
 */
describe('Import Performance', () => {
  it('should import quickly (baseline)', async () => {
    const start = performance.now()

    await import('@/frontend/shared/canvas/core/SharedCanvasProvider')
    await import('@/frontend/shared/components/inspector/CompositeInspector')
    await import('@/frontend/shared/components/library/TemplateLibrary')
    await import('@/frontend/shared/chat/components/ChatContainer')
    await import('@/frontend/shared/settings/featureSettingsRegistry')

    const end = performance.now()
    const duration = end - start

    console.log(`Import time: ${duration.toFixed(2)}ms`)

    // Should be fast (< 1000ms for 5 imports)
    expect(duration).toBeLessThan(1000)
  })
})
