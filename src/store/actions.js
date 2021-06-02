import { userLogin, userLogout } from 'src/api/user.js'

const actions = {
    // 登录
    Login ({ commit }, user) {
        return new Promise((resolve, reject) => {
            userLogin(user).then(res => {
                commit('SET_NICKNAME', user.nickname)
                commit('SET_AVATAR', user.avatar)
                resolve(res.data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    // 登出
    Logout ({ commit }, state) {
        return new Promise((resolve, reject) => {
            userLogout().then((response) => {
                commit('LOGOUT')
                resolve()
            }).catch(error => {
                commit('LOGOUT')
                reject(error)
            })
        })
    }
}

export default actions
