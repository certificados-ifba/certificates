import { Button, Card, LogoArea } from '@components'
import { api } from '@services'
import { theme } from '@styles'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiCheck, FiLoader, FiXCircle } from 'react-icons/fi'

import { Container, FormArea } from './styles'

const ParticipantConfirm: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const { query, replace } = useRouter()
    const { token } = query

    useEffect(() => {
        if (!token) return

        async function confirm() {
            try {
                await api.get(`participants/confirm/${token}`)
                setStatus('success')
                setTimeout(() => replace('/participants/login'), 4000)
            } catch {
                setStatus('error')
            }
        }

        confirm()
    }, [token, replace])

    return (
        <Container>
            <Head>
                <title>Confirmação de E-mail</title>
            </Head>
            <FormArea>
                <LogoArea />
                <Card>
                    {status === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FiLoader size={40} color={theme.colors.primary} style={{ marginBottom: 16 }} />
                            <p>Confirmando seu e-mail...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FiCheck size={56} color={theme.colors.primary} style={{ marginBottom: 16 }} />
                            <h2 style={{ color: theme.colors.primary }}>E-mail confirmado!</h2>
                            <p style={{ marginTop: 12, color: theme.colors.secondary }}>
                                Sua conta foi ativada com sucesso. Você será redirecionado para
                                o login em alguns segundos.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FiXCircle size={56} color={theme.colors.danger} style={{ marginBottom: 16 }} />
                            <h2>Link inválido ou expirado</h2>
                            <p style={{ marginTop: 12, color: theme.colors.secondary }}>
                                O link de confirmação não é válido ou já foi utilizado.
                            </p>
                            <Button
                                style={{ marginTop: 24 }}
                                onClick={() => replace('/participants/login')}
                            >
                                Ir para o login
                            </Button>
                        </div>
                    )}
                </Card>
            </FormArea>
        </Container>
    )
}

export default ParticipantConfirm
