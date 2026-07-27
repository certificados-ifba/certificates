import {
  Button,
  FooterModal,
  HeaderModal,
  Input,
  MainModal,
  Modal
} from '@components'
import { getIcon, ICON_OPTIONS } from '@components/tipoSelectorModal/iconMap'
import { IGeneric } from '@dtos'
import { useToast } from '@providers'
import { api, PaginatedRequest } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { getValidationErrors } from '@utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { IconBaseProps } from 'react-icons'
import { FiCheck, FiEdit, FiPlus, FiUserPlus, FiX } from 'react-icons/fi'
import styled from 'styled-components'
import * as Yup from 'yup'

interface Props {
  type: 'add' | 'update'
  name: string
  url: string
  openModal: boolean
  onClose: () => void
  generic?: IGeneric
  request: PaginatedRequest<any, any>
  icon: React.ComponentType<IconBaseProps>
  showIconPicker?: boolean
}

const IconPickerLabel = styled.label`
  display: block;
  margin: 1rem 0 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.darkTint};
`

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
`

const IconOption = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  border: 2px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.primary : 'transparent'};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.lightShade : theme.colors.light};
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export const GenericModal: React.FC<Props> = ({
  type,
  openModal,
  onClose,
  generic,
  request,
  icon: Icon,
  name,
  url,
  showIconPicker = false
}) => {
  const [loading, setLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<string>(ICON_OPTIONS[0])
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
        const schema = Yup.object().shape({
          name: Yup.string().required(`A ${name} precisa ter um nome`)
        })
        await schema.validate(data, {
          abortEarly: false
        })

        const payload = showIconPicker ? { ...data, icon: selectedIcon } : data

        if (type === 'add') {
          await api.post(url, payload)
        } else {
          delete payload.cpf
          await api.put(`${url}/${generic?.id}`, payload)
        }

        addToast({
          type: 'success',
          title: `${name} ${type === 'add' ? 'cadastrada' : 'atualizada'}`,
          description: `${data.name} foi ${
            type === 'add' ? 'cadastrado' : 'atualizado'
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
          title: `Erro ${generic?.id ? 'na alteração' : 'no cadastro'}`,
          description: err
        })
      }
    },
    [
      type,
      generic?.id,
      addToast,
      request,
      handleCloseModal,
      name,
      url,
      showIconPicker,
      selectedIcon
    ]
  )

  useEffect(() => {
    if (generic) {
      formRef.current?.setData(generic)
      setSelectedIcon(generic.icon || ICON_OPTIONS[0])
    } else {
      formRef.current?.setData({})
      setSelectedIcon(ICON_OPTIONS[0])
    }
  }, [generic, openModal])

  return (
    <Modal open={openModal} onClose={handleCloseModal}>
      <HeaderModal>
        <h2>
          {type === 'update' ? (
            <>
              <FiEdit size={20} />
              <span>Editar {name}</span>
            </>
          ) : (
            <>
              <FiUserPlus size={20} />
              <span>Adicionar {name}</span>
            </>
          )}
        </h2>
      </HeaderModal>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <MainModal>
          <Input
            name="name"
            label="Nome"
            placeholder="Nome"
            icon={Icon}
            disabled={loading}
          />
          {showIconPicker && (
            <>
              <IconPickerLabel>Ícone</IconPickerLabel>
              <IconGrid>
                {ICON_OPTIONS.map(iconName => {
                  const OptionIcon = getIcon(iconName)
                  return (
                    <IconOption
                      key={iconName}
                      type="button"
                      selected={selectedIcon === iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      disabled={loading}
                    >
                      <OptionIcon size={20} />
                    </IconOption>
                  )
                })}
              </IconGrid>
            </>
          )}
        </MainModal>
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
