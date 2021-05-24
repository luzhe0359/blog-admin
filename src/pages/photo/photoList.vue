<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 照片列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm row items-end">
            <q-select clearable color="teal" label="相册选择" options-selected-class="text-deep-orange" v-model="albumId" :options="albumList" option-value="_id" option-label="name" emit-value map-options class="col-lg-3 col-md-3 col-sm-6 col-xs-10"></q-select>
            <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
            <q-space />
            <q-btn label="上 传" type="button" color="secondary" @click="uploadDialogVisible = true" />
            <q-btn label="添 加" type="button" color="secondary" @click="addDialogVisible = true" />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="id" :data="photoData" :columns="CategoryColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
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
            <template v-slot:body-cell-url="props">
              <q-td :props="props">
                <q-img :src="props.row.url | imgBaseUrl" spinner-color="white" style="width: 120px;height: 120px;" />
              </q-td>
            </template>
            <!-- 表格内容 -操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn icon="delete" size="sm" flat dense @click="deleteCategory(props.row._id)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 添加相册 -->
      <BaseDialog :title="'添加'" :dialogVisible="addDialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input class="full-width" v-model="name" autofocus label="相册名称" />
          <q-input class="full-width" v-model="desc" label="相册描述" filled type="textarea" />
        </template>
      </BaseDialog>
      <!-- 添加照片 -->
      <BaseDialog :title="'图片上传'" :dialogVisible="uploadDialogVisible" @okClick="okUpload" @cancelClick="cancelUpload">
        <template v-slot:body>
          <q-select filled clearable color="teal" label="相册选择" options-selected-class="text-deep-orange" v-model="uploadAblum" :options="albumList" option-value="_id" option-label="name" emit-value map-options class="col-12"></q-select>
          <q-uploader :url="`${$url}/photo/uploads?albumId=${uploadAblum}`" :headers="[ {name: 'Authorization', value: `Bearer ${token}`}
        ]" field-name='photo' multiple batch max-files="10" @uploaded="finishUpload" style="width:100%; height: 500px;" />
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { findPhotoList, deletePhotoById } from 'src/api/photo.js'
import { findAlbumList, addAlbum } from 'src/api/album.js'
import { date } from 'quasar'
import { getToken } from 'src/utils/auth.js'

export default {
  name: 'photoList',
  data () {
    return {
      token: getToken(),
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
        { name: 'id', label: '序号', field: 'id', align: 'left' },
        { name: 'url', label: '图片', field: 'url', align: 'center' },
        { name: 'size', label: '大小', field: 'size', align: 'center', format: val => ((val / 1024).toFixed(2) + 'kb') },
        { name: 'type', label: '类型', field: 'type', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      photoData: [], // 照片列表
      searchLoading: false, // 查询 loading
      addDialogVisible: false, // 添加 dialog
      uploadDialogVisible: false, // 上传 dialog
      albumId: '', //  绑定相册 下拉框
      albumList: [], // 相册 下拉框
      uploadAblum: '' // 绑定上传 下拉框
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })

    // 获取相册
    findAlbumList().then(res => {
      this.albumList = res.data
    })
  },
  methods: {
    // 查找照片列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        albumId: this.albumId,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findPhotoList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.photoData = res.data
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
      this.albumId = ''
      this.desc = ''
      this.searchLoading = false
    },
    // 删除相册
    deleteCategory (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该照片吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deletePhotoById(_id).then((res) => {
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
    okClick () {
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
    cancelClick () {
      this.addDialogVisible = false
      this.name = ''
    },
    // Upload dialog 确认
    okUpload () {
      this.uploadAblum = ''
      this.uploadDialogVisible = false
    },
    // Upload dialog 取消
    cancelUpload () {
      this.uploadAblum = ''
      this.uploadDialogVisible = false
    },
    // 上传图片事件
    finishUpload (file) {
      const res = JSON.parse(file.xhr.response)
      if (res.code === 2000) {
        // 上传成功
        this.$q.notify({
          message: res.msg,
          color: 'primary'
        })
        this.request({
          pagination: this.pagination
        })
        // 然后隐藏对话框
        this.uploadDialogVisible = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
