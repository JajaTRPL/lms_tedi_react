import './style.css'
import 'toastify-js/src/toastify.css'
import { renderLogin, handleRedirection } from './login/Login'

const token = localStorage.getItem('auth_token')
const role = localStorage.getItem('auth_role')

if (token && role) {
    handleRedirection(role)
} else {
    renderLogin()
}
