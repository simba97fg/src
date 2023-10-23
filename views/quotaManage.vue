<template>
  <div class="quotaManage">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">额度管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="tabsHead">
      <el-radio-group v-model="tabPosition" @change="tabChange">
        <el-radio-button label="1">额度配置</el-radio-button>
        <el-radio-button label="2">配置记录</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent">
      <div class="selectArea">
        <el-input v-model="inputSelect" placeholder="请输入二级账户名称/二级账户ID"></el-input>
        <p v-show="tabPosition == '2'">其他选项：</p>
        <el-date-picker v-if="tabPosition == '2'" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
          v-model="time" type="datetimerange" :picker-options="pickerOptions" start-placeholder="生成起始时间"
          end-placeholder="结束时间" align="right">
        </el-date-picker>
        <span @click="getList" v-if="tabPosition == '1'">按筛选搜索</span>
        <span @click="getListHistory" v-if="tabPosition == '2'">按筛选搜索</span>
        <span @click="resetSelect" class="resetBtn">重置</span>
        <span class="operBtn" v-show="tabPosition == '1'" @click="updateDrawer = true">新建额度配置</span>
      </div>
      <div class="collapseList">
        <div class="listItem">
          <span>二级账户名称</span>
          <span>二级账户ID</span>
          <span v-if="tabPosition == '1'">可接入车辆数</span>
          <span v-if="tabPosition == '1'">已接入车辆数</span>
          <span v-if="tabPosition == '1'">可接入设备数</span>
          <span v-if="tabPosition == '1'">已接入设备数</span>
          <span v-if="tabPosition == '1'" @click="updateDrawer = true">操作</span>
          <span v-if="tabPosition == '2'">原可接入车辆数</span>
          <span v-if="tabPosition == '2'">配置后可接入车辆数</span>
          <span v-if="tabPosition == '2'">原接入设备数</span>
          <span v-if="tabPosition == '2'">配置后可接入设备数</span>
          <span v-if="tabPosition == '2'"><i class="el-icon-caret-top" v-bind:class="{ blueBtn: applyDesc == 1 }"
              @click="changeOrder(1)" /><i class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 0 }"
              @click="changeOrder(0)" />配置时间</span>

          <span v-if="tabPosition == '2'">操作人</span>
        </div>
        <div v-for="(node, index) in infoList" :key="index" v-show="total > 0">
          <div class="listItem">
            <span>{{ node.deptName }}</span>
            <span>{{ node.deptId }}</span>
            <span v-if="tabPosition == '1'">{{ node.carSum }}</span>
            <span v-if="tabPosition == '1'">{{ node.carUse }}</span>
            <span v-if="tabPosition == '1'">{{ node.deviceSum }}</span>
            <span v-if="tabPosition == '1'">{{ node.deviceUse }}</span>
            <span v-if="tabPosition == '1'" @click="setInfoDetailForChange(node)">修改</span>
            <span v-if="tabPosition == '2'">{{ node.carSum }}</span>
            <span v-if="tabPosition == '2'">{{ node.newCarSum }}</span>
            <span v-if="tabPosition == '2'">{{ node.deviceSum }}</span>
            <span v-if="tabPosition == '2'">{{ node.newDeviceSum }}</span>
            <span v-if="tabPosition == '2'">{{ node.createDate }}</span>
            <span v-if="tabPosition == '2'" style="text-decoration: underline; cursor: auto">{{ node.userName }}</span>
          </div>
        </div>
        <div class="nodataLine" v-if="total <= 0">
          <div></div>
          <span>暂无数据</span>
          <div></div>
        </div>
      </div>
      <div class="collapseListTotal">
        <span>共 {{ total }} 项数据</span>
        <el-pagination @size-change="sizeChange" @current-change="currentPageChange" :current-page.sync="curPage"
          :page-sizes="[10, 50, 100, 500]" :page-size.sync="pageSize" layout=" prev, pager, next,sizes,jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
    <el-drawer :visible.sync="updateDrawer" direction="rtl" size="43.05%" class="updateDrawer"
      :before-close="handleClose">
      <div slot="title">
        <span v-if="!infoDetail.id">新建额度配置</span>
        <span v-if="infoDetail.id">修改额度配置</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span>二级账户名称<label class="addRedStar"></label></span>
          <el-select placeholder="请选择" @change="handleChange" v-model="infoDetail.deptName">
            <el-option v-for="item in treeAddDeptList" :key="item.deptId" :label="item.deptName" :value="item.deptId">
            </el-option>
          </el-select>
        </div>
        <div>
          <span>二级账户ID<label class="addRedStar"></label></span>
          <el-input placeholder="自动带入" disabled v-model="infoDetail.deptId"></el-input>
        </div>
        <div>
          <span>可接入车辆数<label class="addRedStar"></label></span>
          <el-input placeholder="请输入" v-model="infoDetail.newCarSum"></el-input>
        </div>
        <div>
          <span>已接入车辆数</span>
          <el-input placeholder="0" disabled v-model="infoDetail.newCarUse"></el-input>
        </div>
        <div>
          <span>可接入设备数<label class="addRedStar"></label></span>
          <el-input placeholder="请输入" v-model="infoDetail.newDeviceSum"></el-input>
        </div>
        <div>
          <span>已接入设备数</span>
          <el-input placeholder="0" disabled v-model="infoDetail.newDeviceUse"></el-input>
        </div>
      </div>
      <div>
        <el-divider></el-divider>
        <span v-if="
          !(
            infoDetail.deptId &&
            infoDetail.newCarSum &&
            infoDetail.newDeviceSum
          )
        ">保存</span>
        <span class="clickAbleBtn" v-if="
          infoDetail.deptId && infoDetail.newCarSum && infoDetail.newDeviceSum
        " @click="saveChange">保存</span>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listDept } from "@/api/system/dept";
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "quotaManage",
  components: {},
  data() {
    return {
      isCuC: false,
      inputSelect: null,
      infoDetail: {
        deptName: undefined,
        deptId: undefined, //部门id
        id: undefined,
        newCarSum: undefined, //新可接入车辆数
        newDeviceSum: undefined, //新可接入设备数
        newCarUse: undefined,
        newDeviceUse: undefined,
      },
      treeAddDeptList: [],
      updateDrawer: false,
      applyDesc: 1,
      type: 1,
      typeoptions: [
        {
          label: "账户名称",
          value: 1,
        },
        {
          label: "账户ID",
          value: 2,
        },
      ],
      tabPosition: "1",
      today: null,
      total: 0,
      time: [],
      curPage: 1,
      pageSize: 10,
      infoList: [],
      numData: {},
    };
  },
  computed: {
    deptId() {
      return this.$store.getters.deptId;
    },
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    tabChange() {
      this.resetSelect();
      if (this.tabPosition == "1") {
        this.getList();
      } else {
        this.getListHistory();
      }
    },
    setInfoDetailForChange(node) {
      this.infoDetail.deptName = node.deptName;
      this.infoDetail.deptId = node.deptId;
      this.infoDetail.id = node.id;
      this.infoDetail.newCarSum = node.carSum;
      this.infoDetail.newDeviceSum = node.deviceSum;
      this.infoDetail.newCarUse = node.carUse;
      this.infoDetail.newDeviceUse = node.deviceUse;
      this.updateDrawer = true;
    },
    resetInfoDetail() {
      this.infoDetail = {
        deptName: undefined,
        deptId: undefined, //部门id
        id: undefined,
        newCarSum: undefined, //新可接入车辆数
        newDeviceSum: undefined, //新可接入设备数
        newCarUse: undefined,
        newDeviceUse: undefined,
      };
    },
    handleChange(node) {
      this.infoDetail.deptId = node;
    },
    handleClose() {
      this.updateDrawer = false;
      this.resetInfoDetail();
    },
    async saveChange() {
      let serviceName = "new-limit";
      let msg = "新增成功！";
      let params = {
        carSum: this.infoDetail.newCarSum,
        accId: this.infoDetail.deptId,
        deviceSum: this.infoDetail.newDeviceSum,
        id: undefined,
        newCarSum: undefined,
        newDeviceSum: undefined,
      };
      if (this.infoDetail.id) {
        serviceName = "modify-limit";
        msg = "修改成功！";
        params.id = this.infoDetail.id;
        params.newCarSum = this.infoDetail.newCarSum;
        params.newDeviceSum = this.infoDetail.newDeviceSum;
        params.carSum = undefined;
        params.deviceSum = undefined;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameQuota",
        serviceName: serviceName,
        method: "post",
        serviceParameter: params,
      });
      if (res) {
        if (res.success) {
          this.$message({
            message: msg,
            type: "success",
            showClose: true,
          });
          this.getList();
        } else {
          this.$message({
            message: res.msg + "，账户已配置！",
            type: "error",
            showClose: true,
          });
        }
        this.updateDrawer = false;
        this.resetInfoDetail();
      }
    },

    changeOrder(num) {
      this.applyDesc = num;
      this.getListHistory();
    },
    resetSelect() {
      this.time = [];
      this.inputSelect = null;
    },
    todivi(num) {
      let str = num.toString();
      var strList = [];
      var finallyStr = null;
      var j = parseInt(str.length / 3);
      if (str.length <= 3) {
        finallyStr = str;
      } else {
        for (var i = str.length; i - 3 > 0; i -= 3) {
          strList[j] = str.substring(i - 3, i);
          j--;
        }
        if (i != 0) {
          strList[j] = str.substring(0, i)
        }
        if (str.length % 3 == 0) {
          finallyStr = strList.join(',').substring(1, strList.join(',').length);
        }
        else {
          finallyStr = strList.join(',')
        }
      }
      return finallyStr;
    },
    sizeChange() {
      this.curPage = 1;
      this.tabChange();
    },
    async getListHistory() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameQuota",
        serviceName: "find-list-ecord",
        serviceParameter: {
          sort: this.applyDesc,
          pageNum: this.curPage,
          pageSize: this.pageSize,
          search: this.inputSelect,
          start: this.time[0] || null,
          end: this.time[1] || null,
        },
        method: "get",
      });
      if (res) {
        this.infoList = res.data.list;
        this.total = res.data.total;
      }
    },
    async getList() {
      if (!this.isCuC) {
        this.curPage = 1;
      };
      this.isCuC = false;
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameQuota",
        serviceName: "find-list",
        serviceParameter: {
          pageNum: this.curPage,
          pageSize: this.pageSize,
          search: this.inputSelect,
        },
        method: "get",
      });
      if (res) {
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.loadingList.close();
      }
      if (err) {
        this.loadingList.close();
      }
    },
  },
  created() { },
  mounted() {
    this.today = Cookies.get("today");
    this.getList();
    this.treeAddDeptList = [];
    listDept({
      deptName: undefined,
      status: undefined,
    }).then((response) => {
      response.data.forEach((el) => {
        if (el.deptLevel == 2) {
          this.treeAddDeptList.push(el);
        }
      });
      console.log(
        this.treeAddDeptList,
        "==============treeAddDeptList=============="
      );
    });
  },
  beforeDestroy() { },
};
</script>

