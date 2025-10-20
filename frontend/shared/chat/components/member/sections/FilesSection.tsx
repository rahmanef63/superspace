type FilesSectionProps = {
  isMobile: boolean;
};

const FILE_ITEMS = [
  { name: "Project-Brief.pdf", size: "227 KB", type: "PDF" },
  { name: "Budget.xlsx", size: "365 KB", type: "XLSX" },
  { name: "Contract.docx", size: "155 KB", type: "DOCX" },
  { name: "Product-Shots.zip", size: "1.4 MB", type: "ZIP" },
  { name: "Sprint-Notes.md", size: "24 KB", type: "MD" },
];

export function FilesSection({ isMobile }: FilesSectionProps) {
  return (
    <div className="space-y-3">
      {FILE_ITEMS.map((file) => (
        <div
          key={file.name}
          className="flex items-center gap-3 rounded-wa-lg border border-wa-border bg-wa-surface p-3 transition-colors hover:bg-wa-hover"
        >
          <div
            className={[
              "flex items-center justify-center rounded-wa-lg bg-primary text-primary-foreground",
              isMobile ? "h-10 w-10 text-sm" : "h-12 w-12 text-base",
            ].join(" ")}
          >
            {file.type}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-wa-text">{file.name}</p>
            <p className="text-sm text-wa-muted">
              {file.size} • {file.type}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
