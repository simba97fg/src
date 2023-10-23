import Vue from "vue";
import doRequest from '@/api/api/config';
// import storeConfig from '@/store/config';//导入vuex配置
// import {store as AuthenticationStore} from '@/store/stores/Authentication/authentication';//导入vuex配置
//
// const store = storeConfig([AuthenticationStore]);//挂载store
let testURL = process.env.VUE_APP_BASE_API
let prodURL = process.env.VUE_APP_BASE_API
let env = process.env.NODE_ENV === 'development' ? 'development' : process.env.VUE_APP_TITLE;
const baseURL = (env === 'development' || env === 'build_dev') ? testURL : prodURL;


// 接口地址
const API_URLS = {
  // service: '/api/aes/service',//服务接口
  // service: '/api/realNameH5/service',//5g服务接口
  // authenticationService: '/api/realNameH5-file/service',//服务接口
  service: '/api/aes/service',//5g服务接口
  authenticationService: '/api/aes/file-service',//服务接口
  geoJsonPath: `${process.env.ASSETS_PATH}/json`,//geoJson 位置
  bmwesim_api: '/ty-api/bmwesim',
  bmwesim_apiFile: '/ty-api/file-service',
  poc_api: '/ty-api/poc',
  poc_apiFile: '/ty-api/pocFile',
  realNameAuth: '/realname/organize-auth',
  realNameAuthApi: '/realname/api/organize-auth',
  realNameBase: '/realname/base-home',
  realNameWorkflow: '/realname/workFlow-auth',
  realNameAuthRecord: '/realname/organize-auth-record',
  realNameAuthPerson: '/realname/personal-auth',
  realNameBox: '/realname/base-comboBox',
  realNameOrder: '/realname/order-record',
  realNameCarManage: '/realname/base-vehicle',
  realNamePushRecord: '/realname/push-record',
  realNamePushRecordLog: '/realname/api/push-record',
  realNameUnbind: '/realname/base-unbound',
  realNameDevice: '/realname/api/device',
  realNameExter: '/realname/api/tepApi',
  realNameReset: '/realname/base-replace',
  realNameMsg: '/realname/rn_message',
  realNameQuota: '/realname/api/limit',
  realNameRule: '/realname/rule',
  realNameDownload: '/realname/api/download',
  realNameCollect: '/realname/collect',
  realNameNonChannel: '/realname/base-nonChannel',
  realNameLogin: '/platform/soauth'
};

// const mergeParams = (serviceName, serviceParameter) => Object.assign({
//   version: Vue.prototype.$$API_VERSION
// }, {
//   'service_name': serviceName,
//   'service_parameter': serviceParameter
// });
// const mergeParams = (serviceName, serviceParameter) => Object.assign({
//   'service_name': serviceName,
//   'service_parameter': serviceParameter
// });

const getFormData = args => {
  let formData = new FormData();
  // formData.append('consumer', 'clw_tep');
  // formData.append('brand', Vue.prototype.$$CONSUMER);
  // formData.append('password', Vue.prototype.$$PASSWORD);
  Object.keys(args).forEach(k => {
    (Vue.prototype.$$getVariableType(args[k]) === '[object Object]' ? formData.append(k, JSON.stringify(args[k])) : formData.append(k, args[k]))
  });
  return formData;
};

export default {
  //获取geojson
  getGeoJson(args = {}) {
    return doRequest({
      method: 'get',
      fileRead: !0,
      requestUrl: `${API_URLS.geoJsonPath}/${args.mapId}.json`,
    }).promise;
  },
  //返回最近2个月的基础信息（时间倒序）json模式
  do(args = {}) {
    if (!args.serviceName) throw new Error('serviceName不能为空');
    console.log('aaaaaaaaa', Vue.prototype.$$formatApiUrl(API_URLS[args.url_key] || API_URLS.service))
    // console.log(this.$store.getters["auth/getQueryType"])
    console.log('bbbbbbbbbbbbbb', args);
    return doRequest({
      method: args.method,
      apiName: args.serviceName,
      requestUrl: baseURL + Vue.prototype.$$formatApiUrl(API_URLS[args.url_key] || API_URLS.service) + '/' + args.serviceName,
      data: {
        brand: Vue.prototype.$$CONSUMER,
        // ...Vue.prototype.$$encryptAES(mergeParams(args.serviceName, args.serviceParameter)),
        ...args.serviceParameter,
      },
      fileRead: args.fileRead,
      contentType: args.contentType || 0,
      loading: args.loading || false,
      responseType: args.responseType,
      errorMessage: args.errorMessage,
      successMessage: args.successMessage,
      onUploadProgress: args.onUploadProgress,
      onDownloadProgress: args.onDownloadProgress,
    }).promise;
  },
  //实名制 接口请求 FormData 模式
  doFormDataReq(args = {}) {
    console.log('------------doFormDataReq-----------', args)
    if (!args.data.service_name) throw new Error('service_name不能为空');
    console.log('aaaaaaaaa', Vue.prototype.$$formatApiUrl(API_URLS[args.url_key] || API_URLS.authenticationService));
    var newUrl = "";
    if (args.data.service_parameter.orgId) {
      newUrl += '&orgId=' + args.data.service_parameter.orgId;
    }
    if (args.data.service_parameter.status) {
      newUrl += '&status=' + args.data.service_parameter.status;
    }
    if (args.data.service_parameter.batchNo) {
      newUrl += '&batchNo=' + args.data.service_parameter.batchNo
    }
    if (args.data.service_parameter.templateType) {
      newUrl += '&templateType=' + args.data.service_parameter.templateType
    }
    return doRequest({
      method: 'post',
      requestUrl: baseURL + Vue.prototype.$$formatApiUrl(API_URLS[args.url_key] || API_URLS.authenticationService) + '/' + args.data.service_name + '?userName=' + args.data.service_parameter.userName + newUrl,

      data: getFormData({
        // ...Vue.prototype.$$encryptAES(args.data),
        ...args.data,
        ...args.files
      }),
      loading: args.loading,
      contentType: 2,
      errorMessage: args.errorMessage,
      successMessage: args.successMessage,
      onUploadProgress: args.onUploadProgress,
      onDownloadProgress: args.onDownloadProgress,
    });
  },
}
