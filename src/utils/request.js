import axios from 'axios'
import { Notification, MessageBox } from 'element-ui'

// 创建axios实例
const service = axios.create({
  // baseURL: process.env.NODE_ENV === 'development' ? process.env.VUE_APP_BASE_API : '/', // api 的 base_url
  baseURL: '/',
  timeout: 30000 // 请求超时时间
})

service.interceptors.request.use(
  config => {
    /* eslint-disable */
    config.headers['Content-Type'] = 'application/json'

    let url = config.url
    // get参数编码
    if (config.params) {
      url += '?'
      let keys = Object.keys(config.params)
      for (let key of keys) {
        url += `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}&`
      }
      url = url.substring(0, url.length - 1)
      config.params = {}
    }
    config.url = url

    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const code = response.status
    if (code < 200 || code > 300) {
      Notification.error({
        title: response.message
      })
      return Promise.reject('error')
    } else {
      if (response.data && response.data.return_code) {
        Notification.error({
          title: response.data.return_message,
          duration: 3000
        })
        return Promise.reject(response.data)
      }
      return response.data
    }
  },
  error => {
    let code = 0
    try {
      code = error.response.data.status
    } catch (e) {
      if (error.toString().indexOf('Error: timeout') !== -1) {
        Notification.error({
          title: '网络请求超时',
          duration: 2500
        })
        return Promise.reject(error)
      }
      if (error.toString().indexOf('Error: Network Error') !== -1) {
        Notification.error({
          title: '网络请求错误',
          duration: 2500
        })
        return Promise.reject(error)
      }
    }
    if (code === 401) {
      MessageBox.confirm(
        '登录状态已过期，您可以继续留在该页面，或者重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    } else {
      const errorMsg = error.response.data.message
      if (errorMsg !== undefined) {
        Notification.error({
          title: errorMsg,
          duration: 3000
        })
      }
    }
    return Promise.reject(error)
  }
)
export default service

