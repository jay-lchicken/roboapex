"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, ChevronsUpDownIcon, CheckIcon } from "lucide-react"

export function VersionSwitcher({
  versions,
  defaultVersion,
  selectedVersion,
  onSelectVersion,
}: {
  versions: string[]
  defaultVersion: string
  selectedVersion?: string
  onSelectVersion?: (value: string) => void
}) {
  const [internalVersion, setInternalVersion] = React.useState(defaultVersion)
  const activeVersion = selectedVersion ?? internalVersion

  const handleSelectVersion = (value: string) => {
    if (onSelectVersion) {
      onSelectVersion(value)
      return
    }

    setInternalVersion(value)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Batch Number</span>
                <span>{activeVersion}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {versions.map((version) => (
              <DropdownMenuItem
                key={version}
                onSelect={() => handleSelectVersion(version)}
              >
                {version}{" "}
                {version === activeVersion && (
                  <CheckIcon className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
