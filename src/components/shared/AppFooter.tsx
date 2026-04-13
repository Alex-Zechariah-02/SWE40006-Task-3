export function AppFooter() {
  return (
    <footer className="border-t border-border px-4 py-3 sm:px-6">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareerDeck
      </p>
    </footer>
  );
}
