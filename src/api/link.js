/**
 * @FileDescription: 友链API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找友链列表
 * @param {String} name 友链名称
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findLinkList = params => {
    return axios.get('/link/list', { params })
}

/**
 * @description: 添加友链
 * @param {String} title 友链名称
 * @param {String} url 友链链接
 * @param {String} desc 友链描述
 * @param {String} logo 友链logo
 */
export const addLink = params => {
    return axios.post('/link/add', params)
}

/**
 * @description: 编辑单个友链
 * @param {ObjectId} _id 友链_id
 * @param {String} title 友链名称
 * @param {String} url 友链链接
 * @param {String} desc 友链描述
 * @param {String} logo 友链logo
 */
export const editLinkById = (_id, params) => {
    return axios.put(`/link/${_id}`, params)
}

/**
 * @description: 删除单个友链
 * @param {ObjectId} _id 友链_id
 */
export const deleteLinkById = _id => {
    return axios.delete(`/link/${_id}`)
}
