/**
 * @FileDescription: 相册API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找相册列表
 * @param {String} name 相册名称
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findAlbumList = params => {
    return axios.get('/album/list', { params })
}

/**
 * @description: 添加相册
 * @param {String} name 相册名称
 * @param {String} desc 相册描述
 */
export const addAlbum = params => {
    return axios.post('/album/add', params)
}

/**
 * @description: 编辑单个相册
 * @param {ObjectId} _id 相册_id
 * @param {String} name 相册名称
 * @param {String} desc 相册描述
 */
export const editAlbumById = (_id, params) => {
    return axios.put(`/album/${_id}`, params)
}

/**
 * @description: 删除单个相册
 * @param {ObjectId} _id 相册_id
 */
export const deleteAlbumById = _id => {
    return axios.delete(`/album/${_id}`)
}
