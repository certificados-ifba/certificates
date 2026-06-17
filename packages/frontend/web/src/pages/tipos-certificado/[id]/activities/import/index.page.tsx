import { Container, Header, Import, Loading } from '@components'
import { ITipoCertificado, IGeneric } from '@dtos'
import { withAuth } from '@hocs'
import { useToast } from '@providers'
import { api } from '@services'
import { capitalize, getActivitySchema } from '@utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiFilePlus } from 'react-icons/fi'

import { data as dataSheet, examples } from './constants'

const ImportActivities: React.FC = () => {
  const [event, setEvent] = useState<ITipoCertificado>(null)
  const [rows, setRows] = useState<string[][]>([])
  const [typesString, setTypesString] = useState('')
  const { query } = useRouter()
  const { addToast } = useToast()
  const { id } = query

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: dataEvent } = await api.get<{ data: ITipoCertificado }>(
          `tipos-certificado/${id}`
        )

        const event = dataEvent?.data

        if (event) {
          setEvent(event)
        }
        const { data: dataTypes } = await api.get<{ data: IGeneric[] }>(
          '/activity_types',
          {
            params: { sort_by: 'name', order_by: 'ASC' }
          }
        )

        let typesString = ''
        const types: string[][] = []

        dataTypes?.data?.forEach(({ id, name }) => {
          typesString += `${typesString ? ',' : ''}${capitalize(name)}`
          types.push([capitalize(name), id])
        })
        setRows(types)
        setTypesString(typesString)
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
        <title>Atividades | Certificados</title>
      </Head>
      <Header
        title="Importar Atividades"
        subtitle="Envie uma planilha para realizar o cadastro das atividades"
        icon={FiFilePlus}
      />
      {event ? (
        <Import
          url={`tipos-certificado/${id}/activities`}
          filename="importar-atividades"
          schema={getActivitySchema(event.start_date, event.end_date)}
          dataSheet={dataSheet(
            `"${typesString}"`,
            new Date(event.start_date),
            new Date(event.end_date)
          )}
          examples={examples}
          worksheets={[{ name: 'Tipos de Atividade', rows }]}
          formulas={[
            {
              range: 'D3:D100',
              formula: `IFERROR(VLOOKUP(C3,'Tipos de Atividade'!$A:$B,2,0),"")`
            }
          ]}
        />
      ) : (
        <Loading />
      )}
    </Container>
  )
}

export default withAuth(ImportActivities)
