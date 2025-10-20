interface FilesSectionProps {
  isMobile: boolean;
}

export function FilesSection({ isMobile }: FilesSectionProps) {
  const files = [
    { name: 'FLIGHT#1-Muh Anwar-UPG-QDPV...', size: '227 KB', type: 'pdf', icon: '📄' },
    { name: 'ABDURRAHMAN RIJAL.pdf', size: '365 KB', type: 'pdf', icon: '📄' },
    { name: '20250701052005.pdf', size: '155 KB', type: 'pdf', icon: '📄' },
    { name: 'skck.jpg', size: '1.4 MB', type: 'image', icon: '🖼️' },
    { name: 'e-Statement_XXXXXXXXX3495_01 J...', size: '35 KB', type: 'excel', icon: '📊' },
    { name: 'protensial-analisis-abdurrahman.ht...', size: '24 KB', type: 'html', icon: '🌐' },
    { name: 'CATATAN KONFIRMASI LINGKUP P...', size: '78 KB', type: 'pdf', icon: '📄' },
    { name: 'ChatGPT Image May 8, 2025, 09_37...', size: '2.6 MB', type: 'image', icon: '🖼️' },
  ];

  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div 
          key={index} 
          className="flex items-center gap-3 p-3 rounded-wa-lg bg-wa-surface hover:bg-wa-hover cursor-pointer transition-colors border border-wa-border"
        >
          <div className={`flex-shrink-0 bg-primary rounded-wa-lg flex items-center justify-center ${
            isMobile ? 'w-10 h-10' : 'w-12 h-12'
          }`}>
            <span className={isMobile ? 'text-lg' : 'text-2xl'}>{file.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-wa-text font-medium truncate">{file.name}</p>
            <p className="text-wa-muted text-sm">{file.size} • {file.type.toUpperCase()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
