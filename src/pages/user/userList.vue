<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 用户列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-col-gutter-sm row items-end">
            <div class="col-lg-3 col-md-5 col-sm-6 col-xs-12">
              <q-input type=" text" v-model="username" label="用户名" />
            </div>
            <div class="col-lg-3 col-md-5 col-sm-6 col-xs-12">
              <q-input type="text" v-model="nickname" label="昵称" />
            </div>
            <div>
              <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading">
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
            <div>
              <q-btn label="重 置" type="reset" color="grey" />
            </div>
            <q-space />
            <div>
              <q-btn label="添 加" v-if="isZugelu" type="button" color="secondary" @click="addDialogVisible = true" />
            </div>
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="id" :data="userData" :columns="UserColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
                <span>
                  {{ message }}
                </span>
              </div>
            </template>
            <!-- 表格内容 -性别插槽 -->
            <template v-slot:body-cell-gender="props">
              <q-td :props="props">
                {{props.row.gender | userGender}}
              </q-td>
            </template>
            <!-- 表格内容 -头像插槽 -->
            <template v-slot:body-cell-avatar="props">
              <q-td :props="props">
                <q-avatar round size="48px">
                  <q-img no-default-spinner transition="slide-down" :src="`${$url}${props.row.avatar}`" :placeholder-src="'/images/default_avatar.jpg' | imgBaseUrl" />
                </q-avatar>
              </q-td>
            </template>
            <!-- 表格内容 -操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn v-if="isZugelu" icon="edit" size="sm" flat dense @click="editUser(props.row)" />
                <q-btn v-if="isZugelu" icon="delete" size="sm" class="q-ml-sm" flat dense @click="deleteUser(props.row)" />
                <q-btn v-if="!isZugelu" icon="person_off" size="sm" class="q-ml-sm" flat dense @click="noPermission" />
              </q-td>
            </template>
            <!-- 表格内容 -简介插槽 -->
            <template v-slot:body-cell-about="props">
              <q-td :props="props">
                <div class="fit flex flex-center text-center non-selectable q-pa-md">
                  {{props.row.about}}
                  <q-tooltip anchor="top middle" self="center middle">
                    {{props.row.about}}
                  </q-tooltip>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 新增用户 -->
      <BaseDialog :title="'添加'" :dialogVisible="addDialogVisible" @okClick="onOKClick" @cancelClick="onCancelClick">
        <template v-slot:body>
          <q-form ref="addRef" class="fit">
            <!-- 账号 -->
            <q-input outlined dense class="full-width" label="账号" clearable v-model="uName" debounce='500' lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入账号。',
                  val => (val.length >= 6 && val.length <= 12) || '请输入 6-12 位账号。',
                ]">
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
            <!-- 密码 -->
            <q-input outlined dense class="full-width" label="密码" clearable v-model="uPwd" :type="isPwd ? 'password' : 'text'" hint="" debounce='200' lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入密码。',
                  val => (val.length >= 8 && val.length <= 16) || '请输入 8-16 位账号。',
                  passwordStrengthCheck
                ]">
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
            </q-input>
            <q-input outlined dense class="full-width" label="昵称" clearable v-model="uNickname" lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入昵称。',
                  val => (val.length >= 2 && val.length <= 6) || '请输入 2-6 位昵称。',
                ]">
              <template v-slot:prepend>
                <q-icon name="mode_edit" />
              </template>
            </q-input>
            <div class="row full-width items-center">
              <div class="text-subtitle1 q-mr-md ">头像</div>
              <div class="col">
                <q-avatar size="100px">
                  <q-img class="cursor-pointer" :src="uAvatar | imgBaseUrl" spinner-color="primary" width='100px' height='100px' :placeholder-src="'/images/default_avatar.jpg' | imgBaseUrl" @click="uploadDialogVisible = true">
                    <div class="absolute-bottom text-subtitle2 text-center">
                      上传头像
                    </div>
                  </q-img>
                </q-avatar>
              </div>
            </div>
          </q-form>
        </template>
      </BaseDialog>
      <!-- 头像上传 -->
      <BaseDialog :title="'头像上传'" :dialogVisible="uploadDialogVisible" :hideAction="true" @okClick="okUploadClick" @cancelClick="cancelUploadClick">
        <template v-slot:body>
          <q-uploader :url="`${$url}/api/photo/upload`" :headers="[
              {name: 'Authorization', value: `Bearer ${token}`}
            ]" field-name='photo' max-files="1" style="width:100%; height: 500px;" @uploaded="finishUpload" />
        </template>
      </BaseDialog>
      <!-- 编辑用户 -->
      <BaseDialog :title="'修改用户信息'" :dialogVisible="baseDialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <div class="row full-width">
            <label class="text-subtitle1">角色</label>
            <div class="full-width q-gutter-sm row">
              <q-checkbox v-model="roleSelection" val="admin" label="admin" color="teal" />
              <q-checkbox v-model="roleSelection" val="editor" label="editor" color="orange" />
            </div>
          </div>
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findUserList, editUserById, deleteUserById, userRegister } from 'src/api/user.js'
import { aesEncrypt } from 'src/utils/crypto.js'

