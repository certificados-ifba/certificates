import {
  Accordion,
  Alert,
  Button,
  FooterModal,
  HeaderModal,
  MainModal,
  Modal,
  ScrollWrapper,
  Select,
  Table
} from '@components'
import { ICriterion } from '@dtos'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  FiAlertCircle,
  FiCheckSquare,
  FiMinus,
  FiPlus,
  FiSquare,
  FiX
} from 'react-icons/fi'

const { Section } = Accordion

interface Props {
  children?: React.ReactNode
  onFormChange: (formRef: MutableRefObject<FormHandles>) => void
  preview?: boolean
  roles?: ICriterion[]
  id: string
}

export const Roles: React.FC<Props> = ({
  onFormChange,
  preview,
  roles,
  id
}) => {
  const formRef = useRef<FormHandles>(null)

  const [defaultModel, setDefaultModel] = useState(
    !roles ? false : roles.length === 0
  )
  const [roleList, setRoleList] = useState(roles || [])

  useEffect(() => {
    onFormChange(formRef)
  }, [formRef, onFormChange])

  const funcID = 'addFunction' + (preview ? 'modal' : '') + id
  const atvID = 'addActivity' + (preview ? 'modal' : '') + id

  const tableStyle: any = {}

  if (!preview) tableStyle.minWidth = '400px'

  const [openModal, setOpenModal] = useState(false)

  const addRole = useCallback(() => {
    const addFunction = formRef.current.getFieldValue(funcID)
    const addActivity = formRef.current.getFieldValue(atvID)
    const error: any = {}
    if (!addFunction) error[funcID] = 'Por favor, selecione uma função'
    if (!addActivity) error[atvID] = 'Por favor, selecione uma atividade'
    formRef.current.setErrors(error)
    // if (!error[funcID] && !error[atvID]) {
    //   setRoleList([
    //     ...roleList,
    //     {
    //       activity: addActivity,
    //       function: addFunction,
    //       number:
    //         roleList.length === 0 ? 1 : roleList[roleList.length - 1].number + 1
    //     }
    //   ])
    //   formRef.current.setFieldValue(funcID, null)
    //   formRef.current.setFieldValue(atvID, null)
    //   setOpenModal(false)
    // }
  }, [funcID, atvID])

  return (
    <Form
      ref={formRef}
      onSubmit={() => {
        console.log()
      }}
    >
      <Accordion icon={FiCheckSquare} title="Critérios">
        {!preview && (
          <Section paddingTop="md" paddingBottom="md">
            <Button
              size="small"
              onClick={() => {
                setDefaultModel(!defaultModel)
              }}
              outline={defaultModel}
              inline
              type="button"
            >
              {!defaultModel ? (
                <FiCheckSquare size={20} />
              ) : (
                <FiSquare size={20} />
              )}
              <span>Possui algum critério?</span>
            </Button>
          </Section>
        )}
        {!defaultModel && (
          <>
            <Section paddingTop={preview ? 'md' : undefined} paddingBottom="md">
              <Table>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th style={tableStyle}>Tipo de Atividade</th>
                    <th style={tableStyle}>Função</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {!preview && (
                    <>
                      <tr>
                        <td>-</td>
                        <td>
                          <Select
                            formRef={formRef}
                            name={atvID}
                            isSearchable={false}
                            options={[
                              {
                                value: { name: 'Mesa Redonda', value: '1' },
                                label: 'Mesa Redonda'
                              },
                              {
                                value: { name: 'Palestra', value: '2 ' },
                                label: 'Palestra'
                              }
                            ]}
                          />
                        </td>
                        <td>
                          <Select
                            formRef={formRef}
                            name={funcID}
                            isSearchable={false}
                            options={[
                              {
                                value: { name: 'Palestrante', value: '1' },
                                label: 'Palestrante'
                              },
                              {
                                value: { name: 'Professor', value: '1' },
                                label: 'Professor'
                              }
                            ]}
                          />
                        </td>
                        <td>
                          <Button
                            inline
                            square
                            color="success"
                            size="small"
                            type="button"
                            onClick={() => addRole()}
                          >
                            <FiPlus size={20} /> <span>Adicionar</span>
                          </Button>
                        </td>
                      </tr>
                    </>
                  )}
                  {roleList.map((role, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* <td>{role.activity.name}</td>
                      <td>{role.function.name}</td> */}
                      <td>
                        <Button
                          disabled={roleList.length === 1}
                          ghost
                          inline
                          square
                          color="danger"
                          size="small"
                          type="button"
                          onClick={() => {
                            roleList.splice(roleList.indexOf(role), 1)
                            setRoleList([...roleList])
                          }}
                        >
                          <FiMinus size={20} /> <span>Remover</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {preview && (
                    <tr>
                      <td colSpan={4}>
                        <Button
                          square
                          color="success"
                          size="small"
                          type="button"
                          onClick={() => {
                            setOpenModal(true)
                          }}
                        >
                          <FiPlus size={20} /> <span>Adicionar</span>
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Section>
            {roleList.length === 0 && (
              <Section paddingBottom="md">
                <Alert type="danger" icon={FiAlertCircle}>
                  Você tem que selecionar ao menos 1 critério!
                </Alert>
              </Section>
            )}
          </>
        )}
        {defaultModel && (
          <Section paddingTop={preview ? 'md' : undefined} paddingBottom="md">
            <Alert type="warning" icon={FiAlertCircle}>
              Atenção! Este certificado será utilizado para atividades
              e funções que não possuem um modelo definido.<br />
              <b>Verifique se o texto é adequado para esses casos.</b>
            </Alert>
          </Section>
        )}
      </Accordion>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <HeaderModal>
          <h2>Adicionar um Critério</h2>
        </HeaderModal>
        <ScrollWrapper>
          <MainModal>
            {preview && (
              <>
                <Select
                  marginBottom="sm"
                  label="Tipo de Atividade"
                  formRef={formRef}
                  name={atvID}
                  isSearchable={false}
                  options={[
                    {
                      value: { name: 'Mesa Redonda', value: '1' },
                      label: 'Mesa Redonda'
                    },
                    {
                      value: { name: 'Palestra', value: '2 ' },
                      label: 'Palestra'
                    }
                  ]}
                />
                <Select
                  label="Função"
                  formRef={formRef}
                  name={funcID}
                  isSearchable={false}
                  options={[
                    {
                      value: { name: 'Palestrante', value: '1' },
                      label: 'Palestrante'
                    },
                    {
                      value: { name: 'Professor', value: '1' },
                      label: 'Professor'
                    }
                  ]}
                />
              </>
            )}
          </MainModal>
        </ScrollWrapper>
        <FooterModal>
          <Button
            inline
            outline
            square
            color="secondary"
            onClick={() => {
              setOpenModal(false)
            }}
          >
            <FiX size={20} />
            <span>Cancelar</span>
          </Button>
          <Button
            square
            color="success"
            type="button"
            onClick={() => {
              addRole()
            }}
          >
            <FiPlus size={20} />
            <span>Adicionar</span>
          </Button>
        </FooterModal>
      </Modal>
    </Form>
  )
}
