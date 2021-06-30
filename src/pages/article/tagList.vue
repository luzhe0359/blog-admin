<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 标签列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-y-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
            <q-input type="text" v-model="searchName" label="标签名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-12" />
            <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading" :class="{'q-mr-sm':$q.screen.lt.md}">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
            <q-space />
            <q-btn label="添 加" v-if="hasBtnPermissions" type="button" color="secondary" @click="showDialog" />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="_id" :data="TagData" :columns="TagColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
                <span>
                  {{ message }}
                </span>
              </div>
            </template>
            <!-- 表格内容 -操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn v-if="hasBtnPermissions" icon="edit" size="sm" flat dense @click="showDialog(props.row)" />
                <q-btn v-if="hasBtnPermissions" icon="delete" size="sm" flat dense @click="deleteTag(props.row._id)" />
                <q-btn v-if="!hasBtnPermissions" icon="person_off" size="sm" class="q-ml-sm" flat dense @click="noPermission" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 添加/编辑 -->
      <BaseDialog :title="dialogTitle" :dialogVisible="dialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input label="名称" outlined dense class="full-width" v-model="name" autofocus>
            <template v-slot:prepend>
              <q-icon name="bubble_chart" />
            </template>
          </q-input>
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findTagList, deleteTagById, addTag, editTagById } from 'src/api/tag.js'

export default {
  name: 'tagList',
  data () {
    return {
      searchName: '', // 搜索
      name: '', // 标签名称
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      TagColumns: [
        {
          name: 'name', // 唯一的ID
          required: true, // （可选）如果我们使用可见列，这个列将始终可见
          label: '名称', // 头部标签
          align: 'left', // 对齐方式
          field: 'name', // 行对象属性以确定此列的值，或field: row => row.some.nested.prop
          format: val => `${val}`, // （可选）您可以使用函数格式化数据
          sortable: true // （可选）告诉QTable你想要这个列可排序
        },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      TagData: [], // 标签列表
      searchLoading: false, // 查询loading
      dialogTitle: '添加',
      dialogVisible: false,
      tagId: ''
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找标签列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        name: this.searchName,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findTagList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.TagData = res.data
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
      this.searchName = ''
      this.searchLoading = false
    },
    // 删除标签
    deleteTag (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该标签吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteTagById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          // 删除成功
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
      })
    },
    // 展示弹框
    showDialog ({ _id, name }) {
      this.dialogVisible = true
      if (!_id) { // 有_id 为编辑，反之添加
        this.dialogTitle = '添加'
        return
      }
      this.dialogTitle = '编辑'

      this.tagId = _id
      this.name = name
    },
    // dialog 确认
    okClick () {
      const params = {
        name: this.name
      }
      // 添加
      if (this.dialogTitle === '添加') {
        addTag(params).then(res => {
          this.$msg.success(res.msg)
          this.cancelClick()
          this.request({
            pagination: this.pagination
          })
        })
        return
      }
      // 编辑
      editTagById(this.tagId, params).then(res => {
        this.$msg.success(res.msg)
        this.cancelClick()
        this.request({
          pagination: this.pagination
        })
      })
    },
    // dialog 取消
    cancelClick () {
      this.dialogVisible = false
      this.tagId = ''
      this.name = ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
