import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HarnessHome,
})

function HarnessHome() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">react-shell · dev harness</h1>
      <p className="mt-2 text-sm opacity-70">
        Scaffold is up. The shell, providers, themes, and registry composites land
        in later build phases.
      </p>
    </main>
  )
}
