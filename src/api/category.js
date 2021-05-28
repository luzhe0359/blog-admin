/**
 * @FileDescription: 分类API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找分类列表
 * @param {String} name 分类名称
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findCategoryList = params => {
    return axios.get('/category/list', { params })
}

/**
 * @description: 添加分类
 * @param {String} name 分类名称
 * @param {String} icon 分类图标
 */
export const addCategory = params => {
    return axios.post('/category/add', params)
}

/**
 * @description: 编辑单个分类
 * @param {ObjectId} _id 分类_id
 * @param {String} name 分类名称
 * @param {String} icon 分类图标
 */
export const editCategoryById = (_id, params) => {
    return axios.put(`/category/${_id}`, params)
}

/**
 * @description: 删除单个分类
 * @param {ObjectId} _id 分类_id
 */
export const deleteCategoryById = _id => {
    return axios.delete(`/category/${_id}`)
}
