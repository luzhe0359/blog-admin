<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 照片列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-y-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
            <q-select clearable color="teal" label="相册选择" options-selected-class="text-deep-orange" v-model="albumId" :options="albumList" option-value="_id" option-label="name" emit-value map-options class="col-lg-3 col-md-3 col-sm-6 col-xs-12"></q-select>
            <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading" :class="{'q-mr-sm':$q.screen.lt.md}">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
            <q-space />
            <q-btn v-if="hasBtnPermissions" label="上 传" type="button" color="secondary" @click="uploadDialogVisible = true" :class="{'q-mr-sm':$q.screen.lt.md}" />
            <q-btn v-if="hasBtnPermissions" label="添 加" type="button" color="secondary" @click="addDialogVisible = true" />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="_id" :data="photoData" :columns="CategoryColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
                <span>{{ message }}</span>
              </div>
            </template>
            <!-- 表格内容 -->
            <!-- 图片 -->
            <template v-slot:body-cell-url="props">
              <q-td :props="props">
                <q-avatar rounded size="80px">
                  <q-img transition="slide-down" :src="props.row.url" :placeholder-src="$BASE_IMG_URL" spinner-color="white" />
                </q-avatar>
              </q-td>
            </template>
            <!-- 操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn v-if="hasBtnPermissions" icon="delete" size="sm" flat dense @click="handleDelete(props.row._id)" />
                <q-btn v-if="!hasBtnPermissions" icon="person_off" size="sm" class="q-ml-sm" flat dense @click="noPermission" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 添加相册 -->
      <BaseDialog :title="'添加相册'" :dialogVisible="addDialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input label="名称" outlined dense class="full-width" v-model="name" autofocus>
            <template v-slot:prepend>
              <q-icon name="bubble_chart" />
            </template>
          </q-input>
          <q-input label="描述" outlined dense autogrow counter class="full-width" v-model="desc" type="textarea">
            <template v-slot:prepend>
              <q-icon name="create" />
            </template>
          </q-input>
        </template>
      </BaseDialog>
      <!-- 添加照片 -->
      <BaseDialog :title="'图片上传'" :dialogVisible="uploadDialogVisible" @okClick="okUpload" @cancelClick="cancelUpload">
        <template v-slot:body>
          <q-select label="选择相册" outlined dense clearable color="teal" options-selected-class="text-deep-orange" v-model="uploadAblum" :options="albumList" option-value="_id" option-label="name" emit-value map-options class="full-width">
            <template v-slot:prepend>
              <q-icon name="photo_library" />
            </template>
          </q-select>
          <q-uploader v-show="uploadAblum" :url="`${$url}/api/photo/uploads?albumId=${uploadAblum}&classify=album`" :headers="[ {name: 'Authorization', value: `Bearer ${token}`}
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
        { name: 'name', label: '名称', field: 'name', align: 'left' },
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
      albumList: [], // 相册列表 下拉框
      uploadAblum: '' // 绑定上传 下拉框
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
    this.getAblumList()
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
      this.searchLoading = false
    },
    // 删除
    handleDelete (_id) {
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
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
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
        this.$msg.success(res.msg)
        this.cancelClick()
        this.request({
          pagination: this.pagination
        })
        this.getAblumList()
      })
    },
    // dialog 取消
    cancelClick () {
      this.addDialogVisible = false
      this.name = ''
      this.desc = ''
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
    // 上传图片
    finishUpload (file) {
      const res = JSON.parse(file.xhr.response)
      if (res.code === 2000) {
        this.$msg.success(res.msg)
        this.request({
          pagination: this.pagination
        })
        this.uploadDialogVisible = false
      }
    },
    // 获取相册列表
    getAblumList () {
      findAlbumList().then(res => {
        this.albumList = res.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
