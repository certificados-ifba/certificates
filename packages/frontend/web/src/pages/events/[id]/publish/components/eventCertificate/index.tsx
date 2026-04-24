import {
  Button,
  Grid
} from '@components'
import { Certificate } from '@pages/events/[id]/[tab]/components'
import { initialTextConfig } from '@pages/events/[id]/[tab]/components/certificateLayout'
import { api } from '@services'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FiAward, FiCheck, FiCheckSquare, FiX } from 'react-icons/fi'

import { CardContainer, Container, Header } from './styles'

interface IApiModel {
  id: string
  name: string
  pages: Array<{
    type: string
    image: string
    text: string
    layout: any
  }>
  created_at: string
}

interface IProcessedCertificate {
  id: string
  name: string
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

const STORAGE_URL = process.env.baseURL || 'http://localhost:4001'

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' })} a ${e.toLocaleDateString('pt-BR', opts)}`
  }
  return `${s.toLocaleDateString('pt-BR', opts)} a ${e.toLocaleDateString('pt-BR', opts)}`
}

const substituteParams = (html: string, event: any, participantName = 'Fulano de Tal'): string => {
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
    pages: model.pages,
    front: frontPage
      ? { img: frontPage.image ? `${STORAGE_URL}/upload/${frontPage.image}` : '', text: frontPage.text, layout: frontPage.layout }
      : { img: '', text: '', layout: null },
    verse: versePage
      ? { img: versePage.image ? `${STORAGE_URL}/upload/${versePage.image}` : '', text: versePage.text, layout: versePage.layout }
      : undefined
  }
}

export const EventCertificate: React.FC<Props> = ({ event }) => {
  const [openModal, setOpenModal] = useState(false)
  const [certificateList, setCertificateList] = useState<IProcessedCertificate[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [firstParticipantName, setFirstParticipantName] = useState<string>('Fulano de Tal')

  useEffect(() => {
    const loadModels = async () => {
      if (!event?.id) return
      try {
        setLoadingModels(true)
        const [modelsRes, certsRes] = await Promise.all([
          api.get(`events/${event.id}/models`),
          api.get(`events/${event.id}/certificates`, { params: { take: 1, skip: 0 } })
        ])
        const models: IApiModel[] = modelsRes?.data?.data || []
        setCertificateList(models.map(apiModelToCertificate))

        const firstCert = certsRes?.data?.data?.[0]
        if (firstCert?.participant?.name) {
          setFirstParticipantName(firstCert.participant.name)
        }
      } catch (err) {
        console.error('Erro ao carregar modelos:', err)
      } finally {
        setLoadingModels(false)
      }
    }
    if (event) loadModels()
  }, [event])

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const [certificateSelected, setCertificateSelected] = useState<IProcessedCertificate | null>(null)
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
                onClick={() => {
                  setCertificateSelected(certificate)
                  setOpenModal(true)
                }}
                inline
              >
                <FiCheck size={20} />
                <span>Visualizar</span>
              </Button>
            </footer>
          </CardContainer>
        ))}
      </Grid>

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
                html={substituteParams(certificateSelected.front.text, event, firstParticipantName)}
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
