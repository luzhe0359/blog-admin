<template>
  <BaseContent>
    <!-- 相册列表 -->
    <q-card :bordered="false" class="q-pa-md" style="box-shadow: none;">
      <!-- 搜索框 -->
      <q-card-section class="q-px-none q-py-sm">
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-y-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
          <q-input type="text" v-model="name" label="相册名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-12" />
          <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading" :class="{'q-mr-sm':$q.screen.lt.md}">
            <template v-slot:loading>
              <q-spinner-facebook />
            </template>
          </q-btn>
          <q-btn label="重 置" type="reset" color="grey" />
          <q-space />
          <q-btn label="添 加" v-if="isZugelu" type="button" color="secondary" @click="addDialogVisible = true" />
        </q-form>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <!-- 表格 -->
        <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="id" :data="albumData" :columns="CategoryColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
          <!-- 无数据 -插槽 -->
          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center q-gutter-sm text-warning">
              <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
          <!-- 文章标签 -->
          <!-- <template v-slot:body-cell-icon="props">
            <q-td :props="props">
              <q-icon size="md" :name="'iconfont ' + props.row.icon"></q-icon>
            </q-td>
          </template> -->
          <!-- 表格内容 -操作插槽 -->
          <template v-slot:body-cell-action="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn v-if="isZugelu" icon="edit" size="sm" flat dense @click="newDialog(props.row)" />
              <q-btn v-if="isZugelu" icon="delete" size="sm" flat dense @click="deleteCategory(props.row._id)" />
              <q-btn v-if="!isZugelu" icon="person_off" size="sm" class="q-ml-sm" flat dense @click="noPermission" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- 添加相册 -->
    <BaseDialog :title="'添加'" :dialogVisible="addDialogVisible" @okClick="onOKClick" @cancelClick="onCancelClick">
      <template v-slot:body>
        <q-input class="full-width" v-model="name" autofocus label="相册名称" />
        <q-input class="full-width" v-model="desc" label="相册描述" filled type="textarea" />
      </template>
    </BaseDialog>
    <!-- 编辑相册 -->
    <BaseDialog :title="'编辑'" :dialogVisible="editDialogVisible" @okClick="okClick" @cancelClick="cancelClick">
      <template v-slot:body>
        <q-input class="full-width" v-model="name" autofocus label="相册名称" />
        <q-input class="full-width" v-model="desc" label="相册描述" filled type="textarea" />
      </template>
    </BaseDialog>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findAlbumList, deleteAlbumById, addAlbum, editAlbumById } from 'src/api/album.js'

export default {
  name: 'photoAlbum',
  data () {
    return {
      name: '', // 相册名称
      desc: '', // 相册描述
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      CategoryColumns: [
        { name: 'name', required: true, label: '名称', align: 'left', field: 'name', format: val => `${val}`, sortable: true },
        { name: 'desc', label: '描述', field: 'desc', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      albumData: [], // 相册列表
      searchLoading: false, // 查询loading
      addDialogVisible: false,
      editDialogVisible: false,
      albumId: ''
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找相册列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        name: this.name,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findAlbumList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.albumData = res.data
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
      this.name = ''
      this.searchLoading = false
    },
    // 删除相册
    deleteCategory (_id) {
      this.$q.dialog({
        title: '删除',
        message: '将删除相册及其包含的图片。确定要删除吗？',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteAlbumById(_id).then((res) => {
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
        name: this.name,
        desc: this.desc
      }
      addAlbum(params).then(res => {
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
      this.addDialogVisible = false
      this.name = ''
      this.desc = ''
    },
    newDialog ({ _id, name, desc }) {
      this.albumId = _id
      this.name = name
      this.desc = desc
      this.editDialogVisible = true
    },
    // dialog 确认
    okClick () {
      const params = {
        name: this.name,
        desc: this.desc
      }

      editAlbumById(this.albumId, params).then(res => {
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
      this.editDialogVisible = false
      this.albumId = ''
      this.name = ''
      this.desc = ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
