<template>
  <div class="noRealNameCard">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>实名记录</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">未实名号卡<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <div>
          <el-select v-model="type" v-bind:disabled="!listRole" @change="getList">
            <el-option v-for="item in typeoptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-input v-model="inputSelect" placeholder="请输入" @keyup.enter.native="getList" v-bind:disabled="!listRole"
            @change="getList">
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <el-input v-model="queryParams.iccid" placeholder="ICCID" v-bind:disabled="!listRole"
          suffix-icon="el-icon-search" @change="getList">
        </el-input>
        <el-select v-model="queryParams.newVehicleFlag" filterable placeholder="新车标识" v-bind:disabled="!listRole"
          multiple @change="getList" clearable collapse-tags>
          <el-option v-for="item in newVehicleFlagOptions" :key="item.value" :label="item.label" :value="item.value">
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
        <el-select v-model="queryParams.ispType" filterable placeholder="车联网卡类型" v-bind:disabled="!listRole" multiple
          collapse-tags @change="getList" clearable>
          <el-option v-for="item in ispTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="queryParams.vehicleStatus" filterable placeholder="车辆状态" v-bind:disabled="!listRole"
          multiple @change="getList" clearable collapse-tags>
          <el-option v-for="item in vehicleStatusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div v-if="showMoreSelect">
        <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
          placeholder="组织名称" v-model="queryParams.orgIds" @change="getList"></el-cascader>
      </div>
      <span class="moreBtn" @click="showMoreSelect = true" v-if="!showMoreSelect">更多筛选项</span>
      <span class="moreBtn" @click="showMoreSelect = false" v-if="showMoreSelect">隐藏筛选项</span>
    </div>
    <el-divider></el-divider>
    <div class="operationArea">
      <div>
        <i class="el-icon-warning"></i>
        <span>已选 {{ selectNum }}</span>
        <span>/{{ total }} 条</span>
      </div>
      <el-dropdown v-hasPermi="['home:noRealNameCard:export']" style="width: fit-content;">
        <el-button size="mini">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="checkList">批量导出
          </el-dropdown-item>
          <el-dropdown-item @click.native="getExportList(true)">全部导出
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px" ref="multipleTable"
      @selection-change="handleSelectionChange" @select-all="selectAll" class="realNameTable">
      <el-table-column type="selection" width="76" align="center" fixed="left">
      </el-table-column>
      <el-table-column prop="vin" label="VIN" min-width="250" align="center">
      </el-table-column>
      <el-table-column prop="iccid" label="ICCID" min-width="250" align="center">
      </el-table-column>
      <el-table-column prop="msisdn" label="MSISDN" min-width="250" align="center">
      </el-table-column>
      <el-table-column prop="deptName" label="组织名称" min-width="210" align="center">
      </el-table-column>
      <el-table-column prop="companyName" label="车企名称" min-width="210" align="center">
      </el-table-column>
      <el-table-column prop="statusName" label="开通状态" width="115" align="center">
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

    </el-table>
    <!-- <div class="infoTable">
      <div class="tableHead">
        <span
          ><el-checkbox
            size="large"
            v-model="checked"
            @change="clickAll()"
            :indeterminate="isIndeterminate"
          ></el-checkbox
        ></span>
        <span>VIN</span>
        <span>ICCID</span>
        <span>MSISDN</span>
        <span>开通状态</span>
      </div>
      <div
        class="tableContent"
        v-for="(node, index) in infoList"
        :key="index"
        v-show="total > 0"
      >
        <span
          ><el-checkbox
            v-model="node.checked"
            @change="addSelected(node)"
          ></el-checkbox
        ></span>
        <span>{{ node.vin }}</span>
        <span>{{ node.iccid }}</span>
        <span>{{ node.msisdn }}</span>
        <span>{{ node.statusName }}</span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div> -->
    <el-pagination @size-change="pageSizeChange" @current-change="currentPageChange"
      :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
      layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "noRealNameCard",
  components: {},
  data() {
    return {
      isCuC: false,
      deptOptions: [],
      props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      ispCodeOptions: [],
      ispTypeOptions: [],
      vehicleStatusOptions: [],
      newVehicleFlagOptions: [],
      vehicleBrandOptions: [],
      time: [],
      multipleSelection: [],
      showMoreSelect: false,
      listRole: false,
      today: null,
      checkedList: [],
      selectNum: 0,
      total: null,
      checked: false,
      isIndeterminate: false,
      type: "VIN",
      inputSelect: null,
      typeoptions: [
        {
          value: "VIN",
          label: "VIN",
        },
        {
          value: "MSISDN",
          label: "MSISDN",
        },
      ],
      queryParams: {
        pageSize: 10,
        pageNum: 1,
        iccid: null,
        msisdn: null,
        vin: null,
        orgIds: [],
        ispCode: [],
        ispType: [],
        vehicleStatus: [],
        newVehicleFlag: [],
        vehicleBrand: [],
      },
      infoList: [],
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
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    resetSelect() {
      this.queryParams = {
        pageSize: 10,
        pageNum: 1,
        iccid: null,
        msisdn: null,
        vin: null,
        orgIds: [],
        ispCode: [],
        ispType: [],
        vehicleStatus: [],
        newVehicleFlag: [],
        vehicleBrand: [],
      };
      this.type = 'VIN';
      this.inputSelect = null;
      this.getList();
    },
    selectAll(val) {
      if (!val.length && !this.infoList.length) {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.selectNum = this.multipleSelection.length;
    },
    pageSizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    checkList() {
      if (this.multipleSelection.length > 0) {
        this.checkedList = [];
        this.multipleSelection.forEach((el) => {
          this.checkedList.push(el.id);
        })
        this.$nextTick(() => {
          this.getExportList(false);
        })

      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async getExportList(isAll) {
      let tempIds = null;
      if (isAll) {
        tempIds = 'or';
        this.$message({
          message: '全部导出请求已发送，请耐心等候',
          type: "success",
          showClose: true,
        });
      } else {
        tempIds = this.checkedList.toString();
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "export-unAuth-list",
        serviceParameter: { ids: tempIds },
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "未实名号卡" + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        let fileName = "";
        console.log("getExport", res);
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        if (isAll) {
          fileName = "未实名号卡" + this.today + ".zip";
        } else {
          fileName = "未实名号卡" + this.today + ".xls";
        }

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
      if (err) {
        this.$message({
          message: "未实名号卡全部导出请求失败，请稍候再试！",
          type: "error",
          showClose: true,
        });
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
      let params = {
        pageSize: this.queryParams.pageSize,
        pageNum: this.queryParams.pageNum,
        iccid: this.queryParams.iccid,
        msisdn: null,
        vin: null,
        orgIds: this.queryParams.orgIds.toString(),
        ispCode: this.queryParams.ispCode.toString(),
        ispType: this.queryParams.ispType.toString(),
        vehicleStatus: this.queryParams.vehicleStatus.toString(),
        newVehicleFlag: this.queryParams.newVehicleFlag.toString(),
        vehicleBrand: this.queryParams.vehicleBrand.toString(),
      }
      if (this.type == "VIN") {
        params.vin = this.inputSelect;
      } else if (this.type == "MSISDN") {
        params.msisdn = this.inputSelect;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "query-unAuth-list",
        serviceParameter: params,
        method: "get",
      });
      if (err) {
        this.loadingList.close();
      }
      if (res) {
        this.selectNum = 0;
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.loadingList.close();
      }
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
    this.today = Cookies.get("today");
    this.listRole = auth.hasPermi("home:noRealNameCard:list");
    this.getList();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.blue {
  color: rgb(87, 145, 245);
}

.noRealNameCard {
  .blueBtn {
    color: #1e6fff !important;
    cursor: pointer !important;
  }

  padding: toRem(17) toRem(40) toRem(39) toRem(40);

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

  .el-divider {
    margin: toRem(15) 0 toRem(13) 0;
  }

  .operationArea {
    >div:nth-child(2) {
      width: fit-content;
    }
  }

  .infoTable {
    height: fit-content;

    >div {
      >span:first-child {
        width: toRem(46);
      }

      >span:nth-child(2),
      span:nth-child(3),
      span:nth-child(4),
      span:nth-child(5) {
        width: toRem(350);
      }

      >span:last-child {
        margin-right: 0;
        color: unset;
      }
    }
  }
}
</style>
