import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import {
  MutableRefObject,
  useCallback,
  useRef,
  useState
} from 'react'
import { FiTrash2 } from 'react-icons/fi'

import { Section } from '../../styles/components/accordion'
import {
  EditContainer,
  LayoutContainer
} from '../../styles/components/accordions/certificateLayout'
import { Divider } from '../../styles/components/divider'
import { useDebounce } from '../../utils/debounce'
import { Button } from '../button'
import { Dropdown } from '../dropdown'
import { Input } from '../input'
import { VariableModal } from '../modals/variableModal'
import { RichTextEditor } from '../richTextEditor'
import { Select } from '../select'
import { SliderBar } from '../sliderBar'
import Certificate from './certificate'

const initialTextPadding = {
  padding: 15,
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 15,
  paddingRight: 15
}
const initialValidatePadding = {
  validateVerticalPadding: 0,
  validateHorizontalPadding: 0
}

const initialTextPosition = 'center'
const initialValidatePosition = {
  validateVerticalPosition: 'bottom',
  validateHorizontalPosition: 'center',
  codeOrientation: 'horizontal'
}

export const initialTextConfig = {
  position: initialTextPosition,
  ...initialTextPadding,
  ...initialValidatePadding,
  ...initialValidatePosition
}

interface Props {
  type: 'frente' | 'verso'
  text: string
  formRef?: MutableRefObject<FormHandles>
  preview?: string
  setPreview?: (value: string) => void
}

