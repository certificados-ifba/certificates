import { useRequest, Return } from '@services'
import { AxiosRequestConfig } from 'axios'
import { useState, useCallback, useMemo } from 'react'

export interface OptionType {
  label: string
  value: number
}

export interface PaginatedRequest<Data, Error> extends Return<Data, Error> {
  page: number
  perPage: OptionType
  resetPage: () => void
  loadPrevious: () => void
  loadNext: () => void
  goToPage: (newPage: number) => void
  handlePerPage: (option: OptionType) => void
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export function usePaginatedRequest<Data = any, Error = any>(
  request: AxiosRequestConfig
): PaginatedRequest<Data, Error> {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<OptionType>({
    value: request?.params?.per_page || 10,
    label: request?.params?.per_page || '10'
  })

  const { response, requestKey, ...rest } = useRequest<any, Error>(
    request
      ? {
          ...request,
          params: {
            page,
            per_page: perPage.value,
            ...(request.params || {})
          }
        }
      : null
  )

  const hasPreviousPage = useMemo(() => page > 1, [page])
  const hasNextPage = useMemo(() => page < response?.headers['x-total-page'], [
    page,
    response
  ])
  const resetPage = useCallback(() => {
    setPage(1)
  }, [])

  const loadPrevious = useCallback(() => {
    setPage(current => (hasPreviousPage ? current - 1 : current))
  }, [hasPreviousPage])

  const loadNext = useCallback(() => {
    setPage(current => (hasNextPage ? current + 1 : current))
  }, [hasNextPage])

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(current =>
        newPage <= response?.headers['x-total-page'] && newPage > 0
          ? newPage
          : current
      )
    },
    [response]
  )

  const handlePerPage = useCallback(
    (option: OptionType) => {
      setPerPage(option)
    },
    [setPerPage]
  )

  return {
    ...rest,
    requestKey,
    response,
    page,
    perPage,
    resetPage,
    loadNext,
    loadPrevious,
    goToPage,
    handlePerPage,
    hasPreviousPage,
    hasNextPage
  }
}
