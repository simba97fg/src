<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
// @ is an alias to /src

export default {
  name: "App",
  components: {},
  data() {
    return {};
  },
  methods: {},
  created() { },
  mounted() { },
  beforeDestroy() { },
};
</script>
<style  lang="scss">
@import "@/scss/realmgn.scss";

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
}</style>
