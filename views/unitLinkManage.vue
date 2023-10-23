<template>
  <div class="unitLinkManage">
    <el-image-viewer v-if="openImg" :on-close="
      () => {
        openImg = false;
      }
    " :url-list="imgList" />
    <el-drawer :visible.sync="linkDrawer" direction="rtl" size="60.06%" class="linkDrawer" v-if="node.institutionData">
      <div slot="title">
        <span>单位实名链接详情</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <div class="info">
            <span>单位名称</span>
            <span>{{ node.institutionData.orgName }}</span>
          </div>
          <div class="info">
            <span>统一社会信用代码</span>
            <span>{{ node.institutionData.orgCode }}</span>
          </div>
          <div class="info">
            <span>操作人</span>
            <span style="color: #1e6fff; text-decoration: underline">{{
              node.institutionData.operatorName
            }}</span>
          </div>
          <div class="info">
            <span>生成时间</span>
            <span>{{ node.institutionData.creatTime }}</span>
          </div>
          <div>
            <i class="el-icon-warning" />
            共 {{ node.institutionData.importNum }} 辆
          </div>
          <div>
            <div v-for="(vinnode, index) in node.vinListData" :key="index">
              <div>
                <span>{{ index + 1 }}</span><span>{{ vinnode }}</span>
              </div>
              <el-divider></el-divider>
            </div>
          </div>
        </div>

        <div>
          <div>
            <span>单位实名二维码【移动端】</span>
            <span v-show="false">请责任人扫码</span>
            <img :src="node.institutionData.qrCode" />
            <span @click="downloadImg(node.institutionData.qrCode)">保存</span>
          </div>
          <div>
            <span>单位实名链接【移动端】</span>
            <span class="addline">{{ node.institutionData.linkAddress }}</span>
            <span @click="copy(node.institutionData.linkAddress)">复制</span>
          </div>
          <div v-show="false">
            <span>单位在线实名【后台端】</span>
            <span class="addline">{{ node.institutionData.linkAddress }}</span>
            <span @click="copy(node.institutionData.linkAddress)">复制</span>
          </div>
          <div v-show="false">
            <span>短信通知</span>
            <span>该单位实名二维码及链接将通过短信发送至单位责任人手机号码，请责任人点击该链接或扫码完成单位实名</span>
            <span>发送</span>
          </div>
        </div>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="addLinkDrawer" direction="rtl" :before-close="handleClose" size="43.05%"
      class="addLinkDrawer">
      <div slot="title">
        <span>新建单位实名链接</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span></span>
          <span>选择组织</span>
        </div>
        <el-cascader :show-all-levels="true" v-model="deptId" :options="deptOptions" :props="memberDrawerDefaultProps">
        </el-cascader>
        <div>
          <span></span>
          <span>上传车辆信息文件</span>
          <span @click="downloadtemplate">下载模板</span>
        </div>
        <span v-if="updateStatus == '0'" @click="upload" class="margin65">
          <input type="file" name="file" multiple="multiple" style="display: none" id="file"
            @change="uploadfile($event)" />
          上传文件</span>
        <div v-if="updateStatus != '0'" v-bind:class="{ margin65: updateStatus == 1 }">
          <i class="el-icon-error" v-show="updateStatus == '2'" @click="cleardocument" />
          <div>
            <span>{{ fileName }}</span>
            <span @click.stop="clearuploadstatus" v-show="updateStatus == '1'">取消上传</span>
          </div>
          <el-progress :percentage="percentage" :format="format" status="success"></el-progress>
          <div>
            <span>{{ fileSize }}</span>
            <span v-if="updateStatus == '1'">{{ percentage }}%</span>
            <span v-if="updateStatus == '2'">已上传</span>
          </div>
        </div>
        <el-tooltip placement="bottom-start" effect="light" popper-class="popperclass">
          <div slot="content" class="tooltipContent">
            <div v-if="node.institutionData">
              <i class="el-icon-warning" />
              共 {{ node.institutionData.importNum }} 辆
            </div>
            <div>
              <div v-for="(vinnode, index) in node.vinListData" :key="index">
                <div>
                  <span>{{ index + 1 }}</span><span>{{ vinnode }}</span>
                </div>
                <el-divider></el-divider>
              </div>
            </div>
          </div>
          <span v-show="updateStatus == '2' && errorList.length <= 0" class="greenBtn">查看已上传车辆信息</span>
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
        <div>
          <span></span>
          <span>填写单位信息</span>
        </div>
        <div>
          <span>单位名称<label class="addRedStar"></label></span>
          <el-input placeholder="请输入" v-model="orgName" @input="checkOrg"></el-input>
        </div>
        <div>
          <span>统一社会信用代码<label class="addRedStar"></label></span>
          <el-input placeholder="请输入" v-model="addorgCode" @input="checkOrg"></el-input>
        </div>
      </div>
      <div>
        <el-divider></el-divider>
        <span class="clickAbleBtn" v-if="orgName && addorgCode && updateStatus == '2' && checkOrgOk"
          @click="createlinkAndCode">生成链接及二维码</span>
        <span v-if="!(orgName && addorgCode && updateStatus == '2' && checkOrgOk)">生成链接及二维码</span>
      </div>
    </el-drawer>

    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>其他业务管理</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">单位实名链接管理<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>

      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <el-input v-model="inputSelect" placeholder="单位名称" v-bind:disabled="!listRole" @change="getLinkList"
          suffix-icon="el-icon-search"></el-input>
        <el-input v-model="orgCode" placeholder="统一社会信用代码" v-bind:disabled="!listRole" @change="getLinkList"
          suffix-icon="el-icon-search"></el-input>
        <el-input v-model="batchNo1" placeholder="批次号" v-bind:disabled="!listRole" @change="getLinkList"
          suffix-icon="el-icon-search"></el-input>
        <el-select v-bind:disabled="!listRole" filterable placeholder="操作人" clearable v-model="operatorName"
          @change="getLinkList">
          <el-option v-for="item in operatoroptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-cascader :options="deptOptions" :props="deptprops" collapse-tags clearable :show-all-levels="false"
          placeholder="组织名称" v-model="orgIds" @change="getLinkList"></el-cascader>
        <el-date-picker v-bind:disabled="!listRole" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
          v-model="time" type="daterange" :picker-options="pickerOptions" start-placeholder="生成起始时间"
          end-placeholder="结束时间" align="right">
        </el-date-picker>
        <!-- <span @click="getLinkList" v-if="listRole">按筛选搜索</span>
      <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
      <span class="resetBtn" @click="resetSelect" v-bind:class="{ 'disabledBtn': !listRole }">重置</span>
       -->
        <span @click="OpenaddLinkDrawer" v-show="addlinkRole" class="operBtn">新建单位实名链接</span>
      </div>

    </div>
    <el-divider></el-divider>
    <div class="operationArea">
      <div>
        <i class="el-icon-warning"></i>
        <span>已选 {{ selectNum }}</span>
        <span>/{{ total }} 条</span>
      </div>
      <a :href="linkAdd" class="downForPaper" download="单位授权书.docx">下载单位授权书</a>
      <span @click="checkList" v-hasPermi="['home:unitLinkManage:export']">导出</span>
    </div>
    <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;" ref="multipleTable"
      @selection-change="handleSelectionChange" class="realNameTable" @select-all="selectAll">
      <el-table-column type="selection" width="76" align="center" fixed="left">
      </el-table-column>
      <el-table-column prop="creatTime" label="生成时间" width="240" align="center">
      </el-table-column>
      <el-table-column prop="operatorName" label="操作人" width="220" align="center">
      </el-table-column>
      <el-table-column prop="orgName" label="单位名称" width="240" align="center">
      </el-table-column>
      <el-table-column width="240" align="center">
        <template slot="header">
          统一社会信用代码<img src="../assets/images/openEyes.png" v-show="false" v-if="orgCodeStatus"
            @click="changeHeadEyes()" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!orgCodeStatus" @click="changeHeadEyes()" />
        </template>
        <template slot-scope="scope">
          {{ scope.row.orgCode }}
        </template>
      </el-table-column>
      <el-table-column prop="importNum" label="车辆数" width="115" align="center">
      </el-table-column>
      <el-table-column label="链接" width="350" align="center">
        <template slot-scope="scope">
          <span class="linkClass"><span>{{ scope.row.linkAddress }}</span>
            <img src="../assets/images/unit-link.png" @click="copy(scope.row.linkAddress)" v-if="linkdetailRole" />
            <img src="../assets/images/unit-link.png" class="disabledBtn" v-if="!linkdetailRole" />
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="batchNo" label="批次号" width="245" align="center">
      </el-table-column>
      <el-table-column prop="companyName" label="车企名称" width="210" align="center">
      </el-table-column>
      <el-table-column prop="deptName" label="组织名称" width="210" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="二维码" width="150" align="center">
        <template slot-scope="scope">
          <span style="display: flex; align-items: center;justify-content: space-around;"><span
              @click="openUrl(scope.row.qrCode)" v-if="linkdetailRole" class="btnBase blueBtn">查看</span><span
              class="blueBtn disableBtn" v-if="!linkdetailRole">查看</span>
            <el-divider direction="vertical" style="margin:0;height:10px"></el-divider><span
              @click="downloadImg(scope.row.qrCode)" class="btnBase blueBtn" v-if="linkdetailRole">下载</span><span
              class="blueBtn disableBtn" v-if="!linkdetailRole">下载</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="110" align="center">
        <template slot-scope="scope">
          <span @click="openLinkDialog(scope.row)" class="btnBase blueBtn" v-if="linkdetailRole">详情</span>
          <span class="blueBtn disableBtn" v-if="!linkdetailRole">详情</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="infoTable">
      <div class="tableHead">
        <span>
          <el-checkbox v-model="checked" @change="clickAll(pageSize)" :indeterminate="isIndeterminate"></el-checkbox>
        </span>
        <span>生成时间</span>
        <span>操作人</span>
        <span>单位名称</span>
        <span>统一社会信用代码<img src="../assets/images/openEyes.png" v-show="false" v-if="orgCodeStatus" @click="changeHeadEyes()" />
          <img src="../assets/images/closeEyes.png" v-show="false" v-if="!orgCodeStatus" @click="changeHeadEyes()" /></span>
        <span>车辆数</span>
        <span>链接</span>
        <span>二维码</span>
        <span>操作</span>
      </div>
      <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <span>
          <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
        </span>
        <span>{{ node.creatTime }}</span>
        <span style="color: #1e6fff; text-decoration: underline">{{
            node.operatorName
        }}</span>
        <span>{{ node.orgName }}</span>
        <span>{{ node.orgCode }}</span>
        <span>{{ node.importNum }}</span>
        <span><span>{{ node.linkAddress }}</span>
          <img src="../assets/images/unit-link.png" @click="copy(node.linkAddress)" />
          <img src="../assets/images/unit-link.png" class="disabledBtn" v-if="!linkdetailRole" />
        </span>
        <span><span @click="openUrl(node.qrCode)" v-if="linkdetailRole">查看</span><span class="disableBtn"
            v-if="!linkdetailRole">查看</span>
          <el-divider direction="vertical"></el-divider><span @click="downloadImg(node.qrCode)"
            v-if="linkdetailRole">下载</span><span class="disableBtn" v-if="!linkdetailRole">下载</span>
        </span>
        <span @click="openLinkDialog(node)" class="btnBase" v-if="linkdetailRole">详情</span>
        <span class="disableBtn" v-if="!linkdetailRole">详情</span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div> -->
    <el-pagination @size-change="sizeChange()" @current-change="getLinkList()" :current-page.sync="currentPage"
      :page-sizes="[10, 50, 100, 500]" :page-size.sync="pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
