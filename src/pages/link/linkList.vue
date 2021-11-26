<template>
  <BaseContent>
    <div class="q-pa-md">
      <!-- 主体 -->
      <q-card :bordered="false" style="box-shadow: none;">
        <!-- 搜索框 -->
        <q-card-section class="q-px-none q-py-sm">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-y-sm row items-end" :class="{'q-gutter-sm':$q.screen.gt.sm}">
            <q-input type="text" v-model="searchTitle" label="网站名称" class="col-lg-3 col-md-3 col-sm-6 col-xs-12" />
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
          <q-table color="primary" :bordered="false" card-style="box-shadow: none;" row-key="_id" :data="linkData" :columns="columns" :loading="loading" :pagination.sync="pagination" rows-per-page-label="每页条数:" :rows-per-page-options="[5, 10, 20, 50, 0]" :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} / ${totalRowsNumber}`" no-data-label="很抱歉, 没有查询到您想要的结果 . . ." @request="request" binary-state-sort>
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
            <!-- 图标插槽 -->
            <template v-slot:body-cell-logo="props">
              <q-td :props="props">
                <q-avatar round size="80px">
                  <q-img no-default-spinner transition="slide-down" :src="props.row.logo" :placeholder-src="$BASE_IMG_URL" />
                </q-avatar>
              </q-td>
            </template>
            <!-- 置顶插槽 -->
            <template v-slot:body-cell-isTop="props">
              <q-td :props="props">
                <q-toggle v-model="props.row.isTop" color="primary" keep-color @input="toggleHandler($event,props.row, 'isTop')" />
              </q-td>
            </template>
            <!-- 停用插槽 -->
            <template v-slot:body-cell-isStop="props">
              <q-td :props="props">
                <q-toggle v-model="props.row.isStop" color="primary" keep-color @input="toggleHandler($event,props.row, 'isStop')" />
              </q-td>
            </template>
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
      <BaseDialog :title="dialogTitle" :dialogVisible="dialogVisible" @okClick="okClick" @cancelClick="cancelClick">
        <template v-slot:body>
          <q-input label="名称" outlined dense class="full-width" v-model="title" autofocus maxlength="10">
            <template v-slot:prepend>
              <q-icon name="bubble_chart" />
            </template>
          </q-input>
          <q-input label="链接" outlined dense class="full-width" v-model="url">
            <template v-slot:prepend>
              <q-icon class="rotate-135" name="attachment" />
            </template>
          </q-input>
          <q-input label="描述" outlined dense class="full-width" v-model="desc" maxlength='20'>
            <template v-slot:prepend>
              <q-icon name="create" />
            </template>
          </q-input>
          <q-input label="logo" outlined dense class="full-width" v-model="logo">
            <template v-slot:prepend>
              <q-icon name="flutter_dash" />
            </template>
          </q-input>
        </template>
      </BaseDialog>
    </div>
  </BaseContent>
</template>

<script>
import { findLinkList, addLink, editLinkById, deleteLinkById } from 'src/api/link.js'
import { date } from 'quasar'

export default {
  name: 'linkList',
  data () {
    return {
      searchTitle: '', // 搜索
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
        { name: 'isTop', label: '置顶', field: 'isTop', align: 'center', sortable: true },
        { name: 'isStop', label: '停用', field: 'isStop', align: 'center' },
        { name: 'createTime', label: '创建时间', field: 'createTime', align: 'center', sortable: true, format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'action', label: '操作', field: 'action', align: 'center' }
      ],
      linkData: [], // 友链列表
      searchLoading: false, // 查询loading
      dialogVisible: false,
      dialogTitle: '添加',
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
        title: this.searchTitle,
        pageNum: page,
        pageSize: rowsPerPage,
        sortBy: sortBy,
        descending: descending ? 1 : -1
      }
      findLinkList(params).then(res => {
        this.searchLoading = false

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
      this.searchTitle = ''
      this.searchLoading = false
    },
    // 删除友链
    deleteCategory (_id) {
      this.$q.dialog({
        title: '删除',
        message: '确定要删除该友链吗?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteLinkById(_id).then((res) => {
          this.request({
            pagination: this.pagination
          })
          this.$msg.success(res.msg)
        }).catch((err) => {
          throw new Error(err)
        })
      }).onOk(() => {
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    // 展示弹框
    showDialog ({ _id, title, url, desc, logo }) {
      this.dialogVisible = true
      if (!_id) { // 判断有无_id，有_id编辑，反之添加
        this.dialogTitle = '添加'
        return
      }
      this.dialogTitle = '编辑'

      this.title = title
      this.url = url
      this.desc = desc
      this.logo = logo
      this.linkId = _id
    },
    // dialog 确认
    okClick () {
      const params = {
        title: this.title,
        url: this.url,
        desc: this.desc,
        logo: this.logo
      }
      // 添加
      if (this.dialogTitle === '添加') {
        addLink(params).then(res => {
          this.$msg.success(res.msg)
          this.cancelClick()
          this.request({
            pagination: this.pagination
          })
        })
        return
      }
      // 编辑
      editLinkById(this.linkId, params).then(res => {
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
      this.linkId = ''
      this.title = ''
      this.url = ''
      this.desc = ''
      this.logo = ''
    },
    // 是否置顶/停用
    toggleHandler (toggle, row, param) {
      const cancel = toggle ? '' : '取消'
      const TopOrStop = param === 'isTop' ? '置顶' : '停用'
      this.$q.dialog({
        title: '编辑',
        message: `确定要${cancel}${TopOrStop}该条友链吗？`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.loading = true
        const params = {}
        params[param] = toggle
        console.log(params)
        // 编辑
        editLinkById(row._id, params).then(res => {
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
