/**
 * @FileDescription: 留言API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找留言列表
 * @param {String} content 父留言内容
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findMessageList = params => {
  return axios.get('/comment/list', { params })
}

/**
 * @description: 删除单个留言
 * @param {String} _id 父留言_id
 */
export const deleteMessageById = _id => {
  return axios.delete(`/comment/${_id}`)
}

/**
 * @description: 更改留言状态
 * @param {ObjectId} _id 父留言_id
 * @param {String} state 状态
 * @param {ObjectId} otherCommentId 子留言_id
 */
export const changeMessageState = (_id, params) => {
  return axios.put(`/comment/state/${_id}`, params)
}
