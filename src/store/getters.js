const getters = {
  getRole: (state) => { return state.role },
  getRoutes: (state) => { return state.routes },
  getTagView: (state) => { return state.tagView },
  getBreadcrumbs: (state) => { return state.breadcrumbs },
  getKeepAliveList: (state) => { return state.keepAliveList },
  getNickname: (state) => { return state.nickname },
  getAvatar: (state) => { return state.avatar }
}

export default getters
