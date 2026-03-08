"use client"

import { useState } from "react"
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
import { toast } from "sonner"

export type TakerUser = {
  id: string
  name: string
  email: string
  role: "admin" | "taker" | ""
}

type TakersClientProps = {
  users: TakerUser[]
}

export function TakersClient({ users }: TakersClientProps) {
  const batches = ["2023 Batch", "2024 Batch", "2025 Batch", "2026 Batch"] as const
  const { selectedBatch, setSelectedBatch } = usePersistedBatch(batches)
  const [userRoles, setUserRoles] = useState<Record<string, "admin" | "taker" | "">>(
      users.reduce<Record<string, "admin" | "taker" | "">>((acc, user) => {
        acc[user.id] = user.role
        return acc
      }, {})
  )
  const [savingUserId, setSavingUserId] = useState("")

  async function saveRole(userId: string) {
    const role = userRoles[userId] ?? ""
    setSavingUserId(userId)
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role.")
      }
      toast.success("Role updated.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role."
      toast.error(message)
    } finally {
      setSavingUserId("")
    }
  }

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
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">All Users</p>
                <p className="text-sm text-muted-foreground">Loaded users: {users.length}</p>
              </div>

              <div className="max-h-[calc(100svh-220px)] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-card">
                  <tr className="border-b">
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                  </tr>
                  </thead>
                  <tbody>
                  {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{user.email || "-"}</td>
                        <td className="px-4 py-2">
                          <select
                              className="rounded-md border bg-background px-2 py-1"
                              value={userRoles[user.id] ?? ""}
                              onChange={(event) => {
                                const value = event.target.value as "admin" | "taker" | "";

                                setUserRoles((current) => ({
                                  ...current,
                                  [user.id]: value,
                                }));

                                saveRole(user.id);
                              }}
                          >
                            <option value="">No role</option>
                            <option value="taker">Taker</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}
