import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, removeToken } from './utils/auth'


NProgress.configure({ showSpinner: false })

const whiteList = ['/index', '/auth-redirect', '/bind', '/register', '/login']

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)

    /* has token*/
    if (to.path === '/login') {
      next()
    }
    else if (typeof (store.getters.token) == "undefined" || store.getters.token == 'undefined') {
      removeToken();
      next({ path: '/Index' })
      NProgress.done()
    } else
      if (to.path === '/index') {
        next()
        NProgress.done()
      }

      else {
        if (store.getters.roles.length === 0) {
          // 判断当前用户是否已拉取完user_info信息
          store.dispatch('GetInfo').then(() => {
            store.dispatch('GenerateRoutes').then(accessRoutes => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes) // 动态添加可访问路由表
              console.log(to.path, '-----------------------------------next--------------------------------------------------')
              console.log(accessRoutes, '-----------------------------------路由保护--------------------------------------------------')
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成

            })
          }).catch(err => {
            console.log('-----------------------------------LogOut--------------------------------------------------')
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next('/Index')
            })
          })
        } else {
          console.log(to.path, store.getters.validityrouters, store.getters.validityrouters.indexOf(to.path), '-----------------------------------next--------------------------------------------------')
          if (store.getters.roles.toString().indexOf('realname_admin') != -1 || store.getters.roles.toString().indexOf('admin') != -1) {
            console.log('================================================是超级管理员！！！！！！！')
            next()
          }
          else {
            console.log('===========================================不是超级管理员！！！！！！！', store.getters.roles.toString().indexOf('admin'), to.path,)
            if (store.getters.validityrouters.indexOf(to.path) != -1) {
              next()
            } else {
              console.log('===========================================对！！！！！！！', store.getters.roles, to.path)
              next('/indexForStaff')
              NProgress.done()
            }
          }

        }
      }
  } else {
    // 没有token

    if (whiteList.indexOf(to.path) !== -1) {
      console.log(to.path, '-----------------------------------没有token------------------xiaomi--------------------------------')
      // 在免登录白名单，直接进入
      next()
    } else {
      next('/index')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
