//引入所有请求
let requests = {};
const context = require.context('./requests', true, /\.js$/);
context.keys().forEach((filename) => {
  requests = {...requests, ...context(filename).default};
});

export default {
  install(Vue) {
    // 所有请求挂载$api中，this.$$api.xxxx()
    Vue.prototype.$$api = {...requests};
  }
}
