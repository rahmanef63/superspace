export function StarredView() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center text-muted-foreground">
        <div className="mb-4 text-6xl">⭐</div>
        <h2 className="text-xl font-semibold mb-2">Starred Messages</h2>
        <p>Your starred messages will appear here</p>
      </div>
    </div>
  );
}
