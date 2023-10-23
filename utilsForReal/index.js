import merge from 'deepmerge';
import qs from 'qs';
import ResizeObserver from 'resize-observer-polyfill';
// const iconv = require('iconv-lite');
// const customerName = window.location.hash.split("&brand=")[1]


export default {
  install(Vue) {
    //vconsole调试白名单
    Vue.prototype.$$VCONSOLE_WHITELIST = process.env.VCONSOLE_WHITELIST;

    //禁用原生toFixed
    // Number.prototype.toFixed = function (len) {
    //   return Vue.prototype.$$decimal(this).toFixed(len);
    // };

    // 设置根大小
    Vue.prototype.$$setHtmlRemSize = ({psdWidth = 750, jzPx = 100, mDocEl = document.documentElement}) => {//设计稿宽度,基准值
      let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
      mDocEl.style.visibility = 'hidden';
      let setRem = function () {
        mDocEl.style.visibility = 'visible';
        mDocEl.style.fontSize = jzPx * (mDocEl.getBoundingClientRect().width / psdWidth) + 'px';
      };

      if (document.addEventListener) {
        window.addEventListener(resizeEvt, setRem, false);
        document.addEventListener('DOMContentLoaded', setRem, false);
      }
    };

    //公共定时器句柄列表
    Vue.prototype.$$public_setTimeout_handler = [];

    //判断是否为ie
    Vue.prototype.$$isIE = () => {
      let UA = window.navigator.userAgent.toLowerCase();
      return (UA.match(/mozilla/) !== null && (("ActiveXObject" in window)) || UA.match(/msie/) !== null);
    };

    //获取鼠标手指event
    Vue.prototype.$$getEvent = e => {
      if (e.type.indexOf("touch") >= 0) return e.touches[0] || e.changedTouches[0];
      return e;
    };

    //游览器参数
    Vue.prototype.$$requestParams = ((param) => {
      let url = window.location.href, params = {}, strs;
      if (url.indexOf("?") !== -1) {
        strs = (url.split('?')[1]).split("&");
        for (let i = 0; i < strs.length; i++) params[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
        return param ? params[param] : params;
      }
      return '';
    });

    //监听器
    Vue.prototype.$$addEvent = (el, eventName, listener) => {
      if (el.addEventListener) {
        el.addEventListener(eventName, listener, false);
      } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, listener);
      } else {
        el['on' + eventName] = listener;
      }
    };

    //移除监听器
    Vue.prototype.$$removeEvent = (el, eventName, listener) => {
      if (el.removeEventListener) {
        el.removeEventListener(eventName, listener, false);
      } else if (el.detachEvent) {
        el.detachEvent('on' + eventName, listener);
      } else {
        el['on' + eventName] = null;
      }
    };

    //触发监听器
    Vue.prototype.$$dispatchEvent = (el, eventName) => {
      if (el.dispatchEvent) {
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, false, false);
        el.dispatchEvent(evt, !0, !0);
      } else if (el.fireEvent) {
        let evt = document.createEventObject();
        el.fireEvent('on' + eventName, evt);
      }
    };

    //深合并
    Vue.prototype.$$deepMerge = (objects, options = {}) => merge.all([...objects], options);

    //元素属性变化 ，el=原生dom，callBack=回调函数
    Vue.prototype.$$elementResizeObserver = (el, callBack) => {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          callBack && callBack(entry.contentRect);
        }
      });
      ro.observe(el);
      return ro;
    };

    //注销变化监听 ro=ResizeObserver实例 ，el=原生dom
    Vue.prototype.$$elementResizeUnobserve = (ro, el) => {
      ro && ro.unobserve(el);
    };

    //获取元素计算后属性值
    Vue.prototype.$$getComputedStyle = (dom, style, margin) => {
      if (!style) return getComputedStyle(dom, null);
      let value = parseFloat(getComputedStyle(dom, null)[style].replace('px', ''));
      if (Vue.prototype.$$isIE() && (style === 'height' || style === 'width')) {
        value = value + (style === 'height' ? (parseFloat(getComputedStyle(dom, null)['paddingTop'].replace('px', '')) + parseFloat(getComputedStyle(dom, null)['paddingBottom'].replace('px', ''))) : 0);
        value = value + (style === 'width' ? (parseFloat(getComputedStyle(dom, null)['paddingRight'].replace('px', '')) + parseFloat(getComputedStyle(dom, null)['paddingLeft'].replace('px', ''))) : 0);
      }
      //是否需要加上margin
      if (margin) {
        value = value + (style === 'height' ? (parseFloat(getComputedStyle(dom, null)['marginTop'].replace('px', '')) + parseFloat(getComputedStyle(dom, null)['marginBottom'].replace('px', ''))) : 0);
        value = value + (style === 'width' ? (parseFloat(getComputedStyle(dom, null)['marginRight'].replace('px', '')) + parseFloat(getComputedStyle(dom, null)['marginLeft'].replace('px', ''))) : 0);
      }
      return value;
    };

    //获取页面缩放比例
    Vue.prototype.$$scale = () => {
      return Vue.prototype.$$getComputedStyle(document.body, 'width') / Vue.prototype.$$RESOLUTION.WIDTH;
    };
    Vue.prototype.$$getWindowScale = ({mDocEl = document.documentElement} = {}) => {
      return {
        w: mDocEl.getBoundingClientRect().width / Vue.prototype.$$RESOLUTION.WIDTH,
        h: mDocEl.getBoundingClientRect().height / Vue.prototype.$$RESOLUTION.HEIGHT,
      };
    };

    //脱敏器
    Vue.prototype.$$desensitizator = {
      common: str => str.substr(0, 3) + '*'.repeat(str.length - 7) + str.substr(-4),// 通用 前三后四
      email: email => {// 邮箱数据脱敏
        let split = email.split('@');
        return split[0].substr(0, 2) + '*'.repeat(split[0].length - 2) + '@' + split[1]
      },
      name: name => name.substr(0, 1) + '*'.repeat(name.length - 1)//姓名
    };

    //加密
    Vue.prototype.$$ec = params => {
      if (!params) throw new Error('ec params undefined');
      let r = [],
        s = encodeURIComponent(JSON.stringify(params)).split('');
      for (let i in s) {
        let index = Vue.prototype.$$ENCRYPT_CODES.indexOf(s[i]);
        r.push(index < 10 ? '0' + index : index);
      }
      return r.join('');
    };

    //解密
    Vue.prototype.$$dc = params => {
      if (!params) throw new Error('dc params undefined');
      let ut = [],
        u;
      u = params.replace(/(?=(\d{2})+(?!\d))/g, '|').split('|');
      for (let i in u) i > 0 && ut.push(Vue.prototype.$$ENCRYPT_CODES[Number(u[i])]);
      try {
        return JSON.parse(decodeURIComponent(ut.join('')));
      } catch (e) {
        console.error('USER_INFO DECRYPT ERROR!');
        return null;
      }
    };
    /**
     * 表单验证
     * fields：必填，输入的表单集合，
     *  示例： sizeForm: {userName: '',mobile:''},
     * rules：必填，需要效验的集合，
     *  示例： rules:{userName: [{ruleName: 'required', message: '请输入名称'}],mobile: [{ruleName: 'isMobile', message: '输入的联系方式不符合要求，请重新输入'}],},
     * fieldName：规则名称(使用哪条规则效验)，rules参数的ruleName字段
     * errorStatus：存储验证结果， 示例：xxx:{userName: "请输入名称", mobile: "输入的联系方式不符合要求，请重新输入"}
     * */
    Vue.prototype.$$validate = (fields, rules, fieldName, errorStatus) => {
      //单独验证
      if (fieldName) {
        Vue.set(errorStatus, fieldName, '');
        errorStatus[fieldName] = '';//清空状态
        let value = fields[fieldName];
        if (!rules[fieldName]) return;
        for (let rule of rules[fieldName]) {
          if (rule && rule.compare && Vue.prototype.$$validator[rule.ruleName] && !Vue.prototype.$$validator[rule.ruleName](fields[rule.compare], value)) {
            errorStatus[fieldName] = 'error';//写入错误状态
            break;
          }
          if (rule && !rule.compare && Vue.prototype.$$validator[rule.ruleName] && !Vue.prototype.$$validator[rule.ruleName](value)) {
            errorStatus[fieldName] = 'error';//写入错误状态
            break;
          }
          errorStatus[fieldName] = 'success';
          // break;
        }
        return;
      }
      return new Promise((resolve, reject) => {
        let errorMessages = {};
        for (let field in fields) {
          // if (!fields.hasOwnProperty(field)) continue;
          let value = fields[field];
          if (!rules[field]) continue;
          for (let rule of rules[field]) {
            if (rule && Vue.prototype.$$validator[rule.ruleName] && !Vue.prototype.$$validator[rule.ruleName](value)) {
              errorMessages[field] = rule.message;
              break;
            }
          }
        }
        Object.keys(errorMessages).length > 0 ? reject(errorMessages) : resolve();
      });
    };

    //安全随机数 [min,max)
    // Vue.prototype.$$getSecureRandom = ({min = 0, max = 0} = {}) => {
    //   if (min && max) return parseInt((mt.rnd() * (max - min) + min).toString());
    //   return mt.rnd();
    // };

    //获取毫秒时间
    Vue.prototype.$$getTime = () => '000' + new Date().getTime();

    //获取md5
    Vue.prototype.$$getMD5 = str => window['CryptoJS'].MD5(str).toString();

    //加密参数AES
    Vue.prototype.$$encryptAES = postParams => {
      console.log('beforeEncrypt->', JSON.stringify(postParams));
      let iv = Vue.prototype.$$getMD5(Vue.prototype.$$getTime()).substr(-16);
      return {
        iv,
        context: window['CryptoJS'].AES.encrypt(window['CryptoJS'].enc.Utf8.parse(JSON.stringify(postParams)), window['CryptoJS'].enc.Utf8.parse(Vue.prototype.$$AES_KEY), {
          iv: window['CryptoJS'].enc.Utf8.parse(iv),
          mode: window['CryptoJS'].mode.CBC,
          padding: window['CryptoJS'].pad.Pkcs7
        }).toString()
      };
    };

    //解密参数AES encryptParams={'iv','data'}
    Vue.prototype.$$decryptAES = encryptParams => {
      // encryptParams = {
      //   "context":"MGqYf/cAdnbUpniUJeZnNyo8KFXhpEyWBcpvnHlp2+uhDnGjsoUhHvnH1B/UTbH2J2nRLpko8ucqkMeY/NhSVg==",
      //   "iv":"2109061508093081"
      // }
      // console.log('1111111111', window['CryptoJS'].AES.decrypt(encryptParams.context, window['CryptoJS'].enc.Utf8.parse(Vue.prototype.$$AES_KEY), {
      //   iv: window['CryptoJS'].enc.Utf8.parse(encryptParams.iv),
      //   mode: window['CryptoJS'].mode.CBC,
      //   padding: window['CryptoJS'].pad.Pkcs7
      // }))
      // console.log('2222222222222', window['CryptoJS'].enc.Utf8.parse(encryptParams.iv))
      let result = null;
      try {
        console.log(encryptParams)
        result = window['CryptoJS'].AES.decrypt(encryptParams.context, window['CryptoJS'].enc.Utf8.parse(Vue.prototype.$$AES_KEY), {
          iv: window['CryptoJS'].enc.Utf8.parse(encryptParams.iv),
          mode: window['CryptoJS'].mode.CBC,
          padding: window['CryptoJS'].pad.Pkcs7
        }).toString(window['CryptoJS'].enc.Utf8);
        // result = window['CryptoJS'].AES.decrypt(encryptParams.context, window['CryptoJS'].enc.Utf8.parse(encryptParams.iv), {
        //   iv: window['CryptoJS'].enc.Utf8.parse(encryptParams.iv),
        //   mode: window['CryptoJS'].mode.CBC,
        //   padding: window['CryptoJS'].pad.Pkcs7
        // }).toString(window['CryptoJS'].enc.Utf8);
        console.log('afterDecrypt->', JSON.stringify(result));
        return JSON.parse(result);
      } catch (e) {
        console.log('返参转码错误：', e, result);
        return {H5CODE: "1000", H5MSG: '返参转码错误'};
      }
    };

    //获取UUID随机码
    Vue.prototype.$$getUUID = () => {
      let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      let uuid = [], i, r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Vue.prototype.$$getSecureRandom() * 16;
          uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
      }
      return uuid.join('');
    };

    //localStorage 3件套
    Vue.prototype.$$getLocalStorage = (key, type = 'string') => {
      let value = localStorage.getItem(key);
      if (!value) return null;
      if (type.toLowerCase() === 'string') return value;
      if (type.toLowerCase() === 'json') return JSON.parse(value);
    };

    Vue.prototype.$$setLocalStorage = (key, value, type = 'string') => {
      if (type.toLowerCase() === 'string') localStorage.setItem(key, value);
      if (type.toLowerCase() === 'json') localStorage.setItem(key, JSON.stringify(value));
    };

    Vue.prototype.$$removeLocalStorage = key => {
      localStorage.removeItem(key);
    };

    //sessionStorage 3件套
    Vue.prototype.$$getSessionStorage = (key, type = 'string') => {
      let value = sessionStorage.getItem(key);
      if (!value) return null;
      if (type.toLowerCase() === 'string') return value;
      if (type.toLowerCase() === 'json') return JSON.parse(value);
    };

    Vue.prototype.$$setSessionStorage = (key, value, type = 'string') => {
      if (type.toLowerCase() === 'string') sessionStorage.setItem(key, value);
      if (type.toLowerCase() === 'json') sessionStorage.setItem(key, JSON.stringify(value));
    };

    Vue.prototype.$$removeSessionStorage = key => {
      sessionStorage.removeItem(key);
    };

    //统一跳转 to跳转地址, query参数 OBJECT {a:0,b:1} 会转换成 a=0&b=1 $router=路由实例this.$router linkType跳转类型 默认local local同一项目 | project不同项目之间 newWindow是否打开新窗口
    Vue.prototype.$$goLink = ({to, query, replace = false, linkType = 'local', newWindow = false}) => {
      if (/(^http:\/\/|^https:\/\/|^\/\/)/.test(to)) {
        if (newWindow) return window.open(Vue.prototype.$$getQueryifyUrl(to, query));
        return location.href = Vue.prototype.$$getQueryifyUrl(to, query);
      }
      if (linkType === 'local') return Vue.prototype.$$eventHub.$emit('PUBLIC_CHANGE_ROUTER', {to, query, replace});
      let url = `${process.env.CONTEXT_PATH}/${Vue.prototype.$$getQueryifyUrl(to, query)}`;
      if (newWindow) return window.open(url);
      if (replace) return location.replace(url);
      location.href = url;
    };

    //对url和参数进行处理自动拼接?&  url='',query={} ,encode是否url编码
    Vue.prototype.$$getQueryifyUrl = (url, query, encode = true) => {
      if (!query) return url;
      let symbol = ~url.indexOf('?') ? '&' : '?';
      return `${url}${symbol}${qs.stringify(query, {encode})}`
    };

    //添加协议
    Vue.prototype.$$getProtocol = url => {
      if (/(^\/\/)/.test(url)) return `${Vue.prototype.$$PROTOCOL}${url}`;
      return url;
    };

    //添加资源地址
    Vue.prototype.$$getResourceUrl = url => {
      if (/(^http:\/\/|^https:\/\/|^\/\/)/.test(url)) return `${url}`;
      if (process.env.NODE_ENV === 'development') return `${Vue.prototype.$$RESOURCE_SERVER}${url}`;
      return `${url}`;
    };

    //获取静态资源地址
    Vue.prototype.$$getStaticResourceUrl = (url, type = 'images') => {
      if (/(^http:\/\/|^https:\/\/|^\/\/)/.test(url)) return `${url}`;
      return `${process.env.ASSETS_PATH}/${type}/${url}`;
    };

    //获取接口地址 3种代理类型 gateway网关 api接口 local本地  默认网关
    Vue.prototype.$$getApiServer = (proxyType = 1) => {
      if (process.env.NODE_ENV === 'development' && Vue.prototype.$$PROXY) return ['/gateway', `/${window['__APP_PROJECT_NAME__']}`, '/local'][proxyType];
      return Vue.prototype.$$API_SERVER;
    };

    //格式化请求api的地址
    Vue.prototype.$$formatApiUrl = (url) => `${url}`;

    // 问候语
    Vue.prototype.$$greetings = () => {
      return {
        '00': '凌晨好', '01': '凌晨好', '02': '凌晨好', '03': '凌晨好', '04': '凌晨好', '05': '凌晨好',
        '06': '早上好', '07': '早上好',
        '08': '上午好', '09': '上午好', '10': '上午好', '11': '上午好',
        '12': '中午好',
        '13': '下午好', '14': '下午好', '15': '下午好', '16': '下午好', '17': '下午好',
        '18': '傍晚好', '19': '傍晚好',
        '20': '晚上好', '21': '晚上好', '22': '晚上好', '23': '晚上好'
      }[new Date().Format('hh')];
    };

    //上万数据转换 10000 to 1w  value=数字 dValue=位数 unit=单位 toFixedLength=小数点位数 force=强制转换
    Vue.prototype.$$parseWan = ({value, dValue = 10000, unit = 'w', forced = !1, toFixedLength = 1}) => {
      if (forced || value >= dValue) {
        let v = (value / dValue).toFixed(toFixedLength);
        return {
          value: Number(v),
          unit,
          str: `${v}${unit}`
        };
      }
      return {
        value,
        unit: '',
        str: `${value}`
      }
    };

    //字节流量转换
    Vue.prototype.$$parseFlow = ({value, currUnit, toUnit, toFixedLength = 2}) => {
      let flowUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB'];
      currUnit = currUnit.toUpperCase();
      toUnit = toUnit.toUpperCase();
      let currUnitIndex = flowUnits.findIndex(u => u === currUnit),
        toUnitIndex = flowUnits.findIndex(u => u === toUnit);
      if (!~currUnitIndex || !~toUnitIndex || currUnitIndex === toUnitIndex) return {value, unit: currUnit};
      if (currUnitIndex > toUnitIndex) return {value: (value * (1024 ** (currUnitIndex - toUnitIndex))), unit: toUnit};
      let n = value / (1024 ** (toUnitIndex - currUnitIndex));
      return {value: (toFixedLength !== -1 ? Number(n.toFixed(toFixedLength)) : n), unit: toUnit};
    };

    //获取推荐的转换单位 values=[]
    Vue.prototype.$$getSuggestFlowUnit = ({values, currUnit}) => {
      currUnit = currUnit.toUpperCase();
      let flowUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB'];
      return flowUnits[flowUnits.findIndex(u => u === currUnit) + Math.ceil((parseInt(Math.max(...values)).toString().length - 1) / 3) - 1];
    };

    //获取推荐的转换单位 按展示位数 size=实际位数包含小数 decimalSize小数位数    例子 只能展示12345.67   size=7 decimalSize=2
    Vue.prototype.$$getSuggestFlowUnitBySize = ({value, currUnit, size, decimalSize = 2}) => {
      currUnit = currUnit.toUpperCase();
      let flowUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB'];
      let count = 0, currIndex = flowUnits.findIndex(f => f === currUnit);
      while (value.toString().length > (size - decimalSize)) {
        value = parseInt(value / 1024);
        count++;
      }
      return flowUnits[currIndex + count];
    };

    //格式化省市 去掉省市自治区
    Vue.prototype.$$parseProvince = province => province.replace(/(维吾尔自治区|壮族自治区|回族自治区|自治区|特别行政区|省|市)$/g, '');

    //获取月份天数
    Vue.prototype.$$getDayCountOfMonth = (year, month) => {
      return [0, 31, ((year % 100 === 0 && year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };

    //获取变量类型
    Vue.prototype.$$getVariableType = v => Object.prototype.toString.call(v);

    //格式化联系方式 ，return 1xx xxxx xxxx
    Vue.prototype.$$formatMobile = val => (val + '').replace(/(\d{1,3})(?=(\d{4})+(?:$|\.))/g, '$1 ');

    //去除字符串中的空格 ，val： 1xx xxxx xxxx ，return 1xxxxxxxxxx
    Vue.prototype.$$mobileTrim = val => (val + '').replace(/\s+/g, '');

  }
};
