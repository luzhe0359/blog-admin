## 动态路由
:::tip
```quasar-cli```版本的后台获取路由 demo 和 ```vue-cli``` 版本的稍有不同

```quasar-cli```的视图路由，最好不要用大驼峰命名，因为大驼峰会让 webpack 出现解析异常的警告

```quasar```作者对于动态导入的建议是使用内置的 webpack alias + [官方案例](https://next.quasar.dev/quasar-cli/lazy-loading#caveat-for-dynamic-imports) 实现动态导入
:::
在之前的版本中，权限的操作是预先在前端的路由元信息中设置好的，像这样
```js
{
  path: '/',
  name: 'home',
  meta: {
    roles: ['admin', 'user'],
    title: '主页',
  },
  component: () => import('pages/home/home')
}
```
但是最近有不少同学想看看我是如何实现后端返回路由，并在前端显示的。于是就写了个demo，来互相学习。
:::tip
在使用后端返回的路由之前，我们能确定的是，之前我们在路由元信息中，为路由添加的权限信息已经不再需要了。我们只需根据当前用户的信息，从后端获取到他所拥有的路由即可
:::
那么问题来了，路由需要引入组件，像这样```component: () => import('pages/home/home')```，对于这样的数据，我们该如何保存在我们的数据库中呢

### 如何解决
目前最通用的是把路由数据转变为特定的```json```格式，并且在从后端获取到```json```格式的路由信息之后，通过自定义的方法，将```json```格式的路由信息转换为```vue-router```可以用的形式。

在这个项目中，我把路由信息通过自定义方法```handleAsyncRouterToJson```转换为```json```格式

比如将下面的路由
```js
import Layout from '../components/Layout/Layout'

......
{
  path: '/',
  name: 'Home',
  meta: {
    roles: ['admin', 'user'],
    title: '主页',
  },
  component: () => import('pages/home/Home')
},
{
  path: '/start',
  name: 'start',
  meta: {
    roles: ['admin', 'editor'],
    title: '快速起步',
  },
  component: Layout
}
......
```
转化为路由```json```格式：
```json
{
	"path": "/",
	"name": "home",
	"meta": {
		"roles": [],
		"title": "主页",
	},
	"component": "home/home.vue"
},
{
	"path": "/start",
	"name": "start",
	"meta": {
		"roles": [],
		"title": "快速起步",
	},
	"component": "Layout"
}
```
转换成功之后，在每一次路由守卫中都去判断当前用户是否请求了路由，如果没有请求路由就去后端请求路由并使用自定义的```handleJsonRouterToAsyncRouter```方法将```json```格式的路由转换为```vue-router```可用的路由，最后使用```router.addRoutes()```加入到```vue-router```中。

路由守卫的代码如下：
:::tip
从后端请求动态路由的操作，我使用```github page```模拟了一个后台接口```getUserRouter```

请求的数据存储在[```data/asyncRouterDemo```](https://github.com/972784674t/quasar-manage/blob/master/public/data/asyncRouterDemo)中
:::
```boot/permissionWithDynamicRouter.js```
```js
const view404 = {
  path: '*',
  name: '404',
  redirect: '/NoFound404',
  meta: {
    title: '404',
    isHidden: true
  }
}

router.beforeEach(async (to, from, next) => {
  // 模拟获取 token
  const token = sessionStorage.getItem('access_token')
  // 存在 token 说明已经登录
  if (token) {
    // 登录过就不能访问登录界面
    if (to.path === '/login') {
      next({ path: '/' })
    }
    // 动态路由不需要保存用户角色了，判断 store 中路由不为空则放行即可
    if (store.getters.getRoutes.length) {
      next()
    } else {
      // 不存在用户权限时，从后台请求接口获取用户对应的路由
      const userRouterRespouse = await getUserRouter()

      // 将从后台获取的路由转换为 vue-router 可用形式
      const userRouter = handleJsonRouterToAsyncRouter(userRouterRespouse.data)

      // 在路由的末尾处添加 404 界面
      userRouter.push(view404)

      // 将后台请求到的路由加入到主布局路由中
      asyncRoutes[0].children = userRouter

      // 将路由设置到 store 中
      store.commit('SET_ROLES', asyncRoutes)

      // 如果提示 addRoutes 已弃用，使用扩展运算符完成该操作
      // router.addRoute(...asyncRoutes)
      router.addRoutes(asyncRoutes)

      // 如果 addRoutes 并未完成，路由守卫会再执行一次
      next({ ...to, replace: true })
    }
  } else {
    // 如果要前往不需要授权的路由，则放行
    if (constantRoutes.some((item) => item.path === to.path)) {
      next()
    } else {
      next({ path: '/logon' })
    }
  }
})

router.afterEach(() => {
  // 使用多个 stop() 来保证 LoadingBar 在动态添加路由后正确关闭
  LoadingBar.stop()
  LoadingBar.stop()
})

export default router
```
到这里从后端获取路由的操作就结束了，其实就是路由的数据来源改变。

:::tip
如果你只希望知道如何使用，请看[```动态路由```](https://github.com/972784674t/quasar-manage/blob/master/src/pages/router/asyncRouter.vue)的源码，同时记得在```quasar.conf.js```中使用专门用于动态路由的鉴权工具```permissionWithDynamicRouter```即可
```js
// line 24
boot: [
  'i18n',
  'axios',
  'main',
  'permission' // 将 permissionWithDynamicRouter（后端传回的动态路由鉴权工具） 替换 permission （默认前端鉴权工具）
],
```

毕竟每个项目或是每个公司的实现方式均不同，相同的是思想。

如果你想深入研究，可以继续往下看，不过，一小时油耗两个包子...
:::

下面定义了如何将路由转换为```json```格式以及如何将```json```格式转换为可用路由的两个方法。

方法位于```permissionUtils.js```里，这些方法的实现都有种广度优先的意思

:::warning
不要在```map()```/```filter()```内进行```async/await```操作（亲自采坑了...）

当```async```函数被执行时，将立即返回```pending```状态的```Promise```，因此，在```map()```/```filter()```循环时，方法不会等待```await```操作完成，而是直接进入下一次循环，所以应当配合```for```循环使用```async```。
:::

```js
import Layout from '../components/Layout/Layout.vue'

/**
 * 将后端传入的 router 字符串转化为 vue-router 可用的对象
 * @param jsonRouter 后台路由
 * @param t 占存变量，用于返回值（不需要传参）
 */
export function handleJsonRouterToAsyncRouter (jsonRouter, t) {
  t = jsonRouter.map(item => {
    if (item.component === 'Layout') {
      item.component = Layout
    } else {
      // Lazy loading of components
      item.component = handleComponent(item.component)
    }
    return item
  })
  for (const item of t) {
    if (item.children) {
      item.children = handleJsonRouterToAsyncRouter(item.children)
    }
  }
  return t
}

function handleComponent (component) {
  return () => import('src/pages/' + component)
}

/**
 * 将 vue 路由转换为 json 字符串
 * 将 asyncRouters 的 roles 初始化为空，同时处理 Component 的懒加载：
 * component: () => import('../pages/home/home') 转换为 component: 'home/home'
 * @param asyncRouters
 * @returns {Promise<void>} 处理后的 asyncRouters
 */
export async function handleAsyncRouterToJson (asyncRouters) {
  // 先把路由树中的每个节点的 roles 重置为 []，即每个人都可以访问
  for (const item of asyncRouters) {
    item.meta.roles = []
    if (item.children) {
      await handleAsyncRouterToJson(item.children)
    }
    // 当遍历到 *（404）路由时，说明遍历完成，接着去处理 Component 的懒加载
    if (item.path === '*') {
      return await handleAsyncRouterComponentToJson(asyncRouters)
    }
  }
}

/**
 * 处理 Component 的懒加载
 * component: () => import('../pages/home/home') 转换为 component: '/pages/home/home'
 * @param asyncRouters
 * @returns {Promise<void>}
 */
export async function handleAsyncRouterComponentToJson (asyncRouters) {
  for (const item of asyncRouters) {
    // 如果 component 是懒加载，则执行它
    if (typeof item.component === 'function') {
      const c = await item.component()
      // 使用正则表达式将地址中的 'src/pages/' 替换为 ''
      item.component = c.default.__file.replace(/src\/pages\//, '')
    } else if (item.component) {
      item.component = item.component.name
    }
    if (item.children) {
      await handleAsyncRouterComponentToJson(item.children)
    }
    // 当遍历到 * （404）路由时，说明遍历完成
    if (item.path === '*') {
      // 去除 404 路由，在新增路由时自动添加
      asyncRouters.pop()
      return asyncRouters
    }
  }
}
```
不仅如此，在可视化选择动态路由的 Demo 中，用到了路由对象根据选中的路由标识数组，过滤路由的方法
```js
/**
 * 用于添加新角色和对应的路由
 * 使用 selectedRouter 过滤 baseRouter 中的路由，得到新的角色路由（广度优先）
 * @param baseRouter 基础路由
 * @param selectedRouter：Array 被选中的路由标识
 * @param t 暂存变量
 * @returns {Promise<void>} 处理后的 asyncRouters 字符串
 */
export function handleBaseRouterToRolesRouter (baseRouter, selectedRouter, t) {
  t = baseRouter.filter(item => {
    return selectedRouter.some(s => {
      return s === item.name
    })
  })
  for (const item of t) {
    if (item.children) {
      item.children = handleBaseRouterToRolesRouter(item.children, selectedRouter)
    }
  }
  return t
}
```
