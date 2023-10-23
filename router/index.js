import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '@/layout'

Vue.use(Router)

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: (resolve) => require(['@/views/redirect'], resolve)
      }
    ]
  },
  {
    path: '/resetPsw',
    component: (resolve) => require(['@/views/resetPsw'], resolve),
    hidden: true
  },
  {
    path: '/login',
    component: (resolve) => require(['@/views/login'], resolve),
    hidden: true
  },
  {
    path: '/register',
    component: (resolve) => require(['@/views/register'], resolve),
    hidden: true
  },
  {
    path: '/404',
    component: (resolve) => require(['@/views/error/404'], resolve),
    hidden: true
  },
  {
    path: '/401',
    component: (resolve) => require(['@/views/error/401'], resolve),
    hidden: true
  },
  {
    path: '',
    component: (resolve) => require(['@/views/home'], resolve),
    redirect: 'indexForStaff',
    children: [
      {
        path: 'realNameInTele',
        component: (resolve) => require(['@/views/realNameInTele'], resolve),
        name: 'realNameInTele',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'instructionReport',
        component: (resolve) => require(['@/views/instructionReport'], resolve),
        name: 'instructionReport',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'msgManage',
        component: (resolve) => require(['@/views/msgManage'], resolve),
        name: 'msgManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'quotaManage',
        component: (resolve) => require(['@/views/quotaManage'], resolve),
        name: 'quotaManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'testingAuth',
        component: (resolve) => require(['@/views/testingAuth'], resolve),
        name: 'testingAuth',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'exterAbility',
        component: (resolve) => require(['@/views/exterAbility'], resolve),
        name: 'exterAbility',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'deviceManage',
        component: (resolve) => require(['@/views/deviceManage'], resolve),
        name: 'deviceManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'setRules',
        component: (resolve) => require(['@/views/setRules'], resolve),
        name: 'setRules',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'resetRealNameCard',
        component: (resolve) => require(['@/views/resetRealNameCard'], resolve),
        name: 'resetRealNameCard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'accountManage',
        component: (resolve) => require(['@/views/accountManage'], resolve),
        name: 'accountManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'unitLinkManage',
        component: (resolve) => require(['@/views/unitLinkManage'], resolve),
        name: 'unitLinkManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'noRealNameCard',
        component: (resolve) => require(['@/views/noRealNameCard'], resolve),
        name: 'noRealNameCard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'orderManage',
        component: (resolve) => require(['@/views/orderManage'], resolve),
        name: 'orderManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'realNameUnbind',
        component: (resolve) => require(['@/views/realNameUnbind'], resolve),
        name: 'realNameUnbind',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'indexForStaff',
        component: (resolve) => require(['@/views/indexForStaff'], resolve),
        name: 'indexForStaff',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'index',
        component: (resolve) => require(['@/views/index'], resolve),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'logManage',
        component: (resolve) => require(['@/views/logManage'], resolve),
        name: 'logManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'carinfoManage',
        component: (resolve) => require(['@/views/carinfoManage'], resolve),
        name: 'carinfoManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'personalRealAuth',
        component: (resolve) => require(['@/views/personalRealAuth'], resolve),
        name: 'personalRealAuth',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'unitRealAuth',
        component: (resolve) => require(['@/views/unitRealAuth'], resolve),
        name: 'unitRealAuth',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      // {
      //   path: 'manualAudit',
      //   component: (resolve) => require(['@/views/manualAudit'], resolve),
      //   name: 'manualAudit',
      //   meta: { title: '首页', icon: 'dashboard', affix: true }
      // },
      {
        path: 'userManage',
        component: (resolve) => require(['@/views/userManage'], resolve),
        name: 'userManage',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'personCarUnbind',
        component: (resolve) => require(['@/views/personCarUnbind'], resolve),
        name: 'personCarUnbind',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'unitCarUnbind',
        component: (resolve) => require(['@/views/unitCarUnbind'], resolve),
        name: 'unitCarUnbind',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'personOtherIdcard',
        component: (resolve) => require(['@/views/personOtherIdcard'], resolve),
        name: 'personOtherIdcard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
      {
        path: 'unitIdcard',
        component: (resolve) => require(['@/views/unitIdcard'], resolve),
        name: 'unitIdcard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
    ]
  },
  {
    path: '/managerIndex',
    component: Layout,
    hidden: true,
    redirect: 'indexcopy',
    children: [
      {
        path: 'indexcopy',
        component: (resolve) => require(['@/views/indexcopy'], resolve),
        name: 'Indexcopy',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      },
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: (resolve) => require(['@/views/system/user/profile/index'], resolve),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]
// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  }
]
export default new Router({
  mode: 'hash',
  //增加base配置
  base: process.env.VUE_APP_BASE_PATH,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
