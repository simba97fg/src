<template>
  <div class="indexForStaff">
    <img src="../assets/images/staff-BG.png" />
    <div class="listArea">
      <span>您好，{{ nickname }}</span>
      <span>{{ today }}</span>
      <div>
        <div v-for="(node, index) in indexPool" :key="index" @click="pushto(node.path)">
          <div>
            <span>{{ node.title }}</span>
            <span>{{ node.content }}</span>
          </div>

          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Cookies from "js-cookie";
import auth from "@/plugins/auth";
export default {
  name: "indexForStaff",
  components: {},
  data() {
    return {
      nickname: null,
      indexPool: [],
      today:
        new Date().getFullYear() +
        "/" +
        (new Date().getMonth() + 1 > 9
          ? new Date().getMonth() + 1
          : "0" + (new Date().getMonth() + 1)
        ).toString() +
        "/" +
        (new Date().getDate() > 9
          ? new Date().getDate()
          : "0" + new Date().getDate()
        ).toString(),
    };
  },
  computed: {
    routes() {
      return this.$store.getters.addRoutes;
    },
    nickName1() {
      return this.$store.getters.nickname;
    },
    deptLevel() {
      return this.$store.getters.deptLevel;
    },
  },
  watch: {},
  methods: {
    pushto(path) {
      this.$parent.isClickList = true;
      if (path == 'deviceManage') {
        this.$parent.activeIndex = "6";
        this.$router.push("/deviceManage");
      } else
        if (path == "personalRealAuth") {
          this.$parent.activeIndex = "2";
          this.$router.push("/personalRealAuth");
        } else if (path == "unitRealAuth") {
          this.$router.push("/unitRealAuth");
          this.$parent.activeIndex = "2";
        } else if (path == "noRealNameCard") {
          this.$router.push("/noRealNameCard");
          this.$parent.activeIndex = "2";
        } else if (path == "testingAuth") {
          this.$router.push("/testingAuth");
          this.$parent.activeIndex = "2";
        } else if (path == "personCarUnbind") {
          this.$router.push("/personCarUnbind");
          this.$parent.activeIndex = "3";
        }
        else if (path == "unitCarUnbind") {
          this.$router.push("/unitCarUnbind");
          this.$parent.activeIndex = "3";
        }
        else if (path == "personOtherIdcard") {
          this.$router.push("/personOtherIdcard");
          this.$parent.activeIndex = "3";
        }
        else if (path == "unitIdcard") {
          this.$router.push("/unitIdcard");
          this.$parent.activeIndex = "3";
        } else if (path == "carinfoManage") {
          this.$router.push("/carinfoManage");
          this.$parent.activeIndex = "4";
        } else if (path == "accountManage") {
          this.$router.push("/accountManage");
          this.$parent.activeIndex = "4";
        } else if (path == "msgManage") {
          this.$router.push("/msgManage");
          this.$parent.activeIndex = "5";
        } else if (path == "unitLinkManage") {
          this.$router.push("/unitLinkManage");
          this.$parent.activeIndex = "5";
        } else if (path == "realNameUnbind") {
          this.$router.push("/realNameUnbind");
          this.$parent.activeIndex = "5";
        } else if (path == "resetRealNameCard") {
          this.$router.push("/resetRealNameCard");
          this.$parent.activeIndex = "5";
        } else if (path == "orderManage") {
          this.$router.push("/orderManage");
          this.$parent.activeIndex = "0";
        } else if (path == "userManage") {
          this.$router.push("/userManage");
          this.$parent.activeIndex = "0";
        } else if (path == "logManage") {
          this.$router.push("/logManage");
          this.$parent.activeIndex = "0";
        }
        else if (path == "setRules") {
          this.$router.push("/setRules");
          this.$parent.activeIndex = "0";
        }
        else if (path == "quotaManage") {
          this.$router.push("/quotaManage");
          this.$parent.activeIndex = "0";
        }
        else if (path == "exterAbility") {
          this.$router.push("/exterAbility");
          this.$parent.activeIndex = "0";
        }
        else if (path == "instructionReport") {
          this.$router.push("/instructionReport");
          this.$parent.activeIndex = "0";
        }
        else if (path == "realNameInTele") {
          this.$router.push("/realNameInTele");
          this.$parent.activeIndex = "0";
        }
    },
  },
  created() { },
  mounted() {
    this.$parent.activeIndex = "1";
    this.nickname = this.nickName1;
    if (auth.hasPermiOr(["home:personalRealAuth:list", 'home:personalRealAuth:detail', 'home:personalRealAuth:export'])) {
      this.indexPool.push({
        path: "personalRealAuth",
        title: "实名记录",
        content: "个人实名记录",
      });
    }
    if (auth.hasPermiOr(["home:unitRealAuth:list", 'home:unitRealAuth:detail', 'home:unitRealAuth:export'])) {
      this.indexPool.push({
        path: "unitRealAuth",
        title: "实名记录",
        content: "单位实名记录",
      });
    }
    if (auth.hasPermiOr(["home:noRealNameCard:list", 'home:noRealNameCard:export'])) {
      this.indexPool.push({
        path: "noRealNameCard",
        title: "实名记录",
        content: "未实名号卡",
      });
    }
    if (auth.hasPermiOr(["home:testingAuth:list", 'home:testingAuth:detail', 'home:testingAuth:export'])) {
      this.indexPool.push({
        path: "testingAuth",
        title: "实名记录",
        content: "测试期实名记录",
      });
    }
    if (auth.hasPermiOr(["home:personOtherIdcard:list", 'home:personOtherIdcard:detail', 'home:personOtherIdcard:export', 'home:personOtherIdcard:change'])) {
      this.indexPool.push({
        path: "personOtherIdcard",
        title: "人工审核",
        content: "个人其他证件",
      });
    }
    if (auth.hasPermiOr(["home:unitIdcard:list", 'home:unitIdcard:detail', 'home:unitIdcard:export', 'home:unitIdcard:change'])) {
      this.indexPool.push({
        path: "unitIdcard",
        title: "人工审核",
        content: "单位证件",
      });
    }
    if (auth.hasPermiOr(["home:personCarUnbind:list", 'home:personCarUnbind:detail', 'home:personCarUnbind:export', 'home:personCarUnbind:change'])) {
      this.indexPool.push({
        path: "personCarUnbind",
        title: "人工审核",
        content: "个人车辆解绑",
      });
    }
    if (auth.hasPermiOr(["home:unitCarUnbind:list", 'home:unitCarUnbind:detail', 'home:unitCarUnbind:export', 'home:unitCarUnbind:change'])) {
      this.indexPool.push({
        path: "unitCarUnbind",
        title: "人工审核",
        content: "单位车辆解绑",
      });
    }

    if (auth.hasPermiOr(["home:carinfoManage:list", 'home:carinfoManage:change', 'home:carinfoManage:export'])) {
      this.indexPool.push({
        path: "carinfoManage",
        title: "T1数据管理",
        content: "车辆信息管理",
      });
    }
    if (auth.hasPermiOr(["home:accountManage:list", 'home:accountManage:change', 'home:accountManage:export'])) {
      this.indexPool.push({
        path: "accountManage",
        title: "T1数据管理",
        content: "开户信息管理",
      });
    }
    if (auth.hasPermiOr(["home:msgManage:list", 'home:msgManage:change', 'home:msgManage:export'])) {
      this.indexPool.push({
        path: "msgManage",
        title: "其他业务管理",
        content: "短信中心",
      });
    }
    if (auth.hasPermiOr(["home:unitLinkManage:list", 'home:unitLinkManage:detail', 'home:unitLinkManage:export'])) {
      this.indexPool.push({
        path: "unitLinkManage",
        title: "其他业务管理",
        content: "单位实名链接管理",
      });
    }
    if (auth.hasPermiOr(["home:realNameUnbind:list", 'home:realNameUnbind:detail', 'home:realNameUnbind:change'])) {
      this.indexPool.push({
        path: "realNameUnbind",
        title: "其他业务管理",
        content: "实名信息解绑",
      });
    }
    if (auth.hasPermiOr(["home:resetRealNameCard:list", 'home:resetRealNameCard:change'])) {
      this.indexPool.push({
        path: "resetRealNameCard",
        title: "其他业务管理",
        content: "更换车联网卡",
      });
    }
    if (auth.hasPermiOr(["home:deviceManage:list", 'home:deviceManage:change'])) {
      this.indexPool.push({
        path: "deviceManage",
        title: null,
        content: "设备管理",
      });
    }
    if (auth.hasPermi("home:orderManage:list")) {
      this.indexPool.push({
        path: "orderManage",
        title: "工具",
        content: "订单管理",
      });
    }
    if (auth.hasPermi("home:userManage:list")) {
      this.indexPool.push({
        path: "userManage",
        title: "工具",
        content: "账号管理",
      });
    }
    if (auth.hasPermi("home:logManage:list")) {
      this.indexPool.push({
        path: "logManage",
        title: "工具",
        content: "日志管理",
      });
    }
    if (auth.hasPermi("home:setRules:list")) {
      this.indexPool.push({
        path: "setRules",
        title: "工具",
        content: "规则配置",
      });
    }
    // if (auth.hasPermi("home:quotaManage:list")&&this.deptLevel<=2) {
    //   this.indexPool.push({
    //     path: "quotaManage",
    //     title: "工具",
    //     content: "额度管理",
    //   });
    // }
    if (auth.hasPermi("home:exterAbility:list")) {
      this.indexPool.push({
        path: "exterAbility",
        title: "工具",
        content: "外部能力调用",
      });
    }
    if (auth.hasPermi("home:instructionReport:list")) {
      this.indexPool.push({
        path: "instructionReport",
        title: "工具",
        content: "指令采集响应",
      });
    }
    if (auth.hasPermi("home:realNameInTele:list")) {
      this.indexPool.push({
        path: "realNameInTele",
        title: "工具",
        content: "电信侧实名同步",
      });
    }
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.indexForStaff {
  height: fit-content;
  position: relative;
  margin-top: toRem(19);

  >img {
    height: toRem(756);
    width: toRem(1300);
  }

  .listArea {
    position: absolute;
    top: 0;
    left: toRem(100);
    font-size: toRem(14);
    display: flex;
    flex-direction: column;

    >span {
      display: inline-block;
      text-align: left;
    }

    >span:first-child {
      font-size: toRem(24);
      font-weight: 600;
      color: #424549;
      margin-top: toRem(16);
    }

    >span:nth-child(2) {
      width: toRem(88);
      height: toRem(22);
      padding: 0 toRem(3);
      background: #1e6fff;
      border-radius: toRem(2);
      font-size: toRem(16);
      font-weight: bold;
      color: #ffffff;
      line-height: toRem(22);
      margin-top: toRem(32);
      margin-bottom: toRem(44);
    }

    >div:nth-child(3) {
      width: toRem(828);
      display: flex;
      flex-wrap: wrap;

      >div {
        cursor: pointer;
        width: toRem(260);
        height: toRem(64);
        background: #ffffff;
        box-shadow: 0px toRem(2) toRem(10) 0px rgba(0, 0, 0, 0.1);
        border-radius: toRem(2);
        margin: toRem(0) toRem(10) toRem(10) 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 toRem(28) 0 toRem(30);

        >div {
          text-align: left;
          display: flex;
          flex-direction: column;

          >span:first-child {
            font-size: toRem(12);
            color: rgba(0, 0, 0, 1);
            opacity: 0.4;
            margin-bottom: toRem(1);
          }

          >span:last-child {
            font-size: toRem(15);
            font-weight: 600;
            color: #000000;
          }
        }

        >i {
          font-size: toRem(19);
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
        }
      }

      >div:hover {
        background: #1e6fff;

        >div>span {
          color: white !important;
        }

        >i {
          color: white;
        }
      }
    }
  }
}
</style>