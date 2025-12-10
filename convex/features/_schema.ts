import { coreTables } from "./core/api/schema";
import { menuTables } from "./menus/api/schema";
import { chatTables } from "./chat/api/schema";
import { communicationsTables } from "./communications/api/schema";
import { docsTables } from "./docs/api/schema";
import { databaseTables } from "./database/api/schema";
import { projectTables } from "./projects/api/schema";
import { crmTables } from "./crm/api/schema";
import { supportTables } from "./support/api/schema";
import { notificationTables } from "./notifications/api/schema";
import { workflowTables } from "./workflows/api/schema";
import { canvasTables } from "./canvas/api/schema";
import { socialTables } from "./social/api/schema";
import { activityTables } from "./activity/api/schema";
import { contentTables } from "./content/api/schema";
import { callTables } from "./calls/api/schema";
import { statusTables } from "./status/api/schema";
import { cmsTables } from "./cms/api/schema";
import { tables as cmsLiteActivityTables } from "./cms_lite/activityEvents/api/schema";
import { tables as authTables } from "../auth/api/schema";
import { tables as cmsLiteCartTables } from "./cms_lite/cart/api/schema";
import { tables as cmsLiteCommentsTables } from "./cms_lite/comments/api/schema";
import { tables as cmsLiteCopiesTables } from "./cms_lite/copies/api/schema";
import { tables as cmsLiteCurrencyTables } from "./cms_lite/currency/api/schema";
import cmsLiteFeaturesSchema from "./cms_lite/features/api/schema";
import cmsLiteLandingSchema from "./cms_lite/landing/api/schema";
import cmsLiteNavigationSchema from "./cms_lite/navigation/api/schema";
import { pagesTable } from "./cms_lite/pages/api/schema";
import { tables as cmsLitePortfolioTables } from "./cms_lite/portfolio/api/schema";
import { tables as cmsLitePostsTables } from "./cms_lite/posts/api/schema";
import { tables as cmsLiteProductsTables } from "./cms_lite/products/api/schema";
import { tables as cmsLiteQuicklinksTables } from "./cms_lite/quicklinks/api/schema";
import { tables as cmsLiteServicesTables } from "./cms_lite/services/api/schema";
import { tables as cmsLiteSettingsTables } from "./cms_lite/settings/api/schema";
import { websiteSettingsTable } from "./cms_lite/website_settings/api/schema";
import cmsLiteStorageTables from "./cms_lite/storage/api/schema";
import cmsLiteUsersTables from "./cms_lite/users/api/schema";
import cmsLiteWishlistTables from "./cms_lite/wishlist/api/schema";
import { aiTables } from "./ai/api/schema";
import { customFeaturesTables } from "./custom/schema";
import { systemFeaturesTables } from "./system/schema";
import { bundleTables } from "./bundles/schema";
import { knowledgeTables } from "./knowledge/api/schema";
import { userManagementTables } from "./userManagement/api/schema";

// ERP Modules
import salesTables from "./sales/schema";
import inventoryTables from "./inventory/schema";
import crmErpTables from "./crm/schema";
import hrTables from "./hr/schema";
import accountingTables from "./accounting/schema";

// Feature Modules
import analyticsTables from "./analytics/schema";
import formsTables from "./forms/schema";
import approvalsTables from "./approvals/schema";
import auditLogTables from "./auditLog/schema";
import biTables from "./bi/schema";
import importExportTables from "./importExport/schema";
import integrationsTables from "./integrations/schema";
import marketingTables from "./marketing/schema";
import posTables from "./pos/schema";
import industryTemplatesTables from "./industryTemplates/schema";

// Shared Features
import searchTables from "../shared/search/schema";
import bulkTables from "../shared/bulk/schema";
import customFieldsTables from "../shared/customFields/schema";
import automationTables from "../shared/automation/schema";
import commentsTables from "../shared/comments/schema";
import attachmentsTables from "../shared/attachments/schema";
import activityFeedTables from "../shared/activity/schema";
import favoritesTables from "../shared/favorites/schema";

const tables = <T>(schemaOrTables: T): T extends { tables: infer U } ? U : T =>
  ((schemaOrTables as any).tables ?? schemaOrTables) as any;

export const featureTables = {
  ...tables(coreTables),
  ...tables(menuTables),
  ...tables(chatTables),
  ...tables(communicationsTables),
  ...tables(docsTables),
  ...tables(databaseTables),
  ...tables(projectTables),
  ...tables(crmTables),
  ...tables(supportTables),
  ...tables(notificationTables),
  ...tables(workflowTables),
  ...tables(canvasTables),
  ...tables(socialTables),
  ...tables(activityTables),
  ...tables(contentTables),
  ...tables(callTables),
  ...tables(statusTables),
  ...tables(cmsTables),
  ...tables(cmsLiteActivityTables),
  ...tables(authTables),
  ...tables(cmsLiteCartTables),
  ...tables(cmsLiteCommentsTables),
  ...tables(cmsLiteCopiesTables),
  ...tables(cmsLiteCurrencyTables),
  ...tables(cmsLiteFeaturesSchema),
  ...tables(cmsLiteLandingSchema),
  ...tables(cmsLiteNavigationSchema),
  cms_lite_pages: pagesTable,
  ...tables(cmsLitePortfolioTables),
  ...tables(cmsLitePostsTables),
  ...tables(cmsLiteProductsTables),
  ...tables(cmsLiteQuicklinksTables),
  ...tables(cmsLiteServicesTables),
  ...tables(cmsLiteSettingsTables),
  cms_lite_website_settings: websiteSettingsTable,
  ...tables(cmsLiteStorageTables),
  ...tables(cmsLiteUsersTables),
  ...tables(cmsLiteWishlistTables),
  ...tables(aiTables),
  ...tables(customFeaturesTables),
  ...tables(systemFeaturesTables),
  ...tables(bundleTables),
  ...tables(knowledgeTables),
  ...tables(userManagementTables),

  // ERP Modules
  ...tables(salesTables),
  ...tables(inventoryTables),
  ...tables(crmErpTables),
  ...tables(hrTables),
  ...tables(accountingTables),

  // Feature Modules
  ...tables(analyticsTables),
  ...tables(formsTables),
  ...tables(approvalsTables),
  ...tables(auditLogTables),
  ...tables(biTables),
  ...tables(importExportTables),
  ...tables(integrationsTables),
  ...tables(marketingTables),
  ...tables(posTables),
  ...tables(industryTemplatesTables),

  // Shared Features
  ...tables(searchTables),
  ...tables(bulkTables),
  ...tables(customFieldsTables),
  ...tables(automationTables),
  ...tables(commentsTables),
  ...tables(attachmentsTables),
  ...tables(activityFeedTables),
  ...tables(favoritesTables),
};
