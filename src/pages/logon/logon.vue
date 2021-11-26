<template>
  <div class="flex justify-center items-center q-electron-drag" style="height: 100%">
    <div class="row base-card-shadow electron-hide" style="width: 60vw;min-width: 300px">
      <div class="col-6 flex justify-center items-center " v-show="$q.screen.gt.sm">
        <q-skeleton type="text" height="70%" width="50%" v-if="!isLottieF" />
        <lottie-web-cimo align="right" style="height: 70%" :path="defaultOptions.path" @isLottieFinish="handleFinish" />
      </div>
      <q-separator vertical inset v-if="$q.screen.gt.sm" />
      <div class="col flex justify-center items-center">
        <q-card square style="min-width: 290px;height: 100%; width: 60%;" class="no-shadow">
          <q-card-section align="center">
            <h3 class="text-uppercase">zugelu</h3>
            <!-- 用户名 -->
            <q-input class="logon-input" autofocus clearable standout="bg-cyan text-white" bottom-slots v-model="account" label="账号" debounce='500' lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入用户名或邮箱',
                ]">
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
            <!-- 密码 -->
            <q-input class="logon-input" standout="bg-cyan text-white" bottom-slots v-model="password" label="密码" :type="isPwd ? 'password' : 'text'" hint="" debounce='200' lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入密码',
                  val => (val.length >= 8 && val.length <= 16) || '请输入 8-16 位账号',
                  passwordStrengthCheck
                ]">
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
              </template>
            </q-input>

            <!-- 登录按钮 -->
            <q-btn :loading="loading" class="logon-btn bg-logon-card-input" text-color="white" unelevated label="" style="font-size: large;" @keyup.enter="logon" @click="logon">登 录 系 统
            </q-btn>
            <div class="row justify-between" style="margin-bottom: 20px;">
              <q-btn flat label="忘记密码" @click="forget" />
              <q-btn outline label="我要注册" @click="forget" />
            </div>
            <!-- <p class="text-grey" align="left">账号2 ：test &nbsp;&nbsp;&nbsp;&nbsp;密码均为空</p> -->
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- electron 登录 -->
    <div class="row electron-only q-electron-drag" style="width: 100vw;min-width: 300px;background: rgba(255,255,255,0);">

      <div class="col flex justify-center items-center" v-show="$q.screen.gt.sm">
        <q-skeleton type="text" height="100%" width="50%" v-if="!isLottieF" />
        <lottie-web-cimo align="right" style="height: 70%" :path="defaultOptions.path" @isLottieFinish="handleFinish" />
      </div>
      <q-separator vertical inset v-if="$q.screen.gt.sm" />

      <div class="col flex justify-center items-center">

        <q-card square style="min-width: 290px;height: 100%; width: 60%;" class="no-shadow">
          <q-form ref="logon">
            <q-card-section align="center">
              <h3 class="text-uppercase">zugelu</h3>
              <!-- 用户名 -->
              <q-input class="logon-input q-electron-drag--exception" clearable standout="bg-cyan text-white" bottom-slots v-model.trim="account" label="账号" debounce='500' lazy-rules :rules="[
                  val => (val && val.length > 0) || '请输入账号',
                ]">
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>
              <!-- 密码 -->
              <q-input class="logon-input q-electron-drag--exception" standout="bg-cyan text-white" bottom-slots v-model.trim="password" label="密码" :type="isPwd ? 'password' : 'text'" hint="">
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
              </q-input>

              <!-- 登录按钮 -->
              <q-btn :loading="loading" class="logon-btn bg-logon-card-input" text-color="white" unelevated label="" style="font-size: large;" @click="logon">登 录 系 统
              </q-btn>
              <div class="row justify-between" style="margin-bottom: 20px;">
                <q-btn flat label="忘记密码" @click="forget" />
                <q-btn outline label="我要注册" @click="forget" />
              </div>
            </q-card-section>
          </q-form>
        </q-card>
      </div>
    </div>
    <!-- electron end -->
  </div>
</template>

<script>
import { aesEncrypt } from 'src/utils/crypto.js'

import LottieWebCimo from '../../components/LottieWebCimo/LottieWebCimo'

export default {
  name: 'logon',
  components: { LottieWebCimo },
  data () {
    return {
      isPwd: true,
      username: '',
      password: '',
      defaultOptions: {
        path: 'https://assets9.lottiefiles.com/packages/lf20_vo0a1yca.json',
        loop: true
      },
      account: '',
      loading: false,
      isLottieF: false
    }
  },
  methods: {
    logon () {
      this.loading = !this.loading
      this.$refs.logon.validate().then(success => {
        // 校验不通过
        if (!success) {
          this.loading = !this.loading
          return
        }

        this.$store.dispatch('Login', {
          account: this.account,
          password: aesEncrypt(this.password)
        }).then((res) => {
          const { token, user } = res
          // 初始化 store
          sessionStorage.setItem('access_token', token)
          sessionStorage.setItem('user_role', user.role)
          sessionStorage.setItem('user_nickname', user.nickname)
          sessionStorage.setItem('user_avatar', user.avatar)
          sessionStorage.setItem('user_id', user._id)
          this.$store.commit('SET_NICKNAME', user.nickname)
          this.$store.commit('SET_AVATAR', user.avatar)
          // 跳转
          this.$router.push('/').then(e => {
            this.$msg.success(`hi，${user.nickname} 欢迎回来`)
            this.loading = !this.loading
            // 如果是 electron 则改变窗口大小
            if (process.env.MODE === 'electron') {
              this.$q.electron.remote.getCurrentWindow().setSize(1023, 768)
              this.$q.electron.remote.getCurrentWindow().center()
            }
          })
        }).catch(() => {
          this.loading = false
        })
      })
    },
    handleFinish (e) {
      this.isLottieF = e
    },
    forget () {
      this.$q.notify({
        icon: 'no_encryption',
        message: '该功能暂未开放',
        color: 'grey',
        position: 'top'
      })
    },
    // 校验密码强度 8-16位，包含字母、数字、特殊符号
    passwordStrengthCheck (pass) {
      const passReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>,./]).{8,16}/
      return passReg.test(pass) || '密码强度太弱，请重新输入。'
    }
  }
}
</script>

<style lang="scss" scoped >
.logon-btn {
  font-size: large;
  margin-top: 0px;
  margin-bottom: 20px;
  width: 100%;
}

.bg-logon-card-input {
  background: linear-gradient(to right, #36d1dc 1%, #5b86e5 99%);
  transition: all 0.3s ease-in-out;
  background-size: 200% auto;
}

.bg-logon-card-input:hover {
  background-position: right center;
  box-shadow: 0 12px 20px -11px #5b86e5;
}

// input 校验不通过 背景色
::v-deep .q-field--standout.q-field--highlighted .q-field__control {
  background-color: $deep-orange;
}
</style>
