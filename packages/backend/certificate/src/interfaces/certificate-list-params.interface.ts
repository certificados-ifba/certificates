export interface ICertificateListParams {
  event?: string
  user?: string
  name?: string
  activity?: string | string[]
  typeActivity?: string
  function?: string
  workloadMin?: string
  workloadMax?: string
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
  page?: number
  perPage?: number
  sortBy: string
  orderBy: 'ASC' | 'DESC'
}
