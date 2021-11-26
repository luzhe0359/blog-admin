/**
 * main boot file
 */
// import _router from '../router/permission'
import '../components/ECharts/EChartsConfig'
import '../components/Markdown/Markdown'
import '../quasar.manage.config'
import './notify' // quasar 设置默认值
import './filter'

import { handleBaiduStatistics } from 'src/utils/CloneUtils'
import mixin from 'src/mixins/mixin'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ app, router, Vue, publicPath }) => {
  Vue.mixin(mixin)
  handleBaiduStatistics()
}
