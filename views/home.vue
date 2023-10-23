<template>
  <div class="home" @click="messageVisiable = false">
    <el-drawer :visible.sync="drawer" direction="rtl" size="43.05%" class="drawer" :before-close="drawerCLose">
      <div slot="title">
        <span>修改密码</span>
        <span v-show="false"></span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span>原密码</span>
          <el-input placeholder="请输入" show-password v-model="loginForm.password" v-if="loginForm.hidePassword"
            @input="checkL">
          </el-input>
          <el-input placeholder="请输入" v-model="loginForm.password" v-if="!loginForm.hidePassword" @input="checkL">
          </el-input>
          <img src="../assets/images/closeEyes.png" @click="loginForm.hidePassword = false"
            v-if="loginForm.hidePassword" />
          <img src="../assets/images/openEyes.png" @click="loginForm.hidePassword = true"
            v-if="!loginForm.hidePassword" />
        </div>
        <div>
          <span>新密码</span>
          <el-input placeholder="请输入" show-password v-model="loginForm.newPassword" v-if="loginForm.hideNewPassword"
            v-bind:class="{ redInput: !loginForm.pswOk }" @input="checkPassword">
          </el-input>
          <el-input placeholder="请输入" v-model="loginForm.newPassword" v-if="!loginForm.hideNewPassword"
            v-bind:class="{ redInput: !loginForm.pswOk }" @input="checkPassword">
          </el-input>
          <img src="../assets/images/closeEyes.png" @click="loginForm.hideNewPassword = false"
            v-if="loginForm.hideNewPassword" />
          <img src="../assets/images/openEyes.png" @click="loginForm.hideNewPassword = true"
            v-if="!loginForm.hideNewPassword" />
        </div>
        <p v-bind:class="{ redSpan: !loginForm.pswOk }">
          8-32位，由数字、大写字母、小写字母、半角特殊字符（除空格）组成
        </p>
        <div>
          <span>验证码</span>
          <el-input placeholder="请输入" v-model="loginForm.code" @input="checkL"></el-input>
          <img :src="codeUrl" @click="getCode" />
        </div>
      </div>
      <el-divider></el-divider>
      <div>
        <span class="btnBase" v-if="!isDisabled" @click="updatePassword">确定</span>
        <span class="btnBase disabledBtn" v-if="isDisabled">确定</span>
      </div>
    </el-drawer>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认退出系统</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="logout">确 定</el-button>
      </span>
    </el-dialog>
    <div id="nav">
      <div> <img src="../assets/images/logo.png" /></div>
      <el-divider direction="vertical"></el-divider>
      <el-tabs v-model="activeIndex" @tab-click="handleClick" :before-leave="beforeLeave">
        <el-tab-pane label="首页" name="1"></el-tab-pane>
        <el-tab-pane name="2" v-if="personalRealAuth || unitRealAuth || noRealNameCard || testingAuth
          ">
          <span slot="label">
            <el-dropdown placement="bottom">
              <span class="el-dropdown-link"> 实名记录 </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="clickItem('2', 'GR')" v-if="personalRealAuth">个人实名记录</el-dropdown-item>
                <el-dropdown-item v-if="unitRealAuth" @click.native="clickItem('2', 'DW')">单位实名记录</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('2', 'WSM')" v-if="noRealNameCard">未实名号卡</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('2', 'CSQ')" v-if="testingAuth">测试期实名记录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </el-tab-pane>
        <el-tab-pane name="3" v-if="unitCarUnbind || personOtherIdcard || personCarUnbind || unitIdcard
          ">
          <span slot="label">
            <el-dropdown placement="bottom">
              <span class="el-dropdown-link"> 人工审核 </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="clickItem('3', 'GRQT')" v-if="personOtherIdcard">个人其他证件
                </el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('3', 'DWZJ')" v-if="unitIdcard">单位证件</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('3', 'GRCL')" v-if="personCarUnbind">个人车辆解绑
                </el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('3', 'DWCL')" v-if="unitCarUnbind">单位车辆解绑</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </el-tab-pane>
        <el-tab-pane name="4" v-if="carinfoManage || accountManage">
          <span slot="label">
            <el-dropdown placement="bottom">
              <span class="el-dropdown-link"> T1数据管理 </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="clickItem('4', 'CL')" v-if="carinfoManage">车辆信息管理</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('4', 'KH')" v-if="accountManage">开户信息管理</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </el-tab-pane>

        <el-tab-pane name="5" v-if="msgManage || unitLinkManage || realNameUnbind">
          <span slot="label">
            <el-dropdown placement="bottom">
              <span class="el-dropdown-link"> 其他业务管理 </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="clickItem('5', 'DXZX')" v-if="msgManage">短信中心</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('5', 'DWSM')" v-if="unitLinkManage">单位实名链接管理
                </el-dropdown-item>

                <el-dropdown-item @click.native="clickItem('5', 'SMJB')" v-if="realNameUnbind">实名信息解绑</el-dropdown-item>
                <el-dropdown-item @click.native="clickItem('5', 'GXSM')" v-if="resetRealNameCard">更换车联网卡
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </el-tab-pane>
        <el-tab-pane label="设备管理" name="6" v-if="deviceManage"></el-tab-pane>
      </el-tabs>
      <el-divider direction="vertical"></el-divider>
      <div>
        <el-dropdown v-bind:class="{ isclick: activeIndex == '0' }"
          v-show="orderManage || userManage || logManage || setRules || exterAbility">
          <span class="el-dropdown-link">
            工具<i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="toManage('1')" v-if="orderManage">订单管理</el-dropdown-item>
            <el-dropdown-item v-if="userManage" @click.native="toManage('2')">账号管理</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('3')" v-if="logManage">日志管理</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('4')" v-if="setRules">规则配置</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('5')" v-if="quotaManage">额度管理</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('6')" v-if="exterAbility">外部能力调用</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('7')" v-if="instructionReport">指令采集响应</el-dropdown-item>
            <el-dropdown-item @click.native="toManage('8')" v-if="realNameInTele">电信侧实名同步</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div>
          <img src="../assets/images/message.png" @click.stop="getMessageList1" /><span
            @click.stop="messageVisiable = true" v-if="messageList.newsTotalNum && messageList.newsTotalNum > 0">{{
              messageList.newsTotalNum
            }}</span>
          <div v-if="messageVisiable" @click.stop="messageVisiable = true">
            <div v-for="(node, index) in messageList.newsListData" :key="index">
              <div>
                <span>{{ node.titleName }}</span>
                <span> ({{ node.num }})</span>
              </div>
              <div>
                <span>最早来自 </span>
                <span> {{ node.time }}</span>
              </div>
              <span @click.stop="checkMessage(node.titleName)">查看</span>
              <el-divider></el-divider>
            </div>
          </div>
        </div>

        <el-dialog style="padding-top: 15%" :visible.sync="centerDialogVisible" width="30%" center :show-close="false"
          :close-on-click-modal="false" :close-on-press-escape="false">
          <p>长时间未操作，强制退出系统！</p>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="logout">确 定</el-button>
          </span>
        </el-dialog>
        <!-- <el-dropdown>
          <span class="el-dropdown-link">
            <img src="../assets/images/index-user.png" />
          </span>
          <el-dropdown-menu slot="dropdown" v-if="false">
            <el-dropdown-item @click.native="drawer = true">修改密码</el-dropdown-item>
            <el-dropdown-item @click.native="dialogVisible = true">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
      </div>
    </div>
    <el-divider></el-divider>
    <router-view ref="child" />
  </div>
