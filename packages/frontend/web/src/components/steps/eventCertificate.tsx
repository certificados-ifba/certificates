import { useCallback, useState } from 'react'
import {
  FiAward,
  FiCheck,
  FiCheckSquare,
  FiSquare,
  FiX
} from 'react-icons/fi'

import ICertificate from '../../dtos/ICertificate'
import { Row } from '../../styles/components/grid'
import {
  CardContainer,
  Container,
  Header
} from '../../styles/components/steps/eventCertificate'
import Certificate from '../accordions/certificate'
import { initialTextConfig } from '../accordions/certificateLayout'
import { Button } from '../button'
import { Modal } from '../modal'
import { Table } from '../table'

const EventCertificate: React.FC = () => {
  const [openModal, setOpenModal] = useState(false)

  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
  }, [])

  const [certificateSelected, setCertificateSelected] = useState(null)

  const [certificateList, setCertificateList] = useState<ICertificate[]>([
    {
      confirmed: true,
      id: '1',
      name: 'Modelo Padrão 3',
      front: {
        img: "/teste1.png",
        text:
          '<p>Certificamos que <strong>[participante_nome]</strong> participou da <strong>[evento_edicao] [evento_nome] ([evento_sigla])</strong> do Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) Campus Vitória da Conquista, realizada no período de <strong>[participacao_periodo]</strong>, com cargga horária de <strong>[participacao_carga_horaria]</strong></p>'                       },
      roles: [
        {
          number: 1,
          activity: {
            name: 'Mesa Redonda',
            id: '1'
          },
          function: {
            name: 'Palestrante',
            id: '1'
          }
        },
        {
          number: 2,
          activity: {
            name: 'Mesa Redonda',
            id: '1'
          },
          function: {
            name: 'Professor',
            id: '1'
          }
        }
      ]
    },
    {
      confirmed: false,
      id: '2',
      name: 'Modelo para Professores',
      front: {
        img: "'/teste.jpeg'",
        text:
          '<p>Certificamos que <strong>[participante_nome]</strong> participou da <strong>[evento_edicao] [evento_nome] ([evento_sigla])</strong> do Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) Campus Vitória da Conquista, realizada no período de <strong>[participacao_periodo]</strong>, com cargga horária de <strong>[participacao_carga_horaria]</strong></p>'                       },
      verse: {
        img: "'/teste.jpeg'",
        text:
          '<p>Certificamos que <strong>[participante_nome]</strong> participou da <strong>[evento_edicao] [evento_nome] ([evento_sigla])</strong> do Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) Campus Vitória da Conquista, realizada no período de <strong>[participacao_periodo]</strong>, com cargga horária de <strong>[participacao_carga_horaria]</strong></p>'                       },
      roles: [
        {
          number: 1,
          activity: {
            name: 'Mesa Redonda',
            id: '1'
          },
          function: {
            name: 'Palestrante',
            id: '1'
          }
        },
        {
          number: 2,
          activity: {
            name: 'Mesa Redonda',
            id: '1'
          },
          function: {
            name: 'Professor',
            id: '1'
          }
        }
      ]
    }
  ])
  return (
    <Container>
      <Row cols={3}>
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
                  {certificate.roles.map((role, index) => (
                    <tr key={role.number}>
                      <td>{index + 1}</td>
                      <td>{role.activity.name}</td>
                      <td>{role.function.name}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </main>
            <footer>
              <Button
                outline={!certificate.confirmed}
                color="secondary"
                size="small"
                type="button"
                onClick={() => {
                  setCertificateSelected(certificate)
                  setOpenModal(true)
                }}
                inline
              >
                {certificate.confirmed && (
                  <>
                    <FiCheckSquare size={20} /> <span>Confirmado</span>
                  </>
                )}
                {!certificate.confirmed && (
                  <>
                    <FiSquare size={20} /> <span>Confirmar</span>
                  </>
                )}
              </Button>
            </footer>
          </CardContainer>
        ))}
      </Row>

      <Modal size="xl" open={openModal} onClose={handleCloseModal}>
        <header>
          <h2>
            <FiCheckSquare size={20} />
            Revise o texto do certificado
          </h2>
        </header>

        <main>
          <Certificate
            preview="true"
            image={certificateSelected?.front.img}
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
            validateVerticalPadding={initialTextConfig.validateVerticalPadding}
            padding={initialTextConfig.padding}
            position={initialTextConfig.position as 'center' | 'custom'}
            html={certificateSelected?.front.text}
            paddingBottom={initialTextConfig.paddingBottom}
            paddingTop={initialTextConfig.paddingTop}
            paddingLeft={initialTextConfig.paddingLeft}
            paddingRight={initialTextConfig.paddingRight}
          ></Certificate>
        </main>
        <footer>
          <Button
            inline
            onClick={() => {
              handleCloseModal()
            }}
            color="secondary"
            type="button"
            outline
          >
            <FiX size={20} />
            <span>Cancelar</span>
          </Button>
          <Button inline color="secondary" type="button">
            <FiCheck size={20} /> <span>Confirmar</span>
          </Button>
        </footer>
      </Modal>
    </Container>
  )
}

export default EventCertificate
