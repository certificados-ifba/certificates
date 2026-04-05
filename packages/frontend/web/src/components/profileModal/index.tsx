import {
  Button,
  FooterModal,
  HeaderModal,
  Input,
  MainModal,
  Modal,
  ScrollWrapper
} from '@components'
import { useAuth, useToast } from '@providers'
import { api } from '@services'
import { getValidationErrors } from '@utils'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { useCallback, useEffect, useRef } from 'react'
import { FiCheck, FiUser, FiX, FiMail, FiLock } from 'react-icons/fi'
import * as Yup from 'yup'

interface Props {
  openModal: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<Props> = ({ openModal, onClose }) => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const formRef = useRef<FormHandles>(null)

  useEffect(() => {
    if (openModal) {
      formRef.current?.setData({ name: user?.name, email: user?.email })
    }
  }, [openModal, user])

  const handleClose = useCallback(() => {
    formRef.current?.reset()
    formRef.current?.setErrors({})
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    async data => {
      try {
        formRef.current?.setErrors({})

        const schema = Yup.object().shape({
          name: Yup.string().required('O nome é obrigatório'),
          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('O e-mail é obrigatório'),
          password: Yup.string(),
          password_confirmation: Yup.string().when('password', {
            is: (val: string) => val && val.length > 0,
            then: Yup.string()
              .required('Confirme a nova senha')
              .oneOf([Yup.ref('password')], 'As senhas não conferem')
          })
        })

        await schema.validate(data, { abortEarly: false })

        const payload: Record<string, string> = {
          name: data.name,
          email: data.email
        }

        if (data.password) {
          payload.password = data.password
        }

        await api.put(`/users/${user?.id}`, payload)

        addToast({
          type: 'success',
          title: 'Perfil atualizado',
          description: 'Suas informações foram atualizadas com sucesso.'
        })

        handleClose()
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          formRef.current?.setErrors(getValidationErrors(err))
          return
        }
        addToast({
          type: 'error',
          title: 'Erro ao atualizar perfil',
          description: err?.response?.data?.message || 'Tente novamente.'
        })
      }
    },
    [user, addToast, handleClose]
  )

  return (
    <Modal open={openModal} onClose={handleClose}>
      <HeaderModal>
        <h2>
          <FiUser size={20} />
          <span>Editar Perfil</span>
        </h2>
      </HeaderModal>
      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        initialData={{ name: user?.name, email: user?.email }}
      >
        <ScrollWrapper>
          <MainModal>
            <Input
              marginBottom="sm"
              name="name"
              label="Nome"
              placeholder="Seu nome"
              icon={FiUser}
            />
            <Input
              marginBottom="sm"
              name="email"
              label="E-mail"
              placeholder="Seu e-mail"
              icon={FiMail}
            />
            <Input
              marginBottom="sm"
              name="password"
              label="Nova Senha"
              placeholder="Deixe em branco para não alterar"
              type="password"
              icon={FiLock}
            />
            <Input
              marginBottom="sm"
              name="password_confirmation"
              label="Confirmar Nova Senha"
              placeholder="Repita a nova senha"
              type="password"
              icon={FiLock}
            />
          </MainModal>
        </ScrollWrapper>
        <FooterModal inline>
          <Button
            onClick={handleClose}
            color="secondary"
            type="button"
            outline
          >
            <FiX size={20} />
            <span>Cancelar</span>
          </Button>
          <Button color="primary" type="submit">
            <FiCheck size={20} />
            <span>Salvar</span>
          </Button>
        </FooterModal>
      </Form>
    </Modal>
  )
}
