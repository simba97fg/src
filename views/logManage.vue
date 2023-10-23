<template>
  <div class="logManage">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">日志管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="tabsHead">
      <el-radio-group v-model="tabPosition" @change="tabChange">
        <el-radio-button label="1">查验日志</el-radio-button>
        <el-radio-button label="2">登录日志</el-radio-button>
        <el-radio-button label="3">T1上报日志</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent" v-if="tabPosition != '3'">
      <div>
        <div class="selectArea">
          <div>
            <el-input v-if="tabPosition == '2'" v-model="queryParams.userName" placeholder="请输入账号ID"></el-input>
            <el-input v-if="tabPosition == '1'" v-model="queryParams.operName" placeholder="请输入账号ID"></el-input>

            <el-input v-model="queryParams.ipaddr" placeholder="IP地址" v-if="tabPosition == '2'"></el-input>
            <el-select v-show="tabPosition == '2'" v-model="queryParams.status" filterable placeholder="操作状态" clearable>
              <el-option v-for="item in logStatus" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>

            <el-select v-if="tabPosition == '1'" v-model="queryParams.businessType" filterable placeholder="业务类型"
              clearable>
              <el-option v-for="dict in dict.type.sys_oper_type" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
            <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date" v-model="dateRange"
              type="datetimerange" :picker-options="pickerOptions" start-placeholder="生成起始时间" end-placeholder="结束时间"
              align="right">
            </el-date-picker>
            <span v-if="tabPosition == '1'" @click="getOperList" class="operBtn">按筛选搜索</span>
            <span v-if="tabPosition == '2'" @click="getList" class="operBtn">按筛选搜索</span>
            <span @click="resetqueryParams" class="operBtn resetBtn">重置</span>
          </div>

        </div>
        <div class="collapseList">
          <div class="listItem">
            <span>用户名称</span>
            <span>账号ID</span>
            <span class="iPosition">部门名称</span>
            <span>模块标题</span>
            <span class="iPosition">IP地址</span>
            <span v-if="tabPosition == '1'">业务类型</span>
            <span v-if="tabPosition == '2'">操作状态</span>
            <span>操作时间</span>
          </div>
          <div v-for="(node, index) in logList" :key="index" @click="node.isopen = !node.isopen" v-show="total > 0">
            <div class="listItem">
              <span class="iPosition" v-if="tabPosition == '1'"><i class="el-icon-arrow-right namePosition"
                  v-if="!node.isopen"></i>
                <i class="el-icon-arrow-down namePosition" v-if="node.isopen">
                </i>{{ node.nickName }}</span>
              <span v-if="tabPosition == '2'">{{ node.nickName }}</span>
              <span v-if="tabPosition == '1'">{{ node.operName }}</span>
              <span v-if="tabPosition == '2'">{{ node.userName }}</span>
              <span>{{ node.deptName }}</span>
              <span v-if="tabPosition == '2'">实名认证管理平台</span>
              <span v-if="tabPosition == '1'">{{ node.title }}</span><span v-if="tabPosition == '1'">{{ node.operIp
              }}</span>
              <span v-if="tabPosition == '2'">{{ node.ipaddr }}</span><span v-if="tabPosition == '1'">
                <dict-tag :options="dict.type.sys_oper_type" :value="node.businessType" />
              </span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  具体如下：<br />{{ node.msg }}
                </div>
                <span v-if="tabPosition == '2' && node.status == '0'"> 成功</span>
                <span v-if="tabPosition == '2' && node.status == '1'"> 失败</span>
              </el-tooltip>
              <span v-if="tabPosition == '1'">{{ node.operTime }}</span>
              <span v-if="tabPosition == '2'">{{ node.accessTime }}</span>
            </div>
            <div v-show="node.isopen && tabPosition == '1'">
              <div>
                <div v-if="node.nickName">
                  <span>用户名称</span>
                  <span>{{ node.nickName }}</span>
                </div>
                <div>
                  <span>账号ID</span>
                  <span>{{ node.operName }}</span>
                </div>
                <div>
                  <span>部门名称</span>
                  <span>{{ node.deptName }}</span>
                </div>

                <div>
                  <span>操作状态</span>
                  <span>
                    <dict-tag :options="dict.type.sys_common_status" :value="node.status" />
                  </span>
                </div>
                <div>
                  <span>操作时间</span>
                  <span>{{ node.operTime }}</span>
                </div>
                <div>
                  <span>模块标题</span>
                  <span>{{ node.title }}</span>
                </div>
                <div>
                  <span>业务类型</span>
                  <span>
                    <dict-tag :options="dict.type.sys_oper_type" :value="node.businessType" />
                  </span>
                </div>
                <div>
                  <span>请求方式</span>
                  <span>{{ node.requestMethod }}</span>
                </div>
                <div>
                  <span>请求URL</span>
                  <span>{{ node.operUrl }}</span>
                </div>
                <div>
                  <span>主机地址</span>
                  <span>{{ node.operIp }}</span>
                </div>
              </div>
              <div>
                <div>
                  <span>操作方法</span>
                  <span>{{ node.method }}</span>
                </div>
                <div v-show="node.operParam">
                  <span>请求参数</span>
                  <span>{{ node.operParam }}</span>
                </div>
                <div v-show="node.jsonResult">
                  <span>返回参数</span>
                  <span>{{ node.jsonResult }}</span>
                </div>
              </div>
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
          <el-pagination v-if="tabPosition == '2'" @current-change="currentPageChange" :current-page.sync="currentPage"
            :page-size.sync="queryParams.pageSize" layout=" prev, pager, next,jumper" :total="total">
          </el-pagination>
          <el-pagination v-if="tabPosition == '1'" @current-change="getOperList()" :current-page.sync="currentPage"
            :page-size.sync="queryParams.pageSize" layout=" prev, pager, next,jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <div class="tabContent2" v-if="tabPosition == '3'">
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane label="车辆信息上报日志" name="first"></el-tab-pane>
        <el-tab-pane label="开户信息上报日志" name="second"></el-tab-pane>
      </el-tabs>
      <div class="infoArea">
        <div class="selectArea">
          <div>
            <div>
              <el-select v-model="type" v-show="activeName == 'second'">
                <el-option v-for="item in typeoptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
              <el-input v-model="inputSelect" :placeholder="inputSelectP"></el-input>
            </div>
            <el-select v-model="queryParams2.method" v-show="activeName == 'first'" placeholder="操作人" clearable>
              <el-option v-for="item in userList" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <el-select v-model="queryParams2.pushStatus" v-show="activeName == 'second'" placeholder="T1上报结果" clearable>
              <el-option v-for="item in pushStatusOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="queryParams2.userType" v-show="activeName == 'second'" placeholder="用户类型" clearable>
              <el-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date" v-model="time"
              type="datetimerange" :picker-options="pickerOptions" start-placeholder="起始时间" end-placeholder="结束时间"
              align="right">
            </el-date-picker>
            <span @click="getT1List" class="operBtn">按筛选搜索</span>
            <span @click="resetSelect" class="operBtn resetBtn">重置</span>
          </div>
        </div>
        <div class="collapseList" v-if="activeName == 'first'">
          <div class="listItem">
            <span>VIN</span>
            <span>车辆品牌</span>
            <span>车辆型号</span>
            <span>车型通用名称</span>
            <span>操作人</span>
            <span>上报时间</span>
            <span>上报结果</span>
          </div>
          <div v-for="(node, index) in logList" :key="index" v-show="total > 0">
            <div class="listItem">
              <span class="iPosition" @click="clickOpen(node)"><i class="el-icon-arrow-right namePosition"
                  v-if="!node.isopen"></i>
                <i class="el-icon-arrow-down namePosition" v-if="node.isopen">
                </i>{{ node.vin }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleBrand }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleNum }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleMode }}</span>
              <span style="color: #1e6fff; text-decoration: underline" @click="clickOpen(node)">{{ node.method }}</span>
              <span @click="clickOpen(node)">{{ node.operTime }}</span>
              <span @click="clickOpen(node)">{{ node.status }}</span>
            </div>
            <div v-show="node.isopen">
              <div>
                <div>
                  <span>MSISDN</span>
                  <span>{{ node.msisdn }}</span>
                </div>
                <div>
                  <span>ICCID</span>
                  <span>{{ node.iccid }}</span>
                </div>
                <div>
                  <span>道路机动车辆生产企业名称</span>
                  <span>{{ node.vehicleOrgName }}</span>
                </div>
                <div v-if="node.vehicleOrgCode">
                  <span>车企代码</span>
                  <span>{{ node.vehicleOrgCode }}</span>
                </div>
                <div v-if="!node.vehicleOrgCode">
                  <span>车企代码</span>
                  <span>-</span>
                </div>
                <div>
                  <span>车辆识别代号或车架号（VIN）</span>
                  <span>{{ node.vin }}</span>
                </div>
                <div>
                  <span>车辆类型</span>
                  <span>{{ node.vehicleType }}</span>
                </div>
                <div>
                  <span>车辆产地</span>
                  <span>{{ node.vehicleOriginTypeName }}</span>
                </div>
                <div>
                  <span>车辆品牌</span>
                  <span>{{ node.vehicleBrand }}</span>
                </div>
                <div>
                  <span>车辆名称</span>
                  <span>{{ node.vehicleName }}</span>
                </div>
                <div>
                  <span>车辆型号</span>
                  <span>{{ node.vehicleNum }}</span>
                </div>
                <div>
                  <span>车辆通用名称</span>
                  <span>{{ node.vehicleMode }}</span>
                </div>
                <div>
                  <span>车身颜色</span>
                  <span>{{ node.vehicleColour }}</span>
                </div>
                <div>
                  <span>车辆状态名称</span>
                  <span>{{ node.vehicleStatusName }}</span>
                </div>
              </div>
              <div>

                <div>
                  <span>新车标识名称</span>
                  <span>{{ node.newVehicleFlagName }}</span>
                </div>
                <div>
                  <span>燃料种类</span>
                  <span>{{ node.vehicleFuelType }}</span>
                </div>
                <div>
                  <span>发动机号码</span>
                  <span>{{ node.engineNum }}</span>
                </div>
                <div>
                  <span>电动机序列号</span>
                  <span>{{ node.motorNum }}</span>
                </div>
                <div>
                  <span>车辆出厂时间</span>
                  <span>{{ node.vehicleDepartureTime }}</span>
                </div>
                <div>
                  <span>车辆销售时间</span>
                  <span>{{ node.vehicleSalesTime }}</span>
                </div>
                <div>
                  <span>车辆销售信息变更时间</span>
                  <span>{{ node.vehicleSalesChangeTime }}</span>
                </div>
                <div>
                  <span>车牌号码</span>
                  <span>{{ node.licensePlateNumber }}</span>
                </div>
                <div>
                  <span>车辆销售渠道名称</span>
                  <span>{{ node.vehicleChannelName }}</span>
                </div>
                <div v-if="node.vehicleChannelType">
                  <span>车辆销售渠道类型</span>
                  <span>{{ node.vehicleChannelType }}</span>
                </div>
                <div v-if="!node.vehicleChannelType">
                  <span>车辆销售渠道类型</span>
                  <span>-</span>
                </div>
                <div>
                  <span>车辆销售渠道员工姓名</span>
                  <span>{{ node.vehicleStaffName }}</span>
                </div>
                <div>
                  <span>车辆销售渠道地址</span>
                  <span>{{ node.vehicleLogginAddress }}</span>
                </div>
                <div v-if="node.ispName">
                  <span>运营商</span>
                  <span>{{ node.ispName }}</span>
                </div>
                <div v-if="!node.ispName">
                  <span>运营商</span>
                  <span>-</span>
                </div>
                <div v-if="node.ispTypeName">
                  <span>车联网卡类型</span>
                  <span>{{ node.ispTypeName }}</span>
                </div>
                <div v-if="!node.ispTypeName">
                  <span>车联网卡类型</span>
                  <span>-</span>
                </div>
              </div>
            </div>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable" v-if="activeName == 'second'">
          <div class="tableHead">
            <span>VIN</span>
            <span>ICCID</span>
            <span>MSISDN</span>
            <span>用户类型</span>
            <span>用户名称<img src="../assets/images/openEyes.png" v-show="false" v-if="nameStatus"
                @click="changeHeadEyes('N')" />
              <img src="../assets/images/closeEyes.png" v-show="false" v-if="!nameStatus"
                @click="changeHeadEyes('N')" /></span>
            <span>证件号码<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
                @click="changeHeadEyes('C')" />
              <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus"
                @click="changeHeadEyes('C')" /></span>
            <span>T1上报时间</span>
            <span>T1上报结果</span>
            <span>T1报竣结果</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span>{{ node.msisdn }}</span>
            <span>{{ node.customerTypeName }}</span>
            <span>{{ node.customerName }}</span>
            <span>{{ node.certNumber }}</span>
            <span>{{ node.operTimeStr }}</span>
            <el-tooltip class="item" effect="dark" placement="top-start" v-if="node.errorMsg != ''">
              <div slot="content">
                上报失败原因如下：<br />{{ node.errorMsg }}
              </div>
              <span>{{ node.statusName }}</span>
            </el-tooltip>
            <span v-if="node.errorMsg == ''">{{ node.statusName }}</span>
            <el-tooltip class="item" effect="dark" placement="top-start" v-if="
              node.reportCompletionErrorMsg &&
              node.reportCompletionErrorMsg != ''
            ">
              <div slot="content">
                报竣失败原因如下：<br />{{ node.reportCompletionErrorMsg }}
              </div>
              <span>{{ node.reportCompletion }}</span>
            </el-tooltip>
            <span v-if="node.reportCompletion == '-'">{{ node.reportCompletion }}</span>
            <el-tooltip class="item" effect="dark" placement="top-start" v-if="(
              node.reportCompletionErrorMsg == '' ||
              !node.reportCompletionErrorMsg) && node.reportCompletion != '-'
            ">
              <div slot="content">
                结果如下：<br />{{ node.reportCompletion }}
              </div>
              <span>{{ node.reportCompletion }}</span>
            </el-tooltip>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="collapseListTotal" v-if="tabPosition == '3'">
          <span>共 {{ total }} 项数据</span>
          <el-pagination @size-change="sizeChange2" @current-change="getT1List()"
            :current-page.sync="queryParams2.pageNum" :page-sizes="[10, 50, 100, 500]"
            :page-size.sync="queryParams2.pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
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
import { list } from "@/api/system/logininfor";
import { listUser } from "@/api/system/user";
import { list as operList } from "@/api/system/operlog";
import Vue from "vue";
export default {
  name: "App",
  dicts: ["sys_oper_type", "sys_common_status"],
  components: {},
  data() {
    return {
      isCuC: false,
      queryParams2: {
        pageNum: 1,
        pageSize: 10,
        pushStatus: null,
        operName: null,
        userType: null,
        method: null,
        cardNumbStatus: 0,
        nameStatus: 0,
      },
      userList: [],
      infoList: [],
      cardNumbStatus: false,
      nameStatus: false,
      checked: false,
      isIndeterminate: false,
      changeRole: true,
      selectNum: 0,
      currentPage: 1,
      total: 100,
      logStatus: [
        { value: 0, label: "成功" },
        {
          value: 1,
          label: "失败",
        },
      ],
      pushStatusOptions: [
        { label: "成功", value: 0 },
        { label: "失败", value: 1 },
      ],
      userTypeOptions: [
        { label: "个人", value: 1 },
        { label: "单位", value: 2 },
      ],
      time: [],
      userNameIndex: [],
      userNameList: [],
      dateRange: [],
      activeName: "first",
      type: "VIN",
      inputSelectP: "请输入车辆识别码（VIN）",
      typeoptions: ["VIN", "ICCID", "MSISDN"],
      dialogVisiable: false,
      dialogVisible: false,
      checkedList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        operName: undefined,
        ipaddr: undefined,
        userName: undefined,
        businessType: undefined,
        status: undefined,
      },
      logList: [],
      currentPage: 1,

      tabPosition: "1",
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
  computed: {},
  watch: {},
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    changeHeadEyes(type) {
      if (type == "C") {
        this.cardNumbStatus = !this.cardNumbStatus;
      } else {
        this.nameStatus = !this.nameStatus;
      }
      this.getT1List();
    },
    clickOpen(node) {
      node.isopen = !node.isopen;
    },
    sizeChange2() {
      this.queryParams2.pageNum = 1;
      this.getT1List();
    },
    async getT1List() {
      if (this.activeName == "second") {
        this.queryParams2.cardNumbStatus = 0;
        this.queryParams2.nameStatus = 0;
        if (this.cardNumbStatus) {
          this.queryParams2.cardNumbStatus = 1;
        }
        if (this.nameStatus) {
          this.queryParams2.nameStatus = 1;
        }
        if (this.time) {
          this.queryParams2.pushStartTime = this.time[0];
          this.queryParams2.pushEndTime = this.time[1];
        }
        this.queryParams2.vin = null;
        this.queryParams2.iccid = null;
        this.queryParams2.msisdn = null;
        if (this.type == "VIN") {
          this.queryParams2.vin = this.inputSelect;
        } else if (this.type == "ICCID") {
          this.queryParams2.iccid = this.inputSelect;
        } else {
          this.queryParams2.msisdn = this.inputSelect;
        }
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNamePushRecord",
          serviceName: "query-push-list",
          serviceParameter: this.queryParams2,
          method: "get",
        });
        if (res) {
          this.infoList = res.data.list;
          this.total = res.data.total;
        }
      } else {
        this.queryParams2.vin = this.inputSelect;
        if (this.time) {
          this.queryParams2.operTimeStart = this.time[0];
          this.queryParams2.operTimeEnd = this.time[1];
        }
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNamePushRecordLog",
          serviceName: "vehicle-info-log",
          serviceParameter: this.queryParams2,
          method: "post",
        });
        if (res) {
          res.data.data.list.forEach((el) => {
            el.isopen = false;
            el.infoDetail = null;
          });
          this.logList = res.data.data.list;
          this.total = res.data.data.total;
        }
      }
    },
    tabClick() {
      this.resetSelect();
      this.getT1List();
    },
    resetSelect() {
      this.type = "VIN";
      this.inputSelect = null;
      this.queryParams2.pushStatus = null;
      this.queryParams2.userType = null;
      this.queryParams2.operName = null;
      this.queryParams2.method = null;
      this.time = [];
      this.$nextTick(() => {
        this.getT1List();
      })
    },
    getOperList() {
      this.queryParams.pageNum = this.currentPage;
      operList(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          response.rows.forEach((el) => {
            el.isopen = false;
            if (!el.nickName) {
              el.nickName = "手机端未登录用户";
              el.operName = "手机端用户";
              el.deptName = "天翼物联";
            }
          });
          this.logList = response.rows;
          this.total = response.total;
        }
      );
    },
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(
        this.dict.type.sys_oper_type,
        row.businessType
      );
    },
    tabChange() {
      this.resetqueryParams();
      if (this.tabPosition == "2") {
        this.getList();
      } else if (this.tabPosition == "1") {
        this.getOperList();
      } else {
        this.getT1List();
      }
    },
    resetqueryParams() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        operName: undefined,
        ipaddr: undefined,
        userName: undefined,
        businessType: undefined,
        status: undefined,
      };
      this.dateRange = [];
      this.$nextTick(() => {
        if (this.tabPosition == "2") {
          this.getList();
        } else if (this.tabPosition == "1") {
          this.getOperList();
        }
      })
    },
    getList() {
      if (!this.isCuC) {
        this.queryParams.pageNum = 1;
      };
      this.isCuC = false;
      this.userNameIndex = [];
      this.logList = [];
      this.queryParams.pageNum = this.currentPage;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          response.rows.forEach((el) => {
            el.operationPlace = "后台";
            el.isopen = false;
          });
          this.logList = response.rows;
          this.total = response.total;

        }
      );
    },
    setInfo() { },
    async getBox() {
      this.userList = [];
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getUploadOperatorNameComboBox",
        method: "get",
      });
      if (res) {
        this.userList = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
  },
  created() { },
  mounted() {
    this.getOperList();
    this.getBox();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.logManage {
  .el-breadcrumb {
    margin-top: toRem(17);
    margin-bottom: toRem(32);
    margin-left: toRem(40);
  }

  .tabsHead {
    margin-bottom: 0;
  }

  .tabContent {
    background: #f3f4f7;
    height: fit-content;

    span {
      display: inline-block;
      font-size: toRem(14);
    }

    >div {
      background-color: white;
      margin: 0 toRem(40);
      min-height: toRem(785);
      height: fit-content;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
      padding: toRem(20) toRem(29);

      .selectArea {

        >div {
          justify-content: flex-start;
          align-items: flex-start;

          >div:first-child {
            margin-right: toRem(12);
            width: toRem(200);

          }

          >div:nth-child(2),
          div:nth-child(3) {
            margin-right: toRem(12);
            width: toRem(160);
          }

          >div:nth-child(4) {
            width: toRem(260);
          }

          >span:nth-last-child(2) {
            margin-left: toRem(12);
          }

          >span:last-child {
            color: rgba(158, 158, 158, 1);
            border: 1px solid #9e9e9e;
            background: white;
          }
        }
      }

      .collapseList {
        margin-top: toRem(30);

        .listItem {
          cursor: pointer;

          >span:first-child {
            width: toRem(188);
            color: #1e6fff;
            text-decoration: underline;
          }

          >span:nth-child(2),
          span:nth-child(3),
          span:nth-child(5),
          span:nth-child(6) {
            width: toRem(160);
          }

          >span:nth-child(4) {
            width: toRem(260);
          }

          >span:nth-child(7) {
            width: toRem(200);
          }

          .iPosition {
            position: relative;

            >i {
              position: absolute;
              top: toRem(13);
              right: toRem(32);
              font-size: toRem(14);
              cursor: pointer;
            }

            .namePosition {
              left: toRem(-110);
              color: black;
            }
          }
        }
      }
    }
  }

  .tabContent2 {
    padding: 0 toRem(40);
    margin-top: toRem(17);

    .el-divider {
      margin: toRem(15) 0 toRem(14);
    }

    ::v-deep .el-tabs--card {
      position: relative;

      .el-tabs__header .el-tabs__nav {
        border-radius: 10px 10px 0 0;
      }

      .el-tabs__header {
        margin: 0;
      }

      .el-tabs__nav-wrap {
        height: toRem(40);

        .is-active {
          font-weight: 600;
          border-bottom: 4px solid white;
        }

        .el-tabs__item {
          top: toRem(-68);
          height: toRem(40);
          line-height: toRem(40);
          width: toRem(155);
          font-size: toRem(14);
        }
      }

      .el-tabs__content {
        position: absolute;
        top: 0;
        height: toRem(40);
        right: toRem(0);
        width: toRem(120);
      }
    }

    .infoArea {
      min-height: toRem(628);
      padding: toRem(20);
      border: 1px solid #e5e7ed;
      border-top: none;
      padding-right: toRem(15);

      .collapseListTotal {
        font-size: toRem(14);
      }

      .selectArea {
        >div {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;

          >div {
            margin-right: toRem(12);
          }

          >div:first-child {
            height: toRem(40);
            line-height: toRem(40);
            width: fit-content;
            display: flex;

            >div:nth-last-child(2) {
              width: toRem(100);
            }

            >div:last-child {
              width: toRem(200);
            }
          }

          >div:nth-child(2) {
            width: toRem(140);
          }

          >div:nth-child(3),
          div:nth-child(4) {
            width: toRem(140);
          }

          >div:nth-child(5) {
            width: toRem(260);
            margin-right: toRem(0);
          }

          >span:nth-last-child(2) {
            margin-left: toRem(12);
          }

          .resetBtn {
            color: rgba(158, 158, 158, 1) !important;
            border: 1px solid #9e9e9e;
            background: white !important;
            font-size: toRem(14);
          }
        }
      }

      .collapseList {
        margin-top: toRem(20);
        font-size: toRem(14);

        >div>div:nth-child(2) {
          justify-content: unset;

          >div {
            >div {
              >span:first-child {
                width: toRem(230);
              }
            }
          }

          >div:first-child>div {
            margin-right: toRem(180);
          }
        }

        .listItem {
          cursor: pointer;

          >span:first-child {
            width: toRem(200);
          }

          >span:nth-child(2),
          span:nth-child(7),
          span:nth-child(8) {
            width: toRem(174);
          }

          >span:nth-child(3),
          span:nth-child(4),
          span:nth-child(5),
          span:nth-child(6) {
            width: toRem(202);
          }

          >span:last-child {
            margin-right: 0;
            width: toRem(100);
          }

          .iPosition {
            position: relative;

            >i {
              position: absolute;
              top: toRem(13);
              right: toRem(32);
              font-size: toRem(14);
              cursor: pointer;
            }

            .namePosition {
              left: toRem(-140);
              color: black;
            }
          }
        }
      }

      .infoTable {
        height: fit-content;
        margin-top: toRem(20);
        border: 1px solid #e0e0e0;

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

          >span:first-child,
          span:nth-child(2),
          span:nth-child(6),
          span:nth-child(7) {
            width: toRem(185);
          }

          >span:nth-child(5),
          span:nth-child(3) {
            width: toRem(150);
          }

          >span:nth-child(8),
          span:nth-child(4),
          span:nth-child(9),
          span:nth-child(10) {
            width: toRem(90);
          }

          >span:last-child {
            width: toRem(90);
            color: #2c3e50;
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>