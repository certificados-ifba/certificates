import { useCallback, useEffect, useMemo, useState } from 'react'

type Filters = Record<string, any>

const removeEmptyFilters = (filters: Filters): Filters => {
  return Object.entries(filters || {}).reduce((acc, [key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (!Array.isArray(value) || value.length > 0)
    ) {
      acc[key] = value
    }

    return acc
  }, {} as Filters)
}

const parseStoredFilters = (key: string): Filters => {
  if (typeof window === 'undefined') return {}

  const storedFilters = window.localStorage.getItem(key)

  if (!storedFilters) return {}

  try {
    return JSON.parse(storedFilters)
  } catch {
    window.localStorage.removeItem(key)
    return {}
  }
}

export const useAdvancedFilters = (key: string) => {
  const [draft, setDraft] = useState<Filters>(() => parseStoredFilters(key))
  const [filters, setFilters] = useState<Filters>(() => parseStoredFilters(key))

  useEffect(() => {
    const storedFilters = parseStoredFilters(key)

    setDraft(storedFilters)
    setFilters(storedFilters)
  }, [key])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const nextFilters = removeEmptyFilters(filters)

    if (Object.keys(nextFilters).length === 0) {
      window.localStorage.removeItem(key)
      return
    }

    window.localStorage.setItem(key, JSON.stringify(nextFilters))
  }, [filters, key])

  const setField = useCallback((name: string, value: any) => {
    setDraft(currentDraft => ({
      ...currentDraft,
      [name]: value
    }))
  }, [])

  const apply = useCallback(
    (nextDraft?: Filters) => {
      const nextFilters = removeEmptyFilters(nextDraft || draft)

      setDraft(nextFilters)
      setFilters(nextFilters)
    },
    [draft]
  )

  const clear = useCallback(() => {
    setDraft({})
    setFilters({})
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }, [key])

  const activeCount = useMemo(() => {
    return Object.keys(removeEmptyFilters(filters)).length
  }, [filters])

  return {
    draft,
    filters,
    activeCount,
    setField,
    apply,
    clear
  }
}
