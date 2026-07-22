import { Button, Spinner, Table } from '@components'
import { PaginatedRequest } from '@services'
import { theme } from '@styles'
import { buildPaginationPages } from '@utils'
import { useCallback, useMemo } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi'

import { Pagination, NoDataContainer, PaginateList, Select } from './styles'

export { NoDataContainer }

interface Props {
  request: PaginatedRequest<any, any>
  children: React.ReactNode
}

export const PaginatedTable: React.FC<Props> = ({ request, children }) => {
  const {
    data,
    error,
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
  } = request

  const numberOfRegisters = useMemo(() => response?.headers['x-total-count'], [
    response
  ])

  const numberOfPages = useMemo(
    () => Number(response?.headers['x-total-page'] ?? 0),
    [response]
  )

  const loadLast = useCallback(() => {
    goToPage(Number(numberOfPages))
  }, [goToPage, numberOfPages])

  const pages = useMemo(
    () => buildPaginationPages(page, numberOfPages),
    [page, numberOfPages]
  )

  return (
    <>
      <Table>{children}</Table>
      {(!data || data?.data?.length === 0) && (
        <NoDataContainer>
          {data?.data?.length === 0 ? (
            <span>Não há registros a serem exibidos</span>
          ) : error ? (
            <span>Ocorreu um erro, entre em contato com o adminstrador</span>
          ) : (
            <Spinner size={50} color={theme.colors.secondary} />
          )}
        </NoDataContainer>
      )}
      <Pagination>
        <div>
          <span className="hide-md-down">Linhas por página</span>
          <Select
            menuPosition="fixed"
            instanceId="perPage"
            isSearchable={false}
            onChange={handlePerPage}
            defaultValue={perPage}
            value={perPage}
            options={[
              {
                value: 5,
                label: '5'
              },
              {
                value: 10,
                label: '10'
              },
              {
                value: 25,
                label: '25'
              },
              {
                value: 50,
                label: '50'
              },
              {
                value: 100,
                label: '100'
              }
            ]}
          />
        </div>
        <span className="hide-md-down">
          {`${
            !data || data?.data?.length === 0
              ? 0
              : 1 + (page - 1) * perPage.value
          } - ${
            !data ? 0 : !hasNextPage ? numberOfRegisters : page * perPage.value
          } de ${!data ? 0 : numberOfRegisters}`}
        </span>
        <nav>
          <Button
            ghost
            square
            size="small"
            color="dark"
            disabled={!hasPreviousPage}
            onClick={resetPage}
          >
            <FiChevronsLeft size={18} />
          </Button>
          <Button
            ghost
            square
            size="small"
            color="dark"
            disabled={!hasPreviousPage}
            onClick={loadPrevious}
          >
            <FiChevronLeft size={18} />
          </Button>
          <PaginateList className="hide-md-down">
            {pages.map(({ value, label }, key) => (
              <Button
                key={key}
                ghost
                square
                size="small"
                color="dark"
                disabled={value === page}
                onClick={() => goToPage(value)}
              >
                <span>{label}</span>
              </Button>
            ))}
          </PaginateList>
          <Button
            ghost
            square
            size="small"
            color="dark"
            disabled={!hasNextPage}
            onClick={loadNext}
          >
            <FiChevronRight size={18} />
          </Button>
          <Button
            ghost
            square
            size="small"
            color="dark"
            disabled={!hasNextPage}
            onClick={loadLast}
          >
            <FiChevronsRight size={18} />
          </Button>
        </nav>
      </Pagination>
    </>
  )
}
