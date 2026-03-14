import type { WidgetConfig } from '../types/index';
// Standardize widget - skip validation for now
const standardizeWidget = (key: string, config: WidgetConfig): WidgetConfig => config;

// Slices Widgets
import { buttonManifest } from '../slices/widgets/action/button/manifest';
import { cardManifest } from '../slices/widgets/content/card/manifest';
import { textManifest } from '../slices/widgets/content/text/manifest';
import { columnManifest } from '../slices/widgets/layout/column/manifest';
import { containerManifest } from '../slices/widgets/layout/container/manifest';
import { rowManifest } from '../slices/widgets/layout/row/manifest';
import { sectionManifest as _sectionManifest } from '../slices/widgets/layout/section/manifest';
import { divManifest } from '../slices/widgets/layout/div/manifest';
import { imageManifest } from '../slices/widgets/media/image/manifest';

// Patch section label so it appears as "Page" in the library (routing container)
const sectionManifest = { ..._sectionManifest, label: 'Page', description: 'Routable page container. Set a Route Path to link from a Menu.' };
import { navGroupManifest } from '../slices/widgets/navigation/navGroup/manifest';
import { heroManifest } from '../slices/widgets/templates/hero/manifest';
import { heroCompositeManifest } from '../slices/widgets/templates/heroComposite/manifest';

// New Layout Widgets
import { threeColumnManifest } from '../slices/widgets/layout/threeColumn/manifest';
import { twoColumnManifest } from '../slices/widgets/layout/twoColumn/manifest';
import { gridManifest } from '../slices/widgets/layout/grid/manifest';
import { flexManifest } from '../slices/widgets/layout/flex/manifest';

// UI Widgets (existing)
import { accordionManifest } from './ui/accordion/manifest';
import { alertManifest } from './ui/alert/manifest';
import { aspectRatioManifest } from './ui/aspectRatio/manifest';
import { avatarManifest } from './ui/avatar/manifest';
import { badgeManifest } from './ui/badge/manifest';
import { checkboxManifest } from './ui/checkbox/manifest';
import { progressManifest } from './ui/progress/manifest';
import { radioGroupManifest } from './ui/radioGroup/manifest';
import { scrollAreaManifest } from './ui/scrollArea/manifest';
import { skeletonManifest } from './ui/skeleton/manifest';
import { tableManifest } from './ui/table/manifest';
import { textareaManifest } from './ui/textarea/manifest';
import { toggleGroupManifest } from './ui/toggleGroup/manifest';

// New UI Widgets
import { tabsManifest } from './ui/tabs/manifest';
import { separatorManifest } from './ui/separator/manifest';
import { tooltipManifest } from './ui/tooltip/manifest';
import { collapsibleManifest } from './ui/collapsible/manifest';
import { carouselManifest } from './ui/carousel/manifest';
import { breadcrumbManifest } from './ui/breadcrumb/manifest';
import { dialogManifest } from './ui/dialog/manifest';
import { hoverCardManifest } from './ui/hoverCard/manifest';

// Form Widgets (P2)
import { inputManifest } from './ui/input/manifest';
import { selectManifest } from './ui/select/manifest';
import { switchManifest } from './ui/switch/manifest';

// Content Widgets (P2)
import { dividerManifest } from './ui/divider/manifest';
import { spacerManifest } from './ui/spacer/manifest';
import { headingManifest } from './ui/heading/manifest';

// Navigation Widgets
import { linkManifest } from './ui/link/manifest';

// Action Widgets
// Action Widgets
import { iconButtonManifest } from './ui/iconButton/manifest';

// Block Widgets
import { chartManifest as chartBlockManifest } from './blocks/Chart/manifest';
import { kanbanManifest as kanbanBlockManifest } from './blocks/Kanban/manifest';
import { tableManifest as tableBlockManifest } from './blocks/Table/manifest';
import { calendarManifest as calendarBlockManifest } from './blocks/Calendar/manifest';
import { filterManifest as filterBlockManifest } from './blocks/Filter/manifest';
import { fileManifest as fileBlockManifest } from './blocks/File/manifest';
import { commentManifest as commentBlockManifest } from './blocks/Comment/manifest';
import { richTextManifest as richTextBlockManifest } from './blocks/RichText/manifest';
import { formManifest as formBlockManifest } from './blocks/Form/manifest';
import { mediaManifest as mediaBlockManifest } from './blocks/Media/manifest';
import { profileManifest as profileBlockManifest } from './blocks/Profile/manifest';
import { metricCardManifest as metricCardBlockManifest } from './blocks/Metric/manifest';
import { activityManifest as activityBlockManifest } from './blocks/Activity/manifest';
import { listManifest as listBlockManifest } from './blocks/List/manifest';
import { eventsManifest as eventsBlockManifest } from './blocks/Events/manifest';
import { statsManifest as statsBlockManifest } from './blocks/Stats/manifest';
import { agentManifest as agentBlockManifest } from './blocks/Agent/manifest';
import { teamManifest as teamBlockManifest } from './blocks/Team/manifest';
import { timeRangeManifest as timeRangeBlockManifest } from './blocks/TimeRange/manifest';

