import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }


  @media (max-width: 1024px) {
    html {
      font-size: 93.75%;
    }
  }

  @media (max-width: ${({ theme }) => theme.responsive.mdDown}) {
    html {
      font-size: 87.5%;
    }
    .hide-md-down {
      display: none !important;
    }
  }

  body {
    background-color: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.darkShade};
  }

  body,
  input,
  select,
  textarea,
  button {
    font: 400 1rem 'Inter', sans-serif;
    outline: none;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    box-shadow: 0 0 0 30px ${({ theme }) =>
      theme.colors.lightTint}  inset !important;
  }

  #nprogress .bar {
    background: ${({ theme }) => theme.colors.secondary} !important;
  }

  #nprogress .peg {
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.secondary} , 0 0 5px ${({
  theme
}) => theme.colors.secondary} ;
  }
  .public-DraftStyleDefault-block {
    padding: 0 16px;
  }
`
