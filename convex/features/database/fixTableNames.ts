/**
 * Migration Script: Fix Table Names Stored as JSON Strings
 * 
 * This script finds tables where name is stored as JSON string like:
 * '{"name":"Zap","color":"default"}'
 * 
 * And converts them to plain strings: 'Zap'
 */

import { internalMutation } from "../../_generated/server";

export const fixTableNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = await ctx.db.query("dbTables").collect();
    
    let fixed = 0;
    let skipped = 0;
    
    for (const table of tables) {
      const name = table.name;
      
      // Check if name looks like JSON
      if (typeof name === 'string' && name.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(name);
          
          // If it's an object with a name property, extract it
          if (parsed && typeof parsed === 'object' && 'name' in parsed) {
            const cleanName = parsed.name;
            
            console.log(`[Migration] Fixing table ${table._id}: "${name}" → "${cleanName}"`);
            
            await ctx.db.patch(table._id, {
              name: cleanName,
            });
            
            fixed++;
          } else {
            console.log(`[Migration] Skipping table ${table._id}: JSON but no name property`);
            skipped++;
          }
        } catch (error) {
          console.log(`[Migration] Skipping table ${table._id}: Not valid JSON`);
          skipped++;
        }
      } else {
        // Name is already clean
        skipped++;
      }
    }
    
    return {
      success: true,
      fixed,
      skipped,
      total: tables.length,
    };
  },
});
