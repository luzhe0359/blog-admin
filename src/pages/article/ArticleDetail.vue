<template>
  <div id="ArticleDetail" class="q-pa-md" style="height: calc(100vh - 50px);">
    <div class="q-gutter-sm row items-end q-mb-sm">
      <q-input type="text" v-model="post.title" label="标 题" readonly class="col" />
    </div>
    <div id="editor" style="height: calc(100% - 70px);">
      <q-no-ssr>
        <!-- <mavon-editor :value="post.mdContent" :subfield="false" :defaultOpen="'preview'" :toolbarsFlag="false" :editable="false" :scrollStyle="true" :ishljs="true" style="height: 100%; width: 100%;"></mavon-editor> -->
      </q-no-ssr>
    </div>
    <!-- 操作 -->
    <q-fab class="fixed-bottom-right q-mr-lg q-mb-lg" v-model="actions" label="操 作" external-label color="secondary" icon="keyboard_arrow_up" direction="up" padding="12px" :tabindex="'9988899'" :label-position="'left'">
      <q-fab-action external-label color="grey" icon="settings_backup_restore" label="返 回" :label-position="'left'" @click="$router.go(-1)" />
      <q-fab-action external-label :color="isLike ? 'red': 'grey'" icon="favorite_border" :label="isLike?'已 赞': '点 赞'" :label-position="'left'" @click="like" />
    </q-fab>
  </div>
</template>

<script>
// import { mavonEditor } from 'mavon-editor'
// import 'mavon-editor/dist/css/index.css'

// import { uploadImage } from 'src/api/photo.js'
import { findArticleById, likeArticle, nolikeArticle } from 'src/api/article.js'

export default {
  name: 'ArticleDetail',
  components: {
    // mavonEditor
  },
  data () {
    return {
      post: {
        title: '',
        mdContent: '',
        htmlContent: '',
        tags: []
      },
      isLike: false,
      actions: true // 操作
    }
  },
  mounted () {
    this.findArticleById()
  },
  methods: {
    // 根据_id查 文章
    findArticleById () {
      findArticleById(this.$route.params._id, this.$q.localStorage.getItem('user')._id).then(res => {
        const article = res.data
        for (const key in this.post) {
          this.post[key] = article[key]
        }
        this.isLike = article.isLike
      })
    },
    like () {
      // 文章点赞
      !this.isLike && likeArticle({
        articleId: this.$route.params._id,
        userId: this.$q.localStorage.getItem('user')._id
      }).then(res => {
        // 点赞成功
        this.isLike = true
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
      })
      // 取消点赞
      this.isLike && nolikeArticle({
        articleId: this.$route.params._id,
        userId: this.$q.localStorage.getItem('user')._id
      }).then(res => {
        // 消赞成功
        this.isLike = false
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
      })
    }
  }
}
</script>
