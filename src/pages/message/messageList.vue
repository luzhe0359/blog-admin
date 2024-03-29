<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 主体 -->
      <q-card :bordered="false" style="box-shadow: none">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form
            @submit="onSubmit"
            @reset="onReset"
            class="q-gutter-sm row items-end"
          >
            <q-input
              type="text"
              v-model="content"
              label="评论内容"
              class="col-lg-3 col-md-3 col-sm-6 col-xs-10"
            />
            <q-btn
              label="查 询"
              type="submit"
              color="primary"
              :disable="searchLoading"
              :loading="searchLoading"
            >
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
            <q-btn label="重 置" type="reset" color="grey" />
          </q-form>
        </q-card-section>
        <!-- 表格 -->
        <q-card-section class="q-pa-none">
          <q-table
            color="primary"
            :bordered="false"
            card-style="box-shadow: none;"
            row-key="_id"
            :data="data"
            :columns="commentColumns"
            :loading="loading"
            :pagination.sync="pagination"
            rows-per-page-label="每页条数:"
            :rows-per-page-options="[5, 10, 20, 50, 0]"
            :pagination-label="
              (firstRowIndex, endRowIndex, totalRowsNumber) =>
                `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`
            "
            no-data-label="很抱歉, 没有查询到您想要的结果 . . ."
            @request="request"
            binary-state-sort
          >
            <!-- 无数据 -插槽 -->
            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center q-gutter-sm text-warning">
                <q-icon
                  v-show="!loading"
                  size="2em"
                  name="sentiment_dissatisfied"
                />
                <span>
                  {{ message }}
                </span>
              </div>
            </template>
            <!-- 表格内容 -->
            <!-- 扩展行插槽 -->
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
                <!-- 表头 操作列 -->
                <q-th class="text-center">操作</q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td>
                  <q-btn
                    v-if="props.row.otherComments.length > 0"
                    size="sm"
                    color="primary"
                    round
                    flat
                    dense
                    @click="props.expand = !props.expand"
                    :icon="props.expand ? 'remove' : 'add'"
                  />
                </q-td>
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
                <!-- 表体 操作列 -->
                <q-td class="row justify-center items-center no-wrap">
                  <CommentState
                    v-if="hasBtnPermissions"
                    :state="props.row.state"
                    @stateChange="changeState($event, props.row)"
                  />
                  <q-btn
                    v-if="hasBtnPermissions"
                    icon="delete"
                    size="sm"
                    flat
                    dense
                    @click="deleteHandler(props.row._id)"
                  />
                  <q-btn
                    v-if="!hasBtnPermissions"
                    icon="person_off"
                    size="sm"
                    class="q-ml-sm"
                    flat
                    dense
                    @click="noPermission"
                  />
                </q-td>
              </q-tr>
              <!-- 子评论 -->
              <q-tr
                class="bg-grey-2"
                v-show="props.expand"
                :props="props"
                v-for="child in props.row.otherComments"
                :key="child._id"
              >
                <q-td></q-td>
                <!-- 评论用户 -->
                <q-td class="text-center"> {{ child.from.nickname }}</q-td>
                <!-- 评论内容 -->
                <q-td class="text-center">{{ child.content }} </q-td>
                <!-- 评论时间 -->
                <q-td class="text-center">
                  {{ child.createTime | dateFormat }}
                </q-td>
                <!-- 操作 -->
                <q-td class="row justify-center items-center no-wrap">
                  <CommentState
                    v-if="hasBtnPermissions"
                    :state="child.state"
                    @stateChange="changeState($event, props.row, child._id)"
                  />
                  <q-btn
                    v-if="hasBtnPermissions"
                    icon="delete"
                    size="sm"
                    flat
                    dense
                    @click="$q.notify('请删除上级评论 .')"
                  />
                  <q-btn
                    v-if="!hasBtnPermissions"
                    icon="person_off"
                    size="sm"
                    class="q-ml-sm"
                    flat
                    dense
                    @click="noPermission"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </BaseContent>
</template>

<script>
import { date } from 'quasar'
import CommentState from 'components/Comment/CommentState.vue'
import { findMessageList, deleteMessageById, changeMessageState } from 'src/api/message.js'

export default {
  name: 'articleComment',
  components: {
    CommentState
  },
  data () {
    return {
      content: '', // 评论名称
      name: '',
      loading: true, // 表格loading
      pagination: {
        sortBy: 'createTime', // 排序方式, 按照哪个字段排序
        descending: false, // 是否按降序排序
        page: 1, // 页码
        rowsPerPage: 10, // 每页多少行, 0表示无限
        rowsNumber: 10 // 总行数
      },
      commentColumns: [
        { name: '_id', label: '评论用户', field: 'from', align: 'center', sortable: true, format: val => val.nickname },
        { name: 'content', label: '评论内容', field: 'content', align: 'center' },
        { name: 'createTime', label: '评论时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') }
        // { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      data: [], // 评论列表
      searchLoading: false, // 查询loading
      stateOptions: [
        { label: '待审核', value: 0 },
        { label: '已通过', value: 1 },
        { label: '未通过', value: -1 }
      ]
    }
  },
  mounted () {
    this.request({
      pagination: this.pagination
    })
  },
  methods: {
    // 查找评论列表
    request (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.loading = true
      const params = {
        content: this.content,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        type: 2, // 留言
        descending: descending ? 1 : -1
      }
      findMessageList(params)
        .then(res => {
          this.searchLoading = false // 关闭查询按钮loading

          this.data = res.data
          this.pagination.page = page
          this.pagination.rowsPerPage = rowsPerPage
          this.pagination.sortBy = sortBy
          this.pagination.descending = descending
          this.pagination.rowsNumber = res.total

          this.loading = false
        })
        .catch(err => {
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
      this.content = ''
      this.searchLoading = false
    },
    // 删除评论
    deleteHandler (_id) {
      this.$q
        .dialog({
          title: '删除',
          message: '确定要删除该评论吗?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          deleteMessageById(_id)
            .then(res => {
              this.request({
                pagination: this.pagination
              })
              // 删除成功
              this.$msg.success(res.msg)
            })
            .catch(err => {
              throw new Error(err)
            })
        })
        .onOk(() => { })
        .onCancel(() => { })
        .onDismiss(() => { })
    },
    // 更改评论状态
    changeState (state, row, otherCommentId) {
      const params = {
        state,
        otherCommentId
      }
      changeMessageState(row._id, params).then(res => {
        // 修改状态成功
        this.$msg.success(res.msg)
        if (!otherCommentId) {
          return this.$set(row, 'state', res.data.state)
        }
        // 子评论
        this.$set(row, 'otherComments', res.data.otherComments)
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
