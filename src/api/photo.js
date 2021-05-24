import { axios } from 'boot/axios.js'

/**
 * 文件上传
 * @param {String}
 */
export const uploadImage = (params) => {
    return axios.post('/photo/upload', params)
}

/**
 * 查找图片列表
 */
export const findPhotoList = params => {
    return axios.get('/photo/list', { params })
}

/**
 * 根据_id 删除单个图片
 * @param {String} _id 图片_id
 */
export const deletePhotoById = _id => {
    return axios.delete(`/photo/${_id}`)
}
