import { getInfo, login, logout, refreshToken } from '../../api/login'
import { getToken, removeToken, setExpiresIn, setToken } from '../../utils/auth'
import { encrypt } from '@/utils/jsencrypt'
import { Loading, Message, MessageBox, Notification } from 'element-ui'
import auth from '../../plugins/auth'
import router from '@/router';

const user = {
  state: {
    token: getToken(),
    userId: '',
    name: '',
    nickname: '',
    avatar: '',
    roles: [],
    permissions: [],
    validityrouters: [],
    deptId: '',
    roleId: '',
    roleName: '',
    deptName: '',
    deptLevel: '',
  },

  mutations: {
    SET_ROUTERS: (state, validityrouters) => {
      state.validityrouters = validityrouters
    },
    SET_DEPTID: (state, deptId) => {
      state.deptId = deptId
    },
    SET_DEPTNAME: (state, deptName) => {
      state.deptName = deptName
    },
    SET_DEPTLEVEL: (state, deptLevel) => {
      state.deptLevel = deptLevel
    },
    SET_ID: (state, token) => {
      state.userId = token
    },
    SET_ROLEID: (state, roleId) => {
      state.roleId = roleId
    },
    SET_ROLENAME: (state, roleName) => {
      state.roleName = roleName
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_EXPIRES_IN: (state, time) => {
      state.expires_in = time
    },
    SET_NICKNAME: (state, nickname) => {
      state.nickname = nickname
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    }
  },

  actions: {
    LoginInXM({ commit }, userInfo) {
      if (userInfo?.code == 0) {

        setToken(userInfo.data.access_token)
        commit('SET_TOKEN', userInfo.data.access_token)
        setExpiresIn(userInfo.data.expires_in)
        commit('SET_EXPIRES_IN', userInfo.data.expires_in)
      } else {
        Message({
          message: '无token',
          type: 'error'
        })
        commit('SET_TOKEN', '')
        commit('SET_ID', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
      }
    },
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = encrypt(userInfo.password)
      // const password =  userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid).then(res => {
          if (res.data.code && res.data.code === 208) {
            let data = res.data.data
            setToken(data.access_token)
            commit('SET_TOKEN', data.access_token)
            setExpiresIn(data.expires_in)
            commit('SET_EXPIRES_IN', data.expires_in)
            resolve(res)
          }
          else {
            let data = res.data
            setToken(data.access_token)
            commit('SET_TOKEN', data.access_token)
            setExpiresIn(data.expires_in)
            commit('SET_EXPIRES_IN', data.expires_in)
            resolve(res)
          }

        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          const avatar = user.avatar == "" ? require("@/assets/images/profile.jpg") : user.avatar;
          if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组

            if (user.roles.length > 1) {
              user.roles.forEach((el) => {
                if (el.roleKey.indexOf('admin') != -1) {
                  commit('SET_ROLEID', el.roleId);
                  commit('SET_ROLENAME', el.roleName);
                  commit('SET_ROLES', [el.roleKey]);
                  console.log(el, '=====thisgetRoleinfo==')
                }
              })
            }
            else {
              commit('SET_ROLES', res.roles)
            }
            commit('SET_PERMISSIONS', res.permissions)
            const validityrouters = [];
            if (auth.hasPermiOr(["home:personalRealAuth:list", 'home:personalRealAuth:detail', 'home:personalRealAuth:export'])) {
              validityrouters.push('/personalRealAuth')
            }
            if (auth.hasPermiOr(["home:unitRealAuth:list", 'home:unitRealAuth:detail', 'home:unitRealAuth:export'])) {
              validityrouters.push('/unitRealAuth')
            }
            if (auth.hasPermiOr(["home:noRealNameCard:list", 'home:noRealNameCard:export'])) {
              validityrouters.push('/noRealNameCard')
            }
            if (auth.hasPermiOr(["home:testingAuth:list", 'home:testingAuth:detail', 'home:testingAuth:export'])) {
              validityrouters.push('/testingAuth')
            }
            if (auth.hasPermiOr(["home:unitCarUnbind:list", 'home:unitCarUnbind:detail', 'home:unitCarUnbind:export', 'home:unitCarUnbind:change'])) {
              validityrouters.push('/unitCarUnbind')
            }
            if (auth.hasPermiOr(["home:personOtherIdcard:list", 'home:personOtherIdcard:detail', 'home:personOtherIdcard:export', 'home:personOtherIdcard:change'])) {
              validityrouters.push('/personOtherIdcard')
            }
            if (auth.hasPermiOr(["home:personCarUnbind:list", 'home:personCarUnbind:detail', 'home:personCarUnbind:export', 'home:personCarUnbind:change'])) {
              validityrouters.push('/personCarUnbind')
            }
            if (auth.hasPermiOr(["home:unitIdcard:list", 'home:unitIdcard:detail', 'home:unitIdcard:export', 'home:unitIdcard:change'])) {
              validityrouters.push('/unitIdcard')
            }
            if (auth.hasPermiOr(["home:carinfoManage:list", 'home:carinfoManage:change', 'home:carinfoManage:export'])) {
              validityrouters.push('/carinfoManage')
            }
            if (auth.hasPermiOr(["home:accountManage:list", 'home:accountManage:change', 'home:accountManage:export'])) {
              validityrouters.push('/accountManage')
            }
            if (auth.hasPermiOr(["home:msgManage:list", 'home:msgManage:change', 'home:msgManage:export'])) {
              validityrouters.push('/msgManage')
            }
            if (auth.hasPermiOr(["home:unitLinkManage:list", 'home:unitLinkManage:detail', 'home:unitLinkManage:export'])) {
              validityrouters.push('/unitLinkManage')
            }
            if (auth.hasPermiOr(["home:realNameUnbind:list", 'home:realNameUnbind:detail', 'home:realNameUnbind:change'])) {
              validityrouters.push('/realNameUnbind')
            }
            if (auth.hasPermiOr(["home:resetRealNameCard:list", 'home:resetRealNameCard:change'])) {
              validityrouters.push('/resetRealNameCard')
            }
            if (auth.hasPermiOr(["home:deviceManage:list", 'home:deviceManage:change'])) {
              validityrouters.push('/deviceManage')
            }
            if (auth.hasPermi('home:orderManage:list')) {
              validityrouters.push('/orderManage')
            }
            if (auth.hasPermi('home:userManage:list')) {
              validityrouters.push('/userManage')
            }
            if (auth.hasPermi('home:logManage:list')) {
              validityrouters.push('/logManage')
            }
            if (auth.hasPermi('home:setRules:list') && user.deptLevel <= 2) {
              validityrouters.push('/setRules')
            }
            if (auth.hasPermi('home:quotaManage:list')) {
              validityrouters.push('/quotaManage')
            }
            if (auth.hasPermi('home:exterAbility:list')) {
              validityrouters.push('/exterAbility')
            }
            if (auth.hasPermi('home:instructionReport:list')) {
              validityrouters.push('/instructionReport')
            }
            if (auth.hasPermi('home:realNameInTele:list')) {
              validityrouters.push('/realNameInTele')
            }
            validityrouters.push('/indexForStaff');
            commit('SET_ROUTERS', validityrouters)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_NICKNAME', user.nickName)
          commit('SET_NAME', user.userName)
          commit('SET_ID', user.userId)
          commit('SET_DEPTID', user.deptId)
          commit('SET_DEPTNAME', user.dept.deptName)
          commit('SET_DEPTLEVEL', user.deptLevel)
          commit('SET_AVATAR', avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 刷新token
    RefreshToken({ commit, state }) {
      return new Promise((resolve, reject) => {
        refreshToken(state.token).then(res => {
          setExpiresIn(res.data)
          commit('SET_EXPIRES_IN', res.data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      // return new Promise((resolve, reject) => {
      //   logout(state.token).then(() => {

      commit('SET_TOKEN', '')
      commit('SET_ID', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
      //     resolve()
      //   }).catch(error => {
      //     reject(error)
      //   })
      // })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
