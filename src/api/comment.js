/**
 * @FileDescription: 分类API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找评论列表
 * @param {String} content 父评论内容
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findCommentList = params => {
    return axios.get('/comment/list', { params })
}

/**
 * @description: 删除单个评论
 * @param {String} _id 父评论_id
 */
export const deleteCommentById = _id => {
    return axios.delete(`/comment/${_id}`)
}

/**
 * @description: 更改评论状态
 * @param {ObjectId} _id 父评论_id
 * @param {String} state 状态
 * @param {ObjectId} otherCommentId 子评论_id
 */
export const changeCommentState = (_id, params) => {
    return axios.put(`/comment/state/${_id}`, params)
}
