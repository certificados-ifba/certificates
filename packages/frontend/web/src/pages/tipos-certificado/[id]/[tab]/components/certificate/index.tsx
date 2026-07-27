import { Button, FileChooser } from '@components'
import { useToast } from '@providers'
import { api } from '@services'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { FiImage, FiTrash2 } from 'react-icons/fi'

import { EditContainer } from '../certificateLayout/styles'
import { Container, Image, TextContainer, ValidateContainer } from './styles'

interface Props {
  position: 'center' | 'custom'
  html: string
  padding: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  validateVerticalPadding: number
  validateHorizontalPadding: number
  displayTextGuide?: boolean
  displayValidateGuide?: boolean
  validateVerticalPosition: 'bottom' | 'top'
  validateHorizontalPosition: 'right' | 'left' | 'center'
  codeOrientation?: 'horizontal' | 'vertical'
  setPreview?: Dispatch<SetStateAction<string>>
  preview?: string
  image?: string
}

const validateUrl =
  (typeof window !== 'undefined' ? window.location.origin : '') + '/validate'

export const Certificate: React.FC<Props> = ({
  padding,
  html,
  position,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  displayTextGuide,
  validateHorizontalPosition,
  validateVerticalPosition,
  validateHorizontalPadding,
  validateVerticalPadding,
  displayValidateGuide,
  codeOrientation = 'horizontal',
  preview,
  setPreview,
  image
}) => {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleUpload = useCallback(
    async (formData: FormData) => {
      setLoading(true)
      try {
        const { data } = await api.post('upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setPreview(data.data)
        setLoading(false)
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Erro ao tentar enviar o arquivo',
          description: err
        })
        setLoading(false)
      }
    },
    [addToast, setPreview]
  )

  const handleRemove = useCallback(async () => {
    setLoading(true)
    try {
      await api.delete(`upload/${preview}`)
      setPreview('')
      setLoading(false)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao tentar remover o arquivo',
        description: err
      })
      setLoading(false)
    }
  }, [addToast, preview, setPreview])

  return (
    <Container>
      <div>
        {image && <Image img={image} />}
        {!image && (
          <FileChooser
            type="image"
            info={
              <>
                A imagem deve estar nas <b>dimenções A4</b> e orientação
                paisagem. Dimensão: 1123 x 794 pixels (Largura x Altura).
              </>
            }
            title="Arraste a imagem do certificado aqui"
            icon={FiImage}
            height="878px"
            preview={preview}
            onUpload={handleUpload}
            onRemove={handleRemove}
            loading={loading}
          />
        )}
        {preview && (
          <>
            <TextContainer
              displayGuide={displayTextGuide}
              paddingBottom={paddingBottom}
              paddingTop={paddingTop}
              paddingLeft={paddingLeft}
              paddingRight={paddingRight}
              padding={padding}
              position={position}
            >
              <div className="text">
                <div
                  className="center"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </TextContainer>
            <ValidateContainer
              displayGuide={displayValidateGuide}
              horizontalPosition={validateHorizontalPosition}
              verticalPosition={validateVerticalPosition}
              horizontalPadding={validateHorizontalPadding}
              verticalPadding={validateVerticalPadding}
              orientation={codeOrientation}
            >
              <div className="text">
                Código: <b>afae7289-6af4-4cbd-a16d-71247119914a</b> | Para
                validar clique{' '}
                <a href={validateUrl}>aqui</a> ou acesse{' '}
                <a href={validateUrl}>{validateUrl}</a>
              </div>
            </ValidateContainer>
          </>
        )}
      </div>
      {preview && (
        <EditContainer style={{ marginTop: '10px' }}>
          <div>
            <Button
              size="small"
              outline
              color="danger"
              onClick={handleRemove}
              type="button"
            >
              <FiTrash2 />
              <span>Redefinir Imagem</span>
            </Button>
          </div>
        </EditContainer>
      )}
    </Container>
  )
}
