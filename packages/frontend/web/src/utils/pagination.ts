export interface PaginationItem {
  value: number
  label: string
}

export const buildPaginationPages = (
  page: number,
  numberOfPages: number
): PaginationItem[] => {
  const list: PaginationItem[] = []

  for (let index = 1; index <= numberOfPages; index++) {
    const upper = page + (page < 5 ? 7 - page : 3)
    const lower = page - (page + 3 > numberOfPages ? page + 6 - numberOfPages : 3)

    if (
      (index > lower && index < upper) ||
      index === 1 ||
      index === Number(numberOfPages)
    ) {
      list.push({
        value:
          (index - 1 > lower && index + 1 < upper) ||
          index < 3 ||
          index > numberOfPages - 2
            ? index
            : 0,
        label:
          (index - 1 > lower && index + 1 < upper) ||
          index < 3 ||
          index > numberOfPages - 2
            ? String(index)
            : '...'
      })
    }
  }

  return list
}