</template>

<script>
import { getToken, removeToken } from '@/utils/auth'
import watermark from "@/utils/watermark";
import Vue from "vue";
import Cookies from "js-cookie";
import { getCodeImg } from "@/api/login";
import { updateUserPwd } from "@/api/system/user";
import { treeselect } from "@/api/system/dept";
import auth from "@/plugins/auth";
const timeOut = 30 * 60 * 1000;
// const timeOut = 1000;
export default {
  name: "App",
  components: {},
  data() {
    return {
      centerDialogVisible: false,
      isClickList: false,
      messageVisiable: false,
      messageList: [],
      isDisabled: true,
      codeUrl: "",
      loginForm: {
        pswOk: true,
        username: "",
        password: "",
        hidePassword: true,
        newPassword: "",
        hideNewPassword: true,
        code: "",
        uuid: "",
      },
      drawer: false,
      dialogVisible: false,
      isManager: false,
      activeIndex: "1",
      personalRealAuth: null,
      unitRealAuth: null,
      unitCarUnbind: null,
      personOtherIdcard: null,
      personCarUnbind: null,
      unitIdcard: null,
      userManage: null,
      logManage: null,
      instructionReport: null,
      realNameInTele: null,
      setRules: null,
      quotaManage: null,
      exterAbility: null,
      deviceManage: null,
      accountManage: null,
      carinfoManage: null,
      noRealNameCard: null,
      testingAuth: null,
      orderManage: null,
      realNameUnbind: null,
      resetRealNameCard: null,
      unitLinkManage: null,
      msgManage: null,
      indexPool: [],
    };
  },
  computed: {
    deptLevel() {
      return this.$store.getters.deptLevel;
    },
    routes() {
      return this.$store.getters.addRoutes;
    },
    role() {
      return this.$store.getters.roles;
    },
    userId() {
      return this.$store.getters.userId;
    },
    userName() {
      return this.$store.getters.name;
    },
    nickName() {
      return this.$store.getters.nickname;
    },
  },
  watch: {
    routes() {
      console.log(this.routes);
    },
  },
  methods: {
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
    checkTimeout() {
      //更新当前时间
      let currentTime = new Date().getTime();
      let lastTime = Cookies.get("lastTime");
      console.log('==========退出=======', currentTime, Number(lastTime), timeOut, currentTime - Number(lastTime) - timeOut)
      //判断是否超时
      if (!isNaN(Number(lastTime)) && (currentTime - Number(lastTime) >= timeOut)) {
        clearInterval(this.timer1);
        Cookies.set('lastTime', '')
        this.centerDialogVisible = true;
      }
    },
    checkPassword() {
      this.loginForm.pswOk = false;
      var testPassword =
        /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]*$/;

      if (
        testPassword.test(
          this.loginForm.newPassword.replace(/\s+/g, "")
        ) && (this.loginForm.newPassword.replace(/\s+/g, "").length >= 8)
      ) {
        this.loginForm.pswOk = true;
        this.checkL();
      }

    },
    checkL() {
      this.isDisabled = true;
      if (this.loginForm.password.replace(/\s+/g, "").length >= 6) {
        if (this.loginForm.code.length > 0) {
          if (this.loginForm.pswOk) {
            this.isDisabled = false;
          }
        }

      }
    },
    updatePassword() {
      console.log(Cookies.get("userName"));
      this.loginForm.username = Cookies.get("userName");
      this.$store
        .dispatch("Login", this.loginForm)
        .then(() => {
          updateUserPwd(
            this.loginForm.password.replace(/\s+/g, ""),
            this.loginForm.newPassword.replace(/\s+/g, "")
          ).then((response) => {
            this.resetLoginForm();
            this.$message({
              message: "修改成功！",
              type: "success",
              showClose: true,
            });
            this.drawer = false;
          });
        })
        .catch(() => {
          this.getCode();
          this.loginForm.code = "";
        });
    },
    drawerCLose() {
      this.resetLoginForm();
      this.drawer = false;
    },
    resetLoginForm() {
      this.isDisabled = true;
      this.loginForm = {
        pswOk: true,
        username: "",
        password: "",
        hidePassword: true,
        newPassword: "",
        hideNewPassword: true,
        code: "",
        uuid: "",
      };
    },
    toManage(type) {
      this.activeIndex = "0";
      if (type == "1") {
        this.$router.push("/orderManage");
      } else if (type == "2") {
        this.$router.push("/userManage");
      } else if (type == "3") {
        this.$router.push("/logManage");
      } else if (type == "4") {
        this.$router.push("/setRules");
      } else if (type == "5") {
        this.$router.push("/quotaManage");
      } else if (type == "6") {
        this.$router.push("/exterAbility");
      }
      else if (type == "7") {
        this.$router.push("/instructionReport");
      }
      else if (type == "8") {
        this.$router.push("/realNameInTele");
      }
    },
    async logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.href = "/realmgn";

      });
      this.centerDialogVisible = false
    },
    setpersonalRealAuth(node) {
      this.personalRealAuth = node;
    },
    clickItem(activeIndex, type) {
      this.isClickList = true;
      this.activeIndex = activeIndex;
      if (type == "GR") {
        this.$router.push("/personalRealAuth");
      } else if (type == "DW") {
        this.$router.push("/unitRealAuth");
      } else if (type == "WSM") {
        this.$router.push("/noRealNameCard");
      } else if (type == "CSQ") {
        this.$router.push("/testingAuth");
      }
      else if (type == "GRCL") {
        this.$router.push("/personCarUnbind");
      } else if (type == "DWCL") {
        this.$router.push("/unitCarUnbind");
      } else if (type == "GRQT") {
        this.$router.push("/personOtherIdcard");
      } else if (type == "DWZJ") {
        this.$router.push("/unitIdcard");
      }
      else if (type == "CL") {
        this.$router.push("/carinfoManage");
      } else if (type == "KH") {
        this.$router.push("/accountManage");
      } else if (type == "DXZX") {
        this.$router.push("/msgManage");
      } else if (type == "DWSM") {
        this.$router.push("/unitLinkManage");
      } else if (type == "SMJB") {
        this.$router.push("/realNameUnbind");
      } else if (type == "GXSM") {
        this.$router.push("/resetRealNameCard");
      }
      this.$nextTick(() => {
        this.isClickList = false;
      });
    },
    beforeLeave(activeName, oldActiveName) {
      if (activeName == "0") return true;
      if (["1", "6"].indexOf(activeName) != -1) {
        this.isClickList = false;
        return true;
      } else if (["1", "6"].indexOf(activeName) < 0 && !this.isClickList) {
        console.log(["1", "6"].indexOf(activeName), oldActiveName);
        this.isClickList = false;
        return false;
      }
      this.isClickList = false;
    },
    handleClick() {
      this.isClickList = false;
      if (this.activeIndex == "1") {
        if (this.isManager) {
          this.$router.push("/index");
        } else {
          this.$router.push("/indexForStaff");
        }
      } else if (this.activeIndex == "6") {
        this.$router.push("/deviceManage");
      } else {
      }
    },
    checkMessage(name) {
      this.messageVisiable = false;
      this.isClickList = true;
      console.log();
      if (name.indexOf("待审核") != -1) {
        this.activeIndex = "3";
        if (name.indexOf("个人其他") != -1) {
          this.$router.push("/personOtherIdcard");
        } else if (name.indexOf("单位证件") != -1) {
          this.$router.push("/unitIdcard");
        } else if (name.indexOf("个人车辆") != -1) {
          this.$router.push("/personCarUnbind");
        } else if (name.indexOf("单位车辆") != -1) {
          this.$router.push("/unitCarUnbind");
        } else if (name.indexOf("证件更新") != -1) {
          Cookies.set("auditTab", "5");
        }
      } else if (name.indexOf("T1") != -1) {
        this.activeIndex = "4";
        this.$router.push("/accountManage");
      } else {
      }
      this.$nextTick(() => {
        this.isClickList = false;
      });
    },
    getMessageList1() {
      this.messageVisiable = true;
      this.getMessageList();
    },
    async getMessageList() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBase",
        serviceName: "query-message",
        method: "get",
      });
      if (res) {
        // res.data.forEach((el) => {
        //   if (el.titleName.indexOf("个人实名") != -1) {
        //     Cookies.set("grjb", el.num);
        //   }
        //   if (el.titleName.indexOf("单位实名") != -1) {
        //     Cookies.set("dwjb", el.num);
        //   }
        //   if (el.titleName.indexOf("单位证件") != -1) {
        //     Cookies.set("dwsm", el.num);
        //   }
        //   if (el.titleName.indexOf("其他证件") != -1) {
        //     Cookies.set("grsm", el.num);
        //   }
        // });
        this.messageList = res.data;
      }
    },
    async getoptions() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getChannelTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetChannelType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions1() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getCardTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetCardType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions2() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getCardStateComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetCardState", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions3() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getVehicleStatusComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetVehicleStatus", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions4() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getOrderSceneTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetOrderSceneType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions5() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getVehicleCardTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetVehicleCardType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions6() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getVehicleFlagComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetVehicleFlag", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions7() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getVehicleBrandComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetVehicleBrand", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions8() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getIspNameComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetIspName", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions9() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getChannelTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetChannelType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions10() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getDWCardTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetDWCardType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions11() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getFlowComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetFlow", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions12() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getOrderTypeComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetOrderType", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions13() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getStatusComboBox",
        method: "get",
      });
      if (res) {
        this.$store
          .dispatch("GetStatus", res.data)
      }
      if (err) {
        console.log(err);
      }
    },
    getBox() {
      this.getoptions();
      this.getoptions1();
      this.getoptions2();
      this.getoptions3();
      this.getoptions4();
      this.getoptions5();
      this.getoptions6();
      this.getoptions7();
      this.getoptions8();
      this.getoptions9();
      this.getoptions10();
      this.getoptions11();
      this.getoptions12();
      this.getoptions13();
      treeselect().then((response) => {
        this.$store
          .dispatch("GetDept", response.data)
      });
    },
    checkTime(e) {
      if (this.centerDialogVisible) {
        this.logout();
      }
    },
    async getLogin() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameLogin",
        serviceName: "login",
        serviceParameter: {
          parameter: {
            "source": "MIDUN_CAS"
          }
        },
        method: "post",
      });
      if (err) {
        console.log("err", err);
        window.location.href = 'https://cas.mioffice.cn/login'
      }
      if (res) {
        this.$store
          .dispatch("LoginInXM", res)
          .then(ress => {
            this.getBox();
            this.$store.dispatch('GetInfo').then((resss) => {
              console.log("========================MIDUN_CAS==========role===============", this.role[0]);
              Cookies.set("userName", this.userName, { expires: 30 });
              Cookies.set("userId", this.userId, { expires: 30 });
              Cookies.set("role", this.role[0], { expires: 30 });
              Cookies.set("nickName", this.nickName, { expires: 30 });
              this.personalRealAuth = auth.hasPermiOr(["home:personalRealAuth:list", 'home:personalRealAuth:detail', 'home:personalRealAuth:export']);
              this.unitRealAuth = auth.hasPermiOr(["home:unitRealAuth:list", 'home:unitRealAuth:detail', 'home:unitRealAuth:export']);
              this.unitCarUnbind = auth.hasPermiOr(["home:unitCarUnbind:list", 'home:unitCarUnbind:detail', 'home:unitCarUnbind:export', 'home:unitCarUnbind:change']);
              this.personOtherIdcard = auth.hasPermiOr(["home:personOtherIdcard:list", 'home:personOtherIdcard:detail', 'home:personOtherIdcard:export', 'home:personOtherIdcard:change']);
              this.personCarUnbind = auth.hasPermiOr(["home:personCarUnbind:list", 'home:personCarUnbind:detail', 'home:personCarUnbind:export', 'home:personCarUnbind:change']);
              this.unitIdcard = auth.hasPermiOr(["home:unitIdcard:list", 'home:unitIdcard:detail', 'home:unitIdcard:export', 'home:unitIdcard:change']);
              this.userManage = auth.hasPermi("home:userManage:list");
              this.logManage = auth.hasPermi("home:logManage:list");
              this.instructionReport = auth.hasPermi("home:instructionReport:list");
              this.realNameInTele = auth.hasPermi("home:realNameInTele:list");
              this.orderManage = auth.hasPermi("home:orderManage:list");
              this.setRules = auth.hasPermi("home:setRules:list") && this.deptLevel <= 2;
              this.exterAbility = auth.hasPermi("home:exterAbility:list");
              this.accountManage = auth.hasPermiOr(["home:accountManage:list", 'home:accountManage:change', 'home:accountManage:export']);
              this.carinfoManage = auth.hasPermiOr(["home:carinfoManage:list", 'home:carinfoManage:change', 'home:carinfoManage:export']);
              this.noRealNameCard = auth.hasPermiOr(["home:noRealNameCard:list", 'home:noRealNameCard:export']);

              this.realNameUnbind = auth.hasPermiOr(["home:realNameUnbind:list", 'home:realNameUnbind:detail', 'home:realNameUnbind:change']);

              this.resetRealNameCard = auth.hasPermiOr(["home:resetRealNameCard:list", 'home:resetRealNameCard:change']);
              this.testingAuth = auth.hasPermiOr(["home:testingAuth:list", 'home:testingAuth:detail', 'home:testingAuth:export']);

              this.msgManage = auth.hasPermiOr(["home:msgManage:list", 'home:msgManage:change', 'home:msgManage:export']);
              this.deviceManage = auth.hasPermiOr(["home:deviceManage:list", 'home:deviceManage:change']);
              this.quotaManage = false;

              this.unitLinkManage = auth.hasPermiOr(["home:unitLinkManage:list", 'home:unitLinkManage:detail', 'home:unitLinkManage:export']);
              watermark.set(this.nickName + " " + this.userName);
              if (this.role[0].indexOf("admin") != -1) {
                console.log("========================MIDUN_CAS==============admin===========", res);
                this.isManager = true;
              } else {
                this.$router.push("/indexForStaff");
              }
            }).catch(err => {
              this.$message({
                message: `无相关人员信息`,
                type: "error",
                showClose: true,
              });
              window.location.href = 'https://cas.mioffice.cn/login'
            })
          })
          .catch(() => {
          });
      }
    },
  },
  created() {
    if (getToken()) {
      window.addEventListener('beforeunload', e => this.checkTime(e))
    }

  },
  mounted() {


    //需注意
    // this.personalRealAuth = true;
    // this.unitRealAuth = true;
    // this.unitCarUnbind = true;
    // this.userManage = true;
    //需注意
    if (getToken()) {
      this.$store.dispatch('GetInfo').then((resss) => {
        console.log("========================MIDUN_CAS==========role===============", this.role[0]);
        Cookies.set("userName", this.userName, { expires: 30 });
        Cookies.set("userId", this.userId, { expires: 30 });
        Cookies.set("role", this.role[0], { expires: 30 });
        Cookies.set("nickName", this.nickName, { expires: 30 });
        this.personalRealAuth = auth.hasPermiOr(["home:personalRealAuth:list", 'home:personalRealAuth:detail', 'home:personalRealAuth:export']);
        this.unitRealAuth = auth.hasPermiOr(["home:unitRealAuth:list", 'home:unitRealAuth:detail', 'home:unitRealAuth:export']);
        this.unitCarUnbind = auth.hasPermiOr(["home:unitCarUnbind:list", 'home:unitCarUnbind:detail', 'home:unitCarUnbind:export', 'home:unitCarUnbind:change']);
        this.personOtherIdcard = auth.hasPermiOr(["home:personOtherIdcard:list", 'home:personOtherIdcard:detail', 'home:personOtherIdcard:export', 'home:personOtherIdcard:change']);
        this.personCarUnbind = auth.hasPermiOr(["home:personCarUnbind:list", 'home:personCarUnbind:detail', 'home:personCarUnbind:export', 'home:personCarUnbind:change']);
        this.unitIdcard = auth.hasPermiOr(["home:unitIdcard:list", 'home:unitIdcard:detail', 'home:unitIdcard:export', 'home:unitIdcard:change']);
        this.userManage = auth.hasPermi("home:userManage:list");
        this.logManage = auth.hasPermi("home:logManage:list");
        this.instructionReport = auth.hasPermi("home:instructionReport:list");
        this.realNameInTele = auth.hasPermi("home:realNameInTele:list");
        this.orderManage = auth.hasPermi("home:orderManage:list");
        this.setRules = auth.hasPermi("home:setRules:list") && this.deptLevel <= 2;
        this.exterAbility = auth.hasPermi("home:exterAbility:list");
        this.accountManage = auth.hasPermiOr(["home:accountManage:list", 'home:accountManage:change', 'home:accountManage:export']);
        this.carinfoManage = auth.hasPermiOr(["home:carinfoManage:list", 'home:carinfoManage:change', 'home:carinfoManage:export']);
        this.noRealNameCard = auth.hasPermiOr(["home:noRealNameCard:list", 'home:noRealNameCard:export']);

        this.realNameUnbind = auth.hasPermiOr(["home:realNameUnbind:list", 'home:realNameUnbind:detail', 'home:realNameUnbind:change']);

        this.resetRealNameCard = auth.hasPermiOr(["home:resetRealNameCard:list", 'home:resetRealNameCard:change']);
        this.testingAuth = auth.hasPermiOr(["home:testingAuth:list", 'home:testingAuth:detail', 'home:testingAuth:export']);

        this.msgManage = auth.hasPermiOr(["home:msgManage:list", 'home:msgManage:change', 'home:msgManage:export']);
        this.deviceManage = auth.hasPermiOr(["home:deviceManage:list", 'home:deviceManage:change']);
        this.quotaManage = false;

        this.unitLinkManage = auth.hasPermiOr(["home:unitLinkManage:list", 'home:unitLinkManage:detail', 'home:unitLinkManage:export']);
        watermark.set(this.nickName + " " + this.userName);
        if (this.role[0].indexOf("admin") != -1) {
          this.isManager = true;
          this.handleClick();
        }
      }).catch(err => {
        this.$message({
          message: `有token`,
          type: "error",
          showClose: true,
        });
        window.location.href = 'https://cas.mioffice.cn/login'
      })
      this.getBox();
      // 每30秒 调用检查时间的方法
      this.$nextTick(function () {
        this.timer1 = setInterval(this.checkTimeout, 10 * 60 * 1000);
        // this.timer1 = setInterval(this.checkTimeout, 1000);
      })
      // 页面监听 按下鼠标更新操作时间
      window.document.onmousedown = function () {
        Cookies.set('lastTime', new Date().getTime().toString())
      }

      this.getMessageList();
      this.timer = setInterval(this.getMessageList, 60000);
    } else {
      this.getLogin();
    }
  },
  beforeDestroy() {
    if (getToken()) {
      clearInterval(this.timer);
    }
  },
};
</script>
<style  lang="scss" scoped>
@import "../scss/realmgn.scss";

