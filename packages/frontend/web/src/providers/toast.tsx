import { ToastContainer } from '@components'
import { createContext, useCallback, useContext, useState } from 'react'
import { v4 as uuid } from 'uuid'

export interface ToastMessage {
  id: string
  type?: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  fixed?: boolean
}

export interface ToastContextData {
  addToast(message: Omit<ToastMessage, 'id'>): void
  removeToast(id: string): void
}

export const ToastContext = createContext<ToastContextData>(
  {} as ToastContextData
)

export const ToastProvider: React.FC = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    ({ type, title, description, fixed }: Omit<ToastMessage, 'id'>) => {
      const id = uuid()

      const toast = {
        id,
        type,
        title,
        description,
        fixed
      }

      setMessages(oldMessages => {
        if (!fixed) return [...oldMessages, toast]

        const fixedMessages = [toast, ...oldMessages.filter(message => message.fixed)].slice(0, 3)
        const temporaryMessages = oldMessages.filter(message => !message.fixed)

        return [...fixedMessages, ...temporaryMessages]
      })
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setMessages(oldMessages => oldMessages.filter(message => message.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer messages={messages} />
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
