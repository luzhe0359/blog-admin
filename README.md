<div align="center">
  <h1>zugelu - 博客后台管理系统</h1>
</div>
<p align="center">
      <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
   <img src="https://img.shields.io/static/v1?label=Quasar-Manage&message=v1.0.2%20Beta&color=blue" alt="cimo">
    <img src="https://img.shields.io/badge/vue-2.6.12-brightgreen.svg" alt="vue">
  <img src="https://img.shields.io/static/v1?label=quasar&message=v1.15.1&color=blue">
</p>

### zugelu

使用 vue+quasar 搭建的博客后台管理系统，包括以下模块：用户注册、登录，文章编写、发布、列表、分类、标签、评论、点赞等。

##### 2020-05-20，使用Quasar-Manage重构后台管理系统

Quasar-Manage的亮点：

- 基于 [Quasar](http://www.quasarchs.com/) 实现，[Quasar-ui](http://www.quasarchs.com/) 的设计规范来自 [Material Design](https://material.io/)
- 包含动态路由，动态缓存，权限验证等常用功能
- 兼容多端运行: SPA / Electron / Cordova
- 响应式设计，支持手机 / 平板 / 桌面 /小分辨率屏幕显示
- 包含 tagView 快捷导航、面包屑导航等 SPA 应用常用功能
- 简单的代码逻辑，多种自定义组件，高度可定制性（只有 1600 行代码）
- 完全开源及免费  

[点击查看 Quasar-Manage ](http://forum.quasarchs.com/article/1606634838144) 更多信息。

使用这个项目前您需要了解如下技术栈：

[ES6](https://es6.ruanyifeng.com/) | [Node.js](https://nodejs.org/en/) | [Webpack](https://www.webpackjs.com/) | [Vue](https://cn.vuejs.org/) | [Vuex](https://vuex.vuejs.org/zh/) | [Vue-Router](https://router.vuejs.org/zh/) | [Vuex](https://vuex.vuejs.org/zh/) | [Quasar-cli](http://www.quasarchs.com/start/quasar-cli) | [Axios](http://www.axios-js.com/) | [ESlint](https://eslint.bootcss.com/) | [Electron：如果需要](https://www.electronjs.org/)

### 如何运行
请确保您的计算机已经安装了 ```Node.js``` 以及 ```git```，当前项目主要用于展示说明文档

1、克隆项目

```sh
## 克隆模板项目
git clone https://github.com/972784674t/quasar-manage-template.git
```
2、下载项目所需依赖
```yarn
yarn install
```
3、启动开发服务器
```yarn
## 运行 SPA 版本
quasar dev

## 运行 Electron 版本
quasar dev -m electron
```
### 如何打包
```sh
## 打包 SPA 版本
quasar build

## 打包 Electron 版本
quasar build -m electron
```
