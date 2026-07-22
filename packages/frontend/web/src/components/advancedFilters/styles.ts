import styled from 'styled-components'

export const Container = styled.section`
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightShade};
  padding: 20px 30px;

  > div:first-child {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 15px;
    justify-content: space-between;
    margin-bottom: 15px;

    h3 {
      color: ${({ theme }) => theme.colors.dark};
      font-size: 0.875rem;
      font-weight: 700;
    }

    span {
      color: ${({ theme }) => theme.colors.mediumShade};
      font-size: 0.75rem;
      font-weight: 600;
    }
  }
`

export const Fields = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: end;

  .filter-actions {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 100%;

    button {
      width: auto !important;
      min-width: auto !important;
      margin: 0 !important;
      padding: 0 12px;
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
    }
  }
`

export const Actions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;

  button {
    margin-left: 0 !important;
  }
`

export const QuickFilters = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
`
