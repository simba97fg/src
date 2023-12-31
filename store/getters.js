const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  cardStateOptions: state => state.comboBox.cardStateOptions,
  cardTypeOptions: state => state.comboBox.cardTypeOptions,
  channelTypeOptions: state => state.comboBox.channelTypeOptions,
  vehicleStatusOptions: state => state.comboBox.vehicleStatusOptions,
  dWCardTypeOptions: state => state.comboBox.dWCardTypeOptions,
  flowOptions: state => state.comboBox.flowOptions,
  ispNameOptions: state => state.comboBox.ispNameOptions,
  operatorNameOptions: state => state.comboBox.operatorNameOptions,
  orderSceneTypeOptions: state => state.comboBox.orderSceneTypeOptions,
  orderTypeOptions: state => state.comboBox.orderTypeOptions,
  respondStatusOptions: state => state.comboBox.respondStatusOptions,
  statusOptions: state => state.comboBox.statusOptions,
  vehicleBrandOptions: state => state.comboBox.vehicleBrandOptions,
  vehicleCardTypeOptions: state => state.comboBox.vehicleCardTypeOptions,
  vehicleFlagOptions: state => state.comboBox.vehicleFlagOptions,
  deptOptions: state => state.comboBox.deptOptions,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  nickname: state => state.user.nickname,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  userId: state => state.user.userId,
  deptId: state => state.user.deptId,
  deptName: state => state.user.deptName,
  deptLevel: state => state.user.deptLevel,
  roleId: state => state.user.roleId,
  roleName: state => state.user.roleName,
  permissions: state => state.user.permissions,
  validityrouters: state => state.user.validityrouters,
  permission_routes: state => state.permission.routes,
  topbarRouters: state => state.permission.topbarRouters,
  defaultRoutes: state => state.permission.defaultRoutes,
  sidebarRouters: state => state.permission.sidebarRouters,
  addRoutes: state => state.permission.addRoutes,
}
export default getters
