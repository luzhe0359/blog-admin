<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 时间轴列表 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
            <q-input type="text" v-model="searchTitle" label="时间线标题" class="col-lg-3 col-md-3 col-sm-6 col-xs-12" />
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
          <q-table class="table" color="primary" :bordered="false" card-style="box-shadow: none;" row-key="_id" :data="timelineData" :columns="CategoryColumns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon v-show="!loading" size="2em" name="sentiment_dissatisfied" />
                <span>
                  {{ message }}
                </span>
              </div>
            </template>
            <!-- 表格内容 -->
            <!-- 操作插槽 -->
            <template v-slot:body-cell-action="props">
              <q-td :props="props" class="q-gutter-x-sm">
                <q-btn v-if="hasBtnPermissions" icon="edit" size="sm" flat dense @click="showDialog(props.row)" />
                <q-btn v-if="hasBtnPermissions" icon="delete" size="sm" flat dense @click="deleteCategory(props.row._id)" />
                <q-btn v-if="!hasBtnPermissions" icon="person_off" size="sm" class="q-ml-sm" flat dense @click="noPermission" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <!-- 添加/编辑 -->
      <BaseDialog :title="'添加'" :dialogVisible="dialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input label="名称" outlined dense class="full-width" v-model="title" autofocus>
            <template v-slot:prepend>
              <q-icon name="bubble_chart" />
            </template>
          </q-input>
          <q-input label="计划完工日期" outlined dense class="full-width" v-model="date">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input label="描述" outlined dense autogrow counter class="full-width" v-model="body" type="textarea">
            <template v-slot:prepend>
              <q-icon name="create" />
            </template>
          </q-input>
          <q-toggle class="q-mt-none" v-model="finish" label="是否完成" left-label />
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import { findTimelineList, addTimeline, editTimelineById, deleteTimelineById } from 'src/api/timeline.js'

export default {
  name: 'timeline',
  data () {
    return {
      searchTitle: '', // 搜索
      title: '', // 时间线名称
      body: '', // 时间线描述
      finish: false, // 是否完成
      date: '',
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      CategoryColumns: [
        { name: 'title', label: '标题', field: 'title', align: 'left' },
        { name: 'body', label: '内容', field: 'body', align: 'left' },
        { name: 'finish', label: '是否完成', field: 'finish', align: 'center', format: val => val ? '是' : '否' },
        { name: 'date', label: '计划完成时间', field: 'date', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      timelineData: [], // 时间线列表
      searchLoading: false, // 查询loading
      dialogVisible: false,
      dialogTitle: '添加',
      timelineId: '' // 编辑id
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找照片列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      const params = {
        title: this.searchTitle,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findTimelineList(params).then(res => {
        this.searchLoading = false // 关闭查询按钮loading

        this.timelineData = res.data
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
      this.searchTitle = ''
      this.searchLoading = false
    },
    // 删除
    deleteCategory (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该时间线吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteTimelineById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
      })
    },
    // 展示弹框
    showDialog ({ _id, title, body, finish, date }) {
      this.dialogVisible = true
      if (!_id) { // 有_id 为编辑，反之添加
        this.dialogTitle = '添加'
        return
      }
      this.dialogTitle = '编辑'

      this.title = title
      this.body = body
      this.date = date
      this.finish = finish
      this.timelineId = _id
    },
    // dialog 确认
    okClick () {
      const params = {
        title: this.title,
        body: this.body,
        date: this.date,
        finish: this.finish
      }
      // 添加
      if (this.dialogTitle === '添加') {
        addTimeline(params).then(res => {
          this.$msg.success(res.msg)
          this.cancelClick()
          this.request({
            pagination: this.pagination
          })
        })
        return
      }
      // 编辑
      editTimelineById(this.timelineId, params).then(res => {
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
      this.timelineId = ''
      this.title = ''
      this.date = ''
      this.body = ''
      this.finish = false
    }
  }
}
</script>

<style lang="scss" scoped>
// 内容换行
::v-deep .q-table tbody td:nth-child(2) {
  min-width: 500px;
  white-space: break-spaces;
}
</style>
