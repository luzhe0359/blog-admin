import Layout from '../components/Layout/Layout'

/**
 * 需要授权访问的路由
 */
const asyncRoutesChildren = [
  {
    path: '/',
    name: 'home',
    meta: {
      roles: ['admin', 'editor', 'test'],
      title: '主页',
      icon: 'home',
      keepAlive: true
    },
    component: () => import('../pages/home/home')
  },
  {
    path: '/async-router',
    name: 'asyncRouter',
    meta: {
      roles: ['admin', 'editor'],
      title: '动态路由',
      icon: 'all_inclusive',
      itemLabel: 'ROUTER',
      keepAlive: true,
      isHidden: true
    },
    component: () => import('pages/router/asyncRouter')
  },
  {
    path: '/async-router-impl',
    name: 'asyncRouterImpl',
    meta: {
      roles: ['admin', 'editor'],
      title: '动态路由实现思路',
      icon: 'auto_awesome',
      keepAlive: true,
      isHidden: true
    },
    component: () => import('pages/router/asyncRouterImpl')
  },
  {
    path: '/user',
    name: 'user',
    meta: {
      roles: ['admin', 'editor'],
      title: '用户管理',
      // itemLabel: '主菜单',
      icon: 'person_search', // manage_accounts
      isOpen: true
    },
    component: Layout,
    children: [
      {
        path: 'list',
        name: 'user-list',
        meta: {
          roles: ['admin', 'editor'],
          title: '用户列表',
          icon: 'people',
          keepAlive: true
        },
        component: () => import('pages/user/userList')
      },
      {
        path: 'info',
        name: 'user-info',
        meta: {
          roles: ['admin', 'editor'],
          title: '个人中心',
          icon: 'person',
          keepAlive: true
        },
        component: () => import('pages/user/userInfo')
      }
    ]
  },
  {
    path: '/article',
    name: 'article',
    meta: {
      roles: ['admin', 'editor'],
      title: '文章管理',
      icon: 'auto_awesome_motion',
      isOpen: false
    },
    component: Layout,
    children: [
      {
        path: 'list',
        name: 'article-list',
        meta: {
          roles: ['admin', 'editor'],
          title: '文章列表',
          icon: 'library_books',
          keepAlive: true
        },
        component: () => import('pages/article/articleList')
      },
      {
        path: 'write',
        name: 'article-write',
        meta: {
          roles: ['admin', 'editor'],
          title: '文章编写',
          icon: 'library_add',
          keepAlive: true
        },
        component: () => import('pages/article/articleWrite')
      },
      {
        path: 'category',
        name: 'article-category',
        meta: {
          roles: ['admin', 'editor'],
          title: '文章分类',
          icon: 'app_registration',
          keepAlive: true
        },
        component: () => import('pages/article/categoryList')
      },
      {
        path: 'tag',
        name: 'article-tag',
        meta: {
          roles: ['admin', 'editor'],
          title: '文章标签',
          icon: 'loyalty',
          keepAlive: true
        },
        component: () => import('pages/article/tagList')
      }
    ]
  },
  {
    path: '/photo',
    name: 'photo',
    meta: {
      roles: ['admin', 'editor'],
      title: '照片管理',
      // itemLabel: 'SOME LABEL',
      icon: 'image_search',
      isOpen: false
    },
    component: Layout,
    children: [
      {
        path: 'album',
        name: 'photo-album',
        meta: {
          roles: ['admin', 'editor'],
          title: '相册列表',
          icon: 'photo_library',
          keepAlive: true
        },
        component: () => import('../pages/photo/albumList')
      },
      {
        path: 'list',
        name: 'photo-list',
        meta: {
          roles: ['admin', 'editor'],
          title: '照片列表',
          icon: 'image',
          keepAlive: true
        },
        component: () => import('../pages/photo/photoList')
      }
    ]
  },
  {
    path: '/timeline',
    name: 'timeline',
    meta: {
      roles: ['admin', 'editor'],
      title: '时间总轴',
      icon: 'add_road'
    },
    component: () => import('../pages/timeline/timelineList')
  },
  {
    path: '/link',
    name: 'link',
    meta: {
      roles: ['admin', 'editor'],
      title: '友情链接',
      icon: 'all_inclusive'
    },
    component: () => import('../pages/link/linkList')
  },
  {
    path: 'http://www.quasarchs.com/vue-components/button',
    name: 'external-link',
    meta: {
      roles: ['admin', 'editor'],
      title: '外部链接/更多组件',
      icon: 'send',
      isHidden: true
    }
  },
  {
    path: '/tableDetail',
    name: 'tableDetail',
    meta: {
      roles: ['admin', 'editor'],
      title: 'Treats 详情',
      icon: 'blur_linear',
      isHidden: true
    },
    component: () => import('../pages/home/tableDetail')
  },
  {
    path: '*', // 此处需置于最底部
    redirect: '/NoFound404',
    meta: {
      roles: ['admin', 'test'],
      isHidden: true
    }
  }
]

const asyncRoutes = [
  {
    path: '/',
    name: 'index',
    redirect: '/',
    component: () => import('../layouts/MainLayout'),
    children: asyncRoutesChildren
  }
]

export default asyncRoutes

export { asyncRoutesChildren }
