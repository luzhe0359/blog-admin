<template>
  <q-page class="q-pa-md">
    <!-- 主体 -->
    <q-card :bordered="false" style="box-shadow: none;">
      <!-- 搜索框 -->
      <q-card-section class="q-px-none q-py-sm">
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm row items-end">
          <q-input type="text" v-model="title" label="文章名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-10" />
          <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading">
            <template v-slot:loading>
              <q-spinner-facebook />
            </template>
          </q-btn>
          <q-btn label="重 置" type="reset" color="grey" />
          <q-space />
          <q-btn label="添 加" type="button" color="secondary" @click="albumDialog = true" />
        </q-form>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <!-- 表格 -->
        <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="id" :data="linkData" :columns="columns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
          <!-- 无数据 -插槽 -->
          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center q-gutter-sm text-warning">
              <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
          <!-- 表格内容 -头像插槽 -->
          <template v-slot:body-cell-logo="props">
            <q-td :props="props">
              <q-avatar round size="48px">
                <img :src="`${$url}${props.row.logo}`" />
              </q-avatar>
            </q-td>
          </template>
          <!-- 表格内容 -操作插槽 -->
          <template v-slot:body-cell-action="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn icon="edit" size="sm" flat dense @click="newDialog(props.row)" />
              <q-btn icon="delete" size="sm" flat dense @click="deleteCategory(props.row._id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- 添加分类 -->
    <q-dialog ref="dialog" v-model="albumDialog">
      <q-card :style="$q.screen.lt.md? 'width:90vw':'width: 50vw'">
        <q-card-section class="q-pa-sm">
          <div class="text-h6 q-ma-xs">添加</div>
        </q-card-section>
        <!-- <q-separator inset /> -->
        <q-card-actions class="q-px-md">
          <q-input class="full-width" v-model="title" autofocus label="名称" />
          <q-input class="full-width" v-model="url" label="链接" />
          <q-input class="full-width" v-model="desc" label="描述" maxlength='20' />
          <div class="row no-wrap q-py-md">
            <div class="q-mr-md">logo:</div>
            <q-uploader :url="`${$url}/photo/upload`" :headers="[ {name: 'Authorization', value: `Bearer ${token}`}
        ]" field-name='photo' multiple batch max-files="1" @uploaded="finishUpload" style="width:200px; height: 200px;" />
          </div>
        </q-card-actions>
        <!-- 按钮示例 -->
        <q-card-actions align="right">
          <q-btn flat color="grey" label="取消" @click="onCancelClick" />
          <q-btn color="primary" label="保存" @click="onOKClick" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <BaseDialog :title="'编辑'" :dialogVisible="dialogVisible" @okClick="okClick" @cancelClick="cancelClick">
      <template v-slot:body>
        <q-input class="full-width" v-model="title" autofocus label="名称" />
        <q-input class="full-width" v-model="url" label="链接" />
        <q-input class="full-width" v-model="desc" label="描述" maxlength='20' />
        <q-uploader :url="`${$url}/photo/upload`" :headers="[ {name: 'Authorization', value: `Bearer ${token}`}
        ]" field-name='photo' multiple batch max-files="10" @uploaded="finishUpload" style="width:100%; height: 500px;" />
      </template>
    </BaseDialog>
  </q-page>
</template>

<script>
import { findLinkList, addLink, editLinkById, deleteLinkById } from 'src/api/link.js'
import { date } from 'quasar'
import { getToken } from 'src/utils/auth.js'

export default {
  name: 'linkList',
  data () {
    return {
      token: getToken(),
      title: '', // 友链名称
      desc: '', // 友链描述
      url: '', //  友链地址
      logo: '', // 友链logo
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      columns: [ // 列表展示
        { name: 'title', label: '标题', field: 'title', align: 'left' },
        { name: 'desc', label: '简介', field: 'desc', align: 'center' },
        { name: 'logo', label: '图标', field: 'logo', align: 'center' },
        { name: 'url', label: '链接', field: 'url', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      linkData: [], // 友链列表
      searchLoading: false, // 查询loading
      albumDialog: false,
      dialogVisible: false,
      UploadDialogVisible: false,
      linkId: '' // 编辑id
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找友链列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findLinkList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.linkData = res.data
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
      this.desc = ''
      this.url = ''
      this.logo = ''
      this.searchLoading = false
    },
    // 删除分类
    deleteCategory (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该分类吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteLinkById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          // 删除成功
          this.$q.notify({
            message: res.msg,
            color: 'primary'
          })
        }).catch((err) => {
          throw new Error(err)
        })
      }).onOk(() => {
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    // dialog 确认
    onOKClick () {
      const params = {
        title: this.title,
        url: this.url,
        desc: this.desc,
        logo: this.logo
      }
      addLink(params).then(res => {
        // 添加成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
        this.onCancelClick()
        this.request({
          pagination: this.pagination
        })
      })
    },
    // dialog 取消
    onCancelClick () {
      this.albumDialog = false
      this.title = ''
      this.url = ''
      this.desc = ''
      this.logo = ''
    },
    newDialog ({ _id, title, url, desc, logo }) {
      this.title = title
      this.url = url
      this.desc = desc
      this.logo = logo
      this.linkId = _id
      this.dialogVisible = true
    },
    // dialog 确认
    okClick () {
      const params = {
        title: this.title,
        url: this.url,
        desc: this.desc,
        logo: this.logo
      }

      editLinkById(this.linkId, params).then(res => {
        // 编辑成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
        this.cancelClick()
        this.request({
          pagination: this.pagination
        })
      })
    },
    // dialog 取消
    cancelClick () {
      this.dialogVisible = false
      this.title = ''
      this.url = ''
      this.desc = ''
      this.logo = ''
    },
    // 上传图片事件
    finishUpload (file) {
      const res = JSON.parse(file.xhr.response)
      this.logo = res.data.url
      if (res.code === 2000) {
        // 上传成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
        // 然后隐藏对话框
        this.avatarDialog = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
