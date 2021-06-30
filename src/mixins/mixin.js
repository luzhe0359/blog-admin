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
        hasBtnPermissions () {
            const role = sessionStorage.getItem('user_role')
            return ['super', 'admin'].includes(role)
        }
    },
    methods: {
        noPermission () {
            this.$q.notify({
                icon: 'no_encryption_gmailerrorred',
                message: '暂无权限, 请联系管理员',
                color: 'warning',
                textColor: 'dark'
            })
        }
    }
}
