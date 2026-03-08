export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl items-center justify-center p-6">
      <div className="w-full rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">No Access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have permission to access this area.
        </p>
      </div>
    </main>
  )
}
