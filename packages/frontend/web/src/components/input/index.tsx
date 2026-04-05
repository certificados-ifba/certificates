import { useField } from '@unform/core'
import { formatCpf, formatDob, formatPhone } from '@utils'
import {
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

  const [inputState, setInputState] = useState<'isFilled' | 'isFocused' | ''>(
    ''
  )
  const [isShowPass, setIsShowPass] = useState(false)

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const { fieldName, defaultValue, registerField, error } = useField(name)

  useEffect(() => {
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
  }, [fieldName, registerField])

  const handleInputFocus = useCallback(() => {
    setInputState('isFocused')
  }, [])

  const handleShowPass = useCallback(() => {
    setIsShowPass(!isShowPass)
  }, [isShowPass])

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
          ) : (
            <input {...(props as InputProps)} />
          )}
          {secure && (
            <SecureToggle onClick={handleShowPass}>
              {isShowPass ? <FiEye size={20} /> : <FiEyeOff size={20} />}
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
