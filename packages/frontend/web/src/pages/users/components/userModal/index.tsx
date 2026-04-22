import {
  Alert,
  Button,
  FooterModal,
  HeaderModal,
  Input,
  MainModal,
  Modal,
  NewSelect,
  ScrollWrapper
} from '@components'
import { IUser } from '@dtos'
import { useAuth, useToast } from '@providers'
import { api, PaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { getValidationErrors, isValidEmail, maskEmail } from '@utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiCheck,
  FiEdit,
  FiKey,
  FiLock,
  FiMail,
  FiPlus,
  FiUnlock,
  FiUser,
  FiUserPlus,
  FiX
} from 'react-icons/fi'
import * as Yup from 'yup'

interface Props {
  type: 'add' | 'update' | 'update-email'
  openModal: boolean
  onClose: () => void
  user?: IUser
  request: PaginatedRequest<any, any>
}

const displayEmail = (email: string, isAdmin: boolean): string =>
  isAdmin ? email : maskEmail(email)

export const UserModal: React.FC<Props> = ({
  type,
  openModal,
  onClose,
  user,
  request
}) => {
  const [loading, setLoading] = useState(false)
  const { isAdmin } = useAuth()
  const { addToast } = useToast()

  const formRef = useRef<FormHandles>(null)

  const handleCloseModal = useCallback(() => {
    formRef.current.reset()
    formRef.current.setErrors({})
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    async data => {
      try {
        setLoading(true)
        formRef.current?.setErrors({})
        const schemaObj: any = {}

        if (type === 'add' || type === 'update') {
          schemaObj.name = Yup.string().required(
            'O usuário precisa ter um nome'
          )
          schemaObj.role = Yup.string().required(
            'Você precisa selecionar um privilégio'
          )
        }

        if (type === 'add' || type === 'update-email') {
          schemaObj.repeatEmail = Yup.string()
            .test('email-is-valid', 'Por favor, digite um e-mail válido', isValidEmail)
            .required('Você precisa confirmar o e-mail')
            .oneOf([data.email], 'Os e-mails devem ser iguais.')
            .notOneOf([user?.email], 'O e-mail deve ser diferente do atual')
          schemaObj.email = Yup.string()
            .test('email-is-valid', 'Por favor, digite um e-mail válido', isValidEmail)
            .required('O usuário precisa ter um e-mail')
            .notOneOf([user?.email], 'O e-mail deve ser diferente do atual')
        }

        const schema = Yup.object().shape(schemaObj)
        await schema.validate(data, {
          abortEarly: false
        })

        delete data.repeatEmail

        if (type === 'add') {
          await api.post('users', data)
        } else {
          if (!data.name) delete data.name
          if (!data.role) delete data.role
          if (!data.email) delete data.email
          await api.put(`users/${user.id}`, data)
        }

        addToast({
          type: 'success',
          title: `O usuário foi ${type === 'add' ? 'cadastrado' : 'atualizado'
            }`,
          description:
            type === 'update-email'
              ? 'O e-mail foi atualizado, peça para o usuário confirmar sua conta.'
              : `${data.name} foi ${type === 'add' ? 'cadastrado' : 'atualizado'
              } com sucesso.`
        })
        request.revalidate()
        setLoading(false)
        handleCloseModal()
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          setLoading(false)
          return
        }
        setLoading(false)
        addToast({
          type: 'error',
          title: `Erro ao ${type === 'update-email'
            ? 'atualizar o e-mail'
            : type === 'update'
              ? 'atualizar o usuário'
              : 'adicionar o usuário'
            }`,
          description: err
        })
      }
    },
    [type, user, addToast, request, handleCloseModal]
  )

  useEffect(() => {
    if (type === 'update' && user) {
      formRef.current?.setData(user)
    } else {
      formRef.current?.setData({})
    }
  }, [user, openModal, type])

  return (
    <Modal open={openModal} onClose={handleCloseModal}>
      <HeaderModal>
        <h2>
          {type === 'update' ? (
            <>
              <FiEdit size={20} />
              <span>Editar Usuário</span>
            </>
          ) : type === 'update-email' ? (
            <>
              <FiMail size={20} />
              <span>Atualizar E-mail</span>
            </>
          ) : (
            <>
              <FiUserPlus size={20} />
              <span>Adicionar Usuário</span>
            </>
          )}
        </h2>
      </HeaderModal>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <ScrollWrapper>
          <MainModal>
            {type === 'update-email' && (
              <>
                <Alert size="sm" marginBottom="xs">
                  Usuário:
                </Alert>
                <Alert size="sm" icon={FiUser} marginBottom="sm">
                  <b>{user?.name}</b>
                </Alert>
                <Alert size="sm" marginBottom="xs">
                  E-mail atual:
                </Alert>
                <Alert size="sm" icon={FiMail} marginBottom="xs">
                  <b>{displayEmail(user?.email, isAdmin)}</b>
                </Alert>
                <Alert
                  type={user?.is_confirmed ? 'success' : 'danger'}
                  icon={user?.is_confirmed ? FiUnlock : FiLock}
                  size="sm"
                  marginBottom="md"
                >
                  Este e-mail {user?.is_confirmed ? 'já foi' : 'não foi'}{' '}
                  confirmado
                </Alert>
              </>
            )}
            {type === 'update' && (
              <>
                <Alert size="sm" marginBottom="sm">
                  O e-mail de {user?.name} é:
                </Alert>
                <Alert size="sm" icon={FiMail} marginBottom="md">
                  <b>{displayEmail(user?.email, isAdmin)}</b>
                </Alert>
              </>
            )}
            <Input
              hidden={!(type !== 'update-email')}
              marginBottom="sm"
              name="name"
              label="Nome"
              placeholder="Nome"
              icon={FiUser}
              disabled={loading}
            />
            <NewSelect
              hidden={!(type !== 'update-email')}
              label="Privilégio"
              name="role"
              isSearchable={false}
              marginBottom={type === 'add' ? 'sm' : undefined}
              icon={FiKey}
              isDisabled={loading}
              options={[
                {
                  value: 'ADMIN',
                  label: 'Administrador'
                },
                {
                  value: 'COORDINATOR',
                  label: 'Coordenador de Eventos'
                }
              ]}
            />
            <Input
              marginBottom={'sm'}
              name="email"
              label={type === 'update-email' ? 'Novo e-mail' : 'E-mail'}
              placeholder="email@exemplo.com"
              type="text"
              icon={FiMail}
              disabled={loading}
              hidden={!(type !== 'update')}
            />
            <Input
              name="repeatEmail"
              label={
                type === 'update-email'
                  ? 'Confirme o novo e-mail'
                  : 'Confirme o e-mail'
              }
              placeholder="email@exemplo.com"
              type="text"
              icon={FiMail}
              disabled={loading}
              hidden={!(type !== 'update')}
            />
          </MainModal>
        </ScrollWrapper>
        <FooterModal>
          <Button
            onClick={() => {
              handleCloseModal()
            }}
            color="secondary"
            type="button"
            outline
            disabled={loading}
          >
            <FiX size={20} />
            <span>Cancelar</span>
          </Button>
          <Button
            color={type === 'add' ? 'primary' : 'secondary'}
            type="submit"
            loading={loading}
          >
            {type === 'update' || type === 'update-email' ? (
              <>
                <FiCheck size={20} />
                <span>Atualizar</span>
              </>
            ) : (
              <>
                <FiPlus size={20} />
                <span>Adicionar</span>
              </>
            )}
          </Button>
        </FooterModal>
      </Form>
    </Modal>
  )
}
