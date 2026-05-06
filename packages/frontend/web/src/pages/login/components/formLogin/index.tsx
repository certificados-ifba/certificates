import { Button, Card, Help, Input, Row } from '@components'
import { useAuth, useToast } from '@providers'
import { FormHandles } from '@unform/core'
import { getValidationErrors, isValidEmail } from '@utils'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { FiLock, FiLogIn, FiMail } from 'react-icons/fi'
import * as Yup from 'yup'

import { FormArea, FormContainer } from './styles'

interface Props {
  setForgotPassword: Dispatch<SetStateAction<boolean>>
}

interface LoginFormData {
  login: string
  password: string
}

export const FormLogin: React.FC<Props> = ({ setForgotPassword }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const formRef = useRef<FormHandles>(null)
  const { addToast } = useToast()
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSingIn = useCallback(
    async (data: LoginFormData) => {
      try {
        setLoading(true)
        formRef.current?.setErrors({})

        const schema = Yup.object().shape({
          login: Yup.string()
            .required('Por favor, digite o seu login')
            .test('email-is-valid', 'Por favor, digite um e-mail válido', isValidEmail),
          password: Yup.string().required('Por favor, digite a sua senha')
        })

        await schema.validate(data, {
          abortEarly: false
        })

        await signIn({
          login: data.login,
          password: data.password
        })

        setLoading(false)
        router.push('/dashboard')
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
          title: 'Não foi possível entrar',
          description: err
        })
      }
    },
    [router, signIn, addToast]
  )

  return (
    <FormArea ref={formRef} onSubmit={handleSingIn}>
      <Card>
        <header>
          <h2>Faça o login para continuar</h2>
        </header>
        <FormContainer>
          <Input
            label="E-mail"
            name="login"
            icon={FiMail}
            type="email-masked"
            placeholder="Digite seu e-mail"
            autoComplete="username"
            marginBottom="sm"
            disabled={loading}
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            icon={FiLock}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            aria-describedby="password-constraints"
            marginBottom="md"
            disabled={loading}
          />
          <Row>
            <Button
              size="big"
              color="primary"
              type="submit"
              marginBottom="sm"
              loading={loading}
            >
              <FiLogIn size={20} />
              <span>Entrar</span>
            </Button>
          </Row>
          <Row>
            <Button
              onClick={() => {
                setForgotPassword(true)
              }}
              type="button"
              ghost
              link
            >
              Esqueci a minha senha
            </Button>
          </Row>
          <Help />
        </FormContainer>
      </Card>
    </FormArea>
  )
}
