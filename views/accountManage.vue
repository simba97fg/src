<template>
  <div class="accountManage" v-loading="loading">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>T1数据管理</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">开户信息管理<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <div>
          <el-select v-model="type" v-bind:disabled="!listRole" @change="getList">
            <el-option v-for="item in typeoptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-input v-model="inputSelect" placeholder="请输入" v-bind:disabled="!listRole" @change="getList"
            suffix-icon="el-icon-search"></el-input>
        </div>
        <el-input v-model="queryParams.iccid" placeholder="ICCID" v-bind:disabled="!listRole" suffix-icon="el-icon-search"
          @change="getList">
        </el-input>
        <el-select v-model="queryParams.newVehicleFlag" filterable placeholder="新车标识" v-bind:disabled="!listRole" multiple
          @change="getList" clearable collapse-tags>
          <el-option v-for="item in newVehicleFlagOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.userType" filterable placeholder="用户类型" v-bind:disabled="!listRole" clearable
          @change="getList">
          <el-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.ispType" filterable placeholder="车联网卡类型" v-bind:disabled="!listRole" multiple
          collapse-tags @change="getList" clearable>
          <el-option v-for="item in ispTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.vehicleBrand" filterable placeholder="车辆品牌" v-bind:disabled="!listRole" multiple
          collapse-tags @change="getList" clearable>
          <el-option v-for="item in vehicleBrandOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>

        <el-select v-model="queryParams.ispCode" filterable placeholder="运营商" v-bind:disabled="!listRole" multiple
          collapse-tags clearable @change="getList">
          <el-option v-for="item in ispCodeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div v-if="showMoreSelect">
        <el-date-picker v-bind:disabled="!listRole" v-model="time" value-format="yyyy-MM-dd HH:mm:ss" clearable
          prefix-icon="el-icon-date" type="daterange" start-placeholder="上报起始时间" end-placeholder="结束时间" align="right">
        </el-date-picker>
        <el-input v-model="queryParams.applyNo" placeholder="订单号" v-bind:disabled="!listRole" suffix-icon="el-icon-search"
          @change="getList">
        </el-input>
        <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
          placeholder="组织名称" v-model="queryParams.orgIds" @change="getList"></el-cascader>
        <el-select v-model="queryParams.vehicleStatus" filterable placeholder="车辆状态" v-bind:disabled="!listRole" multiple
          @change="getList" clearable collapse-tags>
          <el-option v-for="item in vehicleStatusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.pushStatus" filterable placeholder="T1上报结果" v-bind:disabled="!listRole" clearable
          collapse-tags multiple @change="getList">
          <el-option v-for="item in pushStatusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.reportingResults" filterable placeholder="T1报竣结果" v-bind:disabled="!listRole"
          clearable collapse-tags multiple @change="getList">
          <el-option v-for="item in reportingResultsOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <div style="opacity: 0;pointer-events:none"></div>
      </div>
      <span class="moreBtn" @click="showMoreSelect = true" v-if="!showMoreSelect">更多筛选项</span>
      <span class="moreBtn" @click="showMoreSelect = false" v-if="showMoreSelect">隐藏筛选项</span>
      <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
      <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
      <span @click="resetSelect" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span> -->
    </div>
    <el-divider></el-divider>
    <div class="operationArea">
      <div>
        <i class="el-icon-warning"></i>
        <span>已选 {{ selectNum }}</span>
        <span>/{{ total }} 条</span>
      </div>
      <span @click="checkList" v-if="changeRole">批量重试</span>
    </div>
    <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;" ref="multipleTable"
      @selection-change="handleSelectionChange" class="realNameTable" @select-all="selectAll">
      <el-table-column type="selection" width="76" align="center" fixed="left" :selectable="selectable">
      </el-table-column>
      <el-table-column prop="operTimeStr" label="最近一次T1上报时间" width="240" align="center">
      </el-table-column>
      <el-table-column label="T1上报结果" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-start" v-if="scope.row.errorMsg != ''">
            <div slot="content">上报失败原因如下：<br />{{ scope.row.errorMsg }}</div>
            <span>{{ scope.row.statusName }}</span>
          </el-tooltip>
          <span v-if="scope.row.errorMsg == ''">{{ scope.row.statusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="T1报竣结果" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-start"
            v-if="scope.row.reportCompletionErrorMsg && scope.row.reportCompletionErrorMsg != ''">
            <div slot="content">报竣失败原因如下：<br />{{ scope.row.reportCompletionErrorMsg }}</div>
            <span>{{ scope.row.reportCompletion }}</span>
          </el-tooltip>
          <span v-if="scope.row.reportCompletion == '-'">{{ scope.row.reportCompletion }}</span>
          <el-tooltip class="item" effect="dark" placement="top-start"
            v-if="(scope.row.reportCompletionErrorMsg == '' || !scope.row.reportCompletionErrorMsg) && scope.row.reportCompletion != '-'">
            <div slot="content">结果如下：<br />{{ scope.row.reportCompletion }}</div>
            <span>{{ scope.row.reportCompletion }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="vin" label="VIN" width="250" align="center">
      </el-table-column>
      <el-table-column prop="iccid" label="ICCID" width="250" align="center">
      </el-table-column>
      <el-table-column prop="msisdn" label="MSISDN" width="250" align="center">
      </el-table-column>
      <el-table-column prop="deptName" label="组织名称" width="210" align="center">
      </el-table-column>
      <el-table-column prop="companyName" label="车企名称" width="210" align="center">
      </el-table-column>
      <el-table-column prop="applyNo" label="订单号" width="245" align="center">
      </el-table-column>
      <el-table-column prop="customerTypeName" label="用户类型" width="115" align="center">
      </el-table-column>
      <el-table-column width="115" align="center">
        <template slot="header">
          用户名称<img src="../assets/images/openEyes.png" v-show="false" v-if="nameStatus" @click="changeHeadEyes('N')" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!nameStatus" @click="changeHeadEyes('N')" />
        </template>
        <template slot-scope="scope">
          {{ scope.row.customerName }}
        </template>
      </el-table-column>
      <el-table-column width="160" align="center">
        <template slot="header">
          证件号码<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
            @click="changeHeadEyes('C')" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus" @click="changeHeadEyes('C')" />
        </template>
        <template slot-scope="scope">
          {{ scope.row.certNumber }}
        </template>
      </el-table-column>
      <el-table-column prop="ispName" label="运营商" width="115" align="center">
      </el-table-column>
      <el-table-column prop="vehicleBrand" label="车辆品牌" min-width="180" align="center">
      </el-table-column>
      <el-table-column prop="vehicleStatusName" label="车辆状态" width="115" align="center">
      </el-table-column>
      <el-table-column prop="newVehicleFlagName" label="新车标识" width="115" align="center">
      </el-table-column>
      <el-table-column prop="ispTypeName" label="车联网卡类型" width="140" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="110" align="center">
        <template slot-scope="scope">
          <span v-if="changeRole && scope.row.status == '300'" @click="setNode(scope.row)"
            class="btnBase blueBtn">重试</span>
          <span v-if="!changeRole && scope.row.status == '300'" class="blueBtn disableBtn">重试</span>
          <span class="disableBtn" v-if="scope.row.status != '300'">-</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="infoTable">
      <div class="tableHead">
        <span>
          <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
          </el-checkbox>
        </span>

        <span>VIN</span>
        <span>ICCID</span>
        <span>MSISDN</span>
        <span>用户类型</span>
        <span>
          用户名称<img src="../assets/images/openEyes.png" v-show="false" v-if="nameStatus" @click="changeHeadEyes('N')" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!nameStatus" @click="changeHeadEyes('N')" />
        </span>
        <span>证件号码<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus" @click="changeHeadEyes('C')" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus" @click="changeHeadEyes('C')" /></span>
        <span>最近一次T1上报时间</span>
        <span>T1上报结果</span>
        <span>T1报竣结果</span>
        <span>操作</span>
      </div>
      <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <span>
          <el-checkbox v-model="node.checked" @change="addSelected(node)" v-bind:disabled="node.status != '300'">
          </el-checkbox>
        </span>
        <span>{{ node.vin }}</span>
        <span>{{ node.iccid }}</span>
        <span>{{ node.msisdn }}</span>
        <span>{{ node.customerTypeName }}</span>
        <span>{{ node.customerName }}</span>
        <span>{{ node.certNumber }}</span>
        <span>{{ node.operTimeStr }}</span>
        <el-tooltip class="item" effect="dark" placement="top-start" v-if="node.errorMsg != ''">
          <div slot="content">上报失败原因如下：<br />{{ node.errorMsg }}</div>
          <span>{{ node.statusName }}</span>
        </el-tooltip>
        <span v-if="node.errorMsg == ''">{{ node.statusName }}</span>
        <el-tooltip class="item" effect="dark" placement="top-start"
          v-if="node.reportCompletionErrorMsg && node.reportCompletionErrorMsg != ''">
          <div slot="content">报竣失败原因如下：<br />{{ node.reportCompletionErrorMsg }}</div>
          <span>{{ node.reportCompletion }}</span>
        </el-tooltip>
        <span v-if="node.reportCompletionErrorMsg == '' || !node.reportCompletionErrorMsg">{{ node.reportCompletion
        }}</span>
        <span class="blueBtn" v-if="node.status == '300' && changeRole" @click="setNode(node)">重试</span>
        <span class="disableBtn" v-if="node.status == '300' && !changeRole">重试</span>
        <span class="disableBtn" v-if="node.status != '300'">-</span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div> -->
    <el-pagination @size-change="sizeChange()" @current-change="currentPageChange"
      :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
      layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认重新向T1推送该失败项</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postNode(node)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisiable" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认重新向T1推送已选数据（共{{ checkedList.length }}项）</p>
      <p>仅重新推送原结果为失败的数据项，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="postNodeList()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import auth from "../plugins/auth";
import Vue from "vue";
export default {
  name: "accountManage",
  components: {},
  data() {
    return {
      isCuC: false,
      deptOptions: [],
      ispCodeOptions: [],
      ispTypeOptions: [],
      vehicleStatusOptions: [],
      newVehicleFlagOptions: [],
      vehicleBrandOptions: [],
      multipleSelection: [],
      showMoreSelect: false,
      listRole: false,
      changeRole: null,
      dialogVisiable: false,
      dialogVisible: false,
      node: null,
      cardNumbStatus: false,
      nameStatus: false,
      checkedList: [],
      props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        vin: null,
        iccid: null,
        msisdn: null,
        pushStatus: [],
        reportingResults: [],
        userType: null,
        pushStartTime: null,
        pushEndTime: null,
        cardNumbStatus: 0,
        nameStatus: 0,
        orgIds: [],
        applyNo: null,
        ispCode: [],
        ispType: [],
        vehicleStatus: [],
        newVehicleFlag: [],
        vehicleBrand: [],
      },
      reportingResultsOptions: [],
      pushStatusOptions: [
        { label: "成功", value: '0' },
        { label: "失败", value: '1' },
      ],
      userTypeOptions: [
        { label: "个人", value: '1' },
        { label: "单位", value: '2' },
      ],
      time: [],
      type: "VIN",
      typeoptions: ["VIN", "MSISDN"],
      isok: false,
      selectNum: 0,
      checked: false,
      isIndeterminate: false,
      infoList: [],
      total: 100,
      logStatus: [
        { value: 0, label: "成功" },
        {
          value: 1,
          label: "失败",
        },
      ],
      userNameList: [],
      dateRange: [],

      loading: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      operationPlace: null,
      inputSelect: null,
    };
  },
  computed: {
    deptOptions1() {
      return this.$store.getters.deptOptions;
    },
    vehicleStatusOptions1() {
      return this.$store.getters.vehicleStatusOptions;
    },
    vehicleCardTypeOptions() {
      return this.$store.getters.vehicleCardTypeOptions;
    },
    vehicleFlagOptions() {
      return this.$store.getters.vehicleFlagOptions;
    },
    vehicleBrandOptions1() {
      return this.$store.getters.vehicleBrandOptions;
    },
    ispNameOptions() {
      return this.$store.getters.ispNameOptions;
    },

  },
  watch: {
    time() {
      this.getList();
    }
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    async getoptions() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNamePushRecord",
        serviceName: "select_bos",
        method: "get",
      });
      if (res) {
        this.reportingResultsOptions = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    selectable(row, index) {
      if (!(row.status != '300'))
        return true;
    },
    selectAll(val) {
      if (!val.length && !this.infoList.length) {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.selectNum = this.multipleSelection.length;
      this.$nextTick(() => {
        this.checkedList = [];
        this.multipleSelection.forEach((el) => {
          this.checkedList.push(el.operId);
        })
      })
    },
    checkList() {
      if (this.selectNum > 0) {
        this.dialogVisiable = true;
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    sizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    async postNodeList() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNamePushRecord",
        serviceName: "restart-Push",
        serviceParameter: { ids: this.checkedList.toString() },
        method: "post",
      });
      if (res) {
        if (res.businessCode == "0") {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        } else if (res.businessCode == "1") {
          this.$message({
            message: "推送成功！",
            type: "success",
            showClose: true,
          });
          this.getList();
        }
        this.dialogVisiable = false;
      }
      if (err) {
      }
    },
    addSelected(node) {
      console.log("this.checkedList", this.checkedList);
      if (node.checked) {
        this.selectNum++;
        this.checkedList.push(node.id);
      } else {
        this.selectNum--;
        this.checkedList.splice(this.checkedList.indexOf(node.id), 1);
      }
      this.checked = this.selectNum == this.infoList.length;
      this.isIndeterminate =
        this.selectNum > 0 && this.selectNum < this.infoList.length;
      console.log("this.checkedList", this.checkedList);
    },
    clickAll() {
      this.selectNum = 0;
      this.checkedList = [];
      this.infoList.forEach((el) => {
        el.checked = this.checked;
        if (this.checked && el.status == '300') {
          this.selectNum++;
          this.checkedList.push(el.id);
          console.log("this.checkedList", this.checkedList);
        }
      });
      this.isIndeterminate = false;
      console.log("this.checkedList", this.checkedList);
    },
    setNode(node) {
      this.node = node;
      this.dialogVisible = true;
    },
    resetSelect() {
      this.type = "VIN";
      this.inputSelect = null;
      this.queryParams.pushStatus = [];
      this.queryParams.reportingResults = [];
      this.queryParams.userType = null;
      this.queryParams.iccid = null,
        this.queryParams.applyNo = null,
        this.queryParams.orgIds = [],
        this.queryParams.ispCode = [],
        this.queryParams.ispType = [],
        this.queryParams.vehicleStatus = [],
        this.queryParams.newVehicleFlag = [],
        this.queryParams.vehicleBrand = [],
        this.time = [];
      this.$nextTick(() => {
        this.getList();
      })
    },
    changeHeadEyes(type) {
      if (type == "C") {
        this.cardNumbStatus = !this.cardNumbStatus;
      } else {
        this.nameStatus = !this.nameStatus;
      }
      this.getList();
    },
    resetqueryParams() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        vin: null,
        iccid: null,
        msisdn: null,
        pushStatus: [],
        reportingResults: [],
        userType: null,
        pushStartTime: null,
        pushEndTime: null,
        cardNumbStatus: 0,
        nameStatus: 0,
      };
      this.dateRange = [];
    },
    async postNode(node) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNamePushRecord",
        serviceName: "restart-Push",
        serviceParameter: { ids: node.operId, applyNo: node.applyNo },
        method: "post",
      });
      if (res) {
        if (res.businessCode == "0") {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        } else if (res.businessCode == "1") {
          this.$message({
            message: "推送成功！",
            type: "success",
            showClose: true,
          });
          this.getList();
        }
        this.node = null;
        this.dialogVisible = false;
      }
      if (err) {
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
      this.queryParams.cardNumbStatus = 0;
      this.queryParams.nameStatus = 0;
      if (this.cardNumbStatus) {
        this.queryParams.cardNumbStatus = 1;
      }
      if (this.nameStatus) {
        this.queryParams.nameStatus = 1;
      }
      this.checkedList = [];
      this.selectNum = 0;
      if (this.time) {
        this.queryParams.pushStartTime = this.time[0];
        this.queryParams.pushEndTime = this.time[1];
      } else {
        this.queryParams.pushStartTime = null;
        this.queryParams.pushEndTime = null;
      }
      this.queryParams.vin = null;
      this.queryParams.msisdn = null;
      if (this.type == "VIN") {
        this.queryParams.vin = this.inputSelect;
      } else if (this.type == "ICCID") {
        this.queryParams.iccid = this.inputSelect;
      } else {
        this.queryParams.msisdn = this.inputSelect;
      }
      let params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        vin: this.queryParams.vin,
        iccid: this.queryParams.iccid,
        msisdn: this.queryParams.msisdn,
        pushStatus: this.queryParams.pushStatus.toString(),
        reportingResults: this.queryParams.reportingResults.toString(),
        userType: this.queryParams.userType,
        pushStartTime: this.queryParams.pushStartTime,
        pushEndTime: this.queryParams.pushEndTime,
        cardNumbStatus: this.queryParams.cardNumbStatus,
        nameStatus: this.queryParams.nameStatus,
        orgIds: this.queryParams.orgIds.toString(),
        applyNo: this.queryParams.applyNo,
        ispCode: this.queryParams.ispCode.toString(),
        ispType: this.queryParams.ispType.toString(),
        vehicleStatus: this.queryParams.vehicleStatus.toString(),
        newVehicleFlag: this.queryParams.newVehicleFlag.toString(),
        vehicleBrand: this.queryParams.vehicleBrand.toString(),

      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNamePushRecord",
        serviceName: "query-push-list",
        serviceParameter: params,
        method: "get",
      });
      if (err) {
        console.log("err", err);
        this.loadingList.close();
      }
      if (res) {
        res.data.list.forEach((element) => {
          element.checked = false;
        });
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.checked = false;
        this.isIndeterminate = false;
        console.log("orderList", res.data);
        this.loadingList.close();
      }
      console.log(this.queryParams);
    },
  },
  created() { },
  mounted() {
    this.vehicleStatusOptions = this.vehicleStatusOptions1;
    this.ispTypeOptions = this.vehicleCardTypeOptions;
    this.newVehicleFlagOptions = this.vehicleFlagOptions;
    this.vehicleBrandOptions = this.vehicleBrandOptions1;
    this.ispCodeOptions = this.ispNameOptions;
    this.deptOptions = this.deptOptions1;
    this.getoptions();
    this.listRole = auth.hasPermi("home:accountManage:list");
    this.changeRole = auth.hasPermi("home:accountManage:change");
    this.getList();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.accountManage {
  padding: toRem(17) toRem(41) toRem(39) toRem(40);

  .selectArea {
    >div {
      >div:first-child {
        width: toRem(275);
        display: flex;

        >div:first-child {
          width: toRem(85);
          margin-right: 0;
        }

        >div:nth-child(2) {
          width: toRem(190);
        }
      }

      >div:nth-child(2) {
        width: toRem(180);
      }
    }

  }

  .operationArea {
    >div:nth-child(2) {
      width: fit-content;
    }
  }

  .infoTable {
    height: fit-content;

    >div {
      >span {
        position: relative;

        >img {
          position: absolute;
          height: 0.16rem;
          top: 0.11rem;
          cursor: pointer;
          margin-left: toRem(10);
        }
      }

      >span:first-child {
        width: toRem(46);
      }

      > {
        width: toRem(220);
      }

      >span:nth-child(2),
      span:nth-child(3),
      span:nth-child(7),
      span:nth-child(8),
      span:nth-child(4) {
        width: toRem(175);
      }

      >span:nth-child(6) {
        width: toRem(120);
      }

      >span:nth-child(5) {
        width: toRem(70);
      }

      >span:nth-child(9),
      span:nth-child(10),
      span:nth-child(11) {
        width: toRem(75);
      }

      >span:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>