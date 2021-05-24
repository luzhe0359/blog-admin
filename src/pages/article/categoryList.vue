<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm row items-end">
            <q-input type="text" v-model="name" label="分类名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-10" />
            <q-btn label="查 询" type="submit" color="primary" :disable="searchLoading" :loading="searchLoading">
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
            <q-space />
            <q-btn label="添 加" type="button" color="secondary" @click="openDialog" />
          </q-form>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <!-- 表格 -->
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="id" :data="categoryData" :columns="CategoryColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
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
            <template v-slot:body-cell-icon="props">
              <q-td :props="props">
                <q-icon size="md" :name="'iconfont ' + props.row.icon"></q-icon>
              </q-td>
            </template>
            <!-- 表格内容 -操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn icon="edit" size="sm" flat dense @click="openDialog(props.row)" />
                <q-btn icon="delete" size="sm" flat dense @click="deleteCategory(props.row._id)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 添加/编辑 -->
      <BaseDialog :title="dialogTitle" :dialogVisible="dialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input class="full-width" v-model="name" autofocus label="分类名称" />
          <q-input class="full-width" v-model="icon" label="图标名称" />
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findCategoryList, deleteCategoryById, addCategory, editCategoryById } from 'src/api/category.js'

export default {
  name: 'categoryList',
  data () {
    return {
      name: '', // 分类名称
      icon: '',
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
        { name: 'icon', label: '图标', field: 'icon', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      categoryData: [], // 分类列表
      searchLoading: false, // 查询loading
      dialogVisible: false,
      dialogTitle: '添加',
      categoryId: ''
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找分类列表
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
      findCategoryList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.categoryData = res.data
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
      this.icon = ''
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
        deleteCategoryById(_id).then((res) => {
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
    // 展示弹框
    openDialog ({ _id, name, icon }) {
      this.dialogVisible = true
      if (!_id) {
        this.dialogTitle = '添加'
        return
      }

      this.categoryId = _id
      this.name = name
      this.icon = icon
      this.dialogTitle = '编辑'
    },
    // dialog 确认
    okClick () {
      if (this.dialogTitle === '添加') {
        return this.add()
      }
      this.edit()
    },
    // 添加分类
    add () {
      const params = {
        name: this.name,
        icon: this.icon
      }
      addCategory(params).then(res => {
        // 添加成功
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
    edit () {
      const params = {
        name: this.name,
        icon: this.icon
      }
      editCategoryById(this.categoryId, params).then(res => {
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
      this.categoryId = ''
      this.name = ''
      this.icon = ''
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>