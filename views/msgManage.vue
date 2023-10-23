<template>
  <div class="msgManage">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>其他业务管理</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">短信中心<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="tabsHead">
      <el-radio-group v-model="tabPosition" @change="tabChange">
        <el-radio-button label="1">补登记通知</el-radio-button>
        <el-radio-button label="2">系统短信记录</el-radio-button>
        <el-radio-button label="3">人工发送短信</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent">
      <div class="selectArea">
        <div>
          <el-input @change="getList" v-model="inputSelect" :placeholder="inputSelectP" v-bind:disabled="!listRole"
            suffix-icon="el-icon-search"></el-input>
          <el-select @change="getList" v-bind:disabled="!listRole" v-model="messageType" v-show="tabPosition == '2'"
            clearable placeholder="系统短信类型">
            <el-option v-for="item in messageTypeOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-select @change="getList" v-bind:disabled="!listRole" v-model="returnContent" v-show="tabPosition != '1'"
            clearable placeholder="发送结果">
            <el-option v-for="item in returnContentOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-date-picker v-bind:disabled="!listRole" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
            v-model="time" type="daterange" :picker-options="pickerOptions" start-placeholder="起始时间"
            end-placeholder="结束时间" align="right">
          </el-date-picker>
          <span class="operBtn" @click="openUpdateDrawer" v-show="changeRole" v-if="tabPosition == '1'">上传补登记车辆</span>
          <span class="operBtn" v-show="changeRole" v-if="tabPosition == '2'"
            style="opacity: 0;pointer-events:none">无</span>
          <span class="operBtn" @click="msgDrawer = true" v-show="changeRole" v-if="tabPosition == '3'">发短信</span>
        </div>

        <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
        <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
        <span @click="resetSelect" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span>
        -->
      </div>
      <el-divider></el-divider>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick" v-if="tabPosition == '1'">
        <el-tab-pane label="已上传" name="first"></el-tab-pane>
        <el-tab-pane label="待发送" name="second"></el-tab-pane>
        <el-tab-pane label="客户接收成功" name="third"></el-tab-pane>
        <el-tab-pane label="客户接收失败" name="fourth"></el-tab-pane>
        <el-tab-pane label="发送异常" name="five"></el-tab-pane>
        <el-dropdown v-show="changeRole">
          <el-button size="mini">
            更多操作<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="activeName != 'second' && changeRole" @click.native="sendList()">批量发送
            </el-dropdown-item>
            <el-dropdown-item v-if="activeName == 'first' && changeRole" @click.native="beforeDeleteList(true)">批量删除
            </el-dropdown-item>
            <el-dropdown-item @click.native="beforeDeleteList(false)" v-if="activeName == 'second' && changeRole">批量取消
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-tabs>
      <div class="infoArea" v-if="tabPosition == '1'">
        <div class="operationArea">
          <div>
            <i class="el-icon-warning"></i>
            <span>已选 {{ selectNum }}</span>
            <span>/{{ total }} 条</span>
          </div>
          <span v-show="false"></span>
        </div>
        <div class="infoTable">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>
            <span>VIN</span>
            <span>手机号</span>
            <span v-if="activeName == 'first'">上传时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: short == 0 }"
                @click="changeOrder(0)" /><i class="el-icon-caret-bottom" v-bind:class="{ blueBtn: short == 1 }"
                @click="changeOrder(1)" /></span>
            <span v-if="activeName == 'third'">发送成功时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: short == 0 }"
                @click="changeOrder(0)" /><i class="el-icon-caret-bottom" v-bind:class="{ blueBtn: short == 1 }"
                @click="changeOrder(1)" /></span>
            <span v-if="activeName == 'fourth'">发送失败时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: short == 0 }" @click="changeOrder(0)" /><i class="el-icon-caret-bottom"
                v-bind:class="{ blueBtn: short == 1 }" @click="changeOrder(1)" /></span>
            <!-- <span v-if="activeName == 'five'">发送时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: short == 0 }"
                @click="changeOrder(0)" /><i class="el-icon-caret-bottom" v-bind:class="{ blueBtn: short == 1 }"
                @click="changeOrder(1)" /></span> -->
            <span>操作人</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>
            <span>{{ node.vin }}</span>
            <span>{{ node.phone }}</span>
            <span v-if="activeName == 'first'">{{ node.uploadTime }}</span>
            <span v-if="activeName == 'third'">{{ node.uploadTime }}</span>
            <span v-if="activeName == 'fourth'">{{ node.uploadTime }}</span>
            <!-- <span v-if="activeName == 'five'">{{ node.uploadTime }}</span> -->
            <span style="color: #1e6fff; text-decoration: underline">{{
            node.operator
            }}</span>
            <span v-if="changeRole"><span @click="copyLink(node.shortConnection)">复制链接</span>
              <el-divider direction="vertical"></el-divider><span @click="updateState(node.id)"
                v-if="activeName == 'first'">发送短信</span>
              <span @click="updateState(node.id)" v-if="!(activeName == 'first' || activeName == 'second')">再次发送</span>
              <span v-if="activeName == 'second'" class="disableBtn">等待发送</span>
              <el-divider direction="vertical" v-if="activeName == 'first' || activeName == 'second'"></el-divider><span
                @click="beforedeleteNode(node, true)" v-if="activeName == 'first'">删除</span>
              <span @click="beforedeleteNode(node, false)" v-if="activeName == 'second'">取消</span>
            </span>
            <span v-if="!changeRole"><span @click="copyLink(node.shortConnection)">复制链接</span>
              <el-divider direction="vertical"></el-divider><span class="disableBtn"
                v-if="activeName == 'first'">发送短信</span>
              <span class="disableBtn" v-if="!(activeName == 'first' || activeName == 'second')">再次发送</span>
              <span v-if="activeName == 'second'" class="disableBtn">等待发送</span>
              <el-divider direction="vertical" v-if="activeName == 'first' || activeName == 'second'"></el-divider><span
                class="disableBtn" v-if="activeName == 'first'">删除</span>
              <span class="disableBtn" v-if="activeName == 'second'">取消</span>
            </span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
      </div>
      <div class="operationArea" v-if="tabPosition == '2'">
        <div>
          <i class="el-icon-warning"></i>
          <span>已选 {{ selectNum }}</span>
          <span>/{{ total }} 条</span>
        </div>
        <span @click="checkList" v-hasPermi="['home:msgManage:export']">导出</span>
      </div>
      <div class="infoTable noOne" v-if="tabPosition != '1'">
        <div class="tableHead">
          <span v-show="tabPosition == '2'">
            <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
            </el-checkbox>
          </span>
          <span v-if="tabPosition == '2'">接收方-VIN</span>
          <span>接收方-手机号</span>
          <span>发送时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: short == 0 }" @click="changeOrder(0)" /><i
              class="el-icon-caret-bottom" v-bind:class="{ blueBtn: short == 1 }" @click="changeOrder(1)" /></span>
          <span v-if="tabPosition == '2'">系统短信类型</span>
          <span>发送结果</span>
          <span>操作</span>
        </div>
        <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
          <span v-show="tabPosition == '2'">
            <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
          </span>
          <span v-if="tabPosition == '2'">{{ node.vin }}</span>
          <span>{{ node.phone }}</span>
          <span>{{ node.sendTime }}</span>
          <span v-if="tabPosition == '2'">{{ node.messageType }}</span>
          <span>{{ node.returnContent }}</span>
          <span v-if="tabPosition == '2' && changeRole"><span @click="getContent(node.id)">查看内容</span>
            <el-divider direction="vertical"></el-divider><span @click="getExport(node.id, node.phone)"
              v-if="exportRole">导出</span>
            <span v-if="!exportRole" class="disableBtn">导出</span>
          </span>
          <span v-if="tabPosition == '3' && changeRole"><span @click="sendSMessage(node)">再次发送</span>
            <el-divider direction="vertical"></el-divider><span @click="getArtificial(node)">查看内容</span>
          </span>
          <span v-if="tabPosition == '2' && !changeRole"><span @click="getContent(node.id)">查看内容</span>
            <el-divider direction="vertical"></el-divider><span @click="getExport(node.id, node.phone)"
              v-if="exportRole">导出</span>
            <span v-if="!exportRole" class="disableBtn">导出</span>
          </span>
          <span v-if="tabPosition == '3' && !changeRole"><span class="disableBtn">再次发送</span>
            <el-divider direction="vertical"></el-divider><span @click="getArtificial(node)">查看内容</span>
          </span>
        </div>
        <div class="nodataLine" v-if="total <= 0">
          <div></div>
          <span>暂无数据</span>
          <div></div>
        </div>
      </div>
      <el-pagination @size-change="sizeChange()" @current-change="currentPageChange" :current-page.sync="currentPage"
        :page-sizes="[10, 50, 100, 500]" :page-size.sync="pageSize" layout=" prev, pager, next,sizes,jumper"
        :total="total">
      </el-pagination>
    </div>
    <el-drawer :visible.sync="updateDrawer" direction="rtl" size="43.05%" class="updateDrawer"
      :before-close="handleClose">
      <div slot="title">
        <span>上传待补登记车辆</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span></span>
          <span>选择组织</span>
        </div>
        <el-cascader class="margin65" :show-all-levels="true" v-model="deptId" :options="deptOptions"
          :props="memberDrawerDefaultProps"></el-cascader>
        <div>
          <span></span>
          <span>车辆及车主手机号信息</span>
          <span @click="downloadtemplate">下载模板</span>
        </div>
        <span v-if="updateStatus == '0'" @click="upload" class="margin65">
          <input type="file" name="file" multiple="multiple" style="display: none" id="file"
            @change="getFile($event)" />
          选择文件</span>
        <div v-if="updateStatus != '0'">
          <i class="el-icon-error" v-show="updateStatus == '5'" @click="updateStatus = '0'" />
          <div>
            <span>{{ fileName }}</span>
            <span v-if="updateStatus == '1'">{{ percentage }}%</span>
            <span v-if="updateStatus == '2' && !needSendMsg" class="successP">上传成功</span>
            <span v-if="updateStatus == '2' && needSendMsg" class="successP">生成成功</span>
            <span v-if="updateStatus == '3'" class="errorP">上传失败，请重试</span>
            <span v-if="updateStatus == '4'" class="warningP">已中断，请重试</span>
          </div>
          <el-progress v-bind:class="{ displayNode: updateStatus == '5' }" :percentage="percentage" :format="format"
            :status="progressStatus"></el-progress>
          <div>
            <span v-if="updateStatus != '2'">{{ fileSize }}</span>
            <span v-if="updateStatus == '2'">{{ returnMsg }}</span>
            <span v-show="updateStatus == '1' && false" @click="cancleUpload">取消上传</span>
            <span v-if="updateStatus == '3'">原因：上传数据格式错误</span>
            <span v-if="updateStatus == '4'">原因：被取消</span>
          </div>
        </div>
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
        <span v-if="updateStatus == '0'">上传文件</span>
        <span v-if="updateStatus == '1'">上传中</span>
        <span class="clickAbleBtn" @click="reStart" v-if="updateStatus == '3' || updateStatus == '4'">重新上传</span>
        <span class="clickAbleBtn" @click="reStart" v-if="updateStatus == '2'">继续上传</span>
        <span class="clickAbleBtn" v-if="updateStatus == '5'" @click="updatedialogVisible = true">上传文件</span>
      </div>
    </el-drawer>
    <el-dialog :visible.sync="updatedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确定上传该车辆及车主手机号信息</p>
      <p></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadfile">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="sendMsgdialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认立即发送短信</p>
      <p>已上传的待补登记车辆信息将进入【待发送】队列</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sendMsgdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendNow">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="delListDialog" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p v-if="clickedNode.isDel">确认删除该批次的选中数据</p>
      <p v-if="clickedNode.isDel">选中的数据将被永久删除，此操作不可撤销</p>
      <p v-if="!clickedNode.isDel">确认取消该批次的选中数据的发送</p>
      <p v-if="!clickedNode.isDel">选中的数据发送请求将被取消，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delListDialog = false">取 消</el-button>
        <el-button type="primary" @click="deleteList(clickedNode.isDel)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="delDialog" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p v-if="clickedNode.isDel">确认删除选中数据</p>
      <p v-if="clickedNode.isDel">选中的数据将被永久删除，此操作不可撤销</p>
      <p v-if="!clickedNode.isDel">确认取消选中数据的发送</p>
      <p v-if="!clickedNode.isDel">选中的数据发送请求将被取消，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialog = false">取 消</el-button>
        <el-button type="primary" @click="deleteNode(clickedNode, clickedNode.isDel)">确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="msgDrawer" direction="rtl" size="43.05%" class="msgDrawer"
      :before-close="handleMsgDrawerClose">
      <div slot="title">
        <span>发送短信</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span>接收方手机号</span>
          <el-tooltip class="item" effect="dark" content="请输入11位联系方式" placement="top-end">
            <el-input maxlength="11" placeholder="请输入" v-model="msgToSend.phone" @input="checkMsgL"></el-input>
          </el-tooltip>
        </div>
        <div>
          <span>发送内容</span>
          <el-input placeholder="请输入" v-model="msgToSend.content" type="textarea" autosize @input="checkMsgL"
            maxlength="30" show-word-limit>
          </el-input>
        </div>
      </div>
      <div>
        <el-divider></el-divider>
        <span v-if="!checkMsgLOk">发送</span>
        <span class="clickAbleBtn" v-if="checkMsgLOk" @click="sendSMessage(msgToSend)">发送</span>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="DetailDrawer" direction="rtl" size="43.05%" class="DetailDrawer"
      :before-close="handleDetailClose">
      <div slot="title">
        <span>查看系统短信内容详情</span>
        <span v-if="tabPosition == '2'" @click="getExport(infoDetail.id, infoDetail.phone)">导出</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div v-if="infoDetail.vin">
          <span>接收方-VIN</span><span>{{ infoDetail.vin }}</span>
        </div>
        <div v-if="infoDetail.phone">
          <span>接收方-手机号</span><span>{{ infoDetail.phone }}</span>
        </div>
        <div v-if="infoDetail.messageType">
          <span>系统短信类型</span><span>{{ infoDetail.messageType }}</span>
        </div>
        <div v-if="infoDetail.sendTime">
          <span>发送时间</span><span>{{ infoDetail.sendTime }}</span>
        </div>
        <div v-if="infoDetail.content">
          <span>短信内容</span><span>{{ infoDetail.content }}</span>
        </div>
      </div>
      <div></div>
    </el-drawer>
  </div>
