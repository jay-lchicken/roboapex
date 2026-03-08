"use client"

import { useState } from "react"
import { appendCacheBust, normalizePhotoUrl } from "./utils"

type StudentPhotoProps = {
  photo: string
  memberName: string
}

export function StudentPhoto({ photo, memberName }: StudentPhotoProps) {
  const normalizedUrl = normalizePhotoUrl(photo)
  const [attempt, setAttempt] = useState(0)
  const [isBroken, setIsBroken] = useState(false)

  if (!normalizedUrl || isBroken) {
    return <div className="size-12 rounded-sm bg-muted" />
  }

  const src = attempt > 0 ? appendCacheBust(normalizedUrl, attempt) : normalizedUrl
  return (
    <img
      className="size-28 rounded-sm object-cover"
      src={src}
      alt={`${memberName} profile`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (attempt < 2) {
          setAttempt((currentAttempt) => currentAttempt + 1)
          return
        }
        setIsBroken(true)
      }}
    />
  )
}
