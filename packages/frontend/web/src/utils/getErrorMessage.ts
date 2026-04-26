export const getErrorMessage = (
  error: string,
  errors?: { [key: string]: any } | null
): string => {
  let message: string
  switch (error) {
    case 'permission_check_forbidden':
      message = 'Seu usuário não possui permissão para realizar essa ação.'
      break
    case 'user_create_conflict':
    case 'user_update_by_id_conflict':
      message = errors.email
        ? 'E-mail já cadastrado, tente com um diferente.'
        : errors.cpf
        ? 'CPF já cadastrado, tente com um diferente.'
        : 'Conflito encontrado, verifique os dados informados.'
      break
    case 'user_get_by_link_expired':
      message = 'Link expirado, favor tente novamente.'
      break
    case 'user_search_by_credentials_invalid':
    case 'user_search_by_credentials_not_match':
    case 'user_search_by_credentials_not_found':
      message = 'Por favor, verifique seu usuário e sua senha.'
      break
    case 'user_forgot_password_not_found':
      message = 'E-mail não encontrado, favor informar um e-mail cadastrado.'
      break
    case 'user_get_by_cpf_not_found':
      message = 'CPF válido, porém o participante não está cadastrado.'
      break
    case 'user_get_by_cpf_bad_request':
      message = 'CPF inválido. Revise o valor informado na planilha.'
      break
    case 'generic_create_conflict_name':
    case 'generic_update_by_id_conflict_name':
      message = 'Este nome já está cadastrado, tente com um diferente.'
      break
    case 'certificate_validate_not_found':
      message =
        'Certificado não encontrado, verifique o código e tente novamente.'
      break
    case 'activity_create_conflict':
      message = 'Atividade já cadastrada, tente com o nome ou tipo diferente.'
      break
    case 'certificate_create_participant_not_found':
      message = 'Participante não cadastrado'
      break
    default:
      message =
        error && /\s/.test(error)
          ? error
          : typeof errors === 'string'
          ? errors
          : errors?.message && /\s/.test(String(errors.message))
          ? String(errors.message)
          : 'Erro desconhecido, favor entrar em contato com o administrador.'
      break
  }
  return message
}
