<template>
  <div class="resetRealNameCard">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>其他业务管理</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">更换车联网卡<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <el-dialog :visible.sync="updatedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认为文件中车辆更换车联网卡</p>
      <p></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadfile">确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="updateDrawer" direction="rtl" size="43.05%" class="updateDrawer"
      :before-close="handleClose">
      <div slot="title">
        <span>更换车联网卡</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span></span>
          <span>选择归属组织</span>
        </div>
        <el-cascader class="margin65" :show-all-levels="true" v-model="selectedDept" :options="deptOptions"
          :props="memberDrawerDefaultProps"></el-cascader>
        <div>
          <span></span>
          <span>车联网卡文件</span>
          <span @click="downloadtemplate">下载模板</span>
        </div>
        <span v-if="updateStatus == '0'" @click="upload">
          <input type="file" name="file" multiple="multiple" style="display: none" id="file"
            @change="getFile($event)" />
          选择文件</span>
        <div v-if="updateStatus != '0'">
          <i class="el-icon-error" v-show="updateStatus == '5'" @click="updateStatus = '0'" />
          <div>
            <span>{{ fileName }}</span>
            <span v-if="updateStatus == '1'">{{ percentage }}%</span>
            <span v-if="updateStatus == '2'" class="successP">更换成功</span>
            <span v-if="updateStatus == '3'" class="errorP">更换失败，请重试</span>
            <span v-if="updateStatus == '4'" class="warningP">已中断，请重试</span>
          </div>
          <el-progress v-bind:class="{ displayNode: updateStatus == '5' }" :percentage="percentage" :format="format"
            :status="progressStatus"></el-progress>
          <div>
            <span>{{ fileSize }}</span>
            <span v-show="updateStatus == '1'" @click="cancleUpload">取消上传</span>
            <span v-if="updateStatus == '3'">原因：上传数据格式错误</span>
            <span v-if="updateStatus == '4'">原因：被取消</span>
          </div>
        </div>
        <el-tooltip placement="bottom-start" effect="light" popper-class="popperclass">
          <div slot="content" class="tooltipContent">
            <div v-if="vinList">
              <i class="el-icon-warning" />
              共 {{ vinList.length }} 辆
            </div>
            <div>
              <div v-for="(vinnode, index) in vinList" :key="index">
                <div>
                  <span>{{ index + 1 }}</span><span>{{ vinnode }}</span>
                </div>
                <el-divider></el-divider>
              </div>
            </div>
          </div>
          <span v-show="updateStatus == '2'" class="greenBtn">查看已更换车辆</span>
        </el-tooltip>
        <el-tooltip placement="bottom-start" effect="light" popper-class="popperclass">
          <div slot="content" class="tooltipContent errorList">
            <div v-if="errorList">
              <i class="el-icon-warning" />
              共 {{ errorList.length }} 辆
            </div>
            <div>
              <div>
                <div><span>所在行</span><span>错误原因</span></div>
                <el-divider></el-divider>
              </div>
              <div v-for="(vinnode, index) in errorList" :key="index">
                <div>
                  <span>{{ vinnode.serialNumberName }}</span><span>{{ vinnode.errorMsg }}</span>
                </div>
                <el-divider></el-divider>
              </div>
            </div>
          </div>
          <span v-show="errorList.length > 0" class="greenBtn" style="background-color: #f56c6c">查看错误格式数据</span>
        </el-tooltip>
      </div>
      <div>
        <el-divider></el-divider>
        <span v-if="updateStatus == '0'">确认更换</span>
        <span v-if="updateStatus == '1'">更换中</span>
        <span class="clickAbleBtn" v-if="updateStatus == '2'" @click="reStart">继续更换</span>
        <span class="clickAbleBtn" @click="reStart" v-if="updateStatus == '3' || updateStatus == '4'">重新更换</span>
        <span class="clickAbleBtn" v-if="updateStatus == '5'" @click="updatedialogVisible = true">确认更换</span>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="drawer" direction="rtl" size="40.27%" class="drawer">
      <div slot="title">
        <span>车辆网卡更换详情</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div class="baseInfo" v-if="infoDetail.baseData">
          <div>
            <span>文件名称</span><span>{{ infoDetail.baseData.fileName }}</span>
          </div>
          <div>
            <span>操作人</span><span>{{ infoDetail.baseData.operatorName }}</span>
          </div>
          <div>
            <span>更换时间</span><span>{{ infoDetail.baseData.operatorTime }}</span>
          </div>
        </div>
        <div class="listArea" v-if="infoDetail.baseData">
          <div>
            <i class="el-icon-warning" />
            <span>共 {{ infoDetail.baseData.num }} 张</span>
          </div>
          <div>
            <div>
              <div v-for="(node, index) in infoDetail.listData" :key="index">
                <div>
                  <span>{{ index + 1 }}</span>
                  <span>{{ node.vin }}</span>
                </div>
                <el-divider></el-divider>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="false"></div>
    </el-drawer>

    <div class="selectArea">
      <div>
        <el-input placeholder="文件名" v-model="queryParams.fileName" v-bind:disabled="!listRole" @change="getList"
          suffix-icon="el-icon-search"></el-input>
        <el-input v-model="queryParams.batchNo" placeholder="批次号" v-bind:disabled="!listRole" @change="getList"
          suffix-icon="el-icon-search"></el-input>
        <el-select v-model="queryParams.operatorName" filterable placeholder="操作人" v-bind:disabled="!listRole" clearable
          @change="getList">
          <el-option v-for="item in userList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-cascader :options="deptOptions" :props="deptprops" collapse-tags clearable :show-all-levels="false"
          placeholder="组织名称" v-model="orgId" @change="getList"></el-cascader>
        <el-date-picker v-bind:disabled="!listRole" v-model="time" value-format="yyyy-MM-dd HH:mm:ss"
          prefix-icon="el-icon-date" type="daterange" start-placeholder="更换起始时间" end-placeholder="结束时间" align="right">
        </el-date-picker>
        <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
      <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
      <span @click="resetSelect" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span> -->
        <span @click="openUpdateDrawer" v-show="changeRole" class="operBtn">去更换</span>
      </div>

    </div>
    <el-divider></el-divider>
    <div class="infoTable">
      <div class="tableHead">
        <span>文件名称</span>
        <span>车企名称</span>
        <span>组织名称</span>
        <span>批次号</span>
        <span>卡数</span>
        <span class="timeStatus">更换时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.timeDesc == 1 }"
            @click="changeOrder(1)" /><i class="el-icon-caret-bottom"
            v-bind:class="{ blueBtn: queryParams.timeDesc == 0 }" @click="changeOrder(0)" /></span>
        <span>操作人</span>
        <span>操作</span>
      </div>
      <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <span>{{ node.fileName }}</span>
        <span>{{ node.companyName }}</span>
        <span>{{ node.deptName }}</span>
        <span>{{ node.batchNo }}</span>
        <span>{{ node.num }}</span>
        <span>{{ node.operatorTime }}</span>
        <span>{{ node.operatorName }}</span>
        <span class="blueBtn" @click="opendrawer(node)" v-if="detailRole">详情</span>
        <span class="disableBtn" v-if="!detailRole">详情</span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div>
    <el-pagination @size-change="sizeChange()" @current-change="currentPageChange"
      :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
      layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
