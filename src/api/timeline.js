/**
 * @FileDescription: 时间线API
 * @Author: zugelu
 * @qq: 1141178844
 */
import { axios } from 'boot/axios.js'

/**
 * @description: 查找时间线列表
 * @param {String} title 时间线标题
 * @param {Number} pageNum 当前页码
 * @param {Number} pageSize 每页条数
 * @param {String} sortBy 排序字段
 * @param {String} descending 1升序/-1降序
 */
export const findTimelineList = params => {
    return axios.get('/timeline/list', { params })
}

/**
 * @description: 添加时间线
 * @param {String} title 时间线标题
 * @param {String} body 时间线内容
 * @param {Date} date 计划完成时间
 * @param {Boolean} finish // 是否完成
 */
export const addTimeline = params => {
    return axios.post('/timeline/add', params)
}

/**
 * @description: 编辑单个时间线
 * @param {ObjectId} _id 时间线_id
 * @param {String} title 时间线标题
 * @param {String} body 时间线内容
 * @param {Date} date 计划完成时间
 * @param {Boolean} finish // 是否完成
 */
export const editTimelineById = (_id, params) => {
    return axios.put(`/timeline/${_id}`, params)
}

/**
 * @description: 删除单个时间线
 * @param {ObjectId} _id 时间线_id
 */
export const deleteTimelineById = _id => {
    return axios.delete(`/timeline/${_id}`)
}
