import {
  Button,
  FooterModal,
  Grid,
  HeaderModal,
  MainModal,
  Modal,
  ScrollWrapper,
  Table
} from '@components'
import { IModelCertificate } from '@dtos'
import { Certificate } from '@pages/events/[id]/[tab]/components'
import { initialTextConfig } from '@pages/events/[id]/[tab]/components/certificateLayout'
import { api } from '@services'
import { useCallback, useEffect, useState } from 'react'
import { FiAward, FiCheck, FiCheckSquare, FiX } from 'react-icons/fi'

import { CardContainer, Container, Header } from './styles'

interface Props {
  event: any
}

export const EventCertificate: React.FC<Props> = ({ event }) => {
  const [openModal, setOpenModal] = useState(false)
  const [certificateSelected, setCertificateSelected] = useState(null)
  const [certificateList, setCertificateList] = useState<IModelCertificate[]>([])

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  useEffect(() => {
    if (!event?.id) return
    const load = async () => {
      try {
        const response = await api.get(`events/${event.id}/models`)
        if (response?.data?.data) setCertificateList(response.data.data)
      } catch (_) { }
    }
    load()
  }, [event?.id])

  return (
    <Container>
      {certificateList.length === 0 && (
        <p style={{ padding: '16px' }}>Nenhum modelo de certificado cadastrado para este evento.</p>
      )}
      <Grid cols={3}>
        {certificateList.map((certificate, index) => (
          <CardContainer key={index}>
            <Header>
              <div className="icon">
                <FiAward size={20} />
              </div>
              <h2>{certificate.name}</h2>
            </Header>
            <main>
              <Table>
                <tbody>
                  {certificate.criterions.map((criterion, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{criterion.type_activity_id}</td>
                      <td>{criterion.function_id}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </main>
            <footer>
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
                <FiCheckSquare size={20} />
                <span>Visualizar</span>
              </Button>
            </footer>
          </CardContainer>
        ))}
      </Grid>

      <Modal size="xl" open={openModal} onClose={handleCloseModal}>
        <HeaderModal>
          <h2>
            <FiCheckSquare size={20} />
            Revise o texto do certificado
          </h2>
        </HeaderModal>
        <ScrollWrapper>
          <MainModal>
            <Certificate
              preview="true"
              image={certificateSelected?.pages?.[0]?.image}
              validateHorizontalPosition={
                initialTextConfig.validateHorizontalPosition as
                | 'center'
                | 'right'
                | 'left'
              }
              validateVerticalPosition={
                initialTextConfig.validateVerticalPosition as 'bottom' | 'top'
              }
              validateHorizontalPadding={
                initialTextConfig.validateHorizontalPadding
              }
              validateVerticalPadding={
                initialTextConfig.validateVerticalPadding
              }
              padding={initialTextConfig.padding}
              position={initialTextConfig.position as 'center' | 'custom'}
              html={certificateSelected?.pages?.[0]?.text}
              paddingBottom={initialTextConfig.paddingBottom}
              paddingTop={initialTextConfig.paddingTop}
              paddingLeft={initialTextConfig.paddingLeft}
              paddingRight={initialTextConfig.paddingRight}
            />
          </MainModal>
        </ScrollWrapper>

        <FooterModal inline>
          <Button
            inline
            onClick={handleCloseModal}
            color="secondary"
            type="button"
            outline
          >
            <FiX size={20} />
            <span>Fechar</span>
          </Button>
          <Button inline color="secondary" type="button" onClick={handleCloseModal}>
            <FiCheck size={20} />
            <span>OK</span>
          </Button>
        </FooterModal>
      </Modal>
    </Container>
  )
}