// @ is an alias to /src
import { treeselect } from "@/api/system/dept";
import { listUser } from "@/api/system/user";
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "resetRealNameCard",
  components: {},
  data() {
    return {
      isCuC: false,
      listRole: false,
      deptprops: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      detailRole: null,
      changeRole: null,
      updatedialogVisible: false,
      userList: [],
      files: null,
      progressStatus: undefined,
      errorList: [],
      fileName: null,
      fileSize: null,
      batchNo: null,
      statusOptions: [],
      updateDrawer: false,
      total: null,
      orgId: [],
      queryParams: {
        pageSize: 10,
        pageNum: 1,
        timeDesc: 0,
        operatorName: null,
        fileName: null,
        startTime: null,
        endTime: null,
        batchNo: null,

        orgIds: [],
      },
      time: null,
      vinList: [],
      updateStatus: "0",
      percentage: 45,
      infoDetail: {},
      selectedDept: null,
      deptOptions: [],
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      drawer: false,
      finishDesc: null,
      infoList: [],
    };
  },
  watch: {
    time() {
      this.getList();
    }
  },
  computed: {
    userDeptId() {
      return this.$store.getters.deptId;
    },
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    sizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetSelect() {
      this.queryParams.operatorName = null;
      this.queryParams.fileName = null;
      this.queryParams.startTime = null;
      this.queryParams.endTime = null;
      this.queryParams.batchNo = null;
      this.queryParams.orgIds = [];
      this.orgId = [];
      this.time = [];
      this.$nextTick(() => {
        this.getList();
      })
    },
    reStart() {
      this.errorList = [];
      this.updateDrawer = false;
      this.openUpdateDrawer();
    },
    cancleUpload() {
      this.clearuploadstatus();
      this.reStart();
    },
    setVinList() {
      this.vinList = [
        "lfv2a2150a3049668",
        "lfv2a2150a3049669",
        "lfv2a2150a3049670",
        "lfv2a2150a3049671",
        "lfv2a2150a3049672",
        "lfv2a2150a3049673",
        "lfv2a2150a3049674",
        "lfv2a2150a3049675",
        "lfv2a2150a3049676",
        "lfv2a2150a3049677",
        "lfv2a2150a3049678",
        "lfv2a2150a3049679",
        "lfv2a2150a3049680",
        "lfv2a2150a3049681",
        "lfv2a2150a3049682",
        "lfv2a2150a3049683",
        "lfv2a2150a3049684",
        "lfv2a2150a3049685",
        "lfv2a2150a3049686",
        "lfv2a2150a3049687",
      ];
    },
    downloadFile() {
      this.$message({
        message: "下载成功",
        type: "success",
        showClose: true,
      });
    },
    removeCardInfo() {
      this.$message({
        message: "解绑成功！",
        type: "success",
        showClose: true,
      });
      this.drawer = false;
      this.getList();
    },
    format(percentage) {
      return percentage === 100 ? "满" : `${percentage}%`;
    },
    handleClose() {
      this.errorList = [];
      this.updateDrawer = false;
      this.getList();
    },
    async clearuploadstatus() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "clear-upload-status",
        method: "post",
        serviceParameter: {
          batchNo: this.batchNo,
        },
      });
      if (res) {
        this.cleardocument();
      }
      if (err) {
        console.log(err);
      }
    },
    async cleardocument() {
      this.errorList = [];
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "clear-document",
        method: "post",
        serviceParameter: {
          batchNo: this.batchNo,
        },
      });
      if (res) {
      }
      if (err) {
        console.log(err);
      }
    },
    upload() {
      if (this.selectedDept == null) {
        this.$message({
          message: "请先选择信息归属组织！",
          type: "warning",
          showClose: true,
        });
      } else {
        document.querySelector("#file").click();
      }
    },
    getFile(e) {
      this.files = e.target.files || e.dataTransfer.files;
      this.fileName = this.files[0].name;
      this.fileSize = this.files[0].size / 1024 + "KB";
      this.updateStatus = "5";
    },
    async uploadfile() {
      const api = this.$$api.doFormDataReq({
        url_key: "realNameReset",
        loading: !1,
        serviceParameter: {
          batchNo: this.batchNo.toString(),
          userName: Cookies.get("userName"),
          orgId: this.selectedDept,
        },
        data: {
          service_name: "upload-file",
          service_parameter: {
            batchNo: this.batchNo.toString(),
            userName: Cookies.get("userName"),
            orgId: this.selectedDept,
          },
        },
        files: {
          file: this.files[0],
        },
      });
      let { res, err } = await api.promise;
      if (res) {
        if (res.success) {
          this.getLoadingRate();
          this.updateStatus = "1";
          this.updatedialogVisible = false;
        } else {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
          this.updateStatus = "3";
          this.progressStatus = "exception";
          this.clearuploadstatus();
        }
      }
      if (err) {
        console.log(err);
      }
    },
    async getLoadingRate() {
      let businessCode = '2';
      while (businessCode != "1") {
        if (this.percentage < 99) {
          this.percentage++;
        }
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameReset",
          serviceName: "query-upload-status",
          method: "get",
          serviceParameter: {
            batchNo: this.batchNo,
          },
        });
        if (res) {
          businessCode = res.businessCode;
          if (res.businessCode == '1') {
            if (res.data.errorList.length > 0) {
              this.errorList = [];
              this.updateStatus = "3";
              this.progressStatus = "exception";
              res.data.errorList.forEach((el) => {
                this.errorList.push({
                  serialNumberName: el.serialNumberName,
                  errorMsg: el.errorMsg,
                });
              });
              this.$message({
                message: "成功" + res.data.success + '条，失败' + res.data.error + '条',
                type: "info",
                showClose: true,
                duration: 0
              });
            } else {
              this.updateStatus = "2";
              this.percentage = 100;
              this.progressStatus = "success";
              this.$message({
                message: "更换成功！",
                type: "success",
                showClose: true,
              });
              let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameReset",
                serviceName: "query-detail",
                serviceParameter: { batchNo: this.batchNo, status: "0" },
                method: "get",
              });
              if (res) {
                this.vinList = res.data.listData;
              }
              this.getList();
            }
          } else if (res.businessCode == '0') {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            });
            // if (res.data.errorList.length > 0) {
            //   this.errorList = [];
            //   res.data.errorList.forEach((el) => {
            //     this.errorList.push({
            //       serialNumberName: el.serialNumberName,
            //       errorMsg: el.errorMsg,
            //     });
            //   });
            // }
            this.updateStatus = "3";
            this.progressStatus = "exception";
            this.clearuploadstatus();
            break;
          }
        }
        if (err) {
          this.clearuploadstatus();
          this.$message({
            message: err,
            type: "warning",
            showClose: true,
          });
        }
      }

    },
    async openUpdateDrawer() {
      this.selectedDept = null;
      this.progressStatus = undefined;
      this.updateStatus = "0";
      this.updateDrawer = true;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "create-batchNo",
        method: "get",
      });
      if (res) {
        this.batchNo = res.data;
      }
    },
    opendrawer(node) {
      this.drawer = true;
      this.getDetail(node.id);
    },
    async getDetail(id) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "query-detail",
        serviceParameter: { id: id, status: "0" },
        method: "get",
      });
      if (res) {
        this.infoDetail = res.data;
      }
    },
    async getBox() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getVehicleStatusComboBox",
        method: "get",
      });
      if (res) {
        this.statusOptions = res.data;
      }
    },
    async getBox1() {
      this.userList = [];
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getReplaceOperatorNameComboBox",
        method: "get",
      });
      if (res) {
        this.userList = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    async downloadtemplate() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "download-template",
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "更换车联网卡信息模板" + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "更换车联网卡信息模板" + ".xls";
        // for IE
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          // for Non-IE (chrome, firefox etc.)
          const elink = document.createElement("a");
          elink.download = fileName;
          elink.style.display = "none";
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          URL.revokeObjectURL(elink.href);
          document.body.removeChild(elink);
        }
      }
    },
    async getList() {
      if (!this.isCuC) {
        this.queryParams.pageNum = 1;
      };
      this.isCuC = false;
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      this.queryParams.orgIds = this.orgId.toString();
      if (this.time) {
        this.queryParams.StartTime = this.time[0];
        this.queryParams.endTime = this.time[1];
      }
      console.log(this.queryParams);
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameReset",
        serviceName: "query-list",
        serviceParameter: this.queryParams,
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
    changeOrder(num) {
      this.queryParams.timeDesc = num;
      this.getList();
    },
  },
  created() { },
  mounted() {
    this.detailRole = true;
    this.listRole = auth.hasPermi("home:resetRealNameCard:list");
    this.changeRole = auth.hasPermi("home:resetRealNameCard:change");
    treeselect().then((response) => {
      this.deptOptions = response.data;
    });
    this.getList();
    this.getBox();
    this.getBox1();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.blue {
  color: rgb(87, 145, 245);
}

.resetRealNameCard {
  .blueBtn {
    color: #1e6fff !important;
    cursor: pointer !important;
  }

  padding: toRem(17) toRem(41) toRem(39) toRem(40);

  .updateDrawer {
    .el-drawer__body {
      position: relative;

      >div:nth-child(2) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        font-size: toRem(14);
        color: #343434;
        padding-left: toRem(40);

        >div {
          display: flex;
          align-items: center;
          width: 100%;

          >span {
            display: inline-block;
          }
        }

        .margin65 {
          margin-bottom: toRem(65);
        }

        >span:nth-child(4) {
          width: toRem(402);
          height: toRem(62);
          background: #ffffff;
          box-shadow: 0px 2px 2px 0px rgba(108, 108, 108, 0.12);
          border-radius: toRem(5);
          border: 1px solid #1e6ff0;
          font-weight: 600;
          color: #1d6efd;
          line-height: toRem(64);
          margin-top: toRem(19);
          margin-left: toRem(13);
          cursor: pointer;
        }

        >div:nth-child(4) {
          position: relative;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: toRem(402);
          height: toRem(64);
          background: #f9f9f9;
          border-radius: 5px;
          margin-top: toRem(19);
          margin-left: toRem(13);

          >i {
            cursor: pointer;
            position: absolute;
            top: toRem(-8);
            right: toRem(-8);
            font-size: toRem(24);
            color: rgba(0, 0, 0, 0.41);
          }

          >div {
            width: toRem(366);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          >div:nth-child(2) {
            >span {
              font-size: toRem(12);
              font-weight: 600;
              color: #424549;
              margin-bottom: toRem(5);
            }
          }

          >div:nth-child(3) {
            ::v-deep .el-progress-bar {
              width: 114%;
            }

            ::v-deep .el-progress__text {
              display: none;
            }
          }

          >div:nth-child(4) {
            >span {
              font-size: toRem(12);
              font-weight: 400;
              color: #87898b;
              margin: 0;
              margin-top: toRem(4);
              width: fit-content;
              height: fit-content;
              background: unset;
            }

            >span:last-child {
              font-size: toRem(12);
              color: #424549;
              cursor: pointer;
            }
          }
        }

        .greenBtn {
          cursor: pointer;
          margin: toRem(10) 0 toRem(30) toRem(13);
          width: toRem(127);
          height: toRem(25);
          background: #67c23a;
          box-shadow: 0px 1px 1px 0px rgba(102, 144, 88, 0.34);
          border-radius: 5px;
          color: white;
          line-height: toRem(25);
          font-size: toRem(12);
        }

        >div:nth-child(2) {
          margin-top: 0.19rem;
          margin-left: 0.13rem;
          width: toRem(402);
        }

        >div:first-child,
        div:nth-child(3) {
          >span:first-child {
            width: toRem(8);
            height: toRem(26);
            background: $RBlueColor;
            margin-right: toRem(15);
          }

          >span:nth-child(2) {
            font-size: toRem(22);
            font-weight: 600;
            color: #131415;
            margin-right: toRem(15);
          }

          >span:nth-child(3) {
            width: toRem(76);
            height: toRem(26);
            background: #1d6efe;
            border-radius: toRem(16);
            font-size: toRem(12);
            color: white;
            line-height: toRem(26);
            cursor: pointer;
          }
        }
      }

      >div:last-child {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: toRem(75);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0;

        >span:last-child {
          margin: toRem(7) 0 0 toRem(40);
          font-size: toRem(14);
          display: inline-block;
          width: toRem(200);
          height: toRem(40);
          background: #1e6fff;
          color: white;
          font-weight: 600;
          line-height: toRem(40);
          border-radius: toRem(22);
          cursor: not-allowed;
          border: 1px solid $RBlueColor;
          opacity: 0.24;
        }
      }
    }
  }

  .drawer {
    .el-drawer__body {
      position: relative;

      span {
        display: inline-block;
      }

      .baseInfo {
        background: #f9f9f9;
        margin-left: 0.54rem;
        width: toRem(402);
        border-radius: toRem(5);
        padding: toRem(15);
        padding-bottom: toRem(10);

        >div {
          display: flex;
          align-items: center;
          margin-bottom: toRem(5);

          >span {
            color: rgba(19, 20, 21, 1);
          }

          >span:first-child {
            font-weight: 600;
            width: toRem(90);
          }
        }

        >div:nth-child(2) {
          >span:nth-child(2) {
            color: #1e6fff;
            text-decoration: underline;
          }
        }
      }

      .updateArea {
        display: flex;
        flex-direction: column;
        font-size: toRem(12);

        >div:first-child {
          display: flex;
          align-items: center;
          height: toRem(26);
          line-height: toRem(26);
          margin-bottom: toRem(20);

          >span:first-child {
            height: toRem(26);
            width: toRem(8);
            background: #1e6fff;
            margin: 0 toRem(15) 0 toRem(40);
          }

          >span:nth-child(2) {
            font-size: toRem(22);
            font-weight: 600;
            margin-right: toRem(10);
          }

          >span:nth-child(3) {
            width: toRem(76);
            background: #1e6fff;
            border-radius: toRem(16);
            color: white;
            cursor: pointer;
          }
        }

        >span:nth-child(2) {
          margin-left: 0.54rem;
          width: toRem(402);
          height: toRem(64);
          line-height: toRem(64);
          background: #ffffff;
          box-shadow: 0px 2px 2px 0px rgba(108, 108, 108, 0.12);
          border-radius: toRem(5);
          border: toRem(1) solid #1e6ff0;
          font-size: toRem(14);
          font-weight: 600;
          color: #1d6efd;
          cursor: pointer;
        }

        >div:nth-child(2) {
          position: relative;
          padding: toRem(8) toRem(18);
          width: toRem(402);
          height: toRem(64);
          background: #f9f9f9;
          border-radius: toRem(5);
          margin-left: 0.54rem;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          color: #424549;
          font-weight: 600;

          ::v-deep .el-progress-bar {
            padding: 0;
          }

          ::v-deep .el-icon-circle-check {
            display: none;
          }

          >div {
            text-align: left;
          }

          >div:nth-child(3) {
            font-weight: 400;
            display: flex;
            justify-content: space-between;
            height: toRem(17);
            line-height: toRem(17);
            color: #87898b;

            >span:nth-child(2) {
              color: #67c23a;
            }
          }

          >i {
            position: absolute;
            top: toRem(-7);
            right: toRem(-7);
            font-size: toRem(22);
            opacity: 0.6;
            cursor: pointer;
          }
        }
      }

      .listArea {
        font-size: toRem(15);
        margin-bottom: toRem(20);

        >div {
          width: 4.02rem;
          margin-left: 0.54rem;
        }

        >div:first-child {
          background: #f4f8ff;
          color: #1e6fff;
          height: toRem(38);
          line-height: toRem(38);
          margin-top: 0.2rem;
          border-radius: toRem(5) toRem(5) 0 0;
          text-align: left;
          border: 1px solid #eaeaea;
          border-bottom: white;

          >i {
            margin: 0 toRem(10) 0 toRem(18);
          }
        }

        >div:nth-child(2) {
          padding: toRem(12) toRem(8) toRem(15) 0;
          border: 1px solid #eaeaea;
          border-top: white;

          >div {
            max-height: toRem(500);
            overflow: auto;

            >div {
              display: flex;
              flex-direction: column;
              margin-right: toRem(12);

              >div:first-child {
                margin-left: toRem(20);
                opacity: 0.85;
                display: flex;

                >span:first-child {
                  display: inline-block;
                  text-align: left;
                  width: toRem(130);
                }
              }

              >div:nth-child(2) {
                margin: toRem(5) 0;
              }
            }
          }
        }
      }

      .el-divider {
        width: 100%;
      }
    }
  }

  .selectArea {
    >div {
      align-items: flex-start;

      >div {
        margin-right: toRem(5);

      }

      >div:first-child {
        width: toRem(275);
      }

      >div:nth-child(5) {
        width: toRem(275);
      }
    }
  }

  .el-divider {
    margin: toRem(15) 0 toRem(13) 0;
  }

  .infoTable {
    height: fit-content;

    >div {
      .timeStatus {
        position: relative;

        >i {
          position: absolute;
          top: toRem(9);
          right: toRem(15);
          cursor: pointer;
        }

        >i:last-child {
          top: toRem(16);
        }
      }

      >span:first-child {
        width: toRem(329);
      }

      >span:nth-child(2),
      span:nth-child(3),
      span:nth-child(4) {
        width: toRem(210);
      }

      >span:nth-child(5) {
        width: toRem(100);
      }

      >span:nth-child(6) {
        width: toRem(170);
      }

      >span:nth-child(7) {
        width: toRem(170);
      }

      >span:last-child {
        margin-right: 0;
        width: toRem(100);
      }
    }

    >div:first-child>span:nth-child(4) {
      color: #2c3e50;
      text-decoration: none;
    }
  }
}
</style>
