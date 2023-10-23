<template>
  <div class="Login">
    <img src="../assets/images/BG.png" />
    <img src="../assets/images/BG-right.png" />
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="inputArea">
        <span>车联网卡实名登记</span>
        <span>管理平台</span>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" @keyup.enter.native="handleLogin"></el-input>
        </el-form-item>
        <el-form-item prop="password" class="position">
          <el-input v-bind:show-password="hidePassword" v-model="loginForm.password" @keyup.enter.native="handleLogin">
          </el-input>
          <img src="../assets/images/closeEyes.png" @click.passive="changeImg" v-if="hidePassword" />
          <img src="../assets/images/openEyes.png" @click.passive="changeImg" v-if="!hidePassword" />
        </el-form-item>
        <div>
          <el-form-item prop="code" v-if="captchaOnOff">
            <el-input v-model="loginForm.code" @keyup.enter.native="handleLogin"></el-input>
          </el-form-item>
          <div>
            <img :src="codeUrl" @click="getCode" class="login-code-img" />
          </div>
        </div>
        <span>验证码还有{{ codeTime }}秒过期</span>
        <span @click.stop="handleLogin">登录</span>
        <span>忘记密码？请联系管理员</span>
        <div class="version" style="opacity: 20%;">version: {{ version }}</div>
      </div>
    </el-form>
  </div>
</template>


<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";

export default {
  name: "Login",
  data() {
    return {
      codeTime: 60,
      hidePassword: true,
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        rememberMe: true,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      // 验证码开关
      captchaOnOff: true,
      // 注册开关
      register: true,
      redirect: undefined,
      version: '1.0.0',//this.$$version
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
        this.getCode();
      },
      immediate: true,
    },
    codeTime(val) {
      if (val == 0) {
        this.getCode();
      }
    }
  },
  created() {
    this.getCode();
    this.getCookie();
    this.hidePassword = true;
  },
  methods: {
    changeImg() {
      console.log("================changeImg========================");
      this.hidePassword = !this.hidePassword;
    },
    minCodeTime() {
      if (this.codeTime > 0) {
        this.codeTime = this.codeTime - 1;
      }

    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaOnOff =
          res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeTime = 60;
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      console.log("handleLogin");
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = this.$loading({
            lock: true,
            text: "加载中",
            background: "rgba(0, 0, 0, 0.7)",
          });
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(res => {
              this.loading.close();
              if (res.data.code == 208) {
                Cookies.set("username", this.loginForm.username, { expires: 30 });
                console.log('=======res=== res.data.code==', res.data)
                this.$message({
                  message: res.data.msg + '，请修改密码！',
                  type: "error",
                  showClose: true,
                });
                this.$router.push("/resetPsw").catch(() => { });
              } else {
                var today =
                  new Date().getFullYear() +
                  (new Date().getMonth() + 1 > 9
                    ? new Date().getMonth() + 1
                    : "0" + (new Date().getMonth() + 1)
                  ).toString() +
                  (new Date().getDate() > 9
                    ? new Date().getDate()
                    : "0" + new Date().getDate()
                  ).toString();
                Cookies.set("today", today);
                this.$router.push("/").catch(() => { });
              }
            })
            .catch(() => {
              this.loading.close();
              if (this.captchaOnOff) {
                this.loginForm.code = "";
                this.getCode();
              }
            });
        }
      });
    },
  },
  beforeDestroy() {
    clearInterval(this.codeTimer);
  },
  mounted() {
    this.codeTimer = window.setInterval(this.minCodeTime, 1000);
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "../scss/realmgn.scss";

.Login {
  position: relative;
  height: 100%;

  .version {
    color: gray;
    position: fixed;
    font-size: 20px;
    right: 0;
    top: 0;
  }

  >img:first-child {
    width: 100%;
    height: 100%;
  }

  >img:nth-child(2) {
    position: absolute;
    right: 0;
    width: 1440px;
    height: 900px;
  }

  .inputArea {
    position: absolute;

    top: 24%;
    left: 15%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .position {
      img {
        position: absolute;
        top: 0.07rem;
        left: 3rem;
        cursor: pointer;
        z-index: 999;
      }
    }

    ::v-deep.el-input__icon {
      display: none;
    }

    ::v-deep .el-input__inner {
      height: toRem(40) !important;
    }

    >span {
      display: inline-block;
      color: #373737;
    }

    >span:first-child {
      font-size: toRem(42);
      font-weight: 600;
      line-height: toRem(59);
    }

    >span:nth-child(2) {
      font-size: toRem(36);
      line-height: toRem(50);
      margin-bottom: toRem(40);
    }

    >div:nth-child(4) {
      margin: toRem(20) 0;
    }

    >div:nth-child(5) {
      height: toRem(40);
      display: flex;
      width: toRem(340);
      justify-content: space-between;

      >div:first-child {
        width: toRem(200);
      }

      >div:last-child {
        display: flex;

        .login-code-img {
          width: toRem(126);
          height: toRem(40);
          border-radius: 4px;
        }
      }
    }

    >span:nth-child(6) {
      color: #373737;
      font-size: 12px;
      line-height: 1;
      padding-top: 4px;
      margin-left: auto;
    }

    >span:nth-child(7) {
      width: toRem(340);
      height: toRem(44);
      background: #1e6fff;
      box-shadow: 0px 2px 12px 0px rgba(160, 160, 160, 0.38);
      border-radius: toRem(22);
      color: white;
      font-size: toRem(16);
      font-weight: 600;
      line-height: toRem(44);
      cursor: pointer;
      margin: toRem(20) 0 toRem(10);
      text-align: center;
    }

    >span:nth-child(7):hover {
      opacity: 0.85;
    }

    >span:nth-child(8) {
      font-size: toRem(12);
      color: #2173f8;
      line-height: toRem(17);
    }
  }
}
</style>
