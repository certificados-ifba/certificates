import { IconBaseProps } from 'react-icons'

import { Field } from '../filterInput/styles'

interface Option {
  label: string
  value: string
}

interface Props {
  name: string
  label?: string
  icon?: React.ComponentType<IconBaseProps>
  value?: string | string[]
  options: Option[]
  multiple?: boolean
  onChangeValue: (name: string, value: string | string[]) => void
}

export const FilterSelect: React.FC<Props> = ({
  name,
  label,
  icon: Icon,
  value = '',
  options,
  multiple = false,
  onChangeValue
}) => {
  return (
    <Field htmlFor={name}>
      {label && <span>{label}</span>}
      <div data-multiple={multiple}>
        {Icon && <Icon size={18} />}
        <select
          id={name}
          name={name}
          multiple={multiple}
          value={value}
          onChange={event => {
            if (multiple) {
              const selectedValues = Array.from(
                event.target.selectedOptions
              ).map(option => option.value)
              onChangeValue(name, selectedValues)
              return
            }

            onChangeValue(name, event.target.value)
          }}
        >
          {!multiple && <option value="">Todos</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  )
}
