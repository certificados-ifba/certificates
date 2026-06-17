import { Container, Header, Tabs } from '@components'
import { withAuth } from '@hocs'
import Head from 'next/head'
import {
  FiSettings,
  FiBriefcase,
  FiFileText,
  FiAlignCenter,
  FiTag
} from 'react-icons/fi'

import { Generic, TextConfig } from './components'

const Settings: React.FC = () => {
  return (
    <Container>
      <Head>
        <title>Configurações | Certificados</title>
      </Head>
      <Header
        title="Configurações"
        subtitle="Defina as funções dos participantes, tipo de atividade de um evento e etc."
        icon={FiSettings}
      />
      <Tabs
        tabs={[
          {
            name: 'Funções',
            icon: FiBriefcase,
            children: (
              <Generic
                icon={FiBriefcase}
                name="Função"
                plural="Funções"
                url="/functions"
              />
            ),
            path: 'function'
          },
          {
            name: 'Tipo de Atividades',
            icon: FiFileText,
            children: (
              <Generic
                icon={FiFileText}
                name="Tipo de Atividade"
                plural="Tipo de Atividades"
                url="/activity_types"
              />
            ),
            path: 'activity-type'
          },
          {
            name: 'Texto Padrão',
            icon: FiAlignCenter,
            children: <TextConfig />,
            path: 'default-text'
          },
          {
            name: 'Tipos de Certificação',
            icon: FiTag,
            children: (
              <Generic
                icon={FiTag}
                name="Tipo de Certificação"
                plural="Tipos de Certificação"
                url="/certification_types"
                showIconPicker
              />
            ),
            path: 'certification-type'
          }
        ]}
      />
    </Container>
  )
}

export default withAuth(Settings)
