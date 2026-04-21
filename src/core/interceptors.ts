import type { AxiosInstance } from 'axios'
import { showToast } from 'vant'
import { tokenUtils } from '@/core/auth/token'
import router from '@/router'
import type { ApiResponse } from '@/types'

export function setupInterceptors(http: AxiosInstance): void {
  // 请求拦截
  http.interceptors.request.use((config) => {
    const token = tokenUtils.getToken()
    if (token) {
      config.headers.satoken = token
    }
    if (config.responseType === 'stream') {
      config.headers.Accept = 'text/event-stream'
    }
    return config
  })

  // 响应拦截
  http.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'stream') {
        return response
      }

      const body = response.data as ApiResponse<unknown> & { message?: string }
      if (typeof body?.code === 'number' && body.code !== 0) {
        if (body.code === 40100) {
          showToast('未登录或登录已过期')
          tokenUtils.clearToken()
          if (router.currentRoute.value.path !== '/login') {
            router.replace('/login')
          }
          return Promise.reject(body)
        }
        showToast(body.msg || body.message || '请求失败')
        return Promise.reject(body)
      }
      return response
    },
    (error) => {
      showToast(error.message || '网络异常')
      return Promise.reject(error)
    }
  )
}
