import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Toaster } from "@/components/ui/sonner";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">Audiobook admin</div>
          </header>
          {!isFirebaseConfigured && (
            <div className="flex items-start gap-3 border-b bg-amber-50 px-6 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <strong className="font-semibold">Firebase not configured.</strong> Open{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">src/lib/firebase.ts</code>{" "}
                and paste your Firebase web config, or set the{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">VITE_FIREBASE_*</code> env vars.
              </div>
            </div>
          )}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
