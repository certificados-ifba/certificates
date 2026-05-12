import {
    Button,
    FooterModal,
    HeaderModal,
    Input,
    MainModal,
    Modal,
    ScrollWrapper
} from '@components'
import { useAuth, useToast } from '@providers'
import { api } from '@services'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'
import { getValidationErrors } from '@utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiCheck, FiKey, FiLock, FiMail, FiUser, FiX } from 'react-icons/fi'
import * as Yup from 'yup'

interface Props {
    openModal: boolean
    onClose: () => void
}

export const ProfileModal: React.FC<Props> = ({ openModal, onClose }) => {
    const { user } = useAuth()
    const { addToast } = useToast()
    const formRef = useRef<FormHandles>(null)
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)

    const isAdmin = user?.role === 'ADMIN'

    useEffect(() => {
        if (openModal) {
            setOldPasswordVerified(false)
            setIsVerifying(false)
            formRef.current?.reset()
            formRef.current?.setErrors({})
            if (isAdmin) {
                formRef.current?.setData({ name: user?.name, email: user?.email })
            }
        }
    }, [openModal, user, isAdmin])

    const handleClose = useCallback(() => {
        formRef.current?.reset()
        formRef.current?.setErrors({})
        setOldPasswordVerified(false)
        onClose()
    }, [onClose])

    const handleVerifyPassword = useCallback(async () => {
        const old_password = (formRef.current?.getData() as any)?.old_password
        if (!old_password) {
            formRef.current?.setErrors({ old_password: 'Informe a senha atual' })
            return
        }
        setIsVerifying(true)
        try {
            await api.post(`/users/${user?.id}/verify-password`, {
                password: old_password
            })
            setOldPasswordVerified(true)
            formRef.current?.setErrors({})
        } catch (err) {
            formRef.current?.setErrors({
                old_password:
                    err?.response?.data?.message || 'Senha incorreta'
            })
        } finally {
            setIsVerifying(false)
        }
    }, [user])

    const handleSubmit = useCallback(
        async data => {
            try {
                formRef.current?.setErrors({})

                const schemaShape: Record<string, Yup.AnySchema> = {}

                if (isAdmin) {
                    schemaShape.name = Yup.string().required(
                        'O nome é obrigatório'
                    )
                    schemaShape.email = Yup.string()
                        .email('Digite um e-mail válido')
                        .required('O e-mail é obrigatório')
                }

                if (!isAdmin || oldPasswordVerified) {
                    schemaShape.password = Yup.string().required(
                        'A nova senha é obrigatória'
                    )
                    schemaShape.password_confirmation = Yup.string()
                        .required('Confirme a nova senha')
                        .oneOf([Yup.ref('password')], 'As senhas não conferem')
                }

                const schema = Yup.object().shape(schemaShape)

                await schema.validate(data, { abortEarly: false })

                const payload: Record<string, string> = {}

                if (isAdmin) {
                    payload.name = data.name
                    payload.email = data.email
                }

                if (oldPasswordVerified && data.password) {
                    payload.password = data.password
                }

                await api.put(`/users/${user?.id}`, payload)

                addToast({
                    type: 'success',
                    title: 'Perfil atualizado',
                    description: 'Suas informações foram atualizadas com sucesso.'
                })

                handleClose()
            } catch (err) {
                if (err instanceof Yup.ValidationError) {
                    formRef.current?.setErrors(getValidationErrors(err))
                    return
                }
                addToast({
                    type: 'error',
                    title: 'Erro ao atualizar perfil',
                    description: err?.response?.data?.message || 'Tente novamente.'
                })
            }
        },
        [user, isAdmin, addToast, handleClose]
    )

    return (
        <Modal open={openModal} onClose={handleClose}>
            <HeaderModal>
                <h2>
                    <FiUser size={20} />
                    <span>Editar Perfil</span>
                </h2>
            </HeaderModal>
            <Form
                ref={formRef}
                onSubmit={handleSubmit}
                initialData={
                    isAdmin ? { name: user?.name, email: user?.email } : {}
                }
            >
                <ScrollWrapper>
                    <MainModal>
                        {isAdmin && (
                            <>
                                <Input
                                    marginBottom="sm"
                                    name="name"
                                    label="Nome"
                                    placeholder="Seu nome"
                                    icon={FiUser}
                                />
                                <Input
                                    marginBottom="sm"
                                    name="email"
                                    label="E-mail"
                                    placeholder="Seu e-mail"
                                    icon={FiMail}
                                />
                            </>
                        )}
                        <Input
                            marginBottom="sm"
                            name="old_password"
                            label="Senha Atual"
                            placeholder="Informe sua senha atual"
                            type="password"
                            icon={FiKey}
                            disabled={oldPasswordVerified}
                        />
                        <Button
                            type="button"
                            color="secondary"
                            outline
                            onClick={handleVerifyPassword}
                            disabled={oldPasswordVerified || isVerifying}
                        >
                            <FiKey size={20} />
                            <span>
                                {oldPasswordVerified
                                    ? 'Senha confirmada'
                                    : isVerifying
                                        ? 'Verificando...'
                                        : 'Verificar senha atual'}
                            </span>
                        </Button>
                        {oldPasswordVerified && (
                            <>
                                <Input
                                    marginBottom="sm"
                                    name="password"
                                    label="Nova Senha"
                                    placeholder="Digite a nova senha"
                                    type="password"
                                    icon={FiLock}
                                />
                                <Input
                                    marginBottom="sm"
                                    name="password_confirmation"
                                    label="Confirmar Nova Senha"
                                    placeholder="Repita a nova senha"
                                    type="password"
                                    icon={FiLock}
                                />
                            </>
                        )}
                    </MainModal>
                </ScrollWrapper>
                <FooterModal inline>
                    <Button
                        onClick={handleClose}
                        color="secondary"
                        type="button"
                        outline
                    >
                        <FiX size={20} />
                        <span>Cancelar</span>
                    </Button>
                    <Button
                        color="primary"
                        type="submit"
                        disabled={!isAdmin && !oldPasswordVerified}
                    >
                        <FiCheck size={20} />
                        <span>Salvar</span>
                    </Button>
                </FooterModal>
            </Form>
        </Modal>
    )
}
