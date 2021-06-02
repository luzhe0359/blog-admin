<template>
  <div id="ArticleWrite" class="q-pa-md fit">
    <!-- markdown -->
    <div class="full-height">
      <q-no-ssr>
        <v-md-editor height="100%" v-model="post.mdContent" :disabled-menus="[]" @upload-image="handleUploadImage" />
        <!-- <mavon-editor ref="md" :toolbars="toolbars" v-model="post.mdContent" :ishljs="true" codeStyle="atelier-plateau-dark" @change="editorChange" @imgAdd="imgAdd" :tabSize="4" style="height: 100%; width: 100%;"></mavon-editor> -->
      </q-no-ssr>
    </div>
    <!-- 添加按钮(右下角) -->
    <q-page-sticky position="bottom-right" style="z-index: 3000" :offset="[20,50]" @click="showDialog">
      <q-btn padding="md" round color="primary" icon="eco" />
    </q-page-sticky>
    <!-- 添加文章 -->
    <BaseDialog :title="'添加文章'" :dialogVisible="articleDialog" @okClick="okClick" @cancelClick="cancelClick">
      <template v-slot:body>
        <!-- 文章标题 -->
        <div class="row full-width">
          <label class="text-subtitle1">标题</label>
          <q-input class="full-width" type="text" dense clearable v-model="post.title" />
        </div>
        <!-- 文章分类 -->
        <div class="full-width">
          <!-- 已选分类 -->
          <div class="q-pb-xs fixed-height">
            <label class="text-subtitle1 q-mr-md ">分类</label>
            <q-chip removable v-for="(v, k) in activeCategoryNames" :key="k" @remove="removeCategory(k, v)" size="md" color="primary" text-color="white">
              {{k}}
            </q-chip>
          </div>
          <!-- 分类列表 -->
          <div class="tags-border overflow-hidden" style="max-height:74px;">
            <div v-show="activeCategoryLen" class="absolute-full text-subtitle2 flex flex-center hover-mask">
              <q-icon name="block" class="text-red q-px-sm"></q-icon>
              <div class="text-subtitle1">最多选一个分类哦~</div>
            </div>
            <div class="scroll" style="max-height:74px;">
              <q-chip clickable outline size="md" :disable="activeCategoryLen" :selected.sync="activeCategoryNames[item.name]" icon="check_box_outline_blank" color="primary" @click="clickCategory(item.name, item._id)" v-for="item in categoryList" :key="item._id">
                {{item.name}}
              </q-chip>
            </div>
          </div>
        </div>
        <!-- 文章标签 -->
        <div class="full-width">
          <!-- 已选标签 -->
          <div class="q-pb-xs fixed-height">
            <label class="text-subtitle1 q-mr-md">标签</label>
            <q-chip removable v-for="(v, k) in activeTagNames" :key="k" @remove="removeTag(k, v)" size="md" color="primary" text-color="white">
              {{k}}
            </q-chip>
          </div>
          <!-- 标签列表 -->
          <div class="tags-border overflow-hidden" style="max-height:110px;">
            <!-- 模态框 -->
            <div v-show="activeTagLen" class="fit absolute-full text-subtitle2 flex flex-center hover-mask">
              <q-icon name="block" class="text-red q-px-sm"></q-icon>
              <div class="text-subtitle1">最多选三个标签哦~</div>
            </div>
            <!-- 标签 -->
            <div class="scroll" style="max-height:110px;">
              <q-chip clickable outline size="md" :disable="activeTagLen" :selected.sync="activeTagNames[item.name]" icon="check_box_outline_blank" color="primary" @click="clickTag(item.name, item._id)" v-for="item in tagList" :key="item._id">
                {{item.name}}
              </q-chip>
            </div>
          </div>
        </div>
        <div class="row full-width items-center">
          <label class="text-subtitle1 q-mr-md">类型</label>
          <q-select :class="$q.screen.lt.sm?'col':'select-width'" dense outlined emit-value map-options v-model="post.type" :options="options" />
        </div>
        <div class="row full-width items-center">
          <label class="text-subtitle1 q-mr-md">状态</label>
          <q-select :class="$q.screen.lt.sm?'col':'select-width'" dense outlined emit-value map-options v-model="post.state" :options="typeOptions" />
        </div>
        <div class="row full-width">
          <label class="text-subtitle1">描述</label>
          <q-input class="full-width" type="text" dense clearable v-model="post.desc" placeholder="请输入文章描述 ..." />
        </div>
      </template>
    </BaseDialog>
  </div>
</template>

<script>
// import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

import BaseDialog from 'components/Dialog/BaseDialog.vue'
import { uploadImage } from 'src/api/photo.js'
import { addArticle, findArticleById, EditArticleById } from 'src/api/article.js'
import { findTagList } from 'src/api/tag.js'
import { findCategoryList } from 'src/api/category.js'

