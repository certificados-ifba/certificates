import {
  Button,
  Grid
} from '@components'
import { Certificate } from '@pages/events/[id]/[tab]/components'
import { initialTextConfig } from '@pages/events/[id]/[tab]/components/certificateLayout'
import { api } from '@services'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FiAward, FiCheck, FiCheckSquare, FiSearch, FiUser, FiX } from 'react-icons/fi'

import { CardContainer, Container, Header } from './styles'

interface IGenericRef {
  id: string
  name: string
}

interface ICriterion {
  function: IGenericRef
  type_activity: IGenericRef
}

interface IApiModel {
  id: string
  name: string
  pages: Array<{
    type: string
    image: string
    text: string
    layout: any
  }>
  criterions: ICriterion[]
  created_at: string
}

interface IProcessedCertificate {
  id: string
  name: string
  criterions: ICriterion[]
  front?: {
    img: string
    text: string
    layout?: any
  }
  verse?: {
    img: string
    text: string
    layout?: any
  }
  pages: IApiModel['pages']
}

interface Props {
  event?: any
}

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:4001'

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' })} a ${e.toLocaleDateString('pt-BR', opts)}`
  }
  return `${s.toLocaleDateString('pt-BR', opts)} a ${e.toLocaleDateString('pt-BR', opts)}`
}

const substituteParams = (html: string, event: any, participantName = 'Fulano de Tal', tipoAtividade = '', tipoFuncao = ''): string => {
  if (!html || !event) return html
  const periodo = event.start_date && event.end_date
    ? formatDateRange(event.start_date, event.end_date)
    : '[participacao_periodo]'
  return html
    .replace(/\[participante_nome\]/g, participantName)
    .replace(/\[evento_nome\]/g, event.name || '[evento_nome]')
    .replace(/\[evento_sigla\]/g, event.initials || '[evento_sigla]')
    .replace(/\[evento_edicao\]/g, event.edition || '[evento_edicao]')
    .replace(/\[participacao_periodo\]/g, periodo)
    .replace(/\[participacao_carga_horaria\]/g, '40 horas')
    .replace(/\[tipo_atividade\]/g, tipoAtividade)
    .replace(/\[tipo_funcao\]/g, tipoFuncao)
}

/**
 * Converte o objeto `layout` salvo no banco para os props do Certificate.
 *
 * Estrutura real salva:
 *   layout.padding.{top, right, bottom, left}
 *   layout.vertical.name  → validateVerticalPosition
 *   layout.vertical.value → validateVerticalPadding
 *   layout.horizontal.name  → validateHorizontalPosition
 *   layout.horizontal.value → validateHorizontalPadding
 *
 * Nota: `position` e `orientation` não são salvos no banco.
 * Usamos sempre position='custom' com os lados individuais.
 */
const layoutToConfig = (layout: any) => {
  if (!layout) return initialTextConfig

  const pad = layout.padding || {}
  return {
    position: 'custom' as const,
    padding: initialTextConfig.padding,
    paddingTop: Number(pad.top) || initialTextConfig.paddingTop,
    paddingBottom: Number(pad.bottom) || initialTextConfig.paddingBottom,
    paddingLeft: Number(pad.left) || initialTextConfig.paddingLeft,
    paddingRight: Number(pad.right) || initialTextConfig.paddingRight,
    codeOrientation: layout.orientation || initialTextConfig.codeOrientation,
    validateVerticalPosition: layout.vertical?.name || initialTextConfig.validateVerticalPosition,
    validateHorizontalPosition: layout.horizontal?.name || initialTextConfig.validateHorizontalPosition,
    validateHorizontalPadding: Number(layout.horizontal?.value) || initialTextConfig.validateHorizontalPadding,
    validateVerticalPadding: Number(layout.vertical?.value) || initialTextConfig.validateVerticalPadding,
  }
}

const apiModelToCertificate = (model: IApiModel): IProcessedCertificate => {
  const frontPage = model.pages.find(p => p.type === 'frente')
  const versePage = model.pages.find(p => p.type === 'verso')

  return {
    id: model.id,
    name: model.name,
    criterions: model.criterions || [],
    pages: model.pages,
    front: frontPage
      ? { img: frontPage.image ? `${STORAGE_URL}/upload/${frontPage.image}` : '', text: frontPage.text, layout: frontPage.layout }
      : { img: '', text: '', layout: null },
    verse: versePage
      ? { img: versePage.image ? `${STORAGE_URL}/upload/${versePage.image}` : '', text: versePage.text, layout: versePage.layout }
      : undefined
  }
}

