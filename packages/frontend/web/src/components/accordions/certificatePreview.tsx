import {
    FiAward,
    FiEdit,
    FiEyeOff,
    FiTrash2
} from 'react-icons/fi'

import ICertificate from '../../dtos/ICertificate'
import {
    Container,
    Header,
    ImagePreview,
    Preview
} from '../../styles/components/accordions/certificatePreview'
import { Row } from '../../styles/components/grid'
import { Button } from '../button'
import Roles from './roles'

interface Props {
  certificate: ICertificate
  handleEdit: (certificate: ICertificate) => void
  handleDelete: (certificate: ICertificate) => void
}

const CertificatePreview: React.FC<Props> = ({
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
      <Row cols={2}>
        <Preview>
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
        </Preview>
      </Row>
      <div style={{ marginTop: '15px' }}>
        <Roles
          id={certificate.id}
          roles={certificate.roles}
          isDefault={certificate.is_default}
          onFormChange={() => {
            console.log('')
          }}
          preview={true}
        ></Roles>
      </div>
    </Container>
  )
}

export default CertificatePreview
