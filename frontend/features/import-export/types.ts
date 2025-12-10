export interface TransferJob {
    id: string;
    type: 'import' | 'export';
    entity: string; // e.g., 'contacts', 'products'
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    startedAt: string;
    completedAt?: string;
    recordCount: number;
    fileName: string;
}

export interface ImportExportStats {
    totalExports: number;
    totalImports: number;
    failedJobs: number;
    activeJobs: number;
}

export interface ImportExportData {
    stats: ImportExportStats;
    recentJobs: TransferJob[];
    isLoading: boolean;
}
