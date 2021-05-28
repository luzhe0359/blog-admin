<template>
  <div class="q-gutter-sm row items-center no-wrap q-electron-drag--exception">
    <q-input dense outlined v-model="search" style="min-width: 60px" input-class="text-right" class="q-ml-md">
      <template v-slot:append>
        <q-icon v-if="search === ''" name="search" />
        <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
      </template>
    </q-input>
    <q-btn round dense flat :icon="this.$q.fullscreen.isActive?'fullscreen_exit':'fullscreen'" v-if="$q.screen.gt.sm" @click="fullScreen">
      <q-tooltip v-if="!this.$q.fullscreen.isActive">全屏</q-tooltip>
      <q-tooltip v-if="this.$q.fullscreen.isActive">退出全屏</q-tooltip>
    </q-btn>
    <q-btn round dense flat icon="video_call" v-if="$q.screen.gt.sm">
      <q-tooltip>创建</q-tooltip>
    </q-btn>
    <q-btn round dense flat icon="apps" v-if="$q.screen.gt.sm">
      <q-tooltip>应用</q-tooltip>
    </q-btn>
    <q-btn round dense flat icon="message" v-if="$q.screen.gt.sm">
      <q-tooltip>消息</q-tooltip>
    </q-btn>
    <q-btn round dense flat icon="notifications">
      <q-badge color="red" text-color="" floating>
        2
      </q-badge>
      <q-tooltip>通知</q-tooltip>
    </q-btn>
    <q-btn round flat>
      <q-menu>
        <div class="row no-wrap q-pa-md">

          <div class="column items-center">
            <q-avatar size="72px">
              <q-img no-default-spinner transition="slide-down" :src="getAvatar | imgBaseUrl" :placeholder-src="'/images/default_avatar.jpg' | imgBaseUrl" />
            </q-avatar>

            <div class="text-subtitle1 q-mt-md q-mb-xs">Hi！<br> {{getNickname}}</div>

            <q-btn color="primary" label="Logout" size="sm" v-close-popup @click="logout" />
          </div>
        </div>
      </q-menu>
      <q-avatar size="26px">
        <q-img no-default-spinner transition="slide-down" :src="getAvatar | imgBaseUrl" :placeholder-src="'/images/default_avatar.jpg' | imgBaseUrl" />
      </q-avatar>
      <q-tooltip>账号</q-tooltip>
    </q-btn>
    <div class="electron-only">
      <q-btn dense flat icon="minimize" @click="minimize" />
      <q-btn dense flat :icon="isMaximize?'crop_square':'flip_to_front'" @click="maximize" />
      <q-btn dense flat icon="close" @click="closeApp" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ToolbarItemRight',
  data () {
    return {
      search: '',
      mobileData: false,
      bluetooth: true,
      isMaximize: true
    }
  },
  computed: {
    ...mapGetters([
      'getAvatar',
      'getNickname'
    ])

  },
  methods: {
    fullScreen () {
      if (this.$q.fullscreen.isActive) {
        // 退出全屏模式：
        this.$q.fullscreen.exit()
          .then(() => { // v1.5.0+
            // success!
          })
          // eslint-disable-next-line handle-callback-err
          .catch(err => { // v1.5.0+
            // oh, no!!!
          })
      } else {
        // 请求全屏模式：
        this.$q.fullscreen.request()
          .then(() => { // v1.5.0+
            // success!
          })
          // eslint-disable-next-line handle-callback-err
          .catch(err => { // v1.5.0+
            // oh, no!!!
          })
      }
    },

    logout () {
      this.$store.dispatch('Logout').then(() => {
        this.$msg.success('退出成功')
        this.$router.push('/logon')
        window.sessionStorage.clear()
      }).catch(() => {
        this.$router.push('/logon')
        window.sessionStorage.clear()
      })
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.getCurrentWindow().setSize(500, 490)
        this.$q.electron.remote.getCurrentWindow().center()
      }
    },

    // electron
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },

    maximize () {
      if (process.env.MODE === 'electron') {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()
        if (win.isMaximized()) {
          win.unmaximize()
          this.isMaximize = !this.isMaximize
        } else {
          win.maximize()
          this.isMaximize = !this.isMaximize
        }
      }
    },

    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    }
  }
}
</script>
