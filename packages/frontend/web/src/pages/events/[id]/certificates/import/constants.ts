import { IDataSheet, formatDate } from '@utils'

export const data = (
  activitiesString: string,
  functionsString: string,
  participantsString: string,
  startDate: Date,
  endDate: Date
): IDataSheet[] => [
  {
    column: {
      key: 'cpf',
      header: 'CPF',
      width: 20
    }
  },
  {
    column: {
      header: 'Nome Completo',
      key: 'participant_name',
      width: 40
    }
  },
  {
    column: {
      header: 'Atividade',
      key: 'activity_remove',
      width: 60
    },
    validation: {
      type: 'list',
      formulae: [activitiesString],
      error: 'Valor precisa ser algum da lista',
      prompt: 'Insira a Atividade'
    }
  },
  {
    column: {
      header: 'Id Atividade',
      key: 'activity',
      width: 30,
      hidden: true
    }
  },
  {
    column: {
      header: 'Função',
      key: 'function_remove',
      width: 60
    },
    validation: {
      type: 'list',
      formulae: [functionsString],
      error: 'Valor precisa ser algum da lista',
      prompt: 'Insira a Função'
    }
  },
  {
    column: {
      header: 'Id Função',
      key: 'function',
      width: 30,
      hidden: true
    }
  },
  {
    column: {
      key: 'workload',
      header: 'Carga Horária (Horas)',
      width: 24,
      style: { numFmt: '0' }
    }
  },
  {
    column: {
      header: 'Data Inicial',
      key: 'start_date',
      width: 20,
      style: { numFmt: 'dd/mm/yyyy' }
    },
    validation: {
      type: 'date',
      formulae: [startDate, endDate],
      operator: 'between',
      error: `A data inicial deve estar entre ${formatDate(
        startDate
      )} e ${formatDate(endDate)}`,
      prompt: 'Insira a Data de início'
    }
  },
  {
    column: {
      header: 'Data Final',
      key: 'end_date',
      width: 20,
      style: { numFmt: 'dd/mm/yyyy' }
    },
    validation: {
      type: 'date',
      formulae: [startDate, endDate],
      operator: 'between',
      error: `A data final deve estar entre ${formatDate(
        startDate
      )} e ${formatDate(endDate)} e ser maior ou igual à data inicial`,
      prompt: 'Insira a Data de encerramento'
    }
  },
  {
    column: {
      header: 'Ordem de Autoria (Opcional)',
      key: 'authorship_order',
      width: 20
    },
    validation: {
      type: 'textLength',
      formulae: [0],
      operator: 'greaterThanOrEqual',
      allowBlank: true,
      error: 'Valor pode ser vazio ou texto',
      prompt: 'Insira a Ordem de Autoria (opcional)'
    }
  },
  {
    column: {
      header: 'Campo Adicional (Opcional)',
      key: 'additional_field',
      width: 30
    },
    validation: {
      type: 'textLength',
      formulae: [0],
      operator: 'greaterThanOrEqual',
      allowBlank: true,
      error: 'Valor pode ser vazio ou texto',
      prompt: 'Insira um Campo Adicional (opcional)'
    }
  }
]

export const examples = [
  [
    '000.000.000-00',
    'João da Silva',
    'Palestra de Abertura',
    'Palestrante',
    '2',
    '21/03/2025',
    '21/03/2025',
    '',
    ''
  ],
  [
    '111.111.111-11',
    'Maria Oliveira',
    'Workshop de Programação',
    'Participante',
    '8',
    '22/03/2025',
    '23/03/2025',
    '1',
    'Primeiro autor'
  ]
]
