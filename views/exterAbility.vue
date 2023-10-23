<template>
  <div class="exterAbility">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">外部能力调用<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <el-date-picker v-model="time" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date" type="daterange"
          start-placeholder="起始时间" end-placeholder="结束时间" align="right">
        </el-date-picker>
      </div>

      <!-- <span @click="getList">按筛选搜索</span> -->
      <!-- <span @click="resetSelect" class="resetBtn">重置</span> -->
    </div>
    <div class="showNum">
      <div>
        <div>
          <span>OCR证件识别</span><span>{{ numData.FcheckOcrNum }} 次</span>
        </div>
        <div>
          <span>成功次数</span><span>{{ numData.FcheckOcrSucNum }}</span>
        </div>
        <div>
          <span>失败次数</span><span>{{ numData.FcheckOcrFailNum }}</span>
        </div>
      </div>
      <div>
        <div>
          <span>证件验真</span><span>{{ numData.FcheckCardNum }} 次</span>
        </div>
        <div>
          <span>成功次数</span><span>{{ numData.FcheckCardSucNum }}</span>
        </div>
        <div>
          <span>失败次数</span><span>{{ numData.FcheckCardFailNum }}</span>
        </div>
      </div>
      <div>
        <div>
          <span>活体验证</span><span>{{ numData.FcheckVideoNum }} 次</span>
        </div>
        <div>
          <span>成功次数</span><span>{{ numData.FcheckVideoSucNum }}</span>
        </div>
        <div>
          <span>失败次数</span><span>{{ numData.FcheckVideoFailNum }}</span>
        </div>
      </div>
      <div>
        <div>
          <span>人证比对</span><span>{{ numData.FcheckHandleNum }} 次</span>
        </div>
        <div>
          <span>成功次数</span><span>{{ numData.FcheckHandleSucNum }}</span>
        </div>
        <div>
          <span>失败次数</span><span>{{ numData.FcheckHandleFailNum }}</span>
        </div>
      </div>
    </div>
    <div class="collapseList">
      <div class="listItem">
        <span>接口名称</span>
        <span>调用时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.applyDesc == 0 }"
            @click="changeOrder(0)" /><i class="el-icon-caret-bottom"
            v-bind:class="{ blueBtn: queryParams.applyDesc == 1 }" @click="changeOrder(1)" /></span>
        <span>调用结果</span>
      </div>
      <div v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <div class="listItem">
          <span>{{ node.serviceName }}</span>
          <span>{{ node.requestTime }}</span>
          <span>{{ node.msg }}</span>
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
      <el-pagination @size-change="sizeChange" @current-change="currentPageChange"
        :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
        layout=" prev, pager, next,sizes,jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "exterAbility",
  components: {},
  data() {
    return {
      isCuC: false,
      today: null,
      total: null,
      time: [],
      queryParams: {
        deptId: this.deptId,
        applyDesc: 1,
        pageSize: 10,
        pageNum: 1,
        startTime: null,
        endTime: null,
      },
      infoList: [],
      numData: {},
    };
  },
  watch: {
    time() {
      this.getList();
      this.getNum();
    }
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
    changeOrder(num) {
      this.queryParams.applyDesc = num;
      this.getList();
    },
    resetSelect() {
      this.time = [];
      this.queryParams.startTime = null;
      this.queryParams.endTime = null;
      this.$nextTick(() => {
        this.getList();
      })
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
      this.queryParams.pageNum = 1;
      this.getList();
    },
    async getNum() {
      let params = {
        startTime: null,
        endTime: null
      }
      if (this.time) {
        params.startTime = this.time[0];
        params.endTime = this.time[1];
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameExter",
        serviceName: "stat",
        serviceParameter: params,
        method: "get",
      });
      if (res) {
        res.data.FcheckCardFailNum = this.todivi(res.data.checkCardFailNum);
        res.data.FcheckCardNum = this.todivi(res.data.checkCardNum);
        res.data.FcheckCardSucNum = this.todivi(res.data.checkCardSucNum);
        res.data.FcheckHandleFailNum = this.todivi(res.data.checkHandleFailNum);
        res.data.FcheckHandleNum = this.todivi(res.data.checkHandleNum);
        res.data.FcheckHandleSucNum = this.todivi(res.data.checkHandleSucNum);
        res.data.FcheckOcrFailNum = this.todivi(res.data.checkOcrFailNum);
        res.data.FcheckOcrNum = this.todivi(res.data.checkOcrNum);
        res.data.FcheckOcrSucNum = this.todivi(res.data.checkOcrSucNum);
        res.data.FcheckVideoFailNum = this.todivi(res.data.checkVideoFailNum);
        res.data.FcheckVideoNum = this.todivi(res.data.checkVideoNum);
        res.data.FcheckVideoSucNum = this.todivi(res.data.checkVideoSucNum);
        this.numData = res.data;
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
      if (this.time) {
        this.queryParams.startTime = this.time[0];
        this.queryParams.endTime = this.time[1];
      } else {
        this.queryParams.startTime = null;
        this.queryParams.endTime = null;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameExter",
        serviceName: "detailList",
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
  },
  created() { },
  mounted() {
    this.today = Cookies.get("today");
    this.getNum();
    this.getList();
  },
  beforeDestroy() { },
};
</script>

<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.exterAbility {
  padding: toRem(15) toRem(40);

  span {
    font-size: toRem(14);
  }

  .selectArea {
    >div>div {
      width: toRem(387);
    }
  }

  .showNum {
    margin: toRem(10) 0;
    display: flex;
    height: toRem(86);
    justify-content: space-between;
    width: toRem(1360);

    span {
      font-size: toRem(12);
      line-height: toRem(18);
      color: #000000;

    }

    >div {
      width: toRem(330);
      height: toRem(86);
      background: #f8fafb;
      box-shadow: 0px toRem(2) toRem(4) 0px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      padding: toRem(15) toRem(20) toRem(10) toRem(20);

      >div {
        height: toRem(20);
        display: flex;
        align-items: center;

        >span:first-child {
          font-weight: 600;
          margin-right: toRem(20);
        }
      }

      >div:first-child {
        span {
          font-size: toRem(14);
        }

        margin-bottom: toRem(4);
        justify-content: space-between;

        >span:last-child {
          color: #1e6fff;
        }
      }
    }
  }

  .collapseList {
    width: toRem(1360);

    >div,
    >div>div {
      >span {
        position: relative;
        width: toRem(351);

        >i {
          position: absolute;
          font-size: toRem(16);
          right: toRem(10);
          top: toRem(8);
          cursor: pointer;
        }

        >i:last-child {
          top: toRem(16)
        }
      }

      >span:last-child {
        width: toRem(651);
      }
    }
  }

  .collapseListTotal {
    width: toRem(1360);
  }
}
</style>