"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePersistedBatch } from "../use-persisted-batch"

export function TakersClient() {
  const batches = ["2023 Batch", "2024 Batch", "2025 Batch", "2026 Batch"] as const
  const { selectedBatch, setSelectedBatch } = usePersistedBatch(batches)

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar selectedBatch={selectedBatch} onBatchChange={setSelectedBatch} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Attendance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Attendance Takers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="p-4">
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            Attendance takers view is ready for client-side implementation.
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
