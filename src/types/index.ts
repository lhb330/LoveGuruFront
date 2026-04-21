export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
