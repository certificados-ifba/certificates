import Cookie from 'js-cookie'
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
  const storedFilters = Cookie.get(key)

  if (!storedFilters) return {}

  try {
    return JSON.parse(storedFilters)
  } catch {
    Cookie.remove(key)
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
    const nextFilters = removeEmptyFilters(filters)

    if (Object.keys(nextFilters).length === 0) {
      Cookie.remove(key)
      return
    }

    Cookie.set(key, JSON.stringify(nextFilters))
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
    Cookie.remove(key)
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
