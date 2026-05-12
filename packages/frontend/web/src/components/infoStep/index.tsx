import { Alert, Button, FileChooser } from '@components'
import { IDataSheet } from '@utils'
import { FaRegFileExcel } from 'react-icons/fa'
import { FiDownload, FiInfo } from 'react-icons/fi'

import { SheetTable, SheetTableWrapper } from './styles'

interface Props {
  onUpload: (file: FormData) => void
  onRemove: () => void
  onDownload: () => void
  loading: boolean
  dataSheet: IDataSheet[]
  examples: string[][]
}

export const InfoStep: React.FC<Props> = ({
  onUpload,
  onRemove,
  onDownload,
  loading,
  dataSheet,
  examples
}) => {
  return (
    <>
      <Alert card type="warning" marginBottom="md">
        <p>
          <b>Atenção!</b>
        </p>
        <p>
          A única forma da importação funcionar é que a planilha cumpra as
          seguintes regras.
        </p>
      </Alert>
      <Alert icon={FiInfo} marginBottom="md">
        A planilha <b>deve conter as mesmas colunas</b> exibidas a seguir:
      </Alert>
      <SheetTableWrapper>
        <SheetTable>
          <thead>
            <tr>
              {dataSheet
                .filter(({ column }) => !column?.hidden)
                .map((colum, key) => (
                  <th key={key}>{colum.column?.header}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {examples.map((row, key) => (
              <tr key={key}>
                {row.map((value, key) => (
                  <td key={key}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </SheetTable>
      </SheetTableWrapper>
      <Button
        onClick={onDownload}
        marginBottom="md"
        outline
        color="secondary"
        loading={loading}
      >
        <FiDownload size={20} />
        <span>Baixar Planilha de Exemplo</span>
      </Button>
      <Alert icon={FiInfo} marginBottom="sm">
        Faça o upload da planilha que você baixou como modelo.
      </Alert>
      <FileChooser
        title="Arraste e solte a planilha aqui"
        onUpload={onUpload}
        onRemove={onRemove}
        icon={FaRegFileExcel}
        type="spreadsheet"
        height="240px"
        marginBottom="md"
      />
    </>
  )
}
