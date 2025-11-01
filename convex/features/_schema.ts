import { coreTables } from "./core/api/schema";
import { menuTables } from "./menus/api/schema";
import { chatTables } from "./chat/api/schema";
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
import { tables as cmsLitePortfolioTables } from "./cms_lite/portfolio/api/schema";
import { tables as cmsLitePostsTables } from "./cms_lite/posts/api/schema";
import { tables as cmsLiteProductsTables } from "./cms_lite/products/api/schema";
import { tables as cmsLiteQuicklinksTables } from "./cms_lite/quicklinks/api/schema";
import { tables as cmsLiteServicesTables } from "./cms_lite/services/api/schema";
import { tables as cmsLiteSettingsTables } from "./cms_lite/settings/api/schema";
import cmsLiteStorageTables from "./cms_lite/storage/api/schema";
import cmsLiteUsersTables from "./cms_lite/users/api/schema";
import cmsLiteWishlistTables from "./cms_lite/wishlist/api/schema";
import { aiTables } from "./ai/api/schema";

export const featureTables = {
  ...coreTables,
  ...menuTables,
  ...chatTables,
  ...docsTables,
  ...databaseTables,
  ...projectTables,
  ...crmTables,
  ...supportTables,
  ...notificationTables,
  ...workflowTables,
  ...canvasTables,
  ...socialTables,
  ...activityTables,
  ...contentTables,
  ...callTables,
  ...statusTables,
  ...cmsTables,
  ...cmsLiteActivityTables,
  ...authTables,
  ...cmsLiteCartTables,
  ...cmsLiteCommentsTables,
  ...cmsLiteCopiesTables,
  ...cmsLiteCurrencyTables,
  ...cmsLiteFeaturesSchema.tables,
  ...cmsLiteLandingSchema.tables,
  ...cmsLiteNavigationSchema.tables,
  ...cmsLitePortfolioTables,
  ...cmsLitePostsTables,
  ...cmsLiteProductsTables,
  ...cmsLiteQuicklinksTables,
  ...cmsLiteServicesTables,
  ...cmsLiteSettingsTables,
  ...cmsLiteStorageTables,
  ...cmsLiteUsersTables,
  ...cmsLiteWishlistTables,
  ...aiTables,
};