<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.quotaManage {
  .el-breadcrumb {
    margin-top: toRem(17);
    margin-bottom: toRem(32);
    margin-left: toRem(40);
  }

  .updateDrawer {
    .el-drawer__body {
      >div:nth-child(2) {
        display: flex;
        flex-direction: column;
        margin: toRem(33) 0 0 toRem(40);
        font-size: toRem(14);

        >div {
          display: flex;
          align-items: center;
          margin-bottom: toRem(10);

          >span:first-child {
            width: toRem(110);
            text-align: left;
            font-weight: 600;
            color: #343434;
          }

          >div {
            width: toRem(330);
          }
        }
      }

      >div:last-child {
        height: 0.75rem;
        align-items: flex-start;
        flex-direction: column;
        padding: 0;

        >span:last-child {
          margin: 0.07rem 0 0 0.4rem;
          font-size: 0.14rem;
          display: inline-block;
          width: 2rem;
          height: 0.4rem;
          background: #1e6fff;
          color: white;
          font-weight: 600;
          line-height: 0.4rem;
          border-radius: 0.22rem;
          cursor: not-allowed;
          border: 1px solid #1e6fff;
          opacity: 0.24;
        }
      }
    }
  }

  .tabContent {
    span {
      font-size: toRem(14);
    }

    padding: toRem(0) toRem(40);

    .selectArea {
      width: toRem(1360);
      margin-top: toRem(20);

      >div:first-child {
        width: toRem(300);
      }

      >div:nth-child(3) {
        width: toRem(300);
      }

      >span:nth-last-child(3) {
        margin-left: toRem(10);
      }
    }

    .collapseList {
      width: toRem(1360);
      margin-top: toRem(20);

      >div,
      >div>div {
        >span {
          flex: 0.6;
          margin-right: toRem(2);
          position: relative;

          >i {
            position: absolute;
            font-size: toRem(16);
            right: toRem(10);
            top: toRem(8);
            cursor: pointer;
          }

          >i:last-child {
            top: toRem(16);
          }
        }

        >span:first-child,
        span:nth-child(2) {
          flex: 1;
        }

        >span:last-child {
          color: rgba(30, 111, 255, 1);
          cursor: pointer;
          margin-right: 0;
        }
      }
    }

    .collapseListTotal {
      width: toRem(1360);
    }
  }
}
</style>