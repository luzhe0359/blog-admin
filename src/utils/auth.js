// import { SessionStorage } from 'quasar'
const TokenKey = 'access_token' // token信息

// token
export function getToken () {
  return sessionStorage.getItem(TokenKey) || ''
}

export function setToken (token) {
  sessionStorage.setItem(TokenKey, token)
}

export function removeToken () {
  sessionStorage.removeItem(TokenKey)
}
