import {
  AsyncSelect,
  Button,
  FooterModal,
  Grid,
  HeaderModal,
  Input,
  MainModal,
  Modal,
  ScrollWrapper
} from '@components'
import { IActivity, ITipoCertificado, IGeneric } from '@dtos'
import { useToast } from '@providers'
import { api, PaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { capitalize, getActivitySchema, getValidationErrors } from '@utils'
import { useCallback, useEffect, useRef } from 'react'
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit,
  FiFileText,
  FiPlus,
  FiPlusCircle,
  FiTag,
  FiX
} from 'react-icons/fi'
import * as Yup from 'yup'

interface Props {
  type: 'add' | 'update'
  event: ITipoCertificado
  openModal: boolean
  onClose: () => void
  activity?: IActivity
  request: PaginatedRequest<any, any>
}

export const ActivityModal: React.FC<Props> = ({
  type,
  event,
  openModal,
  onClose,
  activity,
  request
}) => {
  const formRef = useRef<FormHandles>(null)

  const { addToast } = useToast()

  const handleCloseModal = useCallback(() => {
    formRef.current.reset()
    formRef.current.setErrors({})
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    async data => {
      const schema = getActivitySchema(event.start_date, event.end_date)

      try {
        await schema.validate(data, {
          abortEarly: false
        })

        if (type === 'add') {
          await api.post(`tipos-certificado/${event?.id}/activities`, data)
        } else {
          await api.put(`tipos-certificado/${event?.id}/activities/${activity?.id}`, data)
        }

        addToast({
          type: 'success',
          title: `A atividade ${type === 'add' ? 'cadastrado' : 'atualizado'}`,
          description: `A atividade foi ${
            type === 'add' ? 'cadastrado' : 'atualizado'
          } com sucesso.`
        })
        request.revalidate()
        handleCloseModal()
        // setLoading(false)
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          return
        }
        addToast({
          type: 'error',
          title: `Erro ao ${
            type === 'add' ? 'adicionar atividade' : 'atualizar atividade'
          }`,
          description: err
        })
        // setLoading(false)
      }
    },
    [type, event, activity?.id, addToast, handleCloseModal, request]
  )

  const loadTypes = useCallback(async search => {
    const response = await api.get<{ data: IGeneric[] }>('/activity_types', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    const data = []

    response.data?.data?.forEach(type => {
      data.push({
        value: type.id,
        label: capitalize(type.name)
      })
    })
    return data
  }, [])

  useEffect(() => {
    if (activity) {
      formRef.current.setData({
        name: activity.name,
        type: {
          label: capitalize(activity.type.name),
          value: activity.type.id
        },
        workload: activity.workload,
        start_date: activity.start_date,
        end_date: activity.end_date
      })
    } else {
      formRef.current.reset()
    }
  }, [activity, openModal])

  return (
    <Modal open={openModal} onClose={handleCloseModal} size="xl">
      <HeaderModal>
        <h2>
          {activity ? (
            <>
              <FiEdit size={20} />
              <span>Editar Atividade</span>
            </>
          ) : (
            <>
              <FiPlusCircle size={20} />
              <span>Adicionar Atividade</span>
            </>
          )}
        </h2>
      </HeaderModal>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <ScrollWrapper>
          <MainModal>
            <Input
              name="name"
              label="Nome"
              marginBottom="sm"
              placeholder="Nome"
              icon={FiFileText}
            />
            <Grid cols={2}>
              <AsyncSelect
                formRef={formRef}
                label="Tipo de Atividade"
                name="type"
                marginBottom="sm"
                icon={FiTag}
                loadOptions={loadTypes}
              />
              <Input
                type="number"
                name="workload"
                label="Carga Horária (Horas)"
                marginBottom="sm"
                placeholder="Carga Horária"
                icon={FiClock}
              />
              <Input
                type="date"
                name="start_date"
                label="Inicia em"
                marginBottom="sm"
                placeholder="Data de Início"
                icon={FiCalendar}
              />
              <Input
                type="date"
                name="end_date"
                label="Termina em"
                placeholder="Data Final"
                icon={FiCalendar}
              />
            </Grid>
          </MainModal>
        </ScrollWrapper>
        <FooterModal inline>
          <Button
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
          <Button
            color={activity ? 'secondary' : 'primary'}
            type="submit"
            // loading={loading}
          >
            {activity ? (
              <>
                <FiCheck size={20} /> <span>Atualizar</span>
              </>
            ) : (
              <>
                <FiPlus size={20} /> <span>Adicionar</span>
              </>
            )}
          </Button>
        </FooterModal>
      </Form>
    </Modal>
  )
}
