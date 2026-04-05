import { useField } from '@unform/core'
import { formatCpf, formatDob, formatPhone } from '@utils'
import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { IconBaseProps } from 'react-icons'
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'

import { Container, Error, Label, SecureToggle } from './styles'

interface BaseProps<Multiline = false>
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  note?: string
  name: string
  mask?: any
  type?: any
  icon?: React.ComponentType<IconBaseProps>
  multiline?: Multiline
  marginBottom?: 'sm' | 'md' | 'lg' | 'xs'
}

type InputProps = JSX.IntrinsicElements['input'] & BaseProps<false>
type TextAreaProps = JSX.IntrinsicElements['textarea'] & BaseProps<true>

type Props = InputProps | TextAreaProps

export const Input: React.FC<Props> = ({
  label,
  note,
  name,
  mask,
  icon: Icon,
  multiline,
  marginBottom,
  ...rest
}) => {
  const { type, ...restAux } = rest

  const secure = type === 'password'
  const maskedEmail = type === 'email-masked'
  const maskedCpf = type === 'cpf-masked'

  const [inputState, setInputState] = useState<'isFilled' | 'isFocused' | ''>(
    ''
  )
  const [isShowPass, setIsShowPass] = useState(false)
  const [isShowEmail, setIsShowEmail] = useState(false)
  const [isCpfShown, setIsCpfShown] = useState(false)

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const emailRealRef = useRef('')
  const isShowEmailRef = useRef(false)
  const cpfRealRef = useRef('')
  const isCpfShownRef = useRef(false)

  useEffect(() => { isShowEmailRef.current = isShowEmail }, [isShowEmail])
  useEffect(() => { isCpfShownRef.current = isCpfShown }, [isCpfShown])

  const maskEmail = useCallback((value: string): string => {
    if (!value) return ''
    const atIndex = value.indexOf('@')
    const local = atIndex >= 0 ? value.slice(0, atIndex) : value
    const domain = atIndex >= 0 ? value.slice(atIndex) : ''
    if (local.length <= 2) return value
    return local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] + domain
  }, [])

  // CPF format: "123.456.789-10" → "123.***.***-10" (positions 4-6 and 8-10 masked)
  const maskCpf = useCallback((value: string): string => {
    if (!value) return ''
    return value.split('').map((c, i) => ((i >= 4 && i <= 6) || (i >= 8 && i <= 10)) ? '*' : c).join('')
  }, [])

  // Map formatted CPF cursor position → raw digit index
  const fmtToRaw = useCallback((p: number) =>
    p - (p > 3 ? 1 : 0) - (p > 7 ? 1 : 0) - (p > 11 ? 1 : 0), [])

  // Map raw digit index → formatted CPF cursor position
  const rawToFmt = useCallback((r: number) =>
    r + (r >= 3 ? 1 : 0) + (r >= 6 ? 1 : 0) + (r >= 9 ? 1 : 0), [])

  const { fieldName, defaultValue, registerField, error } = useField(name)

  useEffect(() => {
    if (maskedEmail) {
      registerField<string>({
        name: fieldName,
        ref: inputRef.current,
        getValue: () => emailRealRef.current,
        setValue: (_ref, value) => {
          emailRealRef.current = value || ''
          if (inputRef.current)
            inputRef.current.value = isShowEmailRef.current ? (value || '') : maskEmail(value || '')
          setInputState(value ? 'isFilled' : '')
        },
        clearValue: () => {
          emailRealRef.current = ''
          if (inputRef.current) inputRef.current.value = ''
          setInputState('')
        }
      })
    } else if (maskedCpf) {
      registerField<string>({
        name: fieldName,
        ref: inputRef.current,
        getValue: () => cpfRealRef.current,
        setValue: (_ref, value) => {
          cpfRealRef.current = value || ''
          if (inputRef.current)
            inputRef.current.value = isCpfShownRef.current ? (value || '') : maskCpf(value || '')
          setInputState(value ? 'isFilled' : '')
        },
        clearValue: () => {
          cpfRealRef.current = ''
          if (inputRef.current) inputRef.current.value = ''
          setInputState('')
        }
      })
    } else {
      registerField<string>({
        name: fieldName,
        ref: inputRef.current,
        path: 'value',
        setValue(ref: any, value) {
          ref.value = value || ''
          setInputState(value ? 'isFilled' : '')
        },
        clearValue: ref => {
          ref.value = ''
          setInputState('')
        }
      })
    }
  }, [fieldName, registerField, maskedEmail, maskEmail, maskedCpf, maskCpf])

  const handleInputFocus = useCallback(() => {
    setInputState('isFocused')
  }, [])

  const handleShowPass = useCallback(() => {
    setIsShowPass(prev => !prev)
  }, [])

  const handleToggleShowEmail = useCallback(() => {
    setIsShowEmail(prev => {
      const next = !prev
      isShowEmailRef.current = next
      if (inputRef.current) {
        const el = inputRef.current as HTMLInputElement
        const cursor = el.selectionStart ?? emailRealRef.current.length
        el.value = next ? emailRealRef.current : maskEmail(emailRealRef.current)
        requestAnimationFrame(() => {
          const pos = Math.min(cursor, el.value.length)
          el.setSelectionRange(pos, pos)
        })
      }
      return next
    })
  }, [maskEmail])

  const handleToggleShowCpf = useCallback(() => {
    setIsCpfShown(prev => {
      const next = !prev
      isCpfShownRef.current = next
      if (inputRef.current) {
        const el = inputRef.current as HTMLInputElement
        el.value = next ? cpfRealRef.current : maskCpf(cpfRealRef.current)
      }
      return next
    })
  }, [maskCpf])

  const handleCpfKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return
      if (e.ctrlKey || e.metaKey) return
      e.preventDefault()
      const input = e.currentTarget
      const fmtPos = input.selectionStart ?? 0
      const fmtPosEnd = input.selectionEnd ?? fmtPos
      let rawDigits = cpfRealRef.current.replace(/\D/g, '')
      let rawPos = fmtToRaw(fmtPos)
      let rawPosEnd = fmtToRaw(fmtPosEnd)
      let newCursorRaw = rawPos
      if (e.key === 'Backspace') {
        if (rawPos !== rawPosEnd) {
          rawDigits = rawDigits.slice(0, rawPos) + rawDigits.slice(rawPosEnd)
          newCursorRaw = rawPos
        } else if (rawPos > 0) {
          rawDigits = rawDigits.slice(0, rawPos - 1) + rawDigits.slice(rawPos)
          newCursorRaw = rawPos - 1
        }
      } else if (e.key === 'Delete') {
        if (rawPos !== rawPosEnd) {
          rawDigits = rawDigits.slice(0, rawPos) + rawDigits.slice(rawPosEnd)
          newCursorRaw = rawPos
        } else if (rawPos < rawDigits.length) {
          rawDigits = rawDigits.slice(0, rawPos) + rawDigits.slice(rawPos + 1)
          newCursorRaw = rawPos
        }
      } else if (/^\d$/.test(e.key)) {
        if (rawDigits.length >= 11 && rawPos === rawPosEnd) return
        rawDigits = (rawDigits.slice(0, rawPos) + e.key + rawDigits.slice(rawPosEnd)).slice(0, 11)
        newCursorRaw = rawPos + 1
      } else { return }
      const newFormatted = formatCpf(rawDigits)
      cpfRealRef.current = newFormatted
      input.value = isCpfShownRef.current ? newFormatted : maskCpf(newFormatted)
      setInputState(rawDigits ? 'isFilled' : '')
      const newFmtCursor = rawToFmt(Math.min(newCursorRaw, newFormatted.replace(/\D/g, '').length))
      requestAnimationFrame(() => { input.setSelectionRange(newFmtCursor, newFmtCursor) })
    },
    [maskCpf, fmtToRaw, rawToFmt]
  )

  const handleCpfPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const digits = e.clipboardData.getData('text').replace(/\D/g, '')
      const input = e.currentTarget
      const rawPos = fmtToRaw(input.selectionStart ?? 0)
      const rawPosEnd = fmtToRaw(input.selectionEnd ?? rawPos)
      const rawDigits = cpfRealRef.current.replace(/\D/g, '')
      const newRaw = (rawDigits.slice(0, rawPos) + digits + rawDigits.slice(rawPosEnd)).slice(0, 11)
      const newFormatted = formatCpf(newRaw)
      cpfRealRef.current = newFormatted
      input.value = isCpfShownRef.current ? newFormatted : maskCpf(newFormatted)
      setInputState(newRaw ? 'isFilled' : '')
      const newFmtCursor = rawToFmt(Math.min(rawPos + digits.length, newRaw.length))
      requestAnimationFrame(() => { input.setSelectionRange(newFmtCursor, newFmtCursor) })
    },
    [maskCpf, fmtToRaw, rawToFmt]
  )

  const handleEmailKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return
      if (e.ctrlKey || e.metaKey) return
      e.preventDefault()
      const input = e.currentTarget
      const selStart = input.selectionStart ?? 0
      const selEnd = input.selectionEnd ?? 0
      let newReal = emailRealRef.current
      let newCursor = selStart
      if (e.key === 'Backspace') {
        if (selStart !== selEnd) { newReal = newReal.slice(0, selStart) + newReal.slice(selEnd); newCursor = selStart }
        else if (selStart > 0) { newReal = newReal.slice(0, selStart - 1) + newReal.slice(selStart); newCursor = selStart - 1 }
      } else if (e.key === 'Delete') {
        if (selStart !== selEnd) { newReal = newReal.slice(0, selStart) + newReal.slice(selEnd); newCursor = selStart }
        else if (selStart < newReal.length) { newReal = newReal.slice(0, selStart) + newReal.slice(selStart + 1); newCursor = selStart }
      } else if (e.key.length === 1) {
        newReal = newReal.slice(0, selStart) + e.key + newReal.slice(selEnd)
        newCursor = selStart + 1
      } else { return }
      emailRealRef.current = newReal
      input.value = isShowEmailRef.current ? newReal : maskEmail(newReal)
      setInputState(newReal ? 'isFilled' : '')
      requestAnimationFrame(() => { input.setSelectionRange(newCursor, newCursor) })
    },
    [maskEmail]
  )

  const handleEmailPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasteText = e.clipboardData.getData('text')
      const input = e.currentTarget
      const selStart = input.selectionStart ?? 0
      const selEnd = input.selectionEnd ?? 0
      const newReal = emailRealRef.current.slice(0, selStart) + pasteText + emailRealRef.current.slice(selEnd)
      emailRealRef.current = newReal
      input.value = isShowEmailRef.current ? newReal : maskEmail(newReal)
      const newCursor = selStart + pasteText.length
      setInputState(newReal ? 'isFilled' : '')
      requestAnimationFrame(() => { input.setSelectionRange(newCursor, newCursor) })
    },
    [maskEmail]
  )

  const handleInputBlur = useCallback(() => {
    setInputState(inputRef.current?.value ? 'isFilled' : '')
  }, [])

  const handleKeyup = useCallback(() => {
    if (inputRef.current.value)
      if (type === 'cpf') {
        inputRef.current.value = formatCpf(inputRef.current.value)
      } else if (type === 'phone') {
        inputRef.current.value = formatPhone(inputRef.current.value)
      } else if (type === 'dob') {
        inputRef.current.value = formatDob(inputRef.current.value)
      }
  }, [type])

  const handleOnChange = useCallback(() => {
    if (inputState !== 'isFocused') {
      setInputState(inputRef.current?.value ? 'isFilled' : '')
    }
  }, [inputState])

  const cpfMaskedProps: any = {
    ...restAux,
    onFocus: handleInputFocus,
    onBlur: handleInputBlur,
    onKeyDown: handleCpfKeyDown,
    onPaste: handleCpfPaste,
    ref: inputRef,
    id: fieldName,
    'aria-label': fieldName,
    type: 'text',
    autoComplete: 'off',
    inputMode: 'numeric',
    size: 1,
    defaultValue: ''
  }

  const emailProps: any = {
    ...restAux,
    onFocus: handleInputFocus,
    onBlur: handleInputBlur,
    onKeyDown: handleEmailKeyDown,
    onPaste: handleEmailPaste,
    ref: inputRef,
    id: fieldName,
    'aria-label': fieldName,
    type: 'text',
    autoComplete: 'off',
    size: 1,
    defaultValue: ''
  }

  const props: any = {
    ...restAux,
    onFocus: handleInputFocus,
    onBlur: handleInputBlur,
    onKeyUp: handleKeyup,
    onChange: handleOnChange,
    ref: inputRef,
    id: fieldName,
    'aria-label': fieldName,
    type: isShowPass ? 'text' : (type === 'dob' || type === 'cpf' || type === 'phone') ? 'text' : type,
    size: 1,
    defaultValue
  }

  return (
    <div>
      {label && !restAux.hidden && <Label htmlFor={fieldName}>{label}</Label>}
      <Container
        hidden={restAux.hidden}
        marginBottom={marginBottom}
        isErrored={!!error}
        isFilled={inputState === 'isFilled'}
        isFocused={inputState === 'isFocused'}
        isDisabled={!!props?.disabled}
      >
        <fieldset>
          <div>{Icon && <Icon size={20} />}</div>
          {multiline ? (
            <textarea {...(props as TextAreaProps)} />
          ) : maskedEmail ? (
            <input {...emailProps} />
          ) : maskedCpf ? (
            <input {...cpfMaskedProps} />
          ) : (
            <input {...(props as InputProps)} />
          )}
          {secure && (
            <SecureToggle onClick={handleShowPass}>
              {isShowPass ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </SecureToggle>
          )}
          {maskedEmail && (
            <SecureToggle onClick={handleToggleShowEmail}>
              {isShowEmail ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </SecureToggle>
          )}
          {maskedCpf && (
            <SecureToggle onClick={handleToggleShowCpf}>
              {isCpfShown ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </SecureToggle>
          )}
        </fieldset>
        {error && !restAux.hidden && (
          <Error>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </Error>
        )}
      </Container>
    </div>
  )
}