const CertificateLayout: React.FC<Props> = ({
  type,
  text,
  formRef: externalFormRef,
  preview: externalPreview,
  setPreview: externalSetPreview
}) => {
  const internalFormRef = useRef<FormHandles>(null)
  const formRef = externalFormRef || internalFormRef

  const [internalPreview, setInternalPreview] = useState('')
  const preview = externalPreview !== undefined ? externalPreview : internalPreview
  const setPreview = externalSetPreview || setInternalPreview
  const [textConfig, setTextConfig] = useState<any>({
    html: text,
    ...initialTextConfig
  })

  const [displayTextGuide, setDisplayTextGuide] = useState(false)
  const [displayValidateGuide, setDisplayValidateGuide] = useState(false)
  const [dropdownTextActive, setDropdownTextActive] = useState(false)
  const [dropdownValidateActive, setDropdownValidateActive] = useState(false)
  const [stateRichText, setStateRichText] = useState(null)

  const { run } = useDebounce<any>(config => {
    onConfigChange(config)
  })

  const onConfigChange = useCallback(config => {
    setTextConfig({ ...config })
    // Atualizar o formulário com o novo HTML
    if (formRef.current) {
      formRef.current.setFieldValue('html', config.html)
    }
  }, [formRef])

  const [openModal, setOpenModal] = useState(false)

  const handleClose = useCallback(() => {
    setOpenModal(false)
  }, [])

  const handleAddVariable = useCallback(value => {
    setOpenModal(true)
    setStateRichText(value)
  }, [])

  const handleDropdownText = useCallback(({ active }) => {
    setDisplayTextGuide(active)
  }, [])
  const handleDropdownValidate = useCallback(({ active }) => {
    setDisplayValidateGuide(active)
  }, [])

  return (
    <Form
      initialData={{ html: text, ...initialTextConfig }}
      ref={formRef}
      onSubmit={() => {
        console.log()
      }}
    >
      <Section paddingTop="sm" paddingBottom="sm">
        <div>
          {/* Campo hidden para manter o HTML no formulário */}
          <Input hidden type="hidden" name="html" value={textConfig.html} />
          <RichTextEditor
            onChange={({ html }) =>
              onConfigChange({ ...textConfig, html: html })
            }
            initialHTMLValue={textConfig.html}
            label="Texto"
          />
        </div>
      </Section>
      <Divider />
      <Section paddingTop="sm" paddingBottom="sm">
        <EditContainer>
          <div className="first-button">
            <Dropdown
              active={dropdownTextActive}
              setActive={setDropdownTextActive}
              onChangeState={handleDropdownText}
              color="secondary"
              inline
              dropdownChildren={
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <Select
                    formRef={formRef}
                    handleOnSelect={data => {
                      onConfigChange({
                        ...textConfig,
                        position: data.value,
                        ...initialTextPadding
                      })
                    }}
                    initialValue="center"
                    label="Posição"
                    name="position"
                    options={[
                      {
                        value: 'center',
                        label: 'Centralizado'
                      },
                      {
                        value: 'custom',
                        label: 'Personalizado'
                      }
                    ]}
                    marginBottom="sm"
                    menuPortalTarget={null}
                  />
                  {textConfig?.position === 'center' && (
                    <SliderBar
                      formRef={formRef}
                      name="padding"
                      label="Margem"
                      marginBottom="sm"
                      min="0"
                      max="25"
                      onChange={data => {
                        run({
                          ...textConfig,
                          padding: parseInt(data.target.value)
                        })
                      }}
                    />
                  )}
                  {textConfig?.position === 'custom' && (
                    <SliderBar
                      formRef={formRef}
                      name="paddingTop"
                      label="Margem Cima"
                      marginBottom="sm"
                      min="0"
                      max="60"
                      onChange={data => {
                        run({
                          ...textConfig,
                          paddingTop: parseInt(data.target.value)
                        })
                      }}
                    />
                  )}
                  {textConfig?.position === 'custom' && (
                    <SliderBar
                      formRef={formRef}
                      name="paddingBottom"
                      label="Margem Baixo"
                      marginBottom="sm"
                      min="0"
                      max="60"
                      onChange={data => {
                        run({
                          ...textConfig,
                          paddingBottom: parseInt(data.target.value)
                        })
                      }}
                    />
                  )}
                  {textConfig?.position === 'custom' && (
                    <SliderBar
                      formRef={formRef}
                      name="paddingLeft"
                      label="Margem Esquerda"
                      marginBottom="sm"
                      min="0"
                      max="60"
                      onChange={data => {
                        run({
                          ...textConfig,
                          paddingLeft: parseInt(data.target.value)
                        })
                      }}
                    />
                  )}
                  {textConfig?.position === 'custom' && (
                    <SliderBar
                      formRef={formRef}
                      name="paddingRight"
                      label="Margem Direita"
                      marginBottom="sm"
                      min="0"
                      max="60"
                      onChange={data => {
                        run({
                          ...textConfig,
                          paddingRight: parseInt(data.target.value)
                        })
                      }}
                    />
                  )}
                </div>
              }
            >
              <span>Editar Layout Texto</span>
            </Dropdown>
          </div>
          <Dropdown
            active={dropdownValidateActive}
            setActive={setDropdownValidateActive}
            color="secondary"
            onChangeState={handleDropdownValidate}
            dropdownChildren={
              <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                <Select
                  formRef={formRef}
                  handleOnSelect={data => {
                    setTextConfig({
                      ...textConfig,
                      codeOrientation: data.value
                    })
                  }}
                  initialValue="horizontal"
                  label="Orientação do código"
                  name="codeOrientation"
                  options={[
                    {
                      value: 'horizontal',
                      label: 'Horizontal'
                    },
                    {
                      value: 'vertical',
                      label: 'Vertical'
                    }
                  ]}
                  marginBottom="sm"
                  menuPortalTarget={null}
                />
                {textConfig?.codeOrientation === 'horizontal' && (
                  <Select
                    formRef={formRef}
                    handleOnSelect={data => {
                      setTextConfig({
                        ...textConfig,
                        validateVerticalPosition: data.value
                      })
                    }}
                    label="Posição vertical"
                    name="validateVerticalPosition"
                    options={[
                      {
                        value: 'top',
                        label: 'Cima'
                      },
                      {
                        value: 'bottom',
                        label: 'Baixo'
                      }
                    ]}
                    marginBottom="sm"
                    menuPortalTarget={null}
                  />
                )}
                {textConfig?.codeOrientation === 'horizontal' && (
                  <SliderBar
                    formRef={formRef}
                    name="validateHorizontalPadding"
                    label="Deslocamento horizontal"
                    step="0.5"
                    marginBottom="sm"
                    min="-15"
                    max="15"
                    defaultValue={0}
                    onChange={data => {
                      run({
                        ...textConfig,
                        validateHorizontalPadding: data.target.value
                      })
                    }}
                  />
                )}
                {textConfig?.codeOrientation === 'vertical' && (
                  <Select
                    formRef={formRef}
                    handleOnSelect={data => {
                      setTextConfig({
                        ...textConfig,
                        validateHorizontalPosition: data.value
                      })
                    }}
                    label="Posição horizontal"
                    name="validateHorizontalPosition"
                    options={[
                      {
                        value: 'left',
                        label: 'Esquerda'
                      },
                      {
                        value: 'right',
                        label: 'Direita'
                      }
                    ]}
                    marginBottom="sm"
                    menuPortalTarget={null}
                  />
                )}
                {textConfig?.codeOrientation === 'vertical' && (
                  <SliderBar
                    step="0.5"
                    formRef={formRef}
                    name="validateVerticalPadding"
                    label="Deslocamento vertical"
                    marginBottom="sm"
                    min="-5"
                    max="5"
                    defaultValue={0}
                    onChange={data => {
                      run({
                        ...textConfig,
                        validateVerticalPadding: data.target.value
                      })
                    }}
                  />
                )}
              </div>
            }
          >
            Editar Layout Código Certificado
          </Dropdown>
        </EditContainer>
        <div style={{ display: 'flex' }}>
          <LayoutContainer>
            <Certificate
              preview={preview}
              setPreview={setPreview}
              displayValidateGuide={displayValidateGuide}
              validateHorizontalPosition={textConfig.validateHorizontalPosition}
              validateVerticalPosition={textConfig.validateVerticalPosition}
              validateHorizontalPadding={textConfig.validateHorizontalPadding}
              validateVerticalPadding={textConfig.validateVerticalPadding}
              codeOrientation={textConfig.codeOrientation}
              displayTextGuide={displayTextGuide}
              padding={textConfig.padding}
              position={textConfig.position}
              html={textConfig.html}
              paddingBottom={textConfig.paddingBottom}
              paddingTop={textConfig.paddingTop}
              paddingLeft={textConfig.paddingLeft}
              paddingRight={textConfig.paddingRight}
            />
          </LayoutContainer>
        </div>
        {preview && (
          <EditContainer style={{ marginTop: '10px' }}>
            <div>
              <Button
                size="small"
                outline
                color="danger"
                onClick={() => {
                  setPreview('')
                }}
                type="button"
              >
                <FiTrash2 /> <span>Redefinir Imagem</span>
              </Button>
            </div>
          </EditContainer>
        )}
      </Section>
      <VariableModal
        addVariable={(value) => handleAddVariable({ value })}
        openModal={openModal}
        onClose={handleClose}
      />
    </Form>
  )
}

export default CertificateLayout
