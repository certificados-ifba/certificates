import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { useCallback, useRef, useState } from 'react'
import {
  FiCheckSquare,
  FiEdit,
  FiFileText,
  FiImage,
  FiPlus,
  FiPlusCircle,
  FiSquare,
  FiX
} from 'react-icons/fi'
import * as Yup from 'yup'

import { IRole } from '../../dtos/ICertificate'
import { useToast } from '../../providers/toast'
import api from '../../services/axios'
import { Footer, Section } from '../../styles/components/accordion'
import { Divider } from '../../styles/components/divider'
import { Row } from '../../styles/components/grid'
import { getValidationErrors } from '../../utils/getValidationErrors'
import { Accordion } from '../accordion'
import { Button } from '../button'
import { Input } from '../input'
import CertificateLayout from './certificateLayout'
import Roles from './roles'

export interface IModelData {
  id: string
  name: string
  is_default: boolean
  pages: Array<{
    type: string
    image: string
    text: string
    layout: any
  }>
  criterions: Array<{
    function: any
    type_activity: any
  }>
}

interface Props {
  eventId: string
  edit?: boolean
  modelData?: IModelData
  onSuccess?: () => void
}

const AddCertificate: React.FC<Props> = ({
  eventId,
  edit,
  modelData,
  onSuccess
}) => {
  const formRef = useRef<FormHandles>(null)
  const layoutFrontFormRef = useRef<FormHandles>(null)
  const layoutVerseFormRef = useRef<FormHandles>(null)
  const [rolesFormRef, setRolesFormRef] = useState(null)

  // Extrair roles iniciais do modelData
  const initialRoles: IRole[] = (modelData?.criterions || []).map((c, index) => ({
    number: index + 1,
    activity: {
      name: typeof c.type_activity === 'object' ? (c.type_activity?.name || '') : '',
      id: typeof c.type_activity === 'object' ? (c.type_activity?.id || c.type_activity?.value || '') : String(c.type_activity)
    },
    function: {
      name: typeof c.function === 'object' ? (c.function?.name || '') : '',
      id: typeof c.function === 'object' ? (c.function?.id || c.function?.value || '') : String(c.function)
    }
  }))

  const [collectedRoles, setCollectedRoles] = useState<any[]>(initialRoles)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(!!edit)
  const hasVerse = modelData?.pages?.some(p => p.type === 'verso') || false
  const [isVerse, setIsVerse] = useState(hasVerse)
  const [isDefault, setIsDefault] = useState(modelData?.is_default || false)

  const frontPage = modelData?.pages?.find(p => p.type === 'frente')
  const versePage = modelData?.pages?.find(p => p.type === 'verso')

  const [previewFront, setPreviewFront] = useState(
    frontPage?.image || ''
  )
  const [previewVerse, setPreviewVerse] = useState(
    versePage?.image || ''
  )
  const { addToast } = useToast()

  const handleClose = useCallback(() => {
    setIsOpen(false)
    formRef.current?.reset()
    setPreviewFront('')
    setPreviewVerse('')
    setIsVerse(false)
    setIsDefault(false)
    if (onSuccess) {
      onSuccess()
    }
  }, [onSuccess])

  const handleSubmit = useCallback(
    async data => {
      try {
        console.log('📝 [DEBUG] Form data:', data)

        setLoading(true)
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome do modelo é obrigatório')
        })
        formRef.current?.setErrors({})

        await schema.validate(data, {
          abortEarly: false
        })

        // Coletar dados dos layouts
        const frontLayoutData = layoutFrontFormRef.current?.getData() || {}
        const verseLayoutData = isVerse ? layoutVerseFormRef.current?.getData() || {} : null

        console.log('🎨 [DEBUG] Front layout data:', frontLayoutData)
        console.log('🔄 [DEBUG] Verse layout data:', verseLayoutData)
        console.log('🖼️ [DEBUG] Preview front:', previewFront)
        console.log('🖼️ [DEBUG] Preview verse:', previewVerse)

        // Montar objeto pages conforme esperado pelo backend
        const pages = [
          {
            type: 'frente',
            text: frontLayoutData.html || '<p>Texto padrão</p>',
            image: previewFront || '',
            layout: {
              padding: {
                top: String(frontLayoutData.paddingTop || 15),
                right: frontLayoutData.paddingRight || 15,
                bottom: frontLayoutData.paddingBottom || 15,
                left: String(frontLayoutData.paddingLeft || 15)
              },
              vertical: {
                name: frontLayoutData.validateVerticalPosition || 'bottom',
                value: Number(frontLayoutData.validateVerticalPadding || 0)
              },
              horizontal: {
                name: frontLayoutData.validateHorizontalPosition || 'right',
                value: Number(frontLayoutData.validateHorizontalPadding || 0)
              }
            }
          }
        ]

        // Adicionar verso se existir
        if (isVerse && verseLayoutData) {
          pages.push({
            type: 'verso',
            text: verseLayoutData.html || '<p>Texto padrão</p>',
            image: previewVerse || '',
            layout: {
              padding: {
                top: String(verseLayoutData.paddingTop || 15),
                right: verseLayoutData.paddingRight || 15,
                bottom: verseLayoutData.paddingBottom || 15,
                left: String(verseLayoutData.paddingLeft || 15)
              },
              vertical: {
                name: verseLayoutData.validateVerticalPosition || 'bottom',
                value: Number(verseLayoutData.validateVerticalPadding || 0)
              },
              horizontal: {
                name: verseLayoutData.validateHorizontalPosition || 'right',
                value: Number(verseLayoutData.validateHorizontalPadding || 0)
              }
            }
          })
        }

        // Coletar critérios
        const criterions = collectedRoles.map(role => ({
            function: role.function?.value || role.function?.id || role.function,
            type_activity: role.activity?.value || role.activity?.id || role.activity
          }))

        const payload = {
          name: data.name,
          pages,
          criterions,
          is_default: isDefault
        }

        console.log('🚀 [DEBUG] Payload to send:', JSON.stringify(payload, null, 2))

        if (edit && modelData?.id) {
          await api.put(`events/${eventId}/models/${modelData.id}`, payload)
          addToast({
            type: 'success',
            title: 'Modelo atualizado',
            description: 'O modelo de certificado foi atualizado com sucesso.'
          })
        } else {
          await api.post(`events/${eventId}/models`, payload)
          addToast({
            type: 'success',
            title: 'Modelo adicionado',
            description: 'O modelo de certificado foi adicionado com sucesso.'
          })
        }
        setLoading(false)
        handleClose()
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
          title: 'Erro ao adicionar o modelo',
          description: err
        })
      }
    },
    [addToast, eventId, handleClose, isVerse, isDefault, previewFront, previewVerse, collectedRoles, edit, modelData]
  )

  return (
    <Accordion
      isOpen={isOpen}
      onToggle={state => setIsOpen(state)}
      icon={edit ? FiEdit : FiPlusCircle}
      title={
        edit
          ? 'Editar Modelo de Certificado'
          : 'Adicionar Modelo de Certificado'
      }
    >
      <Form ref={formRef} onSubmit={handleSubmit} initialData={{ name: modelData?.name || '' }}>
        <Section paddingTop="sm" paddingBottom="md">
          <Row cols={2}>
            <div>
              <Input
                type="text"
                name="name"
                label="Nome do Modelo"
                placeholder="Ex.: Modelo Padrão"
                icon={FiFileText}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
              <Button
                size="small"
                onClick={() => setIsDefault(state => !state)}
                outline={!isDefault}
                inline
                type="button"
              >
                {isDefault ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                <span>Modelo Padrão</span>
              </Button>
            </div>
          </Row>
        </Section>
        <Divider />
        <Section paddingTop="md" paddingBottom="sm">
          <Accordion title="Layout Frente" icon={FiImage}>
            <CertificateLayout
              type="frente"
              text={
                frontPage?.text ||
                '<p>Certificamos que <strong>[participante_nome]</strong> participou da <strong>[evento_edicao] [evento_nome] ([evento_sigla])</strong> do Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) Campus Vitória da Conquista, realizada no período de <strong>[participacao_periodo]</strong>, com carga horária de <strong>[participacao_carga_horaria]</strong></p>'
              }
              formRef={layoutFrontFormRef}
              preview={previewFront}
              setPreview={setPreviewFront}
            />
          </Accordion>
        </Section>

        <Section paddingBottom="sm">
          <Accordion icon={FiImage} title="Layout Verso">
            <Section paddingTop="sm" paddingBottom="md">
              <Button
                size="small"
                onClick={() => setIsVerse(state => !state)}
                outline={!isVerse}
                inline
                type="button"
              >
                {isVerse ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                <span>Possui verso?</span>
              </Button>
            </Section>

            {isVerse && (
              <CertificateLayout
                type="verso"
                text={versePage?.text || ''}
                formRef={layoutVerseFormRef}
                preview={previewVerse}
                setPreview={setPreviewVerse}
              />
            )}
          </Accordion>
        </Section>
        <Section paddingBottom="md">
          <Roles
            id={edit ? 'edit' : 'add'}
            roles={initialRoles.length > 0 ? initialRoles : undefined}
            isDefault={isDefault}
            onDefaultChange={(value) => {
              setIsDefault(value)
            }}
            onFormChange={form => {
              setRolesFormRef(form)
            }}
            onRolesChange={roles => {
              setCollectedRoles(roles)
            }}
          />
        </Section>
        <Footer>
          <div>
            <Button
              outline
              color="secondary"
              size="default"
              type="reset"
              disabled={loading}
              onClick={handleClose}
            >
              <FiX size={20} />
              <span>Cancelar</span>
            </Button>
          </div>
          <div>
            <Button
              color="primary"
              size="default"
              type="submit"
              loading={loading}
            >
              <FiPlus size={20} />
              <span>{edit ? 'Atualizar Modelo' : 'Adicionar Modelo'}</span>
            </Button>
          </div>
        </Footer>
      </Form>
    </Accordion>
  )
}

export default AddCertificate
