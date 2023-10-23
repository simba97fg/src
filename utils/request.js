import axios from 'axios'
import { Loading, Message, MessageBox, Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { blobValidate, tansParams } from "@/utils/ruoyi";
import { saveAs } from 'file-saver'

let downloadLoadingInstance;

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// axios.defaults.headers['X-Proxy-Midun'] = 'WsTDeXgDW8mTO/VHk5qVCO1c0RGCTyn0DdVvRGMTZedhjgJqUvA0WJtmw/+GTH3pA1PtxlT5eKpbm1NG/wfq9jvPQQLS9icDU1NxDXZ/bviEN3mMplS4rF8nw23Fm2WEdovwGe5xWzavtQ4IV236rNlr3DJQBXBo7ko+G0iMMBU=#IjE2Njc5NjA4OTQuNjI5Ig=='
// axios.defaults.headers['X-Proxy-UserDetail'] = 'iL3RpaS4k9WPcQecJ6WF2Ir6mbQ6KZecsCel0kKnBxArXDj0uZzIK4/pWkosAf+jRwehD84+WbzCoFRNRhrgcgrrVm/KNk2gJQWEfb9Hj67Y7dcTYr9J6mCW9q/PA+gWRONLZyGRQLrDO7rT7MvnNRlPyTYp4Hj2fcGcaybzZMs=#eyJjYXM6dXNlciI6ICJ0YW9oYW5odWkiLCAiY2FzOm5hbWUiOiAiXHU5Njc2XHU2YzQ5XHU4Zjg5IiwgImNhczpkZXBhcnRtZW50TmFtZSI6ICJcdTY1NzBcdTViNTdcdTU3ZmFcdTVlYTciLCAiY2FzOmVtYWlsIjogInRhb2hhbmh1aUB4aWFvbWkuY29tIiwgImNhczpkaXNwbGF5TmFtZSI6ICJcdTk2NzZcdTZjNDlcdThmODkiLCAiY2FzOm1pSUQiOiAiMTE0MTY0NDAiLCAiY2FzOnVpZCI6ICI5NmViNzVhN2M0Yjg0MmE1ODQ0NTM5OWQ5Mjk3ZWQyNCIsICJjYXM6YXZhdGFyIjogImh0dHBzOi8vY2FzLm1pb2ZmaWNlLmNuL3YyL3N0YXRpYy9hdmF0YXIucG5nIiwgImNhczp0eXBlIjogImVtcGxveWVlIn0='
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,//'process.env.VUE_APP_BASE_API' 
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {

  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  else {
    console.log('-----------getTokenF-----------------', config)
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
  // 未设置状态码则默认成功状态
  const code = res.code || res.data.code || 200;
  // 获取错误信息
  const msg = errorCode[code] || res.data.msg || errorCode['default']
  // 二进制数据则直接返回
  if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
    return res.data
  }
  if (code === 401) {
    MessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
      confirmButtonText: '确定',
      showCancelButton: false,
      showClose: false,
      type: 'warning'
    }
    ).then(() => {
      store.dispatch('LogOut').then(() => {
        location.href = '/realmgn';
      })
    }).catch(() => {
    });
    return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
  } else if (code === 500) {
    Message({
      message: msg,
      type: 'error'
    })
    return Promise.reject(new Error(msg))
  } else if (code === 206) {
    Message({
      message: msg,
      type: 'warning'
    })
    return res.data
  }
  else if (code === 208) {
    return res
  }
  else if (code !== 200) {
    Message({
      message: msg,
      type: 'error'
    })
    return Promise.reject('error')
  } else {
    return res.data
  }
},
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename) {
  downloadLoadingInstance = Loading.service({
    text: "正在下载数据，请稍候",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.7)",
  })
  return service.post(url, params, {
    transformRequest: [(params) => {
      return tansParams(params)
    }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob'
  }).then(async (data) => {
    const isLogin = await blobValidate(data);
    if (isLogin) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      Message.error('无效的会话，或者会话已过期，请重新登录。');
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    Message.error('下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close();
  })
}

export default service
