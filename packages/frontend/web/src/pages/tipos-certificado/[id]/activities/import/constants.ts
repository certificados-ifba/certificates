import { IDataSheet, formatDate } from '@utils'

export const data = (
  types: string,
  startDate: Date,
  endDate: Date
): IDataSheet[] => [
  {
    column: {
      header: 'Nome da atividade',
      key: 'name',
      width: 40
    },
    validation: {
      type: 'textLength',
      formulae: [1],
      operator: 'greaterThanOrEqual',
      error: 'Valor não pode ser vazio',
      prompt: 'Insira o Nome da atividade'
    }
  },
  {
    column: {
      key: 'workload',
      header: 'Carga Horária (Horas)',
      width: 24,
      style: { numFmt: '0' }
    },
    validation: {
      type: 'decimal',
      formulae: [1, 100],
      operator: 'between',
      error: 'Valor precisa estar entre 1 e 100',
      prompt: 'Insira o Carga Horária da atividade'
    }
  },
  {
    column: {
      header: 'Tipo',
      key: 'remove',
      width: 60
    },
    validation: {
      type: 'list',
      formulae: [types],
      error: 'Valor precisa ser algum da lista',
      prompt: 'Insira o Tipo da atividade'
    }
  },
  {
    column: {
      header: 'Id Tipo',
      key: 'type',
      width: 30,
      hidden: true
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
      prompt: 'Insira a Data de início da atividade'
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
      prompt: 'Insira a Data de encerramento da atividade'
    }
  }
]

export const examples = [
  ['Teste', '10', 'minicurso', '21/03/2025', '22/03/2025'],
  ['Teste 2', '2', 'oficina', '23/03/2025', '24/03/2025']
]
