import { Button, FooterModal, HeaderModal, MainModal, Modal, ScrollWrapper } from '@components'
import { IGeneric } from '@dtos'
import { api } from '@services'
import { useCallback, useEffect, useState } from 'react'
import { FiCalendar, FiX } from 'react-icons/fi'
import styled from 'styled-components'

import { getIcon } from './iconMap'

export type TipoCertificado = string

interface Props {
  openModal: boolean
  onClose: () => void
  onSelect: (tipo: TipoCertificado) => void
}

const TiposGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
  padding: 1rem 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const TipoCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.1rem 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.mediumTint};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.lightTint};
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.1s;
  font-family: inherit;
  text-align: center;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }

  span {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.dark};
    line-height: 1.2;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.lightShade};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const EmptyMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.darkTint};
  padding: 2rem 0;
`

export const TipoSelectorModal: React.FC<Props> = ({
  openModal,
  onClose,
  onSelect
}) => {
  const [tipos, setTipos] = useState<IGeneric[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!openModal) return
    setLoading(true)
    api
      .get('/certification_types', { params: { per_page: 100, page: 1, sort_by: 'name', order_by: 'ASC' } })
      .then(res => setTipos(res.data?.data ?? []))
      .finally(() => setLoading(false))
  }, [openModal])

  const handleSelect = useCallback(
    (tipo: string) => {
      onSelect(tipo)
    },
    [onSelect]
  )

  return (
    <Modal open={openModal} onClose={onClose} size="xl">
      <HeaderModal>
        <h2>
          <FiCalendar size={20} />
          <span>Selecione o tipo de certificação</span>
        </h2>
      </HeaderModal>
      <ScrollWrapper>
        <MainModal>
          {loading ? (
            <EmptyMessage>Carregando tipos...</EmptyMessage>
          ) : tipos.length === 0 ? (
            <EmptyMessage>
              Nenhum tipo de certificação cadastrado. Acesse Configurações &gt; Tipos de Certificação para adicionar.
            </EmptyMessage>
          ) : (
            <TiposGrid>
              {tipos.map(tipo => {
                const TipoIcon = getIcon(tipo.icon)
                return (
                  <TipoCard key={tipo.id} type="button" onClick={() => handleSelect(tipo.name)}>
                    <TipoIcon size={24} />
                    <span>{tipo.name}</span>
                  </TipoCard>
                )
              })}
            </TiposGrid>
          )}
        </MainModal>
      </ScrollWrapper>
      <FooterModal inline>
        <Button color="secondary" type="button" outline onClick={onClose}>
          <FiX size={20} />
          <span>Cancelar</span>
        </Button>
      </FooterModal>
    </Modal>
  )
}

