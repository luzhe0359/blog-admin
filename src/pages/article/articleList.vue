<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 文章列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-y-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
            <q-input type="text" v-model="title" label="文章名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-12" />
            <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading" :class="{'q-mr-sm':$q.screen.lt.md}">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="_id" :data="articleData" :columns="ArticleColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
                <span>{{ message }}</span>
              </div>
            </template>
            <!-- 表格内容 -->
            <!-- 头像插槽 -->
            <template v-slot:body-cell-imgCover="props">
              <q-td :props="props">
                <q-avatar rounded size="80px">
                  <q-img no-default-spinner transition="slide-down" :src="props.row.imgCover" :placeholder-src="$BASE_IMG_URL" />
                </q-avatar>
              </q-td>
            </template>
            <!-- 文章类型 -->
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                {{props.row.type | articleType}}
              </q-td>
            </template>
            <!-- 文章状态 -->
            <template v-slot:body-cell-state="props">
              <q-td :props="props">
                {{props.row.state | articleState}}
              </q-td>
            </template>
            <!-- 文章标签 -->
            <template v-slot:body-cell-tags="props">
              <q-td :props="props">
                <q-chip outline :size="$q.screen.lt.sm ? 'sm':'md'" color="primary" v-for="item in props.row.tags" :key="item._id">
                  {{item.name}}
                </q-chip>
              </q-td>
            </template>
            <!-- 文章标签 -->
            <!-- 置顶插槽 -->
            <template v-slot:body-cell-isTop="props">
              <q-td :props="props">
                <q-toggle v-model="props.row.isTop" color="primary" keep-color @input="toggleHandler($event,props.row)" />
              </q-td>
            </template>
            <!-- 操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn icon="search" size="sm" flat dense :to="`/article/detail/${props.row._id}`" />
                <q-btn v-if="isAuthor(props.row.author._id) || hasBtnPermissions" icon="edit" size="sm" flat dense :to="{name:'articleWrite',query:{_id:props.row._id}}" />
                <q-btn v-if="hasBtnPermissions" icon="delete" size="sm" flat dense @click="deleteArticle(props.row._id)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findArticleList, editArticleById, deleteArticleById } from 'src/api/article.js'

export default {
  name: 'articleList',
  data () {
    return {
      title: '', // 文章名称
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      ArticleColumns: [
        { name: 'title', required: true, label: '标题', align: 'left', field: 'title', sortable: true },
        { name: 'category', label: '分类', field: 'category', align: 'center', format: val => val && val.name },
        { name: 'imgCover', label: '封面', field: 'imgCover', align: 'center' },
        { name: 'tags', label: '标签', field: 'tags', align: 'center' },
        { name: 'type', label: '类型', field: 'type', align: 'center' },
        { name: 'state', label: '发布状态', field: 'state', align: 'center' },
        { name: 'author', label: '作者', field: 'author', align: 'center', format: val => val && val.nickname },
        { name: 'meta.likes', label: '点赞数', field: 'meta', align: 'center', sortable: true, format: val => val && val.likes },
        { name: 'meta.comments', label: '评论数', field: 'meta', align: 'center', sortable: true, format: val => val && val.comments },
        { name: 'meta.views', label: '浏览量', field: 'meta', align: 'center', sortable: true, format: val => val && val.views },
        { name: 'isTop', label: '置顶', field: 'isTop', align: 'center', sortable: true },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      articleData: [], // 用户列表
      searchLoading: false // 查询loading
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  computed: {
    isAuthor () {
      return function (_id) {
        return _id === sessionStorage.getItem('user_id')
      }
    }
  },
  methods: {
    // 查找文章列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        title: this.title,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findArticleList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.articleData = res.data
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
      this.title = ''
      this.searchLoading = false
    },
    // 删除文章
    deleteArticle (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该文章吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteArticleById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
      })
    },
    // 是否置顶
    toggleHandler (toggle, row) {
      const cancel = toggle ? '' : '取消'
      this.$q.dialog({
        title: '编辑',
        message: `确定要${cancel}置顶该条友链吗？`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.loading = true
        // 编辑
        editArticleById(row._id, { isTop: toggle }).then(res => {
          this.loading = false
          this.$msg.success(res.msg)
        }).catch(() => {
          this.loading = false
        })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
        row.isTop = !toggle
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
