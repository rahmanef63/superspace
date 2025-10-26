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
};
