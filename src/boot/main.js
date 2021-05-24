/**
 * main boot file
 */
// import _router from '../router/permission'
import '../components/ECharts/EChartsConfig'
import '../components/Markdown/Markdown'
import '../quasar.manage.config'
import '../axios/FetchData'
import './filter'
import { handleBaiduStatistics } from 'src/utils/CloneUtils'
import mixin from 'src/mixins/mixin'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ app, router, Vue, publicPath }) => {
  Vue.mixin(mixin)
  handleBaiduStatistics()
}