</template>
<script>
// @ is an alias to /src
import Cookies from "js-cookie";
import auth from "../plugins/auth";
import { treeselect } from "@/api/system/dept";
import Vue from "vue";
export default {
  name: "msgManage",
  components: {},
  data() {
    return {
      isCuC: false,
      errorList: [],
      delListDialog: false,
      delDialog: false,
      clickedNode: {},
      deptId: null,
      deptOptions: [],
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      returnMsg: "",
      percentage: 45,
      updatedialogVisible: false,
      DetailDrawer: false,
      infoDetail: {},
      msgToSend: {
        phone: "",
        content: "",
      },
      currentPage: 0,
      updateStatus: 0,
      pageSize: 10,
      listRole: false,
      changeRole: false,
      exportRole: false,
      msgDrawer: false,
      today: null,
      applyDesc: null,
      finishDesc: null,
      checked: false,
      isIndeterminate: false,
      time: null,
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
      checkedList: [],
      inputSelect: null,
      inputSelectP: "请输入VIN/手机号",
      messageType: null,
      returnContent: null,
      // messageTypeOptions: [
      //   { label: "审核结果通知", value: 0 },
      //   { label: "号卡开通报竣", value: 1 },
      // ],
      // returnContentOptions: [
      //   { label: "成功", value: 0 },
      //   { label: "失败", value: 1 },
      // ],
      messageTypeOptions: [],
      returnContentOptions: [],
      idTypeoptions: [],
      idType: null,
      operation: null,
      selectNum: 0,
      total: 100,
      dialogVisible: false,
      drawer: false,
      infoList: [],
      activeName: "first",
      tabPosition: "1",
      short: 1,
      updateDrawer: false,
      needSendMsg: false,
      sendMsgdialogVisible: false,
      checkMsgLOk: false,
    };
  },

  watch: {
    time() {
      this.getList();
    }
  },
  computed: {
    deptName() {
      return this.$store.getters.deptName;
    },
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    checkMsgL() {
      this.checkMsgLOk = false;
      if (this.msgToSend.phone.replace(/\s+/g, "").length == 11) {
        if (this.msgToSend.content.replace(/\s+/g, "").length > 0) {
          this.checkMsgLOk = true;
        }
      }
    },
    async sendList() {
      if (this.selectNum > 0) {
        this.updateState(this.checkedList);
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async sendNow() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "sendNow",
        method: "get",
      });
      if (res) {
        this.$message({
          message: "请求发送成功，短信发送中！",
          type: "success",
          showClose: true,
        });
        this.sendMsgdialogVisible = false;
        this.updateDrawer = false;
        this.getList();
        this.sendNowMessage();
      }
    },

    async sendNowMessage() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "sendNowMessage",
        method: "get",
        serviceParameter: {
          carEnterprises: this.deptName,
        },
      });
      if (res) {
        if (!res.success) {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        }
        this.needSendMsg = false;
      }
    },
    async generateLink() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "generateLink",
        method: "get",
      });
      if (res) {
        this.$message({
          message: "生成链接成功！",
          type: "success",
          showClose: true,
        });
        this.getList();
        this.needSendMsg = true;
        this.updateStatus = "2";
        this.percentage = 100;
        this.progressStatus = "success";
      }
    },
    async updateState(id) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "updateState",
        method: "get",
        serviceParameter: {
          id: id.toString(),
        },
      });
      if (res) {
        if (res.success) {
          this.$message({
            message: "请求发送成功，短信发送中！",
            type: "success",
            showClose: true,
          });
          this.getList();
          this.sendMsg(id);
        }
        else {
          this.$message({
            message: res.data,
            type: "error",
            showClose: true,
          });
        }
      }
    },
    async getBox1() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "returnResults ",
        method: "get",
      });
      if (res) {
        this.returnContentOptions = res.data;
      }
    },
    async getBox() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "messageTypeDownBox",
        method: "get",
      });
      if (res) {
        this.messageTypeOptions = res.data;
      }
    },
    changeOrder(num) {
      this.short = num;
      this.getList();
    },
    handleDetailClose() {
      this.DetailDrawer = false;
      this.infoDetail = {};
    },
    async sendSMessage(node) {
      this.loading = this.$loading({
        lock: true,
        text: "短信发送中，请稍候片刻",
        background: "rgba(0, 0, 0, 0.7)",
      });
      this.msgDrawer = false;

      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "insert_message",
        method: "get",
        serviceParameter: {
          phones: node.phone.replace(/\s+/g, ""),
          content: node.content,
        },
      });
      if (res) {
        if (!res.success) {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        } else {
          this.$message({
            message: "短信发送成功！",
            type: "success",
            showClose: true,
          });
        }
        this.getList();
        this.loading.close();
        this.msgToSend = {
          phone: "",
          content: "",
        };
      }
    },
    getArtificial(node) {
      this.DetailDrawer = true;
      this.infoDetail = {
        content: node.content,
        phone: node.phone,
        sendTime: node.sendTime,
        returnContent: node.returnContent,
        vin: node.vin,
        id: node.id,
      };
    },
    async getContent(id) {
      this.DetailDrawer = true;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "content",
        method: "get",
        serviceParameter: {
          id: id,
        },
      });
      if (res) {
        res.data.data.id = id;
        this.infoDetail = res.data.data;
      }
    },
    beforeDeleteList(isDel) {
      if (this.selectNum > 0) {
        this.delListDialog = true;
        this.clickedNode.isDel = isDel;
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async deleteList(isDel) {
      this.delListDialog = false;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "deleted",
        method: "get",
        serviceParameter: {
          ids: this.checkedList.toString(),
        },
      });
      if (res) {
        if (isDel) {
          this.$message({
            message: "删除成功！",
            type: "success",
            showClose: true,
          });
        } else {
          this.$message({
            message: "取消成功！",
            type: "success",
            showClose: true,
          });
        }
        this.getList();
      }
    },
    beforedeleteNode(node, isDel) {
      this.clickedNode = node;
      this.clickedNode.isDel = isDel;
      this.delDialog = true;
    },
    async deleteNode(node, isDel) {
      this.delDialog = false;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "deleted",
        method: "get",
        serviceParameter: {
          ids: node.id,
        },
      });
      if (res) {
        if (res.success) {
          if (isDel) {
            this.$message({
              message: "删除成功！",
              type: "success",
              showClose: true,
            });
          } else {
            this.$message({
              message: "取消成功！",
              type: "success",
              showClose: true,
            });
          }
        } else {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        }

        this.getList();
      }
    },
    copyLink(value) {
      var oinput = document.createElement("input");
      oinput.value = value;
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
    async sendMsg(id) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "sendMessage",
        method: "get",
        serviceParameter: {
          carEnterprises: this.deptName,
          id: id.toString(),
        },
      });
      if (res) {
        if (!res.success) {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        }
        this.getList();
      }
    },
    tabChange() {
      if (this.tabPosition == "2") {
        this.inputSelectP = "请输入接收方VIN/手机号";
        this.getBox();
      } else if (this.tabPosition == "3") {
        this.inputSelectP = "请输入接收方手机号";
      } else {
        this.inputSelectP = "请输入VIN/手机号";
      }
      this.inputSelect = null;
      this.messageType = null;
      this.currentPage = 1;
      this.pageSize = 10;
      this.returnContent = null;
      this.time = null;
      this.getList();
    },
    resetSelect() {
      console.log("resetSelect================");
      this.inputSelect = null;
      this.returnContent = null;
      this.time = null;
      this.messageType = null;
      this.$nextTick(() => {
        this.getList();
      })
    },
    async downloadtemplate() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "downloadTemplate",
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "补登记车辆短信通知模板获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "补登记车辆短信通知模板" + ".xls";
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
    getFile(e) {
      this.files = e.target.files || e.dataTransfer.files;
      this.fileName = this.files[0].name;
      this.fileSize = this.files[0].size / 1024 + "KB";
      this.updateStatus = "5";
    },
    async uploadfile() {
      this.updateStatus = "1";
      this.updatedialogVisible = false;
      const api = this.$$api.doFormDataReq({
        url_key: "realNameMsg",
        loading: !1,
        serviceParameter: {
          orgId: this.deptId.toString(),
        },
        data: {
          service_name: "batchUpload",
          service_parameter: {
            orgId: this.deptId.toString(),
          },
        },
        files: {
          file: this.files[0],
        },
      });
      let { res, err } = await api.promise;
      if (res) {
        if (res.success && res.data.errorSize == 0) {
          this.returnMsg = '成功上传' + res.data.success + '条数据';
          this.updateStatus = "2";
          this.percentage = 100;
          this.progressStatus = "success";
          this.$message({
            message: "上传成功！",
            type: "success",
            showClose: true,
          });
        } else if (res.success && res.data.errorSize > 0) {
          this.updateStatus = "3";
          this.progressStatus = "exception";
          this.errorList = [];
          res.data.errorList.forEach((el) => {
            this.errorList.push({
              serialNumberName: '第' + el.errorOrderNbr + '行',
              errorMsg: el.errorMsg,
            });
          });
        } else {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
            duration: 0,
          });
          this.updateStatus = "3";
          this.progressStatus = "exception";
        }
      }
      if (err) {
        console.log(err);
      }
    },
    cancleUpload() {
      this.reStart();
    },
    handleClose() {
      this.errorList = [];
      this.updateDrawer = false;
      this.needSendMsg = false;
      this.getList();
    },
    handleMsgDrawerClose() {
      this.msgDrawer = false;
      this.msgToSend = {
        phone: "",
        content: "",
      };
    },
    reStart() {
      this.errorList = [];
      this.updateDrawer = false;
      this.openUpdateDrawer();
    },
    format(percentage) {
      return percentage === 100 ? "满" : `${percentage}%`;
    },
    openUpdateDrawer() {
      this.progressStatus = undefined;
      this.updateStatus = "0";
      this.updateDrawer = true;
      this.deptId = null;
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
        if (this.checked) {
          this.selectNum++;
          this.checkedList.push(el.id);
          console.log("this.checkedList", this.checkedList);
        }
      });
      this.isIndeterminate = false;
      console.log("this.checkedList", this.checkedList);
    },
    async getList() {
      if (!this.isCuC) {
        this.currentPage = 1;
      };
      this.isCuC = false;
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let serviceName = "repair_notice";
      let params = {};
      if (this.activeName != "first") {
        serviceName = "waitFor";
      }
      if (this.tabPosition == "1") {
        params = {
          vinPhone: this.inputSelect,
          uploadTimeStart: undefined,
          uploadTimeEnd: undefined,
          state: 0,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          sort: this.short,
        };
        if (this.time) {
          params.uploadTimeStart = this.time[0];
          params.uploadTimeEnd = this.time[1];
        }
        if (this.activeName == "second") {
          params.state = 1;
        } else if (this.activeName == "third") {
          params.state = 2;
        } else if (this.activeName == "fourth") {
          params.state = 3;
        }
        else if (this.activeName == "five") {
          params.state = 5;
        } else {
          params.state = 0;
        }
      } else if (this.tabPosition == "2") {
        serviceName = "systemMessage";
        params = {
          vinPhone: this.inputSelect,
          messageType: undefined,
          returnContent: undefined,
          sendTimeStart: undefined,
          sendTimeEnd: undefined,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          sort: this.short,
        };
        if (this.time) {
          params.sendTimeStart = this.time[0];
          params.sendTimeEnd = this.time[1];
        }
        if (this.messageType != null) {
          params.messageType = this.messageType;
        }
        if (this.returnContent != null) {
          params.returnContent = this.returnContent;
        }
      } else if (this.tabPosition == "3") {
        serviceName = "artificial";
        params = {
          phone: this.inputSelect,
          returnContent: undefined,
          sendTimeStart: undefined,
          sendTimeEnd: undefined,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          sort: this.short,
        };
        if (this.time) {
          params.sendTimeStart = this.time[0];
          params.sendTimeEnd = this.time[1];
        }
        if (this.returnContent != null) {
          params.returnContent = this.returnContent;
        }
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: serviceName,
        serviceParameter: params,
        method: "get",
      });
      if (res) {
        res.data.data.list.forEach((el) => {
          el.checked = false;
        });
        this.checked = false;
        this.selectNum = 0;
        this.isIndeterminate = false;
        this.infoList = res.data.data.list;
        this.total = res.data.data.total;
        this.loadingList.close();
      }
      if (err) {
        this.loadingList.close();
      }
    },
    tabClick() {
      this.inputSelect = null;
      this.time = null;
      this.currentPage = 1;
      this.getList();
    },
    async getExport(id, phone) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameMsg",
        serviceName: "downloadExcel",
        method: "get",
        fileRead: true,
        serviceParameter: {
          ids: id,
        },
      });
      if (res) {
        this.$message({
          message: "该系统短信记录获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "手机号为" + phone + "的短信记录" + ".xlsx";
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
    async checkList() {
      if (this.selectNum > 0) {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameMsg",
          serviceName: "downloadExcel",
          method: "get",
          fileRead: true,
          serviceParameter: {
            ids: this.checkedList.toString(),
          },
        });
        if (res) {
          this.$message({
            message: "系统短信记录获取成功，正在下载！",
            type: "success",
            showClose: true,
          });
          const blob = new Blob([res], { type: "application/vnd.ms-excel" });
          // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
          const fileName = "系统短信记录" + ".xlsx";
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
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    sizeChange() {
      this.currentPage = 1;
      this.getList();
    },
  },
  created() { },
  mounted() {
    this.getList();
    this.getBox1();
    treeselect().then((response) => {
      this.deptOptions = response.data;
    });
    this.listRole = auth.hasPermi("home:msgManage:list");
    this.changeRole = auth.hasPermi("home:msgManage:change");
    this.exportRole = auth.hasPermi("home:msgManage:export");
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.msgManage {
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

          ::v-deep .el-input {
            margin-top: toRem(19);
            margin-left: toRem(10);
            width: toRem(400);

            .el-input__inner {
              width: toRem(410);
              height: toRem(40);
            }
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

  .msgDrawer {
    .el-drawer__body {
      position: relative;

      >div:nth-child(2) {
        >div {
          display: flex;
          align-items: center;
          margin-left: toRem(40);
          margin-bottom: toRem(15);

          >span:first-child {
            width: toRem(100) !important;
            text-align: left;
            font-size: 14px;
            font-weight: 600;
            color: #343434;
          }

          >div {
            width: toRem(340);
          }

          ::v-deep .el-textarea__inner {
            width: toRem(340);
            height: toRem(200) !important;
            resize: none;
            font-size: toRem(14) !important;
          }
        }

        >div:last-child {
          align-items: unset;

          >span {
            height: toRem(40);
            padding-top: toRem(10);
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

  .DetailDrawer {
    .el-drawer__body {
      display: flex;
      flex-direction: column;

      >div:nth-child(2) {
        display: flex;
        flex-direction: column;

        span {
          font-size: toRem(14);
          color: rgba(0, 0, 0, 0.8);
          display: inline-block;
          width: toRem(340);
          text-align: left;
        }

        >div {
          display: flex;
          align-items: flex-start;
          margin-left: toRem(40);
          margin-bottom: toRem(15);

          >span:first-child {
            width: toRem(105) !important;
            color: rgba(0, 0, 0, 0.65);
          }
        }
      }
    }
  }

  .el-breadcrumb {
    margin-top: toRem(17);
    margin-bottom: toRem(25);
    margin-left: toRem(40);
  }

  .tabContent {
    padding: 0 toRem(40);

    .selectArea {
      >div {
        >div {
          margin-right: toRem(10);
        }

        >div:nth-child(1) {
          width: toRem(275);
        }

        >div:nth-child(4) {
          width: toRem(275);
        }
      }
    }

    .el-divider {
      margin: toRem(1) 0 toRem(14);
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
          width: toRem(131);
          font-size: toRem(14);
        }
      }

      .el-tabs__content {
        position: absolute;
        top: 0;
        height: toRem(40);
        right: toRem(0);
        width: toRem(120);

        .el-dropdown {
          position: absolute;
          right: 0;

          >button {
            font-size: toRem(14);
          }
        }

        >span {
          position: absolute;
          width: 0.88rem;
          height: 0.21rem;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.15);
          display: inline-block;
          cursor: pointer;
          font-size: toRem(14);
          left: toRem(10);
        }

        >span:hover {
          color: #1e6fff;
          border: 1px solid #1e6fff;
        }
      }
    }

    .infoArea {
      min-height: toRem(628);
      padding: toRem(20);
      border: 1px solid #e5e7ed;
      border-top: none;
      padding-right: toRem(15);

      .operationArea {
        margin-bottom: toRem(13);
      }

      .infoTable {
        >div {
          >span {
            margin-right: toRem(2);
            position: relative;

            .el-divider {
              margin: auto 0;
            }

            >i {
              position: absolute;
              right: toRem(15);
              opacity: 0.65;
              cursor: pointer;
            }

            >i:hover {
              color: $RBlueColor;
            }

            >i:first-child {
              top: toRem(8);
            }

            >i:last-child {
              top: toRem(16);
            }

            >span {
              display: flex;
              justify-content: center;
              align-items: center;

              >img {
                height: 0.16rem;
                top: 0.11rem;
                cursor: pointer;
                margin-left: toRem(10);
              }
            }

            >img {
              position: absolute;
              height: 0.16rem;
              top: 0.11rem;
              cursor: pointer;
              margin-left: toRem(10);
            }
          }

          >span:first-child {
            flex: 1;
          }

          >span:nth-child(2),
          >span:nth-child(4) {
            flex: 6.52;
          }

          >span:nth-child(3),
          >span:nth-child(5) {
            flex: 4.35;
          }

          >span:last-child {
            flex: 5.74;
            margin-right: 0;
            display: flex;
            justify-content: space-evenly;
            align-items: flex-end;

            >span {
              cursor: pointer;
            }
          }
        }
      }

      .blueBtn {
        color: #1e6fff !important;
        cursor: pointer !important;
      }
    }

    .noOne {
      >div {
        >span {
          margin-right: toRem(2);
          position: relative;

          .el-divider {
            margin: auto 0;
          }

          >i {
            position: absolute;
            right: toRem(15);
            opacity: 0.65;
            cursor: pointer;
          }

          >i:hover {
            color: $RBlueColor;
          }

          >i:first-child {
            top: toRem(8);
          }

          >i:last-child {
            top: toRem(16);
          }
        }

        >span:first-child {
          flex: 1;
        }

        >span:nth-child(2),
        >span:nth-child(3),
        >span:nth-child(4) {
          flex: 4.78;
        }

        >span:nth-child(5) {
          flex: 5.22;
        }

        >span:nth-child(6) {
          flex: 2.17;
        }

        >span:last-child {
          flex: 6.52;
          margin-right: 0;
          display: flex;
          justify-content: space-evenly;

          >span {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>