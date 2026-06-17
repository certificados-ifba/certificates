import { Button, FooterModal, HeaderModal, MainModal, Modal, ScrollWrapper } from '@components'
import { useCallback } from 'react'
import {
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiClipboard,
  FiCode,
  FiCompass,
  FiEye,
  FiFlag,
  FiGlobe,
  FiBook,
  FiBookOpen,
  FiLayout,
  FiMessageCircle,
  FiMessageSquare,
  FiMic,
  FiRefreshCw,
  FiTarget,
  FiTerminal,
  FiUserCheck,
  FiUsers,
  FiX,
  FiZap
} from 'react-icons/fi'
import styled from 'styled-components'

export const TIPOS_CERTIFICADO = [
  'Evento',
  'Palestra',
  'Minicurso',
  'Curso',
  'Treinamento',
  'Capacitação',
  'Bootcamp',
  'Congresso',
  'Seminário',
  'Simpósio',
  'Colóquio',
  'Jornada Acadêmica',
  'Semana Acadêmica',
  'Mesa Redonda',
  'Painel',
  'Debate',
  'Visita Técnica',
  'Monitoria',
  'Estágio',
  'Hackathon',
  'Maratona de Programação'
] as const
export type TipoCertificado = typeof TIPOS_CERTIFICADO[number]

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
  border: 2px solid ${({ theme }) => theme.colors?.border || '#e5e5e5'};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.cardBackground || '#fff'};
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.1s;
  font-family: inherit;
  text-align: center;

  svg {
    color: ${({ theme }) => theme.colors?.primary || '#4f46e5'};
    flex-shrink: 0;
  }

  span {
    font-size: 0.78rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#333'};
    line-height: 1.2;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary || '#4f46e5'};
    background: ${({ theme }) => theme.colors?.primaryLight || '#f5f3ff'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const TIPO_CONFIG: Record<TipoCertificado, { icon: React.ReactElement }> = {
  'Evento':               { icon: <FiCalendar size={24} /> },
  'Palestra':             { icon: <FiMic size={24} /> },
  'Minicurso':            { icon: <FiBookOpen size={24} /> },
  'Curso':                { icon: <FiBook size={24} /> },
  'Treinamento':          { icon: <FiTarget size={24} /> },
  'Capacitação':          { icon: <FiAward size={24} /> },
  'Bootcamp':             { icon: <FiCode size={24} /> },
  'Congresso':            { icon: <FiUsers size={24} /> },
  'Seminário':            { icon: <FiClipboard size={24} /> },
  'Simpósio':             { icon: <FiGlobe size={24} /> },
  'Colóquio':             { icon: <FiMessageCircle size={24} /> },
  'Jornada Acadêmica':    { icon: <FiCompass size={24} /> },
  'Semana Acadêmica':     { icon: <FiFlag size={24} /> },
  'Mesa Redonda':         { icon: <FiRefreshCw size={24} /> },
  'Painel':               { icon: <FiLayout size={24} /> },
  'Debate':               { icon: <FiMessageSquare size={24} /> },
  'Visita Técnica':       { icon: <FiEye size={24} /> },
  'Monitoria':            { icon: <FiUserCheck size={24} /> },
  'Estágio':              { icon: <FiBriefcase size={24} /> },
  'Hackathon':            { icon: <FiZap size={24} /> },
  'Maratona de Programação': { icon: <FiTerminal size={24} /> },
}

export const TipoSelectorModal: React.FC<Props> = ({
  openModal,
  onClose,
  onSelect
}) => {
  const handleSelect = useCallback(
    (tipo: TipoCertificado) => {
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
          <TiposGrid>
            {TIPOS_CERTIFICADO.map(tipo => (
              <TipoCard key={tipo} type="button" onClick={() => handleSelect(tipo)}>
                {TIPO_CONFIG[tipo].icon}
                <span>{tipo}</span>
              </TipoCard>
            ))}
          </TiposGrid>
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
