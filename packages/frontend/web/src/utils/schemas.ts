import { formatDate, inDateRange, isValidCpf, isValidEmail, minDate } from '@utils'
import * as Yup from 'yup'

export const getParticipantSchema = (): Yup.AnySchema =>
  Yup.object().shape({
    name: Yup.string().required('O usuário precisa ter um nome'),
    email: Yup.string().test('email-is-valid', 'Por favor, digite um e-mail válido', (v) => !v || isValidEmail(v)),
    cpf: Yup.string()
      .matches(
        /(\d{3}).(\d{3}).(\d{3})-(\d{2})/,
        'Por favor, digite um CPF válido.'
      )
      .test('cpf-is-valid', 'CPF precisa ser válido', isValidCpf)
      .required('Digite o CPF do participante'),
    dob: Yup.string().optional(),
    phone: Yup.string().matches(
      /(^$|\((\d{2})\) (\d{4}|\d{5})-(\d{4}))/,
      'Por favor, digite um telefone válido.'
    ),
    institution: Yup.string().required(
      'Selecione se o participante é da instituição.'
    )
  })

export const getActivitySchema = (
  event_start_date: string,
  event_end_date: string
): Yup.AnySchema =>
  Yup.object().shape({
    name: Yup.string().required('A atividade precisa ter um nome'),
    type: Yup.string().required(`Selecione um tipo da atividade`),
    workload: Yup.number()
      .typeError('Por favor, digite a carga horária')
      .positive('A carga horária precisa ser positiva')
      .required('Por favor, digite a carga horária'),
    start_date: Yup.string()
      .test(
        'in-date-range',
        `A atividade precisa ser entre os dias ${formatDate(
          event_start_date
        )} e ${formatDate(event_end_date)}`,
        (value: string) => inDateRange(value, event_start_date, event_end_date)
      )
      .required('Selecione a data de início'),
    end_date: Yup.string()
      .test(
        'in-date-range',
        `A atividade precisa ser entre os dias ${formatDate(
          event_start_date
        )} e ${formatDate(event_end_date)}`,
        (value: string) => inDateRange(value, event_start_date, event_end_date)
      )
      .test(
        'min-date',
        'A data final precisa ser maior que a data inicial',
        (value, context) => minDate(value, context.parent.start_date)
      )
      .required('Selecione a data do fim')
  })
