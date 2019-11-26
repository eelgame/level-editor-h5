import request from '@/utils/request'

export function user() {
  return request({
    url: 'api/login/user',
    method: 'get'
  })
}
