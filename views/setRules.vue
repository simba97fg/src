<template>
  <div class="setRules">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">规则配置</el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <div v-show="nowDeptL == 1">
        <el-input v-model="deptNameSelect" placeholder="请输入组织名称" suffix-icon="el-icon-search" @blur="getSetedList">
        </el-input>
        <el-checkbox v-model="isCheckUnSet" @change="getSetedList">只看未配置</el-checkbox>
        <div>
          <el-tree :data="treeAddDeptList" node-key="deptId" ref="tree" highlight-current :props="defaultProps"
            @node-click="handleNodeClick">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span v-if="data.deptLevel == 2 && data.isSet">已配置</span>
              <span v-if="data.deptLevel == 2 && !data.isSet">未配置</span>
            </span>
          </el-tree>
        </div>
      </div>
      <el-divider direction="vertical" v-if="nowDeptL == 1"></el-divider>
      <div>
        <span v-if="clickDeptLevel == 2">您正在查看 {{ clickDeptName }} 规则配置</span>
        <span v-if="clickDeptLevel == 1">一级组织无规则配置</span>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>实名制渠道</span>
            <el-switch @change="saveOChange" v-model="infoDetail.channelLimit" active-color="#1E6FFF"
              inactive-color="#C5C5C5" v-show="false">
            </el-switch>
          </div>
          <div>
            <div>
              <span>渠道类型</span>
              <div>
                <el-checkbox v-model="infoDetail.onLine" @change="saveOChange">线上</el-checkbox>
                <el-checkbox v-model="infoDetail.offLine" @change="saveOChange">线下</el-checkbox>
              </div>
            </div>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!oneClickAble">应用修改</span>
            <span @click="saveChange" v-if="oneClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>接口调用</span>
            <el-switch @change="saveTChange" v-model="infoDetail.interfaceLimit" active-color="#1E6FFF"
              inactive-color="#C5C5C5" v-show="false">
            </el-switch>
          </div>
          <div>
            <div>
              <span>可调用T1接口</span>
              <div>
                <el-checkbox v-model="infoDetail.t1Telecom" @change="saveTChange">中国电信</el-checkbox>
                <el-checkbox v-model="infoDetail.t1Mobile" @change="saveTChange">中国移动</el-checkbox>
                <el-checkbox v-model="infoDetail.t1Unicom" @change="saveTChange">中国联通</el-checkbox>
              </div>
            </div>
            <div>
              <span>可调用实名制接口</span>
              <div>
                <el-checkbox v-model="infoDetail.realnameTelecom" @change="saveTChange">中国电信</el-checkbox>
                <el-checkbox v-model="infoDetail.realnameMobile" @change="saveTChange">中国移动</el-checkbox>
                <el-checkbox v-model="infoDetail.realnameUnicom" @change="saveTChange">中国联通</el-checkbox>
              </div>
            </div>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!twoClickAble">应用修改</span>
            <span @click="saveChange" v-if="twoClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>额度限制</span>
          </div>
          <div>
            <div>
              <span>可接入设备数</span>
              <div>
                <el-input v-model="infoDetail.deviceLimit" @change="saveTHChange"></el-input>
                <span>台</span>
              </div>
            </div>
            <span>数量为当前企业已购额度</span>
            <div>
              <span>可接入车辆数</span>
              <div>
                <el-input v-model="infoDetail.carLimit" @change="saveTHChange"></el-input>
                <span>辆</span>
              </div>
            </div>
            <span>数量为当前企业已购额度</span>
            <div>
              <span>已接入设备数</span>
              <div>
                <el-input v-model="infoDetail.deviceLimitUse" disabled></el-input>
                <span>台</span>
              </div>
            </div>
            <span>若余额不足，可联系相关人员购买</span>
            <div>
              <span>已接入车辆数</span>
              <div>
                <el-input v-model="infoDetail.carLimitUse" disabled></el-input>
                <span>辆</span>
              </div>
            </div>
            <span>若余额不足，可联系相关人员购买</span>
            <div>
              <span>已接入车联网卡数</span>
              <div>
                <el-input v-model="infoDetail.carIccidCount" disabled></el-input>
                <span>张</span>
              </div>
            </div>
            <span>若余额不足，可联系相关人员购买</span>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!threeClickAble">应用修改</span>
            <span @click="saveChange" v-if="threeClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>设备规则</span>
          </div>
          <div>
            <span>是否可选其他设备</span>
            <el-switch @change="saveFIChange" v-model="infoDetail.otherDevice" active-color="#1E6FFF"
              inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!fiveClickAble">应用修改</span>
            <span @click="saveChange" v-if="fiveClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>自动规则</span>
          </div>
          <div>
            <span>自动通过解绑申请</span>
            <el-switch @change="saveFChange" v-model="infoDetail.autoBind" active-color="#1E6FFF"
              inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!fourClickAble">应用修改</span>
            <span @click="saveChange" v-if="fourClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>车辆信息自动上报</span>
          </div>
          <div>
            <span>自动上报车辆信息</span>
            <el-switch @change="saveEChange" v-model="infoDetail.autoReportCarinfo" active-color="#1E6FFF"
              inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!eightClickAble">应用修改</span>
            <span @click="saveChange" v-if="eightClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>上传发票</span>
          </div>
          <div>
            <span>需上传发票</span>
            <el-switch @change="saveSChange" v-model="infoDetail.invoice" active-color="#1E6FFF" inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!sixClickAble">应用修改</span>
            <span @click="saveChange" v-if="sixClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>上传行驶证</span>
          </div>
          <div>
            <span>需上传行驶证</span>
            <el-switch @change="saveSEChange" v-model="infoDetail.drivingLicense" active-color="#1E6FFF"
              inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!senvenClickAble">应用修改</span>
            <span @click="saveChange" v-if="senvenClickAble">应用修改</span>
          </div>
        </div>
        <div v-show="clickDeptLevel == 2">
          <div>
            <span></span>
            <span>身份证三次失败转人工</span>
          </div>
          <div>
            <span>是否三次不通过自动转人工审核</span>
            <el-switch @change="saveNIChange" v-model="infoDetail.autoWorkByPerson" active-color="#1E6FFF"
              inactive-color="#C5C5C5">
            </el-switch>
          </div>
          <div>
            <el-divider></el-divider>
            <span class="disabledBtn" v-if="!nineClickAble">应用修改</span>
            <span @click="saveChange" v-if="nineClickAble">应用修改</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { listDept } from "@/api/system/dept";
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "setRules",
  components: {},
  data() {
    return {
      sixClickAble: false,
      senvenClickAble: false,
      nineClickAble: false,
      eightClickAble: false,
      fiveClickAble: false,
      oneClickAble: false,
      twoClickAble: false,
      threeClickAble: false,
      fourClickAble: false,
      infoDetail: {
        id: undefined,
        offLine: false,
        onLine: false,
        realnameMobile: false, //实名制接口 移动
        realnameTelecom: false, //实名制接口 电信
        realnameUnicom: false, //实名制接口 联通
        t1Mobile: false, //T1接口移动
        t1Telecom: false,
        t1Unicom: false,
        carLimit: null,
        carLimitUse: null,
        deviceLimit: null,
        autoBind: false,
        channelLimit: true,
        interfaceLimit: true,
        invoice: false,
        drivingLicense: false,
        autoWorkByPerson: false,
        autoReportCarinfo: false,
        oldOne: {
          offLine: false,
          onLine: false,
          realnameMobile: false, //实名制接口 移动
          realnameTelecom: false, //实名制接口 电信
          realnameUnicom: false, //实名制接口 联通
          t1Mobile: false, //T1接口移动
          t1Telecom: false,
          t1Unicom: false,
          carLimit: null,
          carLimitUse: null,
          deviceLimit: null,
          autoBind: false,
          channelLimit: true,
          interfaceLimit: true,
          invoice: false,
          drivingLicense: false,
          autoWorkByPerson: false,
          autoReportCarinfo: false,
        },
      },
      clickDeptLevel: 1,
      clickDeptName: null,
      checked: false,
      treeAddDeptList: [],
      defaultProps: {
        children: "children",
        label: "deptName",
      },
      isCheckUnSet: false,
      deptNameSelect: null,
      nowDeptL: 2,
      deviceNum: null,
      value: false,
    };
  },
  computed: {
    deptLevel() {
      return this.$store.getters.deptLevel;
    },
  },
  methods: {
    async getInfoDetail(id) {
      console.log(this.infoDetail, "==========getInfoDetail==================");
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameRule",
        serviceName: "find-config",
        method: "get",
        serviceParameter: {
          orgId: id,
        },
      });
      if (res) {
        res.data.oldOne = {};
        this.infoDetail = res.data;
        this.infoDetail.oldOne.offLine = res.data.offLine;
        this.infoDetail.oldOne.onLine = res.data.onLine;
        this.infoDetail.oldOne.channelLimit = res.data.channelLimit;
        this.infoDetail.oldOne.autoBind = res.data.autoBind;
        this.infoDetail.oldOne.otherDevice = res.data.otherDevice;
        this.infoDetail.oldOne.interfaceLimit = res.data.interfaceLimit;
        this.infoDetail.oldOne.t1Mobile = res.data.t1Mobile;
        this.infoDetail.oldOne.t1Telecom = res.data.t1Telecom;
        this.infoDetail.oldOne.t1Unicom = res.data.t1Unicom;
        this.infoDetail.oldOne.realnameMobile = res.data.realnameMobile;
        this.infoDetail.oldOne.realnameTelecom = res.data.realnameTelecom;
        this.infoDetail.oldOne.realnameUnicom = res.data.realnameUnicom;
        this.infoDetail.oldOne.carLimit = res.data.carLimit;
        this.infoDetail.oldOne.deviceLimit = res.data.deviceLimit;
        this.infoDetail.oldOne.invoice = res.data.invoice;
        this.infoDetail.oldOne.drivingLicense = res.data.drivingLicense;
        this.infoDetail.oldOne.autoWorkByPerson = res.data.autoWorkByPerson;
        this.infoDetail.oldOne.autoReportCarinfo = res.data.autoReportCarinfo;
      }
    },
    saveFIChange() {
      this.fiveClickAble = false;
      if (this.infoDetail.otherDevice != this.infoDetail.oldOne.otherDevice) {
        this.fiveClickAble = true;
      }
    },
    saveFChange() {
      this.fourClickAble = false;
      if (this.infoDetail.autoBind != this.infoDetail.oldOne.autoBind) {
        this.fourClickAble = true;
      }
    },
    saveSChange() {
      this.sixClickAble = false;
      if (this.infoDetail.invoice != this.infoDetail.oldOne.invoice) {
        this.sixClickAble = true;
      }
    },
    saveSEChange() {
      this.senvenClickAble = false;
      if (this.infoDetail.drivingLicense != this.infoDetail.oldOne.drivingLicense) {
        this.senvenClickAble = true;
      }
    },
    saveNIChange() {
      this.nineClickAble = false;
      if (this.infoDetail.autoWorkByPerson != this.infoDetail.oldOne.autoWorkByPerson) {
        this.nineClickAble = true;
      }
    },
    saveEChange() {
      this.eightClickAble = false;
      if (this.infoDetail.autoReportCarinfo != this.infoDetail.oldOne.autoReportCarinfo) {
        this.eightClickAble = true;
      }
    },
    saveTHChange() {
      this.threeClickAble = false;

      if (
        (this.infoDetail.carLimit != this.infoDetail.oldOne.carLimit &&
          !isNaN(Number(this.infoDetail.carLimit))) ||
        (this.infoDetail.deviceLimit != this.infoDetail.oldOne.deviceLimit &&
          !isNaN(Number(this.infoDetail.deviceLimit)))
      ) {
        this.threeClickAble = true;
      }
    },
    saveTChange() {
      this.twoClickAble = false;
      if (
        this.infoDetail.t1Mobile != this.infoDetail.oldOne.t1Mobile ||
        this.infoDetail.t1Telecom != this.infoDetail.oldOne.t1Telecom ||
        this.infoDetail.t1Unicom != this.infoDetail.oldOne.t1Unicom ||
        this.infoDetail.realnameMobile !=
        this.infoDetail.oldOne.realnameMobile ||
        this.infoDetail.realnameTelecom !=
        this.infoDetail.oldOne.realnameTelecom ||
        this.infoDetail.realnameUnicom !=
        this.infoDetail.oldOne.realnameUnicom ||
        this.infoDetail.interfaceLimit != this.infoDetail.oldOne.interfaceLimit
      ) {
        this.twoClickAble = true;
      }
    },
    saveOChange() {
      console.log(this.infoDetail);
      this.oneClickAble = false;
      if (
        this.infoDetail.onLine != this.infoDetail.oldOne.onLine ||
        this.infoDetail.offLine != this.infoDetail.oldOne.offLine ||
        this.infoDetail.channelLimit != this.infoDetail.oldOne.channelLimit
      ) {
        this.oneClickAble = true;
      }
    },
    async saveChange() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameRule",
        serviceName: "save-config",
        method: "get",
        serviceParameter: {
          id: this.infoDetail.id,
          accId: this.clickDeptId,
          deptId: this.clickDeptId,
          offLine: this.toNum(this.infoDetail.offLine),
          onLine: this.toNum(this.infoDetail.onLine),
          realnameMobile: this.toNum(this.infoDetail.realnameMobile), //实名制接口 移动
          realnameTelecom: this.toNum(this.infoDetail.realnameTelecom), //实名制接口 电信
          realnameUnicom: this.toNum(this.infoDetail.realnameUnicom), //实名制接口 联通
          t1Mobile: this.toNum(this.infoDetail.t1Mobile), //T1接口移动
          t1Telecom: this.toNum(this.infoDetail.t1Telecom),
          t1Unicom: this.toNum(this.infoDetail.t1Unicom),
          carLimit: this.infoDetail.carLimit,
          carLimitUse: this.infoDetail.carLimitUse,
          deviceLimit: this.infoDetail.deviceLimit,
          deviceLimitUse: this.infoDetail.deviceLimitUse,
          autoBind: this.toNum(this.infoDetail.autoBind),
          otherDevice: this.toNum(this.infoDetail.otherDevice),
          channelLimit: this.toNum(true),
          interfaceLimit: this.toNum(true),
          invoice: this.toNum(this.infoDetail.invoice),
          drivingLicense: this.toNum(this.infoDetail.drivingLicense),
          autoWorkByPerson: this.toNum(this.infoDetail.autoWorkByPerson),
          autoReportCarinfo: this.toNum(this.infoDetail.autoReportCarinfo),
        },
      });
      if (res.success) {
        this.$message({
          message: "配置成功！",
          type: "success",
          showClose: true,
          duration: 1000
        });
        this.getInfoDetail(this.clickDeptId);
        this.getSetedList();
        this.oneClickAble = false;
        this.twoClickAble = false;
        this.threeClickAble = false;
        this.fourClickAble = false;
        this.fiveClickAble = false;
        this.sixClickAble = false;
        this.senvenClickAble = false;
        this.nineClickAble = false;
        this.eightClickAble = false;
      }
    },
    handleNodeClick() {
      this.infoDetail = {
        id: undefined,
        offLine: false,
        onLine: false,
        realnameMobile: false, //实名制接口 移动
        realnameTelecom: false, //实名制接口 电信
        realnameUnicom: false, //实名制接口 联通
        t1Mobile: false, //T1接口移动
        t1Telecom: false,
        t1Unicom: false,
        carLimit: null,
        carLimitUse: null,
        deviceLimit: null,
        deviceLimitUse: null,
        autoBind: false,
        otherDevice: false,
        channelLimit: true,
        interfaceLimit: true,
        invoice: false,
        drivingLicense: false,
        autoWorkByPerson: false,
        autoReportCarinfo: false,
        oldOne: {
          offLine: false,
          onLine: false,
          realnameMobile: false, //实名制接口 移动
          realnameTelecom: false, //实名制接口 电信
          realnameUnicom: false, //实名制接口 联通
          t1Mobile: false, //T1接口移动
          t1Telecom: false,
          t1Unicom: false,
          carLimit: null,
          carLimitUse: null,
          deviceLimit: null,
          autoBind: false,
          otherDevice: false,
          channelLimit: true,
          interfaceLimit: true,
          invoice: false,
          drivingLicense: false,
          autoWorkByPerson: false,
          autoReportCarinfo: false,
        },
      };
      this.oneClickAble = false;
      this.twoClickAble = false;
      this.threeClickAble = false;
      this.fourClickAble = false;
      this.fiveClickAble = false;
      this.sixClickAble = false;
      this.senvenClickAble = false;
      this.eightClickAble = false;
      this.nineClickAble = false;
      this.clickDeptLevel = this.$refs.tree.getCurrentNode().deptLevel;
      this.clickDeptName = this.$refs.tree.getCurrentNode().deptName;
      this.clickDeptId = this.$refs.tree.getCurrentNode().deptId;
      if (this.$refs.tree.getCurrentNode().isSet) {
        this.getInfoDetail(this.clickDeptId);
      }
    },
    async getSetedList() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameRule",
        serviceName: "find-list",
        method: "get",
      });
      if (res) {
        let list = [];
        if (res.code != 500) {
          res.data.forEach((el) => {
            list.push(el.deptId);
          });
        }
        this.$nextTick(() => {
          this.getDeptList(list);
        });
      }
    },
    getDeptList(list) {
      this.treeAddDeptList = [];
      let deptList = [];
      listDept({
        deptName: this.deptNameSelect,
        status: undefined,
      }).then((response) => {
        if (this.isCheckUnSet) {
          response.data.forEach((el) => {
            el.isSet = false;
            if (
              !(
                (list.indexOf(el.deptId) != -1 && el.deptLevel == 2) ||
                el.deptLevel >= 3
              )
            ) {
              deptList.push(el);
            }
          });
        } else {
          response.data.forEach((el) => {
            if (list.indexOf(el.deptId) != -1) {
              el.isSet = true;
            }
            if (el.deptLevel < 3) {
              el.setSum = 0;
              deptList.push(el);
            }
          });
        }
        this.$nextTick(() => {
          this.treeAddDeptList = this.handleTree(deptList, "deptId");
          this.resetDeptName(this.treeAddDeptList, list);
          console.log(
            this.treeAddDeptList,
            "==============treeAddDeptList=============="
          );
        });
      });
    },
    toNum(node) {
      if (node) {
        return 1;
      }
      return 0;
    },
    resetDeptName(deptList, list) {
      if (this.isCheckUnSet) {
        deptList.forEach((el) => {
          el.deptName = el.deptName + "（0" + "/" + el.children.length + "）";
        });
      } else {
        deptList.forEach((el) => {
          el.children.forEach((ele) => {
            if (list.indexOf(ele.deptId) != -1) {
              el.setSum++;
            }
          });
          this.$nextTick(() => {
            el.deptName =
              el.deptName + "（" + el.setSum + "/" + el.children.length + "）";
          });
        });
      }
    },
  },
  created() {
    this.nowDeptL = this.deptLevel;
  },
  mounted() {
    this.getSetedList();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.setRules {
  padding: toRem(15) toRem(40);
  padding-bottom: 0;

  >div {
    display: flex;

    >div:first-child {
      flex: 1;
      display: flex;
      flex-direction: column;

      ::v-deep .el-input__icon {
        color: #1e6fff !important;
        line-height: toRem(32);
        font-size: toRem(12);
        margin-right: toRem(10);
        cursor: pointer;
      }

      .el-checkbox {
        text-align: right;
        margin: toRem(17) 0 toRem(12) 0;
      }

      >div:nth-child(3) {
        padding: toRem(15) toRem(20) 0 toRem(18);
        width: 100%;
        height: toRem(1007);
        border: 1px solid #e7e7e7;

        ::v-deep .custom-tree-node {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: toRem(15);
          padding-right: toRem(10);
          color: rgba(0, 0, 0, 0.9);

          >span:nth-child(2) {
            color: rgba(0, 0, 0, 0.26);
          }
        }
      }
    }

    .el-divider--vertical {
      margin: 0 toRem(20);
      height: toRem(1130);
    }

    >div:last-child {
      display: flex;
      flex-direction: column;
      flex: 2;

      * {
        font-size: toRem(14);
      }

      span {
        display: inline-block;
      }

      >span:first-child {
        width: 100%;
        height: toRem(40);
        background: #f4f8ff;
        font-size: toRem(18);
        font-weight: 600;
        color: rgba(0, 0, 0, 0.9);
        line-height: toRem(40);
        padding-left: toRem(10);
        margin-bottom: toRem(20);
        text-align: left;
      }

      >div {
        margin-bottom: toRem(10);
        justify-content: space-between;
        width: 100%;
        min-height: toRem(195);
        background: #ffffff;
        box-shadow: 0px toRem(2) toRem(4) 0px rgba(64, 64, 64, 0.1);
        border: toRem(1) solid #e0e0e0;
        display: flex;
        flex-direction: column;

        >div:first-child {
          display: flex;
          align-items: center;
          margin-top: toRem(20);
          margin-bottom: toRem(30);

          >span:first-child {
            width: toRem(10);
            height: toRem(20);
            background: #1e6fff;
          }

          >span:nth-child(2) {
            width: fit-content;
            font-weight: 600;
            color: #000000;
            margin: 0 toRem(20);
          }
        }

        >div:nth-child(2) {
          >div {
            display: flex;
            align-items: center;
            margin-left: toRem(30);

            ::v-deep span {
              font-size: toRem(14);
            }

            >span:first-child {
              color: rgba(0, 0, 0, 0.4);
              width: toRem(116);
              text-align: left;
            }
          }
        }

        >div:last-child {
          margin-top: toRem(30);
          padding: 0 toRem(30);
          text-align: left;

          .el-divider {
            margin: 0;
          }

          >span:nth-child(2) {
            text-align: center;
            margin: toRem(20) 0;
            width: toRem(96);
            height: toRem(32);
            line-height: toRem(32);
            color: white;
            background: #1e6fff;
            cursor: pointer;
          }
        }
      }

      >div:nth-child(3) {
        >div:nth-child(2) {
          >div {
            >span:first-child {
              width: toRem(142);
            }
          }

          >div:first-child {
            margin-bottom: toRem(20);
          }
        }
      }

      >div:nth-child(4) {
        >div:nth-child(2) {
          text-align: left;

          >div {
            >span:first-child {
              width: toRem(124);
            }

            >div {
              display: flex;
              align-items: center;

              >span:last-child {
                margin-left: toRem(8);
              }
            }

            ::v-deep .el-input__inner {
              padding: 0;
              text-align: center;
              width: toRem(120);
              height: toRem(32);
              border-radius: toRem(3);
            }
          }

          >div:nth-child(3),
          div:nth-child(5),
          div:nth-child(7),
          div:nth-child(9) {
            margin-top: toRem(20);
          }

          >span {
            margin-top: toRem(4);
            margin-left: toRem(154);
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }

      >div:nth-child(5),
      >div:nth-child(6),
      >div:nth-child(7),
      >div:nth-child(8),
      >div:nth-child(9),
      >div:nth-child(10) {
        >div:nth-child(2) {
          display: flex;

          >span {
            margin-left: toRem(30);
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }
    }
  }
}
</style>
