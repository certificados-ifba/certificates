import { Button, Grid } from '@components'
import { IModelCertificate } from '@dtos'
import { FiAward, FiEdit, FiTrash2 } from 'react-icons/fi'

import { Roles } from '..'

import { Container, Header, ImagePreview, Preview } from './styles'

interface Props {
  certificate: IModelCertificate
  handleEdit: (certificate: IModelCertificate) => void
  handleDelete: (certificate: IModelCertificate) => void
}

export const CertificatePreview: React.FC<Props> = ({
  certificate,
  handleEdit,
  handleDelete
}) => {
  return (
    <Container>
      <Header>
        <div className="icon">
          <FiAward size={20} />
        </div>
        <h2>{certificate.name}</h2>
        <div className="delete">
          <Button
            inline
            size="small"
            color="danger"
            outline
            onClick={() => handleDelete(certificate)}
          >
            <FiTrash2 size={20} />
          </Button>
        </div>
        <div className="edit">
          <Button
            size="small"
            color="secondary"
            onClick={() => handleEdit(certificate)}
            inline
          >
            <FiEdit size={20} />
          </Button>
        </div>
      </Header>
      <Grid cols={2}>
        {certificate.pages.map((page, index) => (
          <Preview key={index}>
            <h3>{page.type}</h3>
            <div>
              <ImagePreview img={page.image} />
            </div>
          </Preview>
        ))}
        {/* <Preview>
          <h3>Frente</h3>
          <div>
            <ImagePreview img={certificate.front?.img} />
          </div>
        </Preview>
        <Preview>
          <h3>Verso</h3>
          <div>
            <ImagePreview img={certificate.verse?.img}>
              <div>
                <div>
                  <FiEyeOff size={50} />
                </div>
              </div>
            </ImagePreview>
          </div>
          {!certificate.verse?.text && (
            <small
              style={{
                textAlign: 'center',
                display: 'block'
              }}
            >
              Esse certificado não tem verso.
            </small>
          )}
        </Preview> */}
      </Grid>
      <div style={{ marginTop: '15px' }}>
        <Roles
          id={certificate.name}
          roles={(certificate as any).roles}
          isDefault={certificate.is_default}
          onFormChange={() => {
            console.log('')
          }}
          preview={true}
        />
      </div>
    </Container>
  )
}
