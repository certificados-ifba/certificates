import { Button } from '@components'
import { FiFilter, FiX } from 'react-icons/fi'

import { Actions, Container, Fields, QuickFilters } from './styles'

interface Props {
  activeCount?: number
  resultsCount?: number | string
  isLoading?: boolean
  onApply: () => void
  onClear: () => void
  children: React.ReactNode
  quickFilters?: React.ReactNode
}

export const AdvancedFilters: React.FC<Props> = ({
  activeCount = 0,
  resultsCount,
  isLoading,
  onApply,
  onClear,
  children,
  quickFilters
}) => {
  return (
    <Container aria-label="Filtros avançados">
      <div>
        <h3>Filtros</h3>
        <span>
          {activeCount} ativo{activeCount === 1 ? '' : 's'}
          {resultsCount !== undefined &&
            ` · ${resultsCount} resultado${
              String(resultsCount) === '1' ? '' : 's'
            }`}
          {isLoading && ' · atualizando'}
        </span>
      </div>
     <Fields>
      {children}

      <div className="filter-actions">
        <Button type="button" ghost color="dark"  onClick={onClear}>
          <FiX size={16} />
          <span>Limpar filtros</span>
        </Button>
      </div>
    </Fields>
    </Container>
  )
}
