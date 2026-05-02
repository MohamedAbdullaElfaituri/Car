import { AppShell } from "@/components/app-shell";
import { collectDiagnostics } from "./actions";
import { DiagnosticsPanel } from "./diagnostics-panel";

export default async function DiagnosticsPage() {
  const results = await collectDiagnostics();

  return (
    <AppShell title="فحص الربط والصلاحيات">
      <DiagnosticsPanel initialResults={results} />
    </AppShell>
  );
}
