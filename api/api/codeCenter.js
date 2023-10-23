// import Vue from "vue";
//接口返回code统一处理

export default {
  //特殊处理
  // 'code_0001': (err, errorMessage) => {
  //   //类似 token超时....
  //   //类似 token错误....
  //   // etc...
  //   return false;
  // },
  'status_net_work_error': (err, errorMessage) => {//无网络
    // Vue.prototype.$message.error(errorMessage || err.statusText);
    console.log(errorMessage || err.statusText);
    return true;
  },
  'status_500': (err, errorMessage) => {//http异常
    // Vue.prototype.$message.error(errorMessage || err.statusText);
    console.log(errorMessage || err.statusText);
    return true;
  },
  'other': (err, errorMessage) => {
    // Vue.prototype.$message.error(errorMessage || err.statusText || err.data.msg);
    console.log(err)
    console.log(errorMessage || err.statusText || err.message || err.msg || (err.data ? (err.data.message || err.data.msg) : '未知错误'));
    return true;
  },
}
