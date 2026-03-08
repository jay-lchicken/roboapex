"use client"

import { useEffect, useState } from "react"

const BATCH_STORAGE_KEY = "admin-dashboard:selected-batch"

export function usePersistedBatch(batches: readonly string[]) {
  const [selectedBatch, setSelectedBatch] = useState<string>(() => {
    if (typeof window === "undefined") {
      return batches[0] ?? ""
    }

    const storedBatch = window.localStorage.getItem(BATCH_STORAGE_KEY)
    if (storedBatch && batches.includes(storedBatch)) {
      return storedBatch
    }

    return batches[0] ?? ""
  })

  useEffect(() => {
    if (!selectedBatch) return
    window.localStorage.setItem(BATCH_STORAGE_KEY, selectedBatch)
  }, [selectedBatch])

  return { selectedBatch, setSelectedBatch }
}
