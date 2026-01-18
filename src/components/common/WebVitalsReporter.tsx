"use client"

import { useEffect } from 'react'
import { onWebVitalsLoaded } from '@/utils/webVitals'

const WebVitalsReporter = () => {
  useEffect(() => {
    onWebVitalsLoaded()
  }, [])

  return null
}

export default WebVitalsReporter
