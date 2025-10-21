import { databaseTables as dbTables } from "../../db/api/schema";

/**
 * Database feature table definitions.
 *
 * We reuse the rich Notion-style data model that already powers the
 * generic db feature and re-export it under the database feature namespace
 * so consumers can depend on `features/database` without knowing about the
 * lower-level module structure.
 */
export const databaseTables = dbTables;

export type DatabaseTables = typeof databaseTables;