export default {
  name: 'articleWrite',
  components: {
    // mavonEditor,
    BaseDialog
  },
  data () {
    return {
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: true, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      },
      post: {
        title: '',
        desc: '',
        mdContent: '',
        htmlContent: '',
        tags: [],
        category: [],
        type: 1, // 1:原创 | 2:转载
        state: 1, // 1:已发布 | 2:草稿 | 3:垃圾箱
        author: sessionStorage.getItem('user_id') || ''
      },
      articleDialog: false, // dialog
      tagList: [], // 标签列表
      activeTagNames: {}, // 选中标签 名称
      activeTagIds: {}, // 选中标签 _id
      categoryList: [], // 分类
      activeCategoryNames: {}, // 选中分类 名称
      activeCategoryIds: {}, // 选中分类 _id
      options: [ // 文章分类
        { label: '原创', value: 1 },
        { label: '转载', value: 2 }
      ],
      typeOptions: [ // 文章状态
        { label: '已发布', value: 1 },
        { label: '草稿', value: 2 },
        { label: '垃圾箱', value: 3 }
      ],
      id: '' // 编辑时的id
    }
  },
  created () {
    this.id = this.$route.query._id || ''
    this.getTagList()
    this.getCategoryList()

    this.id && this.getArticleById()
  },
  watch: {
    // 标签对象，转为数组
    activeTagIds (newVal, oldVal) {
      this.$set(this.post, 'tags', [...Object.values(newVal)])
    },
    // 分类对象，转为数组
    activeCategoryIds (newVal, oldVal) {
      this.$set(this.post, 'category', [...Object.values(newVal)])
    }
  },
  computed: {
    // 标签长度>= 3, 禁用
    activeTagLen () {
      return Object.keys(this.activeTagNames).length >= 3
    },
    // 分类长度>= 1, 禁用
    activeCategoryLen () {
      return Object.keys(this.activeCategoryNames).length >= 1
    }
  },
  methods: {
    // markdown修改
    editorChange (value, render) {
      this.post.htmlContent = render
    },
    // 添加图片
    // handleUploadImage (pos, $file) {
    //   // 第一步.将图片上传到服务器.
    //   var formdata = new FormData()
    //   formdata.append('file', $file)

    //   uploadImage(formdata).then(res => {
    //     this.$refs.md.$img2Url(pos, this.$url + res.data.url)
    //   })
    // },
    // 上传图片
    handleUploadImage (event, insertImage, files) {
      // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
      var formdata = new FormData()
      formdata.append('photo', files[0])

      uploadImage(formdata).then(res => {
        // this.$refs.md.$img2Url(pos, this.$url + res.data.url)
        // md插入图片
        insertImage({
          url: this.$url + res.data.url,
          desc: res.data.name,
          width: '50%',
          height: '50%'
        })
      })
    },
    // 保存
    showDialog () {
      if (!this.post.mdContent) {
        return this.$msg.warning('文章内容不能为空')
      }
      this.articleDialog = true
    },
    // 标签列表
    getTagList () {
      findTagList().then(res => {
        this.tagList = res.data
      })
    },
    // 分类列表
    getCategoryList () {
      findCategoryList().then(res => {
        this.categoryList = res.data
      })
    },
    // 根据_id查 文章
    getArticleById () {
      const params = {
        admin: true // 为admin, 访问数、不+1
      }
      findArticleById(this.id, params).then(res => {
        const article = res.data

        for (const key in this.post) {
          this.post[key] = article[key]
        }
        // 标签回显
        article.tags.forEach(tag => {
          this.$set(this.activeTagNames, tag.name, true)
          this.$set(this.activeTagIds, tag.name, tag._id)
        })
        // 分类回显
        this.$set(this.activeCategoryNames, article.category.name)
        this.$set(this.activeCategoryIds, article.category.name, article.category._id)
      })
    },
    // dialog 确认
    okClick () {
      if (!this.post.title) {
        return this.$msg.warning('请填写文章标题')
      }
      if (this.post.category.length < 1) {
        return this.$msg.warning('请选择文章分类')
      }
      if (this.post.tags.length < 1) {
        return this.$msg.warning('请选择文章标签')
      }
      if (!this.post.desc) {
        return this.$msg.warning('请填写文章标题描述')
      }

      // 有_id 即为编辑
      if (this.id) {
        EditArticleById(this.id, this.post).then(res => {
          // 修改成功
          this.$msg.success(res.msg)
          this.articleDialog = false
        })
        return
      }
      addArticle(this.post).then(res => {
        this.$msg.success(res.msg)
        this.cancelClick()
      })
    },
    // dialog 取消
    cancelClick () {
      this.articleDialog = false
      this.post = this.$options.data().post
      this.activeTagNames = {}
      this.activeTagIds = {}
      this.activeCategoryNames = {}
      this.activeCategoryIds = {}
    },
    // 点击标签
    clickTag (name, _id) {
      // 不存在,则添加; 已存在,则删除
      // :selected.sync 和activeTag绑定，需处理下未选中时，移除name
      if (!this.activeTagNames[name]) {
        this.removeTag(name)
      } else {
        this.$set(this.activeTagIds, name, _id)
      }
    },
    // 删除标签
    removeTag (name, v) {
      this.$delete(this.activeTagNames, name)
      this.$delete(this.activeTagIds, name)
    },
    // 点击分类
    clickCategory (name, _id) {
      // 不存在,则添加; 已存在,则删除
      // :selected.sync 和activeTag绑定，需处理下未选中时，移除name
      if (!this.activeCategoryNames[name]) {
        this.removeCategory(name)
      } else {
        this.$set(this.activeCategoryIds, name, _id)
      }
    },
    // 删除分类
    removeCategory (name, v) {
      this.$delete(this.activeCategoryNames, name)
      this.$delete(this.activeCategoryIds, name)
    }
  }
}
</script>

<style lang="scss" scoped>
.select-width {
  width: 220px;
}
// 防止选择标签后，高度变化
.fixed-height {
  height: 36px;
  line-height: 36px;
}
.tags-border {
  position: relative;
  border: 1px solid $grey-3;
  transition: All 0.2s ease-in-out;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 12px 2px !important;
  }
  .hover-mask {
    background-color: $grey-1;
    opacity: 0.8;
    z-index: 999;
  }
}
.disable-scroll {
  overflow: hidden;
}
.hover-mask {
  background-color: $grey-1;
  opacity: 0.8;
  z-index: 999;
}
</style>
