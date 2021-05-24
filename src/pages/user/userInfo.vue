<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 个人信息 -->
      <q-card class="q-py-md no-box-shadow">
        <q-form @submit="onSubmit" class="q-gutter-sm">

          <div class="column">
            <span class="label-title q-mb-sm">头像</span>
            <div>
              <q-avatar size="100px">
                <q-img :disable="!readonly" :src="formData.avatar | imgBaseUrl" spinner-color="primary" class="border-radius50 " :class="!readonly && 'cursor-pointer'" width='100px' height='100px' @click="uploadDialog">
                  <div v-show="!readonly" class="absolute-bottom text-subtitle2 text-center">
                    更换头像
                  </div>
                </q-img>
              </q-avatar>
            </div>
          </div>

          <div class="column">
            <span class="label-title q-mb-sm">性别</span>
            <q-option-group inline :disable="readonly" label="性别" v-model="formData.gender" :options="genderOptions" color="primary" />
          </div>

          <q-input label="昵称" :readonly="readonly" v-model="formData.nickname" lazy-rules :rules="[
            val => val && val.length > 0 || '请输入昵称',
            val => (val.length >= 2 && val.length <= 6) || '请输入2-6位昵称'
          ]" />

          <q-input label="年龄" type="number" :readonly="readonly" v-model="formData.age" lazy-rules :rules="[
          val => val !== null && val !== '' || '请输入年龄',
          val => val > 0 && val < 120 || '请输入一个真实的年龄'
        ]" />

          <q-input label="邮箱" type="email" :readonly="readonly" v-model="formData.email" lazy-rules :rules="[ val => val && val.length > 0 || '请输入邮箱']" />

          <q-input label="个人简介" type="textarea" hint="个人简介, 最多50个字。" :hide-hint="readonly" :readonly="readonly" v-model="formData.about" maxlength='60' lazy-rules :rules="[ val => val && val.length > 0 || '请填写个人简介']" />

          <div class="q-gutter-sm">
            <q-btn v-show="readonly" label="编 辑" type="button" color="amber" @click="editUser" :class="$q.screen.lt.sm?'full-width':'q-ml-none'" />
            <q-btn v-show="!readonly" label="保 存" type="submit" color="primary" :loading="loading" :class="$q.screen.lt.sm?'full-width':'q-ml-none'">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn v-show="!readonly" label="取 消" type="button" color="grey" @click="cancel" :class="$q.screen.lt.sm?'full-width':''" />
          </div>
        </q-form>
      </q-card>
      <!-- 头像上传 -->
      <BaseDialog :title="'头像上传'" :dialogVisible="baseDialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-uploader :url="`${$url}/photo/upload`" :headers="[
              {name: 'Authorization', value: `Bearer ${token}`}
            ]" field-name='photo' max-files="1" style="width:100%; height: 500px;" @uploaded="finishUpload" />
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { findUserById, EditUserById } from 'src/api/user.js'
// import { uploadImage } from 'src/api/photo.js'
import { getToken } from 'src/utils/auth.js'

export default {
  name: 'userInfo',
  data () {
    return {
      formData: {
        nickname: '',
        age: '',
        gender: '',
        email: '',
        avatar: '',
        about: ''
      },
      genderOptions: [
        { label: '男', value: 1 },
        { label: '女', value: 0 },
        { label: '保密', value: -1 }
      ],
      readonly: true, // 只读, 编辑时去掉
      loading: false,
      userId: null, // 用户id
      token: getToken(),
      baseDialogVisible: false
    }
  },
  created () {
    this.findUserById()
  },
  methods: {
    // 获取用户信息
    findUserById () {
      this.userId = sessionStorage.getItem('user_id')
      findUserById(this.userId).then(res => {
        const user = res.data
        for (const key in this.formData) {
          this.formData[key] = user[key]
        }
      })
    },
    // 保存
    onSubmit () {
      this.loading = true
      EditUserById(this.userId, this.formData).then(res => {
        this.loading = false
        const user = res.data
        for (const key in this.formData) {
          this.formData[key] = user[key]
        }
        this.readonly = true
        this.$store.commit('SET_AVATAR', user.avatar)
        this.$store.commit('SET_NICKNAME', user.nickname)
        // 保存成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
      }).catch(() => {
        this.loading = false
      })
    },
    // 编辑
    editUser () {
      this.readonly = false
    },
    // 取消
    cancel () {
      this.readonly = true
      this.findUserById()
    },
    // 上传图片弹框
    uploadDialog () {
      if (this.readonly) return
      this.baseDialogVisible = true
    },
    // 上传图片事件
    finishUpload (file) {
      const res = JSON.parse(file.xhr.response)
      if (res.code === 2000) {
        this.$set(this.formData, 'avatar', res.data.url)
        // 上传成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })

        // 然后隐藏对话框
        this.baseDialogVisible = false
      }
    },
    // dialog 确认
    okClick () {
      this.baseDialogVisible = false
    },
    // dialog 取消
    cancelClick () {
      this.baseDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.q-card {
  max-width: 500px;
}
::v-deep .q-uploader__file--img {
  height: 100%;
}
</style>