// @ is an alias to /src
import Cookies from "js-cookie";
import Vue from "vue";
import { treeselect } from "@/api/system/dept";
import auth from "../plugins/auth";
export default {
  name: "unitLinkManage",
  components: {
    "el-image-viewer": () =>
      import("element-ui/packages/image/src/image-viewer"),
  },
  data() {
    return {
      deptprops: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      batchNo: null,
      batchNo1: null,
      deptOptions: [],
      orgIds: [],
      errorList: [],
      today: null,
      openImg: false,
      imgList: [],
      listRole: false,
      linkdetailRole: false,
      unitdetailRole: false,
      addlinkRole: false,
      infoDetail: {},
      selectId: null,
      selectVin: null,
      checked: false,
      isIndeterminate: false,
      addorgCode: null,
      linkList: [],
      fileName: null,
      fileSize: null,
      percentage: 0,
      orgName: null,
      phone: null,
      operatorName: null,
      linkAdd: './authPaper.docx',
      inputSelect: null,
      orgCode: null,
      checkedList: [],
      selectNum: 0,
      currentPage: 1,
      total: 100,
      pageSize: 10,
      updateStatus: "0",
      deptId: null,
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      addLinkDrawer: false,
      linkDrawer: false,
      dialogVisible: false,
      node: {
        vin: "LFA2A1BS363553763",
        code: "92749TYE987495U49R",
        name: "大陆菲菲科技有限公司",
        status: "已实名",
      },
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
      time: null,
      drawer: false,
      tabPosition: "1",
      type: "VIN",
      infoList: [],
      typeoptions: [
        {
          value: "VIN",
          label: "VIN",
        },
        {
          value: "batchNo",
          label: "订单号",
        },
        {
          value: "归属单位",
          label: "归属单位",
        },
      ],
      checkOrgOk: false,
      realoptions: [],
      operatoroptions: [],
      realStatus: null,
      handlerInfoStatus: false,
      orgInfoStatus: false,
      orgCodeStatus: false,
      multipleSelection: []
    };
  },
  computed: {
    deptOptions1() {
      return this.$store.getters.deptOptions;
    },
  },
  watch: {
    time() {
      this.getLinkList();
    }
  },
  methods: {
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
          this.checkedList.push(el.id);
        })
      })
    },
    checkOrg() {
      this.checkOrgOk = false;
      if (this.orgName.replace(/\s+/g, "").length > 0) {
        if (this.addorgCode.replace(/\s+/g, "").length > 0) {
          this.checkOrgOk = true;
        }
      }
    },
    resetSelect() {
      this.inputSelect = null;
      this.orgCode = null;
      this.operatorName = null;
      this.batchNo1 = null;
      this.orgIds = [],
        this.time = [];
      this.$nextTick(() => {
        this.getLinkList();
      })
    },
    sizeChange() {
      this.currentPage = 1;
      this.getLinkList();
    },
    downloadImg(src) {
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      a.download = "二维码图片";
      a.href = src;
      a.dispatchEvent(event);
    },
    copy(adress) {
      var oinput = document.createElement("input");
      oinput.value = adress;
      document.body.appendChild(oinput);
      oinput.select();
      document.execCommand("Copy");
      oinput.className = "oinput";
      oinput.style.display = "none";
      this.$message({
        message: "复制成功！",
        type: "success",
        showClose: true,
      });
    },
    changeHeadEyes() {
      this.orgCodeStatus = !this.orgCodeStatus;
      this.getLinkList();
    },
    resetAll() {
      this.infoDetail = {};
      this.drawer = false;
      this.handlerInfoStatus = false;
      this.orgInfoStatus = false;
    },
    changeEyes(which) {
      if (which == "O") {
        this.orgInfoStatus = !this.orgInfoStatus;
      } else {
        this.handlerInfoStatus = !this.handlerInfoStatus;
      }
      this.getInfo(this.selectId, "realNameAuthRecord", "query-detail");
    },
    async createlinkAndCode() {
      this.linkDrawer = false;
      let params = {
        batchNo: this.batchNo,
        orgName: this.orgName.replace(/\s+/g, ""),
        orgCode: this.addorgCode.replace(/\s+/g, ""),
        orgId: this.deptId
      };
      this.loading = this.$loading({
        lock: true,
        text: "生成中，请稍候片刻",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthApi",
        serviceName: "create-linkAndCode",
        serviceParameter: params,
        method: "post",
      });
      if (err) {
        console.log("err", err);
      }
      if (res) {
        this.addLinkDrawer = false;
        this.loading.close();
        this.batchNo = null;
        this.getLinkList();
      }
    },
    handleClose() {
      this.addLinkDrawer = false;
      this.cleardocument();
    },
    openLinkDialog(node) {
      this.linkDrawer = true;
      this.getInfo(node.batchNo, "realNameAuth", "query-detail");
    },
    async getLinkList() {
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let time = null,
        time1 = null;
      if (this.time) {
        time = this.time[0];
        time1 = this.time[1];
      }
      var orgCodeStatus = 0;
      if (this.orgCodeStatus) {
        orgCodeStatus = 1;
      }
      let params = {
        orgName: this.inputSelect,
        orgCode: this.orgCode,
        operatorName: this.operatorName,
        pageSize: this.pageSize || 10,
        pageNum: this.currentPage,
        batchNo: this.batchNo1,
        orgIds: this.orgIds.toString(),
        startTime: time,
        endTime: time1,
        orgCodeStatus: orgCodeStatus,
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuth",
        serviceName: "query-list",
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
          element.qrCode = "data:image/png;base64," + element.qrCode;
        });
        this.checked = false;
        this.isIndeterminate = false;
        this.checkedList = [];
        this.selectNum = 0;
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.loadingList.close();
      }
    },

    async OpenaddLinkDrawer() {
      this.errorList = [];
      this.addLinkDrawer = true;
      this.orgName = null;
      this.addorgCode = null;
      this.deptId = null;
      this.updateStatus = "0";
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuth",
        serviceName: "create-batchNo",
        method: "get",
      });
      if (res) {
        this.batchNo = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    async downloadtemplate() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuth",
        serviceName: "download-template",
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "单位用户批量实名模板" + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "单位用户批量实名模板" + ".xls";
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
        console.log(err);
      }
    },
    upload() {
      if (this.deptId) {
        document.querySelector("#file").click();
      } else {
        this.$message({
          message: "请先选择归属组织！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async uploadfile(e) {
      let files = e.target.files || e.dataTransfer.files;
      this.fileName = files[0].name;
      this.fileSize = files[0].size / 1024 + "KB";
      this.updateStatus = "1";
      const api = this.$$api.doFormDataReq({
        url_key: "realNameAuth",
        loading: !1,
        serviceParameter: {
          batchNo: this.batchNo.toString(),
          orgId: this.deptId.toString(),
          userName: "admin",
        },
        data: {
          service_name: "upload-file",
          service_parameter: {
            batchNo: this.batchNo.toString(),
            orgId: this.deptId.toString(),
            userName: "admin",
          },
        },
        files: {
          file: files[0],
        },
      });
      let { res, err } = await api.promise;
      if (res) {
        if (!res.success) {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
          this.clearuploadstatus();
          this.cleardocument();
        } else {
          this.getLoadingRate();
        }

      }
      if (err) {
        console.log(err);
      }
    },
    async getLoadingRate() {
      this.node = {};
      this.errorList = [];
      let businessCode = '2';
      while (businessCode != "1") {
        if (this.percentage < 99) {
          this.percentage++;
        }
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameAuth",
          serviceName: "query-upload-status",
          method: "post",
          serviceParameter: {
            batchNo: this.batchNo,
          },
        });
        if (res) {
          businessCode = res.businessCode;
          if (res.businessCode == '1') {
            this.updateStatus = "2";
            this.percentage = 100;
            if (res.data.errorList.length > 0) {
              this.$message({
                message: "成功" + res.data.success + '条，失败' + res.data.error + '条',
                type: "info",
                showClose: true,
                duration: 0
              });
              res.data.errorList.forEach((el) => {
                this.errorList.push({
                  serialNumberName: el.serialNumberName,
                  errorMsg: el.errorMsg,
                });
              });
            }
            else {
              this.$message({
                message: "全部上传成功！",
                type: "success",
                showClose: true,
              });
              this.getInfo(this.batchNo, "realNameAuth", "query-detail");
            }
          } else if (res.businessCode == '0') {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            }); this.clearuploadstatus();
            this.cleardocument();
            break;
          }

        }
        if (err) {
          this.clearuploadstatus();
          this.cleardocument();
          this.$message({
            message: err,
            type: "warning",
            showClose: true,
          });
        }
      }
    },
    clearuploadstatus() {
      this.updateStatus = "0";
      this.percentage = 0;
      this.errorList = [];
      this.nextclearuploadstatus();
    },
    async nextclearuploadstatus() {
      let msg = null;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuth",
        serviceName: "clear-upload-status",
        method: "post",
        serviceParameter: {
          batchNo: this.batchNo,
        },
      });
      if (res) {
        msg = res.msg;
        this.cleardocument();
        console.log(
          "----------clearuploadstatus------------------" + msg + "-----------"
        );
      }
      if (err) {
        console.log(err);
      }
    },
    async cleardocument() {
      this.errorList = [];
      let msg = null;
      this.updateStatus = "0";
      this.percentage = 0;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuth",
        serviceName: "clear-document",
        method: "post",
        serviceParameter: {
          batchNo: this.batchNo,
        },
      });
      if (res) {
        msg = res.msg;
        console.log(
          "----------cleardocument------------------" + msg + "-----------"
        );
      }
      if (err) {
        console.log(err);
      }
    },
    checkList() {
      if (this.selectNum > 0) {
        this.getExportList(this.checkedList, "realNameAuth", "export-base-sum");
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async getExportList(ids, key, name) {
      let params = {
        ids: ids.toString(),
      };
      var fileType = "单位实名链接记录";
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: key,
        serviceName: name,
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      if (res) {
        console.log("getExport", res);
        this.$message({
          message: fileType + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = fileType + this.today + ".xlsx";
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
        console.log(err);
      }
    },
    async getInfo(vin, key, name) {
      this.node = {};
      var handlerInfoStatus = 0;
      var orgInfoStatus = 0;
      if (this.handlerInfoStatus) {
        handlerInfoStatus = 1;
      }
      if (this.orgInfoStatus) {
        orgInfoStatus = 1;
      }
      let params = {
        id: vin.toString(),
        batchNo: vin.toString(),
        handlerInfoStatus: handlerInfoStatus,
        orgInfoStatus: orgInfoStatus,
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: key,
        serviceName: name,
        serviceParameter: params,
        method: "get",
      });
      if (res) {
        if (res.data.institutionData) {
          res.data.institutionData.qrCode =
            "data:image/png;base64," + res.data.institutionData.qrCode;
        }
        this.node = res.data;
        this.infoDetail = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    async getBox1() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getOperatorNameComboBox",
        method: "get",
      });
      if (res) {
        this.operatoroptions = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    format(percentage) {
      return percentage === 100 ? "满" : `${percentage}%`;
    },
    openUrl(src) {
      this.imgList = [];
      this.imgList.push(src);
      this.openImg = true;
      console.log(this.imgList);
    },
    openwindows(link) {
      window.open(link);
    },
  },
  created() { },
  mounted() {
    this.deptOptions = this.deptOptions1;
    this.getBox1();
    this.getLinkList();
    this.listRole = auth.hasPermi("home:unitLinkManage:list");
    this.linkdetailRole = auth.hasPermi("home:unitLinkManage:detail");
    this.addlinkRole = auth.hasPermi("home:unitLinkManage:change");
    this.today = Cookies.get("today");
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.blue {
  color: rgb(87, 145, 245);
}

.unitLinkManage {
  padding: toRem(17) toRem(40) toRem(39) toRem(40);

  .operationArea {
    >div {
      width: 83.5%;
    }

    .downForPaper {
      background: #FFFFFF;
      border: 1px solid #1E6FFF;
      font-size: toRem(14);
      width: fit-content;
      padding: 0 toRem(5);
      height: toRem(20);
      line-height: toRem(18);
      display: inline-block;
      cursor: pointer;
      color: #1E6FFF;
      opacity: 0.8;
    }
  }


  .downForPaper:hover {
    opacity: 1;
  }

  .linkDrawer {
    .el-drawer__body {
      >div:nth-child(2) {
        display: flex;
        position: relative;
        height: fit-content;
        width: 99%;
        padding: 0;
        padding-bottom: 0.35rem;
        overflow: hidden;

        >div {
          background: #f8fafb;
          margin-top: toRem(3);
          height: toRem(745);
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          >div>span {
            display: inline-block;
            color: rgba(0, 0, 0, 0.65);
          }
        }

        >div:first-child {
          width: toRem(470);
          margin: 0 toRem(25) 0 toRem(43);
          font-size: toRem(16);
          padding: toRem(20) toRem(20) 0 toRem(24);

          >div {
            margin-bottom: toRem(14);

            >span:first-child {
              width: toRem(140);
              text-align: left;
              font-weight: 600;
              color: #343434;
            }

            >span:nth-child(2) {
              text-align: left;
            }
          }

          >div:nth-last-child(2) {
            margin-top: toRem(17);
            margin-left: toRem(15);
            color: $RBlueColor;
          }

          >div:last-child {
            height: toRem(450);
            background: white;
            width: 90%;
            overflow: auto;
            padding: toRem(10);
            color: #8c969e;

            >div>div:first-child {
              display: flex;
              justify-content: space-evenly;
              margin-bottom: toRem(3);
            }
          }
        }

        >div:last-child {
          width: toRem(270);
          font-size: toRem(14);
          height: toRem(745);
          align-items: center;
          background-color: white;

          span {
            display: inline-block;
            margin-bottom: toRem(5);
            text-align: left;
          }

          >div {
            margin-bottom: toRem(10);
            width: 100%;
            height: fit-content;
            background: #f8fafb;
            padding: toRem(10) toRem(20);
            padding-top: toRem(18);
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            >img {
              width: toRem(160);
              height: toRem(160);
            }

            .addline {
              text-decoration: underline;
            }

            >span:first-child {
              font-size: toRem(18);
              font-weight: 600;
              color: #131415;
              margin-bottom: 0.05rem;
            }

            >span:nth-child(2) {
              color: #a1a1a9;
              width: 100%;
              word-wrap: break-word;
              overflow: hidden;
            }

            >span:last-child {
              width: toRem(56);
              height: toRem(22);
              line-height: toRem(22);
              cursor: pointer;
              background: #1e6fff;
              color: white;
              border-radius: 2px;
              text-align: center;
              margin-top: 0.09rem;
            }
          }

          >div:last-child {
            >span:last-child {
              border: 1px solid #1e6fff;
              background-color: white;
              color: #1e6fff;
            }
          }
        }
      }
    }
  }

  .addLinkDrawer {
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

          >span:first-child {
            width: toRem(140);
            text-align: left;
            font-weight: 600;
          }

          ::v-deep .el-input {
            width: toRem(330);

            .el-input__inner {
              width: toRem(330);
              height: toRem(40);
            }
          }
        }

        >div:nth-child(2) {
          ::v-deep .el-input {
            margin: toRem(19);
            margin-left: toRem(10);
            width: toRem(400);

            .el-input__inner {
              width: toRem(410);
              height: toRem(40);
            }
          }
        }

        >div:nth-child(7),
        div:nth-child(8),
        div:nth-child(9) {
          margin-bottom: toRem(15);
        }

        >div:nth-child(7) {
          margin-top: toRem(30);
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
              opacity: 0.85;
            }

            >span:last-child {
              cursor: pointer;
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
              color: #67c23a;
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

        >div:first-child,
        div:nth-child(3),
        div:nth-child(7) {
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

  .selectArea {
    >div {
      align-items: flex-start;

      >div {
        margin-right: toRem(5);
      }

      >div:nth-child(3) {
        width: toRem(210);
      }

      >div:nth-child(6) {
        width: toRem(275);
      }
    }
  }

  .el-divider {
    margin: toRem(15) 0 toRem(13);
  }

  .linkClass {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    >span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      display: inline-block;
    }

    >img {
      height: toRem(15);
    }
  }

  .infoTable {
    height: fit-content;

    >div {
      >span:first-child {
        width: toRem(45);
      }

      >span:nth-child(2) {
        width: toRem(180);
      }

      >span:nth-child(3) {
        width: toRem(120);
      }

      >span:nth-child(4) {
        width: toRem(230);
      }

      >span:nth-child(5) {
        width: toRem(200);
        position: relative;

        >img {
          position: absolute;
          height: 0.16rem;
          top: 0.11rem;
          margin-left: toRem(10);
          cursor: pointer;
        }
      }

      >span:nth-child(6) {
        width: toRem(120);
      }

      >span:nth-child(7) {
        width: toRem(180);
        position: relative;

        >span {
          padding-right: 10px;
          width: toRem(130);
          height: toRem(40);
          overflow: hidden;
          word-break: normal;
          text-overflow: ellipsis;
          display: inline-block;
        }

        >img {
          cursor: pointer;
          height: toRem(14);
          position: absolute;
          top: toRem(13);
          right: toRem(11);
        }
      }

      >span:nth-child(8) {
        width: toRem(160);

        .el-divider--vertical {
          margin: 0 toRem(20);
        }

        >span {
          color: $RBlueColor;
          cursor: pointer;
        }
      }

      >span:nth-child(9) {
        width: toRem(120);
        margin-right: 0;
      }
    }
  }
}

.clickAbleBtn {
  opacity: 1 !important;
  cursor: pointer !important;
}
</style>
