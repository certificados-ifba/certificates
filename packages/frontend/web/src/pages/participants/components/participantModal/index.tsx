import {
  Button,
  FooterModal,
  Grid,
  HeaderModal,
  Input,
  MainModal,
  Modal,
  NewSelect,
  ScrollWrapper
} from '@components'
import { IParticipant } from '@dtos'
import { useToast } from '@providers'
import { api, PaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { formatDate, getParticipantSchema, getValidationErrors } from '@utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiBook,
  FiCalendar,
  FiCheck,
  FiCreditCard,
  FiEdit,
  FiMail,
  FiPhoneCall,
  FiPlus,
  FiUser,
  FiUserPlus,
  FiX
} from 'react-icons/fi'
import * as Yup from 'yup'

interface Props {
  type: 'add' | 'update'
  openModal: boolean
  onClose: () => void
  participant?: IParticipant
  request: PaginatedRequest<any, any>
}

export const ParticipantModal: React.FC<Props> = ({
  type,
  openModal,
  onClose,
  participant,
  request
}) => {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const formRef = useRef<FormHandles>(null)

  const handleCloseSaveModal = useCallback(() => {
    formRef.current.reset()
    formRef.current.setErrors({})
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    async data => {
      try {
        setLoading(true)
        formRef.current?.setErrors({})
        await getParticipantSchema().validate(data, {
          abortEarly: false
        })

        data.cpf = data.cpf.replace(/[^\d]+/g, '')
        if (type === 'add') {
          await api.post('participants', data)
        } else {
          await api.put(`participants/${participant.id}`, data)
        }

        addToast({
          type: 'success',
          title: `O participante ${type === 'add' ? 'cadastrado' : 'atualizado'
            }`,
          description: `${data.name} foi ${type === 'add' ? 'cadastrado' : 'atualizado'
            } com sucesso.`
        })
        request.revalidate()
        setLoading(false)
        handleCloseSaveModal()
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
          title: `Erro ao ${type === 'update' ? 'atualizar' : 'adicionar'
            } o participante`,
          description: err
        })
      }
    },
    [type, participant, addToast, request, handleCloseSaveModal]
  )

  useEffect(() => {
    if (participant) {
      formRef.current?.setData({
        name: participant.name,
        email: participant.email,
        cpf: participant.personal_data.cpf,
        dob: formatDate(participant.personal_data.dob, true, false),
        phone: participant.personal_data.phone,
        institution: participant.personal_data.institution
      })
    } else {
      formRef.current?.setData({})
    }
  }, [participant, openModal])

  return (
    <Modal size="xl" open={openModal} onClose={handleCloseSaveModal}>
      <HeaderModal>
        <h2>
          {type === 'update' ? (
            <>
              <FiEdit size={20} />
              <span>Editar Participante</span>
            </>
          ) : (
            <>
              <FiUserPlus size={20} />
              <span>Adicionar Participante</span>
            </>
          )}
        </h2>
      </HeaderModal>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <ScrollWrapper>
          <MainModal>
            <Grid cols={2}>
              <Input
                marginBottom="sm"
                name="name"
                label="Nome"
                placeholder="Nome"
                icon={FiUser}
                disabled={loading}
              />
              <Input
                marginBottom="sm"
                name="cpf"
                label="CPF"
                placeholder="CPF"
                type="cpf"
                icon={FiCreditCard}
                disabled={loading}
              />
              <Input
                marginBottom="sm"
                name="dob"
                label="Data de Nascimento"
                type="date"
                icon={FiCalendar}
                disabled={loading}
              />
              <NewSelect
                marginBottom={'sm'}
                label="É da Instituição?"
                name="institution"
                isSearchable={false}
                icon={FiBook}
                isDisabled={loading}
                options={[
                  {
                    value: true,
                    label: 'Sim'
                  },
                  {
                    value: false,
                    label: 'Não'
                  }
                ]}
              />
              <Input
                marginBottom={'sm'}
                name="email"
                label={'E-mail'}
                placeholder="email@exemplo.com"
                type="text"
                icon={FiMail}
                disabled={loading}
              />
              <Input
                marginBottom="sm"
                name="phone"
                label="Telefone"
                placeholder="Telefone"
                type="phone"
                icon={FiPhoneCall}
                disabled={loading}
              />
            </Grid>
          </MainModal>
        </ScrollWrapper>
        <FooterModal inline>
          <Button
            onClick={() => {
              handleCloseSaveModal()
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
            {type === 'update' ? (
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
