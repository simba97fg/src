<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Cookies from 'js-cookie'

export default {
  name: "App",
  methods: {
    beforeunloadHandler() {
      this.beforeUnload_time = new Date().getTime();
    },
    unloadHandler() {
      this._gap_time = new Date().getTime() - this.beforeUnload_time;
      console.log(this._gap_time)
      //判断是窗口关闭还是刷新
      if (this._gap_time <= 5) {
        console.log('执行关闭方法')
        Cookies.remove(TokenKey)
      }
    }
  },
  beforeDestroy() {
    this.$store.dispatch("LogOut").then(() => { });
  },
  destroyed() {
    window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
    window.removeEventListener('unload', e => this.unloadHandler(e))
  },
  mounted() {
    window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
    window.addEventListener('unload', e => this.unloadHandler(e))
  },
  metaInfo() {
    return {
      title: '小米汽车实名登记',
      titleTemplate: (title) => {
        return title
          ? `${title}${process.env.VUE_APP_TITLE}`
          : process.env.VUE_APP_TITLE;
      },
    };

  },
};
</script>
<style  lang="scss">
@import "./scss/realmgn.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  scrollbar-width: thin;
}

::-webkit-scrollbar-thumb {
  width: 6px;
  max-height: 400px;
  background: #e3e3e3;
  border-radius: 6px;
}

::-webkit-scrollbar {
  width: 10px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #f5f5f5;
  height: 8px;
}

::-webkit-input-placeholder {
  font-size: toRem(14);
}

:-moz-placeholder {
  font-size: toRem(14);
}

::-moz-placeholder {
  font-size: toRem(14);
}

::-ms-input-placeholder {
  font-size: toRem(14);
}

.popperclass.el-tooltip__popper[x-placement^="bottom-start"] {
  padding: 0 !important;
}

.popperclass.el-tooltip__popper[x-placement^="bottom-start"].is-light {
  border-radius: toRem(5);
  border: 1px solid #EAEAEA;
}

::v-deep .el-dropdown-menu__item {
  font-size: toRem(14) !important;
}
</style>
