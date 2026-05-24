import { ToastMessage, useToast } from '@providers'
import { useEffect } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi'

import { Container } from './styles'

const icons = {
  info: FiInfo,
  warning: FiAlertCircle,
  error: FiXCircle,
  success: FiCheckCircle
}

interface Props {
  message: ToastMessage
  style: object
}

export const Toast: React.FC<Props> = ({ message, style }) => {
  const { removeToast } = useToast()
  const Icon = icons[message.type || 'info']

  useEffect(() => {
    if (message.fixed) return undefined

    const timer = setTimeout(() => {
      removeToast(message.id)
    }, 25000)

    return () => {
      clearTimeout(timer)
    }
  }, [message.fixed, message.id, removeToast])

  return (
    <Container type={message.type} style={style}>
      <Icon size={24} />

      <div>
        <strong>{message.title}</strong>
        {message.description && <p>{message.description}</p>}
      </div>

      <button onClick={() => removeToast(message.id)} type="button">
        <FiXCircle size={20} />
      </button>
    </Container>
  )
}
