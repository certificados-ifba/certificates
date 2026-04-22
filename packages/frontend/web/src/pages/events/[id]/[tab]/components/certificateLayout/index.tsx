import {
  Accordion,
  Divider,
  Dropdown,
  Input,
  NewSelect,
  RichTextEditor,
  SliderBar
} from '@components'
import { useDebounce } from '@utils'
import { useCallback, useState } from 'react'

import { Certificate } from '..'

import { EditContainer, LayoutContainer } from './styles'

const { Section } = Accordion

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
}

export const CertificateLayout: React.FC<Props> = ({ type, text }) => {
  const [preview, setPreview] = useState('')
  const [displayTextGuide, setDisplayTextGuide] = useState(false)
  const [displayValidateGuide, setDisplayValidateGuide] = useState(false)
  const [dropdownTextActive, setDropdownTextActive] = useState(false)
  const [dropdownValidateActive, setDropdownValidateActive] = useState(false)
  const [textConfig, setTextConfig] = useState<any>({
    html: text,
    ...initialTextConfig
  })

  const { run } = useDebounce<any>(config => {
    onConfigChange(config)
  })

  const onConfigChange = useCallback(config => {
    setTextConfig({ ...config })
  }, [])

  const handleDropdownText = useCallback(({ active }) => {
    setDisplayTextGuide(active)
  }, [])
  const handleDropdownValidate = useCallback(({ active }) => {
    setDisplayValidateGuide(active)
  }, [])

  const index = type === 'frente' ? 0 : 1

  return (
    <>
      <Input name={`pages[${index}].type`} value={type} hidden />
      <Input name={`pages[${index}].image`} value={preview} hidden />
      <Section paddingTop="sm" paddingBottom="sm">
        <RichTextEditor
          name={`pages[${index}].text`}
          onChange={({ html }) => onConfigChange({ ...textConfig, html: html })}
          initialHTMLValue={textConfig.html}
          label="Texto"
        />
      </Section>
      <Divider />
      <Section paddingTop="sm" paddingBottom="sm">
        <EditContainer style={{ justifyContent: 'flex-start' }}>
          <Dropdown
            active={dropdownTextActive}
            setActive={setDropdownTextActive}
            onChangeState={handleDropdownText}
            color="secondary"
            inline
            dropdownChildren={
              <>
                <NewSelect
                  label="Posição"
                  isClearable={false}
                  marginBottom="sm"
                  defaultValue={{
                    value: 'center',
                    label: 'Centralizado'
                  }}
                  onChange={(data: any) => {
                    onConfigChange({
                      ...textConfig,
                      position: data?.value,
                      ...initialTextPadding
                    })
                  }}
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
                />
                {textConfig?.position === 'center' ? (
                  <SliderBar
                    name={`pages[${index}].layout.padding`}
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
                ) : (
                  <>
                    <SliderBar
                      name={`pages[${index}].layout.padding.top`}
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
                    <SliderBar
                      name={`pages[${index}].layout.padding.bottom`}
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
                    <SliderBar
                      name={`pages[${index}].layout.padding.left`}
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
                    <SliderBar
                      name={`pages[${index}].layout.padding.right`}
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
                  </>
                )}
              </>
            }
          >
            <span>Editar Layout Texto</span>
          </Dropdown>
          {type === 'frente' && (
            <Dropdown
              active={dropdownValidateActive}
              setActive={setDropdownValidateActive}
              color="secondary"
              onChangeState={handleDropdownValidate}
              dropdownChildren={
                <>
                  <NewSelect
                    name={`pages[${index}].layout.orientation`}
                    label="Orientação do código"
                    isClearable={false}
                    marginBottom="sm"
                    defaultValue={{
                      value: 'horizontal',
                      label: 'Horizontal'
                    }}
                    onChange={(data: any) => {
                      onConfigChange({
                        ...textConfig,
                        codeOrientation: data?.value
                      })
                    }}
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
                  />
                  {textConfig?.codeOrientation === 'horizontal' && (
                    <NewSelect
                      name={`pages[${index}].layout.vertical.name`}
                      label="Posição vertical"
                      isClearable={false}
                      marginBottom="sm"
                      defaultValue={{
                        value: 'bottom',
                        label: 'Baixo'
                      }}
                      onChange={(data: any) => {
                        onConfigChange({
                          ...textConfig,
                          validateVerticalPosition: data?.value
                        })
                      }}
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
                    />
                  )}
                  {textConfig?.codeOrientation === 'horizontal' && (
                    <SliderBar
                      name={`pages[${index}].layout.horizontal.value`}
                      label="Deslocamento horizontal"
                      marginBottom="sm"
                      step="0.5"
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
                    <NewSelect
                      name={`pages[${index}].layout.horizontal.name`}
                      label="Posição horizontal"
                      isClearable={false}
                      marginBottom="sm"
                      defaultValue={{
                        value: 'right',
                        label: 'Direita'
                      }}
                      onChange={(data: any) => {
                        onConfigChange({
                          ...textConfig,
                          validateHorizontalPosition: data?.value
                        })
                      }}
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
                    />
                  )}
                  {textConfig?.codeOrientation === 'vertical' && (
                    <SliderBar
                      name={`pages[${index}].layout.vertical.value`}
                      label="Deslocamento vertical"
                      marginBottom="sm"
                      step="0.5"
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
                </>
              }
            >
              Editar Layout Código Certificado
            </Dropdown>
          )}
        </EditContainer>
        <LayoutContainer>
          <div>
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
          </div>
        </LayoutContainer>
      </Section>
    </>
  )
}
