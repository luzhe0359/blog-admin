/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */
import Vue from 'vue'
import Axios from 'axios'
import { Notify, LoadingBar } from 'quasar'

import router from 'src/router/index.js'
import { getToken } from 'src/utils/auth.js'

LoadingBar.setDefaults({
    color: 'light-blue-4',
    size: '4px',
    position: 'top'
})
/**
 * 请求配置
 */
const axios = Axios.create({
    baseURL: process.env.URL + '/api',
    timeout: 10000 // 请求 20s 超时
})

axios.defaults.headers.common.Authorization = ''
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8' // 配置请求头（推荐）

/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
axios.interceptors.request.use(
    config => {
        LoadingBar.start()
        // 添加token
        const token = getToken()
        token && (config.headers.Authorization = 'Bearer ' + token)
        config.headers.admin = 'admin' // 后台
        return config
    },
    error => Promise.error(error))

// 响应拦截器
axios.interceptors.response.use(
    /**
           * 传输层：接口正常或异常，用http状态码
           * 业务层：业务正常或异常，用自定义状态码
           */
    // 请求成功
    res => {
        LoadingBar.stop()
        // HTTP 状态码
        if (res.status !== 200) {
            return Promise.reject(res)
        }
        // 业务状态码
        const code = res.data.code
        if (!code) {
            // 返回 HTML(没有code属性，则请求的是html)
            return Promise.resolve(res.data)
        }
        return code === 2000 ? Promise.resolve(res.data) : errorHandle(code, res.data.msg)
    },
    // 请求失败
    error => {
        LoadingBar.stop()
        const { response } = error
        if (response) {
            // 请求已发出，但是不在2xx的范围
            errorHandle(response.status, response.data.message)
            return Promise.reject(response)
        } else {
            tip('网络出现故障,请稍后再试')
            // 处理断网的情况
            // eg:请求超时或断网时，更新state的network状态
            // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
            // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
            // store.commit('changeNetwork', false);
        }
    })

/**
* 提示函数
*/
const tip = msg => {
    Notify.create({
        message: msg,
        color: 'negative',
        position: 'top',
        timeout: 3000
    })
}

/**
 * 跳转登录页
 */
const toLogin = async (msg) => {
    tip(msg)
    window.sessionStorage.clear()
    router.replace({
        path: '/logon'
    })
}

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 状态码
 */
const errorHandle = (status, msg) => {
    // 状态码判断
    switch (status) {
        // 2001: 账号已存在
        case 2001:
            tip('账号已存在，请重新输入!')
            break
        // 2002: 用户名/密码错误
        case 2002:
            tip('用户名或密码错误!')
            break
        // 2003: 用户名/密码错误
        case 2003:
            tip(msg)
            break
        // 4001: token无效/未登录状态，跳转登录页
        case 4001:
            toLogin('未登录状态')
            break
        // 4003: token过期，清除token并跳转登录页
        case 4003:
            toLogin('登录信息过期')
            break
        // 6001: 会话失效
        case 6001:
            toLogin('会话已失效')
            break
        // 6003: 异地登录
        case 6003:
            toLogin('该账号已在其它地方登录')
            break
        // 6003: 其他错误
        case 6006:
            tip(msg)
            break
        default:
            tip('后台维护中，请稍后再试')
    }
}

Vue.prototype.$axios = axios

export { axios }
