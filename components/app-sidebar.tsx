"use client"

import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {NavUser} from "@/components/nav-user";

const data = {
  versions: ["2023 Batch","2024 Batch", "2025 Batch", "2026 Batch"],
  navMain: [
    {
      title: "Attendance",
      items: [
        { title: "Attendance", url: "/admin-dashboard" },
        { title: "Attendance Takers", url: "/admin-dashboard/takers" },
      ],
    },
  ],
}

interface AppSidebarProps{
  selectedBatch: string;
  onBatchChange: (batch: string) => void;
}


export function AppSidebar({ selectedBatch, onBatchChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
          selectedVersion={selectedBatch}
          onSelectVersion={onBatchChange}
        />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild>
                      <a href={subItem.url}>{subItem.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
