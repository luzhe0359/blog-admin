<template>
  <BaseContent>
    <div class="q-pa-md">
      <div class="text-h5 q-py-md"> {{article.title}} </div>
      <!-- <q-chip v-for="item in post.tags" :key="item._id" size="12px">
        {{item.name}}
      </q-chip> -->
      <div class="text-grey q-pb-sm row">
        <q-chip icon="iconfont icon-biaoqian" color="transparent" text-color="grey">{{article.type | articleType}}</q-chip>
        <q-chip icon="iconfont icon-qiepian" color="transparent" text-color="grey"> {{article.createTime | dateFormat}}</q-chip>
        <!-- 套一个div，小屏幕 换行 -->
        <div v-if="article.meta">
          <q-chip icon="iconfont icon-fangwenliang" color="transparent" text-color="grey">{{article.meta.views}}</q-chip>
          <q-chip icon="iconfont icon-pinglun" color="transparent" text-color="grey"> {{article.meta.comments}}</q-chip>
          <q-chip class="like-box" color="transparent" text-color="grey">
            <q-icon class="like q-mr-xs" name="iconfont icon-xin" :color="isLike" size="21px"></q-icon>
            {{article.meta.likes}}
          </q-chip>
        </div>
        <q-space />
        <q-chip color="primary" text-color="white" v-for="tag in article.tags" :key="tag._id">{{tag.name}}</q-chip>
      </div>
      <!-- markdown -->
      <div class="base-card-shadow">
        <q-no-ssr>
          <v-md-editor v-model="article.mdContent" mode="preview" :disabled-menus="[]" />
        </q-no-ssr>
      </div>
      <!-- 标签 -->
    </div>
  </BaseContent>
</template>

<script>
import { findArticleById } from 'src/api/article.js'

export default {
  name: 'articleDetail',
  data () {
    return {
      article: ''
    }
  },
  computed: {
    isLike () {
      return this.article.isLike ? 'red' : ''
    }
  },
  mounted () {
    this.findArticleById()
  },
  methods: {
    // 根据_id查 文章
    findArticleById () {
      findArticleById(this.$route.params._id).then(res => {
        this.article = res.data
        console.log(this.article)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.q-page-sticky {
  z-index: 9999;
}
</style>
