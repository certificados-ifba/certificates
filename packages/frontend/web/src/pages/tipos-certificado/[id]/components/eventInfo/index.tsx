import { Alert, Button, DeleteModal, TipoCertificadoModal, Grid } from '@components'
import { ITipoCertificado } from '@dtos'
import { useAuth, useToast } from '@providers'
import { api } from '@services'
import { formatDate } from '@utils'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  FiBookmark,
  FiCalendar,
  FiEdit,
  FiHash,
  FiMapPin,
  FiTag,
  FiTrash2,
  FiUser
} from 'react-icons/fi'

import { ButtonContainer, Container } from './styles'

interface Props {
  event: ITipoCertificado
  setEvent: Dispatch<SetStateAction<ITipoCertificado>>
  edit: boolean
}

export const EventInfo: React.FC<Props> = ({ event, setEvent, edit }) => {
  const [show, setShow] = useState(false)
  const [openTipoCertificadoModal, setOpenTipoCertificadoModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const { addToast } = useToast()
  const { isAdmin } = useAuth()
  const router = useRouter()

  const handleSubmitDelete = useCallback(async () => {
    try {
      await api.delete(`tipos-certificado/${event?.id}`)
      addToast({
        title: 'Evento excluido',
        type: 'success',
        description: `${event?.name} excluído com sucesso.`
      })
      setOpenDeleteModal(false)
      router.push(`/tipos-certificado`)
    } catch (err) {
      addToast({
        title: 'Erro na exclusão',
        type: 'error',
        description: err
      })
    }
  }, [addToast, event, router])

  const handleCloseTipoCertificadoModal = useCallback(() => {
    setOpenTipoCertificadoModal(false)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false)
  }, [])

  useEffect(() => {
    if (!show) setShow(isAdmin && edit)
  }, [show, isAdmin, edit])

  return (
    <Container>
      <Grid cols={2}>
        <div>
          <Alert marginBottom="sm" size="sm">
            Nome do Evento:
          </Alert>
          <Alert icon={FiBookmark} marginBottom="md">
            <b>{event?.name}</b>
          </Alert>
        </div>
        <div>
          <Alert marginBottom="sm" size="sm">
            Sigla:
          </Alert>
          <Alert icon={FiHash} marginBottom="md">
            <b>{event?.initials}</b>
          </Alert>
        </div>
        <div>
          <Alert marginBottom="sm" size="sm">
            Edição:
          </Alert>
          <Alert icon={FiTag} marginBottom="md">
            <b>{event?.edition}</b>
          </Alert>
        </div>
        <div>
          <Alert marginBottom="sm" size="sm">
            Local:
          </Alert>
          <Alert icon={FiMapPin} marginBottom="md">
            <b>{event?.local}</b>
          </Alert>
        </div>
        <div>
          <Alert marginBottom="sm" size="sm">
            Período:
          </Alert>
          <Alert icon={FiCalendar} marginBottom="md">
            <b>
              De {formatDate(event?.start_date)} até{' '}
              {formatDate(event?.end_date)}
            </b>
          </Alert>
        </div>
        <div>
          <Alert marginBottom="sm" size="sm">
            Coordenador:
          </Alert>
          <Alert icon={FiUser}>
            <b>{event?.user?.name}</b>
          </Alert>
        </div>
      </Grid>
      {show && event?.status !== 'PUBLISHED' && (
        <ButtonContainer>
          <Button
            marginBottom="xs"
            size="small"
            color="secondary"
            onClick={() => {
              setOpenTipoCertificadoModal(true)
            }}
          >
            <FiEdit size={20} />
            <span>Editar</span>
          </Button>
          <Button
            size="small"
            color="danger"
            outline
            onClick={() => {
              setOpenDeleteModal(true)
            }}
          >
            <FiTrash2 size={20} />
            <span>Excluir</span>
          </Button>
        </ButtonContainer>
      )}
      <TipoCertificadoModal
        type="edit"
        event={event}
        openModal={openTipoCertificadoModal}
        onClose={handleCloseTipoCertificadoModal}
        setEvent={setEvent}
      />
      <DeleteModal
        name="Evento"
        openModal={openDeleteModal}
        onClose={handleCloseDeleteModal}
        handleSubmit={handleSubmitDelete}
      >
        <Alert>
          Tem certeza que você deseja excluir o evento <b>{event?.name}</b>?
        </Alert>
      </DeleteModal>
    </Container>
  )
}
