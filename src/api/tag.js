/**
 * @FileDescription: 标签API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找标签列表
 * @param {String} name 标签名称
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findTagList = params => {
    return axios.get('/tag/list', { params })
}

/**
 * @description: 添加标签
 * @param {String} name 标签名称
 */
export const addTag = params => {
    return axios.post('/tag/add', params)
}

/**
 * @description: 编辑单个标签
 * @param {ObjectId} _id 标签_id
 * @param {String} name 标签名称
 */
export const editTagById = (_id, params) => {
    return axios.put(`/tag/${_id}`, params)
}

/**
 * @description: 删除单个标签
 * @param {ObjectId} _id 标签_id
 */
export const deleteTagById = _id => {
    return axios.delete(`/tag/${_id}`)
}
