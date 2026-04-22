import { Alert, Button, Card, Help, Input, Row } from '@components'
import { useToast } from '@providers'
import { api } from '@services'
import { FormHandles } from '@unform/core'
import { getValidationErrors, isValidEmail } from '@utils'
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import { FiArrowLeft, FiMail, FiSend } from 'react-icons/fi'
import * as Yup from 'yup'

import { FormArea, FormContainer } from './styles'

interface Props {
  setForgotPassword: Dispatch<SetStateAction<boolean>>
}

export const FormForgotPassword: React.FC<Props> = ({ setForgotPassword }) => {
  const { addToast } = useToast()
  const formRef = useRef<FormHandles>(null)
  const handleForgotPassword = useCallback(
    async data => {
      try {
        setLoading(true)
        formRef.current?.setErrors({})
        const schema = Yup.object().shape({
          email: Yup.string()
            .required('Por favor, digite o seu e-mail')
            .test('email-is-valid', 'Por favor, digite um e-mail válido', isValidEmail)
        })

        await schema.validate(data, {
          abortEarly: false
        })

        await api.post('/password/forgot', data)

        addToast({
          type: 'success',
          title: 'E-mail de recuperação enviado',
          description: 'Verifique sua caixa de entrada para recuperar a senha.'
        })
        setForgotPassword(false)
        setLoading(false)
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
          title: 'Erro na solicitação',
          description: err
        })
      }
    },
    [addToast, setForgotPassword]
  )
  const [loading, setLoading] = useState(false)
  return (
    <FormArea ref={formRef} onSubmit={handleForgotPassword}>
      <Card>
        <header>
          <Button
            onClick={() => {
              setForgotPassword(false)
            }}
            color="dark"
            type="button"
            size="small"
            ghost
            square
            inline
            style={{ margin: 0 }}
          >
            <FiArrowLeft size={20} />
          </Button>
          <h2 style={{ marginRight: 38 }}>Redefinir sua senha</h2>
        </header>
        <FormContainer>
          <Alert marginBottom="sm">
            Esqueceu sua senha? <b>Não se preocupe.</b>
          </Alert>
          <Alert marginBottom="md">
            É só nos dizer seu e-mail que enviaremos um link para você cadastrar
            uma <b>nova senha</b>.
          </Alert>
          <Input
            label="E-mail"
            name="email"
            icon={FiMail}
            placeholder="email@exemplo.com"
            autoComplete="username"
            marginBottom="md"
            disabled={loading}
          />
          <Row>
            <Button size="big" loading={loading} color="primary" type="submit">
              <FiSend size={20} /> <span>Enviar e-mail</span>
            </Button>
          </Row>
          <Help />
        </FormContainer>
      </Card>
    </FormArea>
  )
}
