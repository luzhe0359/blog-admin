import Layout from '../components/Layout/Layout'

/**
 * 需要授权访问的路由
 */
const asyncRoutesChildren = [
  {
    path: '/',
    name: 'home',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '主页',
      icon: 'home',
      keepAlive: true
    },
    component: () => import(/* webpackChunkName:"home" */ 'pages/home/home')
  },
  {
    path: '/async-router',
    name: 'asyncRouter',
    meta: {
      roles: ['super', 'admin', 'editor'],
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
      roles: ['super', 'admin', 'editor'],
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
      roles: ['super', 'admin', 'editor'],
      title: '用户管理',
      // itemLabel: '主菜单',
      icon: 'person_search', // manage_accounts
      isOpen: true
    },
    component: Layout,
    children: [
      {
        path: 'list',
        name: 'userList',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '用户列表',
          icon: 'people',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"user" */ 'pages/user/userList')
      },
      {
        path: 'info',
        name: 'userInfo',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '个人中心',
          icon: 'person',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"user" */ 'pages/user/userInfo')
      }
    ]
  },
  {
    path: '/article',
    name: 'article',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '文章管理',
      icon: 'auto_awesome_motion',
      isOpen: false
    },
    component: Layout,
    children: [
      {
        path: 'list',
        name: 'articleList',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章列表',
          icon: 'library_books',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/article/articleList')
      },
      {
        path: 'write',
        name: 'articleWrite',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章编写',
          icon: 'library_add',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/article/articleWrite')
      },
      {
        path: 'detail/:_id?',
        name: 'articleDetail',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章详情',
          icon: 'article',
          keepAlive: true,
          isHidden: true
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/article/articleDetail')
      },
      {
        path: 'comment',
        name: 'articleComment',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章评论',
          icon: 'comment',
          keepAlive: false
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/comment/commentList')
      },
      {
        path: 'category',
        name: 'articleCategory',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章分类',
          icon: 'app_registration',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/article/categoryList')
      },
      {
        path: 'tag',
        name: 'articleTag',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '文章标签',
          icon: 'loyalty',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"article" */ 'pages/article/tagList')
      }
    ]
  },
  {
    path: '/photo',
    name: 'photo',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '照片管理',
      // itemLabel: 'SOME LABEL',
      icon: 'image_search',
      isOpen: false
    },
    component: Layout,
    children: [
      {
        path: 'album',
        name: 'photoAlbum',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '相册列表',
          icon: 'photo_library',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"photo" */ '../pages/photo/albumList')
      },
      {
        path: 'list',
        name: 'photoList',
        meta: {
          roles: ['super', 'admin', 'editor'],
          title: '照片列表',
          icon: 'image',
          keepAlive: true
        },
        component: () => import(/* webpackChunkName:"photo" */ '../pages/photo/photoList')
      }
    ]
  },
  {
    path: '/timeline',
    name: 'timeline',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '时间总轴',
      icon: 'add_road',
      keepAlive: true
    },
    component: () => import(/* webpackChunkName:"timeline" */ '../pages/timeline/timelineList')
  },
  {
    path: '/link',
    name: 'link',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '友情链接',
      icon: 'all_inclusive',
      keepAlive: true
    },
    component: () => import(/* webpackChunkName:"link" */ '../pages/link/linkList')
  },
  {
    path: '/message',
    name: 'message',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '留点什么',
      icon: 'spellcheck',
      keepAlive: true
    },
    component: () => import(/* webpackChunkName:"message" */ '../pages/message/messageList')
  },
  {
    path: 'http://www.quasarchs.com/vue-components/button',
    name: 'external-link',
    meta: {
      roles: ['super', 'admin', 'editor'],
      title: '外部链接/更多组件',
      icon: 'send',
      isHidden: true
    }
  },
  {
    path: '*', // 此处需置于最底部
    redirect: '/NoFound404',
    meta: {
      roles: ['super', 'admin', 'editor', 'visitor'],
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
