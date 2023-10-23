// import Vue from 'vue';
import axios from 'axios';
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import Cookies from "js-cookie";
// import qs from 'qs';

//axios 配置

//增加请求拦截
axios.interceptors.request.use(
  config => {
    console.log('config', config)
    if (config.fileRead) {
      config.responseType = 'blob'
    }
    //设置超时
    if (config.params && config.params.ids && (config.params.ids == 'or' || (config.params.ids == 'all' && config.apiName == 'batch-export') || (config.params.ids == 'all' && (config.apiName == 'export-allPersonal-detail' || config.apiName == 'export-allCompany-detail')))) {
      config.timeout = 1700000;
    } else {
      config.timeout = 180000;
    }

    // config.responseType = 'blob';
    //设置请求格式
    if (getToken() && getToken() != 'undefined') {
      config.headers['Authorization'] = 'Bearer ' + getToken();
    }

    config.headers['Content-Type'] = ['application/json;charset=UTF-8', 'application/x-www-form-urlencoded;charset=UTF-8', 'multipart/form-data;charset=UTF-8', 'application/x-tar'][config.contentType];
    return config;
  },
  err => {
    return Promise.reject({ code: '-2', msg: err, message: '网络异常，请检查您的网络设置' });
  }
);

let resInterceptors = response => {
  if (response.__CANCEL__) return { code: '-1', msg: '已取消', message: '已取消' };
  if (!response) return { code: '-2', msg: '网络异常，请检查您的网络设置', message: '网络异常，请检查您的网络设置' };
  if (response.status !== 200) return { code: '-3', msg: '系统开小差了，请稍后再试', message: '系统开小差了，请稍后再试' };
  return response.data || response//{code: response.data.code, msg: response.data.msg, message: response.data.msg, data: response.data.data};
};
//增加响应拦截
axios.interceptors.response.use(
  response => {
    const code = response.code || response.data.code || 200;
    const msg = response.msg || response.data.msg || '操作失败'
    console.log('interceptorOK->', response.config.apiName, response);
    let decryptParams = null;
    // 网络结果200返回resolve
    if (response.status === 200) {
      // 如果是文件读取 直接返回内容
      if (response.config.fileRead) return { data: response.data, header: response.headers };
      if (code === 500) {
        Message({
          message: msg,
          type: 'error'
        })
        return Promise.reject(resInterceptors(response))
      }
      //如果不加密
      // if (!response.config.isEncrypt) {
      //   if (response.data.businessCode === 1) return response.data;
      //   return Promise.reject(resInterceptors(response));
      // }
      //业务逻辑200
      // if (response.data.businessCode !== '1') return Promise.reject(resInterceptors(response));//有code都非200
      // decryptParams = response.data;
      // decryptParams = Vue.prototype.$$decryptAES(response.data);
      // console.log('decryptParams->', response.config.apiName, decryptParams);
      // if (decryptParams.code === 200) return decryptParams;
      return response
    }
    // 非200返回reject
    return Promise.reject(resInterceptors({ status: 200, ...decryptParams }));
  },
  err => {
    if (err.__CANCEL__) return Promise.reject(resInterceptors(err));
    console.log('interceptorERR->', err.config.apiName, err);
    return Promise.reject(resInterceptors(err.response));
  },
);

export default axios;
