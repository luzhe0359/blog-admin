import { axios } from 'boot/axios.js'

/**
 * 添加相册
 * @param {String} name 相册名称
 */
export const addAlbum = params => {
    return axios.post('/album/add', params)
}

/**
 * 查找相册列表
 */
export const findAlbumList = params => {
    return axios.get('/album/list', { params })
}

/**
 * 根据_id 编辑相册信息
 * @param {String} _id 相册_id
 * @param {String} name 相册名称
 */
export const editAlbumById = (_id, params) => {
    return axios.put(`/album/${_id}`, params)
}

/**
 * 根据_id 删除单个相册
 * @param {String} _id 相册_id
 */
export const deleteAlbumById = _id => {
    return axios.delete(`/album/${_id}`)
}
