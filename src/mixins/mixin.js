import BaseContent from 'components/BaseContent/BaseContent'
import BaseDialog from 'components/Dialog/BaseDialog'

export default {
    components: {
        BaseContent,
        BaseDialog
    },
    data () {
        return {
        }
    },
    computed: {
        // 最高权限(博主)
        isZugelu () {
            return sessionStorage.getItem('user_id') === '60aa4d94e18bfd3eb4b0ac27'
        }
    },
    methods: {
        noPermission () {
            this.$q.notify({
                icon: 'no_encryption_gmailerrorred',
                message: '暂无权限, 请联系管理员',
                color: 'warning',
                textColor: 'dark',
                position: 'top',
                timeout: 1500
            })
        }
    }
}
