import { useEffect, useRef, useState } from 'react'
import { IconBaseProps } from 'react-icons'

import { Field } from './styles'

interface Props extends Omit<JSX.IntrinsicElements['input'], 'onChange'> {
  name: string
  label?: string
  icon?: React.ComponentType<IconBaseProps>
  value?: string | number
  onChangeValue: (name: string, value: string) => void
  onDebouncedChange?: (name: string, value: string) => void
  debounceTime?: number
}

export const FilterInput: React.FC<Props> = ({
  name,
  label,
  icon: Icon,
  value,
  onChangeValue,
  onDebouncedChange,
  debounceTime = 500,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value || '')
  const firstRender = useRef(true)

  useEffect(() => {
    setInternalValue(value || '')
  }, [value])

  useEffect(() => {
    if (!onDebouncedChange) return
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const timeout = setTimeout(() => {
      onDebouncedChange(name, String(internalValue || ''))
    }, debounceTime)

    return () => clearTimeout(timeout)
  }, [debounceTime, internalValue, name, onDebouncedChange])

  return (
    <Field htmlFor={name}>
      {label && <span>{label}</span>}
      <div>
        {Icon && <Icon size={18} />}
        <input
          {...rest}
          id={name}
          name={name}
          value={internalValue}
          onChange={event => {
            const nextValue = event.target.value
            setInternalValue(nextValue)
            onChangeValue(name, nextValue)
          }}
        />
      </div>
    </Field>
  )
}
