export const logger = {
  save: (entity: string, location: string, data?: any) => {
    console.log(`💾 Menyimpan ${entity} ke ${location}...`, data || '');
  },

  saved: (entity: string, location: string, data?: any) => {
    console.log(`✅ Tersimpan: ${entity} di ${location}`, data || '');
  },

  load: (entity: string, source: string) => {
    console.log(`📥 Mengambil ${entity} dari ${source}...`);
  },

  loaded: (entity: string, source: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
    console.log(`✅ Berhasil: ${entity} dari ${source}${countInfo}`);
  },

  error: (action: string, entity: string, error: any) => {
    console.error(`❌ Error ${action} ${entity}:`, {
      message: error?.message || error,
      details: error?.response?.data || error,
      stack: error?.stack,
      fullError: error,
    });
  },

  update: (entity: string, location: string, data?: any) => {
    console.log(`🔄 Mengupdate ${entity} di ${location}...`, data || '');
  },

  updated: (entity: string, location: string) => {
    console.log(`✅ Terupdate: ${entity} di ${location}`);
  },

  delete: (entity: string, location: string, id?: any) => {
    console.log(`🗑️ Menghapus ${entity} dari ${location}...`, id ? `ID: ${id}` : '');
  },

  deleted: (entity: string, location: string) => {
    console.log(`✅ Terhapus: ${entity} dari ${location}`);
  },

  export: (entity: string, destination: string) => {
    console.log(`📤 Mengekspor ${entity} ke ${destination}...`);
  },

  exported: (entity: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
    console.log(`✅ Berhasil ekspor: ${entity}${countInfo}`);
  },

  import: (entity: string, source: string) => {
    console.log(`📥 Mengimpor ${entity} dari ${source}...`);
  },

  imported: (entity: string, count?: number) => {
    const countInfo = count !== undefined ? ` (${count} items)` : '';
    console.log(`✅ Berhasil impor: ${entity}${countInfo}`);
  },

  action: (action: string, details?: any) => {
    console.log(`⚡ ${action}`, details || '');
  },
};
