<template>
  <div class="Login">
    <img src="../assets/images/BG.png" />
    <img src="../assets/images/BG-right.png" />
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="inputArea">
        <span>车联网卡实名登记</span>
        <span>管理平台-密码修改</span>
        <el-form-item prop="password" class="position">
          <el-input placeholder="请输入旧密码" v-bind:show-password="hidePassword" v-model="loginForm.password"
            @keyup.enter.native="resetPsw"></el-input>
          <img src="../assets/images/closeEyes.png" @click.passive="changeImg" v-if="hidePassword" />
          <img src="../assets/images/openEyes.png" @click.passive="changeImg" v-if="!hidePassword" />
        </el-form-item>
        <el-form-item prop="newpassword" class="position">
          <el-input placeholder="请输入新密码" v-bind:show-password="hidePassword1" v-model="loginForm.newpassword"
            @keyup.enter.native="resetPsw"></el-input>
          <img src="../assets/images/closeEyes.png" @click.passive="changeImg1" v-if="hidePassword1" />
          <img src="../assets/images/openEyes.png" @click.passive="changeImg1" v-if="!hidePassword1" />
        </el-form-item>
        <el-form-item prop="newpassword1" class="position">
          <el-input placeholder="请确认新密码" v-bind:show-password="hidePassword2" v-model="loginForm.newpassword1"
            @keyup.enter.native="resetPsw"></el-input>
          <img src="../assets/images/closeEyes.png" @click.passive="changeImg2" v-if="hidePassword2" />
          <img src="../assets/images/openEyes.png" @click.passive="changeImg2" v-if="!hidePassword2" />
        </el-form-item>
        <div>
          <el-form-item prop="code" v-if="captchaOnOff">
            <el-input placeholder="请输入验证码" v-model="loginForm.code" @keyup.enter.native="resetPsw"></el-input>
          </el-form-item>
          <div>
            <img :src="codeUrl" @click="getCode" class="login-code-img" />
          </div>
        </div>
        <span @click.stop="resetPsw">提交</span>
        <span>请记得及时更换密码</span>
      </div>
    </el-form>
  </div>
</template>


<script>
import { removeToken } from '../utils/auth'
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import { updateUserPwd } from "@/api/system/user";

export default {
  name: "Login",
  data() {
    return {
      needRemove: true,
      hidePassword: true,
      hidePassword1: true,
      hidePassword2: true,
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        newpassword: "",
        newpassword1: "",
        rememberMe: true,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的旧密码" },
        ],
        newpassword: [
          { required: true, trigger: "blur", message: "请输入您的新密码" },
        ],
        newpassword1: [
          { required: true, trigger: "blur", message: "请确认您的新密码" },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },
      // 验证码开关
      captchaOnOff: true,
      // 注册开关
      register: true,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.getCode();
    this.getCookie();
    this.hidePassword = true;
    this.hidePassword1 = true;
    this.hidePassword2 = true;
  },
  methods: {
    changeImg() {
      console.log("================changeImg========================");
      this.hidePassword = !this.hidePassword;
    },
    changeImg1() {
      console.log("================changeImg========================");
      this.hidePassword1 = !this.hidePassword1;
    },
    changeImg2() {
      console.log("================changeImg========================");
      this.hidePassword2 = !this.hidePassword2;
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaOnOff =
          res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
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
    resetPsw() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          if (this.loginForm.newpassword === this.loginForm.newpassword1) {
            this.hidePassword = true;
            this.hidePassword1 = true;
            this.hidePassword2 = true;
            updateUserPwd(
              this.loginForm.password,
              this.loginForm.newpassword
            ).then((response) => {
              this.loginForm.password = this.loginForm.newpassword;
              this.handleLogin();
            });
          }
          else {
            this.loginForm.code = "";
            this.getCode();
            this.$message({
              message: '新密码两次输入不一致，请仔细确认！',
              type: "error",
              showClose: true,
            });
          }
        }
      });
    },
    handleLogin() {
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
            .then((res) => {
              this.needRemove = false;
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
              this.$message({
                message: '修改成功，已自动登录',
                type: "success",
                showClose: true,
              });
              this.$router.push("/index").catch(() => { });
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
    }
  },
  beforeDestroy() {
    if (this.needRemove) {
      removeToken()
    }
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "../scss/realmgn.scss";

.Login {
  position: relative;
  height: 100%;

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
      margin-top: toRem(20);
    }

    >div:nth-child(5) {
      margin: toRem(20) 0;
    }

    >div:nth-child(6) {
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
      margin: toRem(32) 0 toRem(10);
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