// Raw widget configurations
const rawWidgetRegistry: Record<string, WidgetConfig> = {
  // Layout
  div: divManifest,           // Universal container (replaces container + section in library)
  section: sectionManifest,   // Page / routing container (kept for Renderer routing)
  // Legacy aliases — kept for backward-compat of saved schemas, hidden from Library
  container: { ...containerManifest, label: 'Container (legacy)', category: 'Layout' as const, hidden: true },
  row: { ...rowManifest, hidden: true },
  column: { ...columnManifest, hidden: true },
  threeColumn: threeColumnManifest,
  twoColumn: twoColumnManifest,
  grid: gridManifest,
  flex: flexManifest,

  // Content
  text: textManifest,
  card: cardManifest,

  // Media
  image: imageManifest,

  // Action
  button: buttonManifest,
  iconButton: iconButtonManifest,

  // Navigation
  navGroup: navGroupManifest,
  link: linkManifest,

  // Templates
  hero: heroManifest,
  heroComposite: heroCompositeManifest,

  // UI Components (existing)
  accordion: accordionManifest,
  alert: alertManifest,
  aspectRatio: aspectRatioManifest,
  avatar: avatarManifest,
  badge: badgeManifest,
  checkbox: checkboxManifest,
  progress: progressManifest,
  radioGroup: radioGroupManifest,
  scrollArea: scrollAreaManifest,
  skeleton: skeletonManifest,
  table: tableManifest,
  textarea: textareaManifest,
  toggleGroup: toggleGroupManifest,

  // UI Components (new)
  tabs: tabsManifest,
  separator: separatorManifest,
  tooltip: tooltipManifest,
  collapsible: collapsibleManifest,
  carousel: carouselManifest,
  breadcrumb: breadcrumbManifest,
  dialog: dialogManifest,
  hoverCard: hoverCardManifest,

  // Form Widgets (P2)
  input: inputManifest,
  select: selectManifest,
  switch: switchManifest,

  // Content Widgets (P2) — divider duplicates separator; heading duplicates text (hidden from Library)
  divider: { ...dividerManifest, hidden: true },
  spacer: spacerManifest,
  heading: { ...headingManifest, hidden: true },

  // Blocks
  chartBlock: chartBlockManifest,
  kanbanBlock: kanbanBlockManifest,
  tableBlock: tableBlockManifest,
  calendarBlock: calendarBlockManifest,
  filterBlock: filterBlockManifest,
  fileBlock: fileBlockManifest,
  commentBlock: commentBlockManifest,
  richTextBlock: richTextBlockManifest,
  formBlock: formBlockManifest,
  mediaBlock: mediaBlockManifest,
  profileBlock: profileBlockManifest,
  metricCardBlock: metricCardBlockManifest,
  activityBlock: activityBlockManifest,
  listBlock: listBlockManifest,
  eventsBlock: eventsBlockManifest,
  statsBlock: statsBlockManifest,
  agentBlock: agentBlockManifest,
  teamBlock: teamBlockManifest,
  timeRangeBlock: timeRangeBlockManifest,
};

// Standardize all widgets and validate in development
const standardizeRegistry = (registry: Record<string, WidgetConfig>): Record<string, WidgetConfig> => {
  const standardized: Record<string, WidgetConfig> = {};

  Object.entries(registry).forEach(([key, config]) => {
    standardized[key] = standardizeWidget(key, config);
  });

  // Validate in development: warn on widgets missing required fields
  if (process.env.NODE_ENV === 'development') {
    Object.entries(standardized).forEach(([key, config]) => {
      if (!config.label) console.warn(`[Studio] Widget "${key}" is missing a label`);
      if (!config.render) console.warn(`[Studio] Widget "${key}" is missing a render function`);
      if (!config.category) console.warn(`[Studio] Widget "${key}" is missing a category`);
    });
  }

  return standardized;
};

// Export standardized and validated widget registry
export const cmsWidgetRegistry = standardizeRegistry(rawWidgetRegistry);

// Export widget categories for reference
export const widgetCategories = {
  Layout: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Layout').map(([key]) => key),
  Content: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Content').map(([key]) => key),
  Media: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Media').map(([key]) => key),
  Navigation: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Navigation').map(([key]) => key),
  Action: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Action').map(([key]) => key),
  UI: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'UI').map(([key]) => key),
  Templates: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Templates').map(([key]) => key),
  Blocks: Object.entries(cmsWidgetRegistry).filter(([_, config]) => config.category === 'Blocks').map(([key]) => key),
};

// Export widget count by category
export const widgetStats = {
  total: Object.keys(cmsWidgetRegistry).length,
  byCategory: Object.fromEntries(
    Object.entries(widgetCategories).map(([category, widgets]) => [category, widgets.length])
  ),
};
