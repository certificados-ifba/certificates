import { Container, Header, Import, Loading } from '@components'
import { IEvent, IActivity, IGeneric, IParticipant } from '@dtos'
import { withAuth } from '@hocs'
import { useToast } from '@providers'
import { api } from '@services'
import { capitalize, getCertificateSchema } from '@utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiFilePlus } from 'react-icons/fi'

import { data as dataSheet, examples } from './constants'

const ImportCertificates: React.FC = () => {
  const [event, setEvent] = useState<IEvent>(null)
  const [activitiesRows, setActivitiesRows] = useState<string[][]>([])
  const [functionsRows, setFunctionsRows] = useState<string[][]>([])
  const [participantsRows, setParticipantsRows] = useState<string[][]>([])
  const [activitiesString, setActivitiesString] = useState('')
  const [functionsString, setFunctionsString] = useState('')
  const [participantsString, setParticipantsString] = useState('')
  const { query } = useRouter()
  const { addToast } = useToast()
  const { id } = query

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: dataEvent } = await api.get<{ data: IEvent }>(
          `events/${id}`
        )

        const event = dataEvent?.data

        if (event) {
          setEvent(event)
        }
        const { data: dataActivities } = await api.get<{ data: IActivity[] }>(
          `events/${id}/activities`,
          {
            params: { sort_by: 'name', order_by: 'ASC' }
          }
        )

        let activitiesString = ''
        const activities: string[][] = []

        dataActivities?.data?.forEach(({ id, name }) => {
          activitiesString += `${activitiesString ? ',' : ''}${capitalize(
            name
          )}`
          activities.push([capitalize(name), id])
        })
        setActivitiesRows(activities)
        setActivitiesString(activitiesString)
        const { data: dataFunctions } = await api.get<{ data: IGeneric[] }>(
          '/functions',
          {
            params: { sort_by: 'name', order_by: 'ASC' }
          }
        )

        let functionsString = ''
        const functions: string[][] = []

        dataFunctions?.data?.forEach(({ id, name }) => {
          functionsString += `${functionsString ? ',' : ''}${capitalize(name)}`
          functions.push([capitalize(name), id])
        })
        setFunctionsRows(functions)
        setFunctionsString(functionsString)
      } catch (err) {
        addToast({
          title: 'Erro no carregamento',
          type: 'error',
          description: err
        })
        history.back()
      }
    }
    if (id) loadData()
  }, [id, addToast])

  return (
    <Container>
      <Head>
        <title>Certificados | Certificados</title>
      </Head>
      <Header
        title="Importar Certificados"
        subtitle="Envie uma planilha para realizar o cadastro das participações dos certificados"
        icon={FiFilePlus}
      />
      {event ? (
        <Import
          url={`events/${id}/certificates`}
          filename="importar-certificados"
          schema={getCertificateSchema(event.start_date, event.end_date)}
          dataSheet={dataSheet(
            `"${activitiesString}"`,
            `"${functionsString}"`,
            `"${participantsString}"`,
            new Date(event.start_date),
            new Date(event.end_date)
          )}
          examples={examples}
          worksheets={[
            { name: 'Atividades', rows: activitiesRows },
            { name: 'Funções', rows: functionsRows },
            { name: 'Participantes', rows: participantsRows }
          ]}
          formulas={[
            {
              range: 'D3:D100',
              formula: `IFERROR(VLOOKUP(C3,'Atividades'!$A:$B,2,0),"")`
            },
            {
              range: 'F3:F100',
              formula: `IFERROR(VLOOKUP(E3,'Funções'!$A:$B,2,0),"")`
            }
          ]}
        />
      ) : (
        <Loading />
      )}
    </Container>
  )
}

export default withAuth(ImportCertificates)
