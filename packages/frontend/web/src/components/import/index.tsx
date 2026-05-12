import { Button, Card, Stepper, ImportStep, InfoStep } from '@components'
import {
  createSheet,
  downloadSheet,
  IDataSheet,
  IFormula,
  IWorksheet
} from '@utils'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { AnySchema } from 'yup'

import { HeaderCard, MainCard } from './styles'

interface Props {
  url: string
  filename: string
  schema: AnySchema
  dataSheet: IDataSheet[]
  examples: string[][]
  worksheets?: IWorksheet[]
  formulas?: IFormula[]
}

export const Import: React.FC<Props> = ({
  url,
  filename,
  schema,
  dataSheet,
  examples,
  worksheets,
  formulas
}) => {
  const [file, setFile] = useState<File>()
  const [isLoading, setIsLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleDownload = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handleFinished = useCallback(() => {
    setFinished(true)
  }, [])

  const handleFileSelected = useCallback((formData: FormData) => {
    const file = formData.get('file') as File
    setFile(file)
  }, [])

  const handleFileRemove = useCallback(() => {
    setFile(undefined)
  }, [])

  useEffect(() => {
    const download = async () => {
      downloadSheet(
        await createSheet(dataSheet, worksheets, formulas),
        filename
      )
      setIsLoading(false)
    }
    if (isLoading) download()
  }, [dataSheet, filename, isLoading, worksheets, formulas])

  const steps = [
    {
      id: 0,
      name: 'Instruções',
      textButton: 'Selecione o arquivo antes',
      component: (
        <InfoStep
          onUpload={handleFileSelected}
          onRemove={handleFileRemove}
          onDownload={handleDownload}
          loading={isLoading}
          dataSheet={dataSheet}
          examples={examples}
        />
      ),
      enablePreviousStep: true,
      enableNextStep: !!file
    },
    {
      id: 1,
      name: 'Importando',
      textButton: 'Retornar',
      component: (
        <ImportStep
          file={file}
          url={url}
          schema={schema}
          dataSheet={dataSheet}
          onFinished={handleFinished}
        />
      ),
      enablePreviousStep: !!finished,
      enableNextStep: !!finished
    }
  ]

  const goNext = useCallback(() => {
    if (currentStep === steps.length - 1) {
      router.push(`/${url}`)
    } else {
      setCurrentStep(currentStep => currentStep + 1)
    }
  }, [currentStep, router, steps.length, url])

  const goBack = useCallback(() => {
    setFile(null)
    setFinished(false)
    if (currentStep === 0) {
      router.back()
    } else {
      setCurrentStep(currentStep => currentStep - 1)
    }
  }, [currentStep, router])

  return (
    <>
      <Stepper steps={steps} current={currentStep} />
      <Card>
        <HeaderCard>
          <Button
            ghost
            color="secondary"
            size="default"
            type="button"
            onClick={goBack}
            disabled={!steps[currentStep]?.enablePreviousStep}
            inline
          >
            <FiChevronLeft size={20} />
            <span>Voltar</span>
          </Button>
          <Button
            disabled={!steps[currentStep]?.enableNextStep}
            color={'primary'}
            size="default"
            type="button"
            onClick={goNext}
            inline
          >
            <FiChevronRight size={20} />
            <span>
              {steps[currentStep]?.enableNextStep
                ? 'Avançar'
                : steps[currentStep]?.textButton}
            </span>
          </Button>
        </HeaderCard>
        <MainCard>{steps[currentStep]?.component}</MainCard>
      </Card>
    </>
  )
}