export default {
  name: 'userList',
  data () {
    return {
      user: null, // 当前用户信息
      username: '', // 用户名(搜索)
      nickname: '', // 昵称(搜索)
      uName: '', // 用户名(注册)
      uPwd: '', // 密码(注册)
      uNickname: '',
      uAvatar: '/images/default_avatar.webp', // 默认头像
      isPwd: true,
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: true, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      UserColumns: [
        {
          name: 'username', // 唯一的ID
          required: true, // （可选）如果我们使用可见列，这个列将始终可见
          label: '用户名', // 头部标签
          align: 'left', // 对齐方式
          field: 'username', // 行对象属性以确定此列的值，或field: row => row.some.nested.prop
          format: val => `${val}`, // （可选）您可以使用函数格式化数据
          sortable: true // （可选）告诉QTable你想要这个列可排序
        },
        { name: 'nickname', label: '昵称', field: 'nickname', align: 'center', sortable: true },
        { name: 'role', label: '角色', field: 'role', align: 'center', format: val => val.join(' , ') },
        { name: 'email', label: '邮箱', field: 'email', align: 'center', sortable: true },
        { name: 'age', label: '年龄', field: 'age', align: 'center', sortable: true },
        { name: 'gender', label: '性别', field: 'gender', align: 'center', sortable: true },
        { name: 'avatar', label: '头像', field: 'avatar', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'about', label: '个人简介', field: 'about', align: 'center' },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      userData: [], // 用户列表
      roleSelection: [], // 角色
      searchLoading: false, // 查询loading
      baseDialogVisible: false,
      addDialogVisible: false, // 添加 loading
      uploadDialogVisible: false,
      token: sessionStorage.getItem('access_token')
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找用户列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        username: this.username,
        nickname: this.nickname,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findUserList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.userData = res.data
        this.pagination.page = page
        this.pagination.rowsPerPage = rowsPerPage
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending
        this.pagination.rowsNumber = res.total

        this.loading = false
      }).catch(err => {
        throw new Error(err)
      })
    },
    // 查询
    onSubmit () {
      this.searchLoading = true
      this.request({
        pagination: this.pagination
      })
    },
    // 重置
    onReset () {
      this.username = ''
      this.nickname = ''
      this.searchLoading = false
    },
    // 删除用户
    deleteUser ({ _id }) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该用户吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteUserById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          // 删除成功
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
      }).onOk(() => {
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    editUser (row) {
      this.user = row
      this.roleSelection = row.role
      this.baseDialogVisible = true
    },
    // dialog 确认
    okClick () {
      const { _id } = this.user
      editUserById(_id, { role: this.roleSelection }).then(res => {
        this.loading = false
        // 修改成功
        this.$msg.success(res.msg)
        this.baseDialogVisible = false
      }).catch(() => {
        this.baseDialogVisible = false
      })
    },
    // dialog 取消
    cancelClick () {
      this.baseDialogVisible = false
    },
    // 新增 dialog 确认
    onOKClick () {
      this.$refs.addRef.validate().then(success => {
        if (success) {
          const params = {
            username: this.uName,
            password: aesEncrypt(this.uPwd),
            nickname: this.uNickname,
            avatar: this.uAvatar
          }
          userRegister(params).then((res) => {
            this.request({
              pagination: this.pagination
            })
            this.$msg.success(res.msg)
            this.addDialogVisible = false
          })
        }
      })
    },
    // 新增 dialog 取消
    onCancelClick () {
      this.addDialogVisible = false
    },
    okUploadClick () {
      this.uploadDialogVisible = false
    },
    cancelUploadClick () {
      this.uploadDialogVisible = false
    },
    // 上传图片事件
    finishUpload (file) {
      const res = JSON.parse(file.xhr.response)
      if (res.code === 2000) {
        this.uAvatar = res.data.url
        // 上传成功
        this.$msg.success(res.msg)

        // 然后隐藏对话框
        this.uploadDialogVisible = false
      }
    },
    // 校验密码强度 8-16位，包含字母、数字、特殊符号
    passwordStrengthCheck (pass) {
      const passReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>,./]).{8,16}/
      return passReg.test(pass) || '密码强度太弱，请重新输入。'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