interface ICombination {
  activityTypeName: string
  functionName: string
}

interface IParticipant {
  id: string
  name: string
  combinations: ICombination[]
  workload?: number
}

export const EventCertificate: React.FC<Props> = ({ event }) => {
  const [openModal, setOpenModal] = useState(false)
  const [certificateList, setCertificateList] = useState<IProcessedCertificate[]>([])
  const [loadingModels, setLoadingModels] = useState(true)

  // Seleção de participante
  const [openParticipantModal, setOpenParticipantModal] = useState(false)
  const [participantList, setParticipantList] = useState<IParticipant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [participantSearch, setParticipantSearch] = useState('')

  useEffect(() => {
    const loadModels = async () => {
      if (!event?.id) return
      try {
        setLoadingModels(true)
        const modelsRes = await api.get(`events/${event.id}/models`)
        const models: IApiModel[] = modelsRes?.data?.data || []
        setCertificateList(models.map(apiModelToCertificate))
      } catch (err) {
        console.error('Erro ao carregar modelos:', err)
      } finally {
        setLoadingModels(false)
      }
    }
    if (event) loadModels()
  }, [event])

  const handleOpenParticipantModal = useCallback(async (certificate: IProcessedCertificate) => {
    setCertificateSelected(certificate)
    setParticipantSearch('')
    setOpenParticipantModal(true)
    if (!event?.id) return
    try {
      setLoadingParticipants(true)
      const res = await api.get(`events/${event.id}/certificates`, { params: { take: 100, skip: 0 } })
      const certs: any[] = res?.data?.data || []
      if (certs.length >= 100) {
        console.warn('[EventCertificate] Limite de 100 participantes atingido. Podem existir mais registros não exibidos.')
      }
      const hasCriterions = certificate.criterions && certificate.criterions.length > 0

      // Todos os critérios do modelo já populados (type_activity.name e function.name)
      const allCombinations: ICombination[] = (certificate.criterions || []).map(c => ({
        activityTypeName: c.type_activity?.name || '',
        functionName: c.function?.name || ''
      }))

      let participants: IParticipant[]
      if (hasCriterions) {
        // Lista todos os participantes do evento, cada um carrega TODOS os critérios do modelo
        const seen = new Set<string>()
        participants = []
        for (const c of certs) {
          if (!c?.participant?.id || seen.has(c.participant.id)) continue
          seen.add(c.participant.id)
          participants.push({
            id: c.participant.id || c.id,
            name: c.participant.name,
            combinations: allCombinations,
            workload: c.workload
          })
        }
      } else {
        const seen = new Set<string>()
        participants = []
        for (const c of certs) {
          if (!c?.participant?.id || seen.has(c.participant.id)) continue
          seen.add(c.participant.id)
          participants.push({ id: c.participant.id || c.id, name: c.participant.name, combinations: [], workload: c.workload })
        }
      }

      setParticipantList(participants)
    } catch (err) {
      console.error('Erro ao carregar participantes:', err)
      setParticipantList([])
    } finally {
      setLoadingParticipants(false)
    }
  }, [event])

  const [selectedParticipant, setSelectedParticipant] = useState<IParticipant>({ id: '', name: 'Fulano de Tal', combinations: [] })

  const handleSelectParticipant = useCallback((participant: IParticipant) => {
    setSelectedParticipant(participant)
    setOpenParticipantModal(false)
    setOpenModal(true)
  }, [])

  const handleCloseParticipantModal = useCallback(() => {
    setOpenParticipantModal(false)
    setCertificateSelected(null)
  }, [])

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const [certificateSelected, setCertificateSelected] = useState<IProcessedCertificate | null>(null)

  const filteredParticipants = participantList.filter(p => {
    const q = participantSearch.toLowerCase()
    const combinationsText = p.combinations.map(c => `${c.activityTypeName} ${c.functionName}`).join(' ')
    return (
      p.name.toLowerCase().includes(q) ||
      combinationsText.toLowerCase().includes(q)
    )
  })

  const hasCriterionsSelected = !!(certificateSelected?.criterions?.length)

  return (
    <Container>
      <Grid cols={3}>
        {certificateList.map((certificate) => (
          <CardContainer key={certificate.id}>
            <Header>
              <div className="icon">
                <FiAward size={20} />
              </div>
              <h2>{certificate.name}</h2>
            </Header>
            <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', overflow: 'hidden' }}>
              {certificate.front?.img ? (
                <Image
                  src={certificate.front.img}
                  alt={certificate.name}
                  width={300}
                  height={200}
                  unoptimized
                  style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '200px' }}
                />
              ) : (
                <p style={{ color: '#999' }}>Sem imagem</p>
              )}
            </main>
            <footer style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
              <Button
                color="secondary"
                size="small"
                type="button"
                onClick={() => handleOpenParticipantModal(certificate)}
                inline
              >
                <FiCheck size={20} />
                <span>Visualizar</span>
              </Button>
            </footer>
          </CardContainer>
        ))}
      </Grid>

      {/* Modal de seleção de participante */}
      {openParticipantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            width: '100%',
            maxWidth: 480,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiUser size={18} />
                Selecionar participante
              </h2>
              <Button inline onClick={handleCloseParticipantModal} color="secondary" type="button" outline>
                <FiX size={18} />
              </Button>
            </div>

            {/* Busca */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiSearch size={16} style={{ position: 'absolute', left: 10, color: '#999' }} />
                <input
                  type="text"
                  placeholder="Buscar participante..."
                  value={participantSearch}
                  onChange={e => setParticipantSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Lista */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
              {loadingParticipants ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>Carregando participantes...</p>
              ) : filteredParticipants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
                  {participantSearch ? 'Nenhum participante encontrado.' : 'Nenhum participante cadastrado.'}
                </p>
              ) : (
                filteredParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => handleSelectParticipant(participant)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 20px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderBottom: '1px solid #f5f5f5',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <FiUser size={15} style={{ color: '#888', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>{participant.name}</span>
                      {participant.combinations.length > 0 && (
                        <span style={{ fontSize: '0.78rem', color: '#888' }}>
                          {participant.combinations.map(c =>
                            [c.activityTypeName, c.functionName].filter(Boolean).join(' como ')
                          ).join(', ')}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização do certificado */}
      {openModal && certificateSelected?.front?.img && (() => {
        const cfg = layoutToConfig(certificateSelected.front?.layout)
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            {/* Barra superior */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 24px',
              borderBottom: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCheckSquare size={20} />
                Modelo: {certificateSelected.name}
                <span style={{ fontWeight: 400, color: '#666', fontSize: '0.9rem' }}>
                  — {selectedParticipant.name}
                </span>
              </h2>
              <Button inline onClick={handleCloseModal} color="secondary" type="button" outline>
                <FiX size={20} />
                <span>Fechar</span>
              </Button>
            </div>

            {/* Área do certificado */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '32px 24px',
              minHeight: 'calc(100vh - 61px)'
            }}>
              <Certificate
                preview="true"
                image={certificateSelected.front.img}
                validateHorizontalPosition={cfg.validateHorizontalPosition as 'center' | 'right' | 'left'}
                validateVerticalPosition={cfg.validateVerticalPosition as 'bottom' | 'top'}
                validateHorizontalPadding={cfg.validateHorizontalPadding}
                validateVerticalPadding={cfg.validateVerticalPadding}
                codeOrientation={cfg.codeOrientation as 'horizontal' | 'vertical'}
                padding={cfg.padding}
                position={cfg.position as 'center' | 'custom'}
                html={(() => {
                  if (hasCriterionsSelected && selectedParticipant.combinations.length > 0) {
                    const periodo = event?.start_date && event?.end_date
                      ? formatDateRange(event.start_date, event.end_date)
                      : '[participacao_periodo]'
                    const criteriosStr = selectedParticipant.combinations
                      .map(c => `${c.functionName || ''} de ${c.activityTypeName || ''}`.trim())
                      .join(', ')
                    return `<p>Certificamos que <strong>${selectedParticipant.name}</strong> participou como <strong>${criteriosStr}</strong> da <strong>${event?.edition || ''} ${event?.name || ''} (${event?.initials || ''})</strong> do Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) Campus Vitória da Conquista, realizada no período de <strong>${periodo}</strong>, com carga horária de <strong>${selectedParticipant.workload ? `${selectedParticipant.workload} horas` : '[participacao_carga_horaria]'}</strong>.</p>`
                  }
                  return substituteParams(
                    certificateSelected.front.text,
                    event,
                    selectedParticipant.name,
                    '',
                    ''
                  )
                })()}
                paddingBottom={cfg.paddingBottom}
                paddingTop={cfg.paddingTop}
                paddingLeft={cfg.paddingLeft}
                paddingRight={cfg.paddingRight}
              />
            </div>
          </div>
        )
      })()}
    </Container>
  )
}
