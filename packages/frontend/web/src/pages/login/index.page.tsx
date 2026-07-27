import { Button, LogoArea } from '@components'
import { withoutAuth } from '@hocs'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiCheck, FiSearch } from 'react-icons/fi'

import { FormForgotPassword, FormLogin } from './components'
import { Container, TopButton } from './styles'

const Login: React.FC = () => {
  const [forgotPassword, setForgotPassword] = useState<boolean>(false)
  const router = useRouter()

  return (
    <Container>
      <Head>
        <title>Login | Certificados</title>
      </Head>
      <LogoArea />
      <TopButton>
        <div>
          <Button
            onClick={() => {
              router.push(`/validate`)
            }}
            size="small"
            type="button"
            inline
          >
            <FiCheck size={20} />
            <span>Validar Certificado</span>
          </Button>
          <Button
            onClick={() => {
              router.push(`/participants/login`)
            }}
            size="small"
            type="button"
            inline
          >
            <FiSearch size={20} />
            <span>Encontrar Certificados</span>
          </Button>
        </div>
      </TopButton>
      {forgotPassword ? (
        <FormForgotPassword setForgotPassword={setForgotPassword} />
      ) : (
        <FormLogin setForgotPassword={setForgotPassword} />
      )}
    </Container>
  )
}

export default withoutAuth(Login)
