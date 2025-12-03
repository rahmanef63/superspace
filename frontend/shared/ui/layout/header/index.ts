/**
 * Header System
 * 
 * Unified header components for consistent UI across the application.
 * 
 * Features:
 * - Multiple header variants (feature, sidebar, container, page, modal, card, etc.)
 * - Compound component pattern for flexibility
 * - Pre-configured presets for common use cases
 * - Full TypeScript support
 * - Dynamic header updates via context
 * - Breadcrumbs, search, actions, badges, meta support
 * 
 * @example Feature Header
 * ```tsx
 * import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
 * 
 * <FeatureHeader
 *   title="Documents"
 *   subtitle="Manage your documents"
 *   icon={FileText}
 *   primaryAction={{
 *     label: "Add Document",
 *     icon: Plus,
 *     onClick: handleAdd,
 *   }}
 *   badge={{ text: "Beta", variant: "secondary" }}
 * />
 * ```
 * 
 * @example Compound Pattern
 * ```tsx
 * import { Header } from "@/frontend/shared/ui/layout/header"
 * 
 * <Header variant="default" size="lg">
 *   <Header.Breadcrumbs items={breadcrumbs} />
 *   <Header.Title title="Page Title" subtitle="Description" icon={Icon} />
 *   <Header.Actions>
 *     <Button>Add</Button>
 *   </Header.Actions>
 * </Header>
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Base types
  HeaderSize,
  HeaderVariant,
  HeaderLayout,
  HeaderAlignment,
  
  // Breadcrumb
  BreadcrumbItem,
  
  // Actions
  HeaderAction,
  HeaderActionGroup,
  
  // Content (Config types - use these for props configuration)
  HeaderBadgeConfig,
  HeaderSearchConfig,
  HeaderMetaItem,
  HeaderStats,
  HeaderSlots,
  
  // Props
  HeaderBaseProps,
  HeaderNavigationProps,
  HeaderActionProps,
  HeaderContentProps,
  HeaderProps,
  
  // Compound component props
  HeaderRootProps,
  HeaderTitleProps,
  HeaderActionsProps,
  HeaderBreadcrumbsProps,
  HeaderSearchProps,
  HeaderToolbarProps,
  HeaderSectionProps,
  HeaderBackProps,
  HeaderBadgeProps,
  HeaderMetaProps,
  
  // Context
  HeaderContextValue,
  
  // Presets
  HeaderPresetName,
  HeaderPreset,
} from "./types"

export {
  HEADER_PRESETS,
  ICON_SIZES,
  TITLE_SIZES,
  SUBTITLE_SIZES,
  PADDING_SIZES,
} from "./types"

// ============================================================================
// Context
// ============================================================================

export {
  useHeaderContext,
  useHeaderContextSafe,
  HeaderProvider,
  useDynamicHeader,
  useDynamicHeaderSafe,
  DynamicHeaderProvider,
  useSetHeaderTitle,
  useSetHeaderBreadcrumbs,
  useSetHeaderActions,
} from "./context"

export type {
  HeaderProviderProps,
  DynamicHeaderState,
  DynamicHeaderContextValue,
  DynamicHeaderProviderProps,
} from "./context"

// ============================================================================
// Components (Compound)
// ============================================================================

export {
  Header,
  HeaderRoot,
  HeaderSection,
  HeaderTitle,
  HeaderActions,
  HeaderActionGroupMenu,
  HeaderBreadcrumbs,
  HeaderSearch,
  HeaderBadge,
  HeaderMeta,
  HeaderToolbar,
  HeaderBack,
} from "./Header"

// ============================================================================
// Presets (Pre-configured Headers)
// ============================================================================

export {
  FeatureHeader,
  SidebarHeader,
  ContainerHeader,
  PageHeader,
  ModalHeader,
  CardHeader,
  SectionHeader,
  ToolbarHeader,
  ChatHeader,
  MinimalHeader,
} from "./presets"

export type {
  FeatureHeaderProps,
  SidebarHeaderProps,
  ContainerHeaderProps,
  PageHeaderProps,
  ModalHeaderProps,
  CardHeaderProps,
  SectionHeaderProps,
  ToolbarHeaderProps,
  ChatHeaderProps,
  MinimalHeaderProps,
} from "./presets"

// ============================================================================
// Styles (for custom implementations)
// ============================================================================

export {
  getHeaderContainerClasses,
  getHeaderSectionClasses,
  getTitleWrapperClasses,
  getTitleClasses,
  getSubtitleClasses,
  getIconContainerClasses,
  getIconSizeClass,
  getIconSizePixels,
  getActionsContainerClasses,
  getBreadcrumbsContainerClasses,
  getBreadcrumbItemClasses,
  getBreadcrumbSeparatorClasses,
  getSearchContainerClasses,
  getSearchInputClasses,
  getHeaderBadgeClasses,
  getMetaContainerClasses,
  getMetaItemClasses,
  getMetaSeparatorClasses,
  getToolbarClasses,
  getBackButtonClasses,
} from "./styles"
