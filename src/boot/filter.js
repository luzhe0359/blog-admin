// 全局过滤器
import Vue from 'vue'
import { date } from 'quasar'

const filters = {
    // 性别
    userGender (gender) {
        switch (gender) {
            case 1:
                return '男'
            case 0:
                return '女'
            case -1:
                return '*'
        }
    },
    // 文章类型
    articleType (type) {
        switch (type) {
            case 1:
                return '原创'
            case 2:
                return '转载'
        }
    },
    // 文章状态
    articleState (state) {
        switch (state) {
            case 1:
                return '已发布'
            case 2:
                return '草稿'
            case 3:
                return '垃圾箱'
        }
    },
    // 默认地址
    imgBaseUrl (url) {
        return process.env.URL + url
    },
    // 日期差
    dateDiff (d) {
        const now = new Date()

        const year = date.getDateDiff(now, d, 'yaers')
        const month = date.getDateDiff(now, d, 'months')
        const day = date.getDateDiff(now, d, 'days')
        const hour = date.getDateDiff(now, d, 'hours')
        const minute = date.getDateDiff(now, d, 'minutes')

        return (year && year + '年前') ||
            (month && month + '个月前') ||
            (day && day + '天前') ||
            (hour && hour + '小时前') ||
            (minute && minute + '分钟前') ||
            '刚刚'
    },
    // 日期格式化
    dateFormat (d) {
        return date.formatDate(d, 'YYYY-MM-DD HH:mm:ss')
    }
}

// 注册全局过滤器
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})