.home {
  .el-drawer__body {
    .el-divider--horizontal {
      top: unset;
    }

    >div:nth-child(2) {
      position: relative;

      >div {
        position: relative;
        display: flex;
        font-size: 0.14rem;
        margin-bottom: 0.2rem;
        margin-left: 0.4rem;

        >span {
          width: 0.76rem;
          line-height: 0.4rem;
          text-align: left;
          font-weight: 600;
        }

        >div {
          width: 3.3rem;

          ::v-deep .el-input__inner {
            height: 0.4rem;
          }

          ::v-deep .el-input__suffix {
            display: none;
          }
        }

        >img {
          position: absolute;
          height: 0.16rem;
          top: 0.125rem;
          left: 3.7rem;
          cursor: pointer;
        }
      }

      >div:nth-child(2) {
        margin-bottom: 0.4rem;
      }

      >div:nth-child(4) {
        >div {
          width: 2rem;
          margin-right: 0.12rem;
        }

        >img {
          position: unset;
          width: toRem(118);
          height: 0.4rem;
          cursor: pointer;
        }
      }

      >p {
        display: inline-block;
        font-size: toRem(12);
        color: rgba(0, 0, 0, 0.35);
        position: absolute;
        top: 1rem;
        left: 1.16rem;
      }
    }
  }

  #nav {
    display: flex;
    height: toRem(60);
    align-items: center;

    >div:first-child {
      width: toRem(140);
      height: toRem(35);
      font-size: 14px;
      background: rgb(252, 252, 252);
      margin: 0 toRem(20) 0 toRem(45);

      >img {
        width: toRem(140);
        height: toRem(35);
      }
    }

    .el-divider--vertical {
      height: toRem(16);
      margin: 0;
    }

    .el-tabs {
      padding-left: toRem(30);
      display: flex;
      width: toRem(1010);
    }

    ::v-deep .el-tabs__header {
      margin: 0;
    }

    ::v-deep .el-tabs__nav-wrap {
      height: toRem(55);

      .is-active {
        font-weight: 600;
      }

      .el-tabs__item {
        top: toRem(-57.5);
        height: toRem(55);
        line-height: toRem(55);
        width: toRem(135);
        font-size: toRem(18);
        color: #606266;
        padding: 0;
      }

      .el-tabs__active-bar {
        top: toRem(53);
        height: toRem(2);
        background-color: #1e6fff;
      }
    }

    ::v-deep .el-tabs__nav-wrap::after {
      height: 0;
    }

    >div:last-child {
      cursor: pointer;
      width: fit-content;
      align-items: center;
      display: flex;
      margin-left: 2%;
      font-size: toRem(12);

      img {
        height: toRem(20);
        width: toRem(20);
      }

      >div:nth-child(2) {
        cursor: default;
        position: relative;

        >img {
          margin: toRem(3) toRem(15) 0 toRem(15);
          cursor: pointer;
        }

        >span {
          cursor: pointer;
          position: absolute;
          display: inline-block;
          width: toRem(20);
          height: toRem(20);
          color: white;
          line-height: toRem(20);
          opacity: 0.86;
          background: #e34d59;
          border-radius: 50%;
          top: toRem(-7);
          left: toRem(25);
        }

        >div {
          cursor: default;
          z-index: 999;
          width: toRem(400);
          height: fit-content;
          background: #ffffff;
          box-shadow: 0px 6px 30px 5px rgba(0, 0, 0, 0.05),
            0px 16px 24px 2px rgba(0, 0, 0, 0.04),
            0px 8px 10px -5px rgba(0, 0, 0, 0.08);
          border-radius: toRem(3);
          position: absolute;
          top: toRem(42);
          right: 0;
          display: flex;
          flex-direction: column;

          >div {
            position: relative;
            height: toRem(95);

            >div:first-child {
              font-size: toRem(16);
              font-weight: 600;
              color: rgba(0, 0, 0, 0.9);
              margin: toRem(20) toRem(0) toRem(10) toRem(24);
            }

            >div:nth-child(2) {
              font-size: toRem(14);
              color: rgba(0, 0, 0, 0.6);
              margin-left: toRem(24);
            }

            >div {
              text-align: left;
            }

            >span {
              z-index: 1099;
              cursor: pointer;
              position: absolute;
              display: inline-block;
              width: toRem(60);
              height: toRem(32);
              line-height: toRem(32);
              background: #f3f3f3;
              border-radius: toRem(3);
              font-size: toRem(14);
              color: #0052d9;
              top: toRem(31);
              right: toRem(24);
            }

            .el-divider {
              top: toRem(95);
            }
          }
        }
      }

      .el-dropdown:first-child {
        padding: toRem(5) 0;
        padding-left: toRem(10);
        width: toRem(80);
      }

      .isclick {
        background: #f4f8ff;
        border-radius: toRem(6);
      }
    }

    .el-dropdown {
      font-size: toRem(18);
      width: fit-content;

      .el-dropdown-link {
        align-items: center;
        display: flex;
        height: 0.25rem;
        line-height: 0.29rem;
      }

      i {
        margin-left: toRem(10);
        font-size: toRem(12);
      }
    }
  }

  .el-divider--horizontal {
    height: 1.5px;
    background: #e6e6e6;
    position: absolute;
    top: toRem(58);
    margin: 0;
  }
}
</style>
