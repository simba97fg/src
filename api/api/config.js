import Vue from 'vue';
import axios from 'axios';
import codeCenter from './codeCenter';

//统一处理 status不为200都视为失败
let errorProcessor = (err, errorMessage) => {
  console.log('aaaa', err, errorMessage)
  let code_ftn = codeCenter['code_' + err.code];
  if (code_ftn) return code_ftn(err, errorMessage);
  return codeCenter.other(err, errorMessage);
};

/*
传参说明
args = {
  method String 请求类型 默认POST
  contentType Integer 请求类型 默认0  0='application/json'  1='application/x-www-form-urlencoded; charset=UTF-8' 2='multipart/form-data'
  requestUrl String 请求地址
  data object post提交数据
  params String get提交数据
  fileRead Boolean 是否读取本地json等文件 默认否
  isEncrypt Boolean 是否加密 默认是
  loading Boolean 默认true 请求时是否出现loading
  successMessage String 请求成功提示 默认为空不提示
  errorMessage String 请求失败提示 默认为空不提示
  onUploadProgress Function 上传进度回调方法
  onDownloadProgress Function 下载进度回调方法
}
*/
export default (args) => {
  console.log('beforeAxios->', args.apiName || '', args);
  const source = axios.CancelToken.source();//取消请求工厂
  return {
    cancel: source.cancel,
    promise: new Promise((resolve) => {
      (args.loading = args.loading === undefined ? true : args.loading) && console.log('true');   //开启loading
      //开始请求
      Vue.prototype.$$axios({
        apiName: args.apiName,
        method: args.method || 'POST',
        url: args.requestUrl,
        fileRead: args.fileRead || false,
        contentType: args.contentType || 0,
        data: args.data,
        isEncrypt: args.isEncrypt === undefined ? true : args.isEncrypt,
        params: args.data,
        onUploadProgress: args.onUploadProgress,
        onDownloadProgress: args.onDownloadProgress,
        cancelToken: source.token,
        responseType: args.responseType || '',
      }).then(res => {
        // args.successMessage && Vue.prototype.$message({
        //   message: args.successMessage,
        //   type: 'success'
        // });
      // setTimeout(() => {
        console.log('false', res);//关闭loading
        if(args.fileRead){
          resolve({res: res.data, err: null,header:res.header});
          return;
        }
        resolve({res: res.data, err: null});
      // }, 3000);
      }).catch(err => {
        console.log('yes!', err);//关闭loading
        errorProcessor(err) && resolve({res: null, err});//当错误处理完成时 返回是否需要回调
      }).finally(() => {
        console.log('false');//关闭loading
      });
    })
  };
};
