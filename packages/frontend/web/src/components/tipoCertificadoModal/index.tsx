import {
  AsyncSelect,
  Button,
  Grid,
  Input,
  Modal,
  FooterModal,
  HeaderModal,
  MainModal,
  ScrollWrapper
} from '@components'
import { Badge, Group } from '@components/asyncSelect/styles'
import { ITipoCertificado, IUser } from '@dtos'
import { useToast } from '@providers'
import { api } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { capitalize, getValidationErrors } from '@utils'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  FiBookmark,
  FiTag,
  FiCalendar,
  FiX,
  FiPlus,
  FiCheck,
  FiHash,
  FiUser,
  FiMapPin
} from 'react-icons/fi'
import styled from 'styled-components'
import * as Yup from 'yup'

interface IResponse {
  data: IUser[]
}

const TipoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors?.primaryLight || '#ede9fe'};
  color: ${({ theme }) => theme.colors?.primary || '#4f46e5'};
  margin-left: 0.5rem;
`

interface Props {
  type: 'add' | 'edit'
  openModal: boolean
  onClose: () => void
  setEvent?: Dispatch<SetStateAction<ITipoCertificado>>
  event?: ITipoCertificado
  tipo?: string
}

export const TipoCertificadoModal: React.FC<Props> = ({
  type,
  openModal,
  onClose,
  setEvent,
  event,
  tipo
}) => {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const router = useRouter()

  const formRef = useRef<FormHandles>(null)

  const tipoAtual = event?.tipo || tipo

  const handleCloseSaveModal = useCallback(() => {
    formRef.current.reset()
    formRef.current.setErrors({})
    onClose()
  }, [onClose])

  useEffect(() => {
    if (event) {
      formRef.current.setData({
        name: event?.name,
        initials: event?.initials,
        edition: event?.edition,
        start_date: event?.start_date,
        end_date: event?.end_date,
        local: event?.local,
        user: {
          label: capitalize(event?.user?.name),
          value: event?.user?.id
        }
      })
    } else {
      formRef.current.reset()
    }
  }, [event, openModal])

  const handleSubmit = useCallback(
    async data => {
      setLoading(true)
      const schema = Yup.object().shape({
        name: Yup.string().required('A certificação precisa ter um nome'),
        initials: Yup.string().required('Por favor, digite a sigla'),
        edition: Yup.string().required('Por favor, digite a edição'),
        local: Yup.string().required('Por favor, digite o local'),
        user: Yup.string().required(
          'Você precisa selecionar um coordenador'
        ),
        start_date: Yup.string().required('Selecione a data de início'),
        end_date: Yup.string().required('Selecione a data do fim')
      })

      try {
        await schema.validate(data, {
          abortEarly: false
        })

        const payload = { ...data, tipo: tipoAtual }

        if (type === 'add') {
          const response = await api.post('tipos-certificado', payload)
          router.push(`tipos-certificado/${response.data?.data?.event?.id}/info`)
        } else {
          const response = await api.put(`tipos-certificado/${event?.id}`, payload)
          setEvent(response.data?.data?.event)
        }

        addToast({
          type: 'success',
          title: `Certificação ${type === 'add' ? 'cadastrada' : 'atualizada'}`,
          description: `A certificação foi ${
            type === 'add' ? 'cadastrada' : 'atualizada'
          } com sucesso.`
        })
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
          title: `Erro ao ${
            type === 'add' ? 'adicionar a certificação' : 'atualizar a certificação'
          }`,
          description: err
        })
      }
    },
    [router, type, tipoAtual, event?.id, addToast, handleCloseSaveModal, setEvent]
  )

  const loadUsers = useCallback(async search => {
    const response = await api.get<IResponse>('/users', {
      params: { search, sort_by: 'name', order_by: 'ASC' }
    })

    const data = [
      {
        label: 'Administrador',
        options: []
      },
      {
        label: 'Coordenador',
        options: []
      }
    ]

    response.data?.data?.forEach(user => {
      data[user.role === 'ADMIN' ? 0 : 1].options.push({
        value: user.id,
        label: capitalize(user.name)
      })
    })
    return data
  }, [])

  const formatGroupLabel = data => (
    <Group>
      <span>{data.label}</span>
      <Badge>{data.options.length}</Badge>
    </Group>
  )

  return (
    <Modal open={openModal} onClose={handleCloseSaveModal} size="xl">
      <HeaderModal>
        <h2>
          <FiCalendar size={20} />
          <span>{event ? 'Editar' : 'Nova'} Certificação</span>
          {tipoAtual && <TipoBadge>{tipoAtual}</TipoBadge>}
        </h2>
      </HeaderModal>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <ScrollWrapper>
          <MainModal>
            <Input
              marginBottom="sm"
              name="name"
              label="Nome"
              placeholder="Nome da certificação"
              icon={FiBookmark}
            />
            <Grid cols={2}>
              <Input
                marginBottom="sm"
                name="initials"
                label="Sigla"
                placeholder="Sigla"
                icon={FiHash}
              />
              <Input
                marginBottom="sm"
                name="edition"
                label="Edição"
                placeholder="Edição"
                icon={FiTag}
              />
              <Input
                marginBottom="sm"
                name="start_date"
                label="Data Inicial"
                placeholder="Data Inicial"
                type="date"
                icon={FiCalendar}
              />
              <Input
                marginBottom="sm"
                name="end_date"
                label="Data Final"
                placeholder="Data Final"
                type="date"
                icon={FiCalendar}
              />
              <Input
                marginBottom="sm"
                name="local"
                label="Local"
                placeholder="Local"
                icon={FiMapPin}
              />
              <AsyncSelect
                label="Coordenador"
                name="user"
                loadOptions={loadUsers}
                formatGroupLabel={formatGroupLabel}
                icon={FiUser}
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
          >
            <FiX size={20} />
            <span>Cancelar</span>
          </Button>
          <Button
            color={event ? 'secondary' : 'primary'}
            type="submit"
            loading={loading}
          >
            {event ? (
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

