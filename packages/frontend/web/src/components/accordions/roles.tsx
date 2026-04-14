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

import { IRole } from '../../dtos/ICertificate'
import api from '../../services/axios'
import { Section } from '../../styles/components/accordion'
import { Accordion } from '../accordion'
import { Alert } from '../alert'
import { Button } from '../button'
import { Modal } from '../modal'
import { Select } from '../select'
import { Table } from '../table'

interface Props {
  onFormChange: (formRef: MutableRefObject<FormHandles>) => void
  onRolesChange?: (roles: IRole[]) => void
  isDefault?: boolean
  onDefaultChange?: (value: boolean) => void
  preview?: boolean
  roles?: IRole[]
  id: string
}

const Roles: React.FC<Props> = ({ onFormChange, onRolesChange, isDefault, onDefaultChange, preview, roles, id }) => {
  const formRef = useRef<FormHandles>(null)

  const [roleList, setRoleList] = useState(roles || [])
  const [activityOptions, setActivityOptions] = useState<any[]>([])
  const [functionOptions, setFunctionOptions] = useState<any[]>([])

  useEffect(() => {
    onFormChange(formRef)
  }, [formRef, onFormChange])

  useEffect(() => {
    if (onRolesChange) {
      onRolesChange(roleList)
    }
  }, [roleList, onRolesChange])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [actRes, funcRes] = await Promise.all([
          api.get('/activity_types', { params: { sort_by: 'name', order_by: 'ASC' } }),
          api.get('/functions', { params: { sort_by: 'name', order_by: 'ASC' } })
        ])
        const activities = (actRes.data?.data?.generics || actRes.data?.data || [])
        const functions = (funcRes.data?.data?.generics || funcRes.data?.data || [])
        setActivityOptions(
          activities.map((item: any) => ({
            value: { name: item.name, value: item.id },
            label: item.name.charAt(0).toUpperCase() + item.name.slice(1)
          }))
        )
        setFunctionOptions(
          functions.map((item: any) => ({
            value: { name: item.name, value: item.id },
            label: item.name.charAt(0).toUpperCase() + item.name.slice(1)
          }))
        )
      } catch (err) {
        console.error('Erro ao carregar opções de critérios:', err)
      }
    }
    loadOptions()
  }, [])

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
    if (!error[funcID] && !error[atvID]) {
      setRoleList([
        ...roleList,
        {
          activity: addActivity,
          function: addFunction,
          number:
            roleList.length === 0 ? 1 : roleList[roleList.length - 1].number + 1
        }
      ])
      formRef.current.setFieldValue(funcID, null)
      formRef.current.setFieldValue(atvID, null)
      setOpenModal(false)
    }
  }, [funcID, roleList, atvID])

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
                if (onDefaultChange) onDefaultChange(!isDefault)
              }}
              outline={!isDefault}
              inline
              type="button"
            >
              {isDefault ? (
                <FiCheckSquare size={20} />
              ) : (
                <FiSquare size={20} />
              )}
              <span>Modelo padrão</span>
            </Button>
          </Section>
        )}
        {!isDefault && (
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
                            options={activityOptions}
                          />
                        </td>
                        <td>
                          <Select
                            formRef={formRef}
                            name={funcID}
                            isSearchable={false}
                            options={functionOptions}
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
                    <tr key={role.number}>
                      <td>{index + 1}</td>
                      <td>{role.activity.name}</td>
                      <td>{role.function.name}</td>
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
        {isDefault && (
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
        <header>
          <h2>Adicionar um Critério</h2>
        </header>
        <main>
          {preview && (
            <>
              <Select
                marginBottom="sm"
                label="Tipo de Atividade"
                formRef={formRef}
                name={atvID}
                isSearchable={false}
                options={activityOptions}
              />
              <Select
                label="Função"
                formRef={formRef}
                name={funcID}
                isSearchable={false}
                options={functionOptions}
              />
            </>
          )}
        </main>
        <footer>
          <Button
            inline
            outline
            square
            color="secondary"
            onClick={() => {
              setOpenModal(false)
            }}
          >
            <FiX size={20} /> <span>Cancelar</span>
          </Button>
          <Button
            square
            color="success"
            type="button"
            onClick={() => {
              addRole()
            }}
          >
            <FiPlus size={20} /> <span>Adicionar</span>
          </Button>
        </footer>
      </Modal>
    </Form>
  )
}

export default Roles
