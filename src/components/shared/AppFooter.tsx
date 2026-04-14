export function AppFooter() {
  return (
    <footer className="border-t border-border px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} CareerDeck · SWE40006 Task 3
        </p>
        <p className="text-xs text-muted-foreground sm:text-right">AZ</p>
      </div>
    </footer>
  );
}
