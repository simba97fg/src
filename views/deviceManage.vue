<template>
  <div class="deviceManage">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item class="is-link">设备管理<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <el-input @change="getList" placeholder="设备名称" v-model="queryParams.search" v-bind:disabled="!listRole"
          suffix-icon="el-icon-search"></el-input>
        <el-input @change="getList" placeholder="设备SN码" v-model="queryParams.sn" v-bind:disabled="!listRole"
          suffix-icon="el-icon-search"></el-input>
        <el-cascader @change="getList" placeholder="归属组织" class="margin65" :show-all-levels="false" clearable
          v-model="queryParams.accId" v-bind:disabled="!listRole" :options="deptOptions"
          :props="memberDrawerDefaultProps"></el-cascader>
        <!-- <el-select @change="getList" placeholder="设备状态" v-model="queryParams.deviceStatus" v-bind:disabled="!listRole"
          clearable>
          <el-option v-for="dict in dict.type.device_use_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select> -->
        <el-select @change="getList" placeholder="启停状态" v-model="queryParams.useStatus" v-bind:disabled="!listRole"
          clearable>
          <el-option v-for="dict in dict.type.device_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
        <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
      <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
      <span @click="resetSelect" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span> -->
        <span class="operBtn" @click="centerDialogVisible = true" v-show="changeRole">录入新设备</span>
      </div>

    </div>
    <el-divider></el-divider>
    <div class="operationArea">
      <div>
        <i class="el-icon-warning"></i>
        <span>已选 {{ selectNum }}</span>
        <span>/{{ total }} 条</span>
      </div>
      <el-dropdown v-show="changeRole">
        <el-button size="mini">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="changeRole" @click.native="checkList(false)">批量删除</el-dropdown-item>
          <el-dropdown-item v-if="changeRole" @click.native="checkList(true)">全部删除</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="infoTable">
      <div class="tableHead">
        <span>
          <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
          </el-checkbox>
        </span>
        <span>设备SN码</span>
        <span>设备名称</span>
        <span>设备类型</span>
        <!-- <span>设备状态</span> -->
        <span>启停状态</span>
        <span>责任人姓名</span>
        <span>组织名称</span>
        <span>操作</span>
      </div>
      <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <span>
          <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
        </span>
        <span>{{ node.deviceSn }}</span>
        <span>{{ node.deviceName }}</span>
        <span>{{ node.deviceTypeName }}</span>
        <!-- <span>{{ node.deviceStatusName }}</span> -->
        <span>{{ node.useStatusName }}</span>
        <span>{{ node.bindUser }}</span>
        <span>{{ node.deptName }}</span>
        <span><span class="btnBase" @click="getDetail(false, node.id)">查看</span>
          <el-divider direction="vertical"></el-divider>
          <span class="btnBase" @click="getDetail(true, node.id)" v-if="changeRole">编辑</span>
          <span class="btnBase disableBtn" v-if="!changeRole">编辑</span>
          <el-divider direction="vertical"></el-divider><span class="btnBase" @click="setDleId(node.id)"
            v-if="changeRole">删除</span>
          <span class="btnBase disableBtn" v-if="!changeRole">编辑</span>
        </span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div>
    <el-pagination @size-change="pageSizeChange" @current-change="currentPageChange"
      :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
      layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
    <el-drawer :visible.sync="updateDrawer" direction="rtl" size="43.05%" class="updateDrawer"
      :before-close="handleClose">
      <div slot="title">
        <span v-if="infoDetail.id == null">录入新设备</span>
        <span v-if="infoDetail.id != null && !isEdit">查看设备详情</span>
        <span v-if="infoDetail.id != null && isEdit">编辑设备详情</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span><label class="addRedStar"></label>归属组织</span>
          <el-cascader
            v-bind:disabled="(infoDetail.id != null && !isEdit||(infoDetail.id != null&&isEdit&&infoDetail.manufacturer=='QT'))"
            v-model="infoDetail.deptId" :options="deptOptions" :props="memberDrawerDefaultProps" @change="handleChange"
            ref="cascader">
          </el-cascader>
        </div>
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>责任人</span>
          <el-input v-bind:disabled="infoDetail.id != null && !isEdit" v-model="infoDetail.bindUser" placeholder="请输入"
            @input="checkInfoDetail" @change="bindUserChange">
          </el-input>
        </div>
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>联系方式</span>
          <el-input placeholder="请输入" v-model="infoDetail.phone" v-bind:disabled="infoDetail.id != null && !isEdit"
            maxlength="11" @input="checkInfoDetail"></el-input>
        </div>

        <div v-show="infoDetail.deptId != null">
          <el-divider></el-divider>
        </div>
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>设备厂商</span>
          <el-select placeholder="请选择" v-model="infoDetail.manufacturer" @change="getDeviceTypeList($event, null)"
            v-bind:disabled="(infoDetail.id != null && !isEdit)||(infoDetail.id != null&&isEdit&&infoDetail.manufacturer=='QT')">
            <el-option v-for="dict in manufacturerOptions" :key="dict.dictValue" :label="dict.dictLabel"
              :value="dict.dictValue" />
          </el-select>
        </div>
        <div v-show="
          infoDetail.deptId != null &&
          infoDetail.manufacturer &&
          infoDetail.manufacturer.indexOf('QT') < 0
        ">
          <span><label class="addRedStar"></label>设备SN码</span>
          <el-input v-bind:disabled="infoDetail.id != null && !isEdit" @input="checkInfoDetail" placeholder="请输入"
            v-model="infoDetail.deviceSn"></el-input>
        </div>
        <!-- <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>设备ID</span>
          <el-input placeholder="自动生成" disabled v-model="infoDetail.deviceId"></el-input>
        </div> -->
        <div v-show="infoDetail.deptId != null && infoDetail.manufacturer != null">
          <span><label class="addRedStar"></label>设备类型</span>
          <el-select
            v-bind:disabled="(infoDetail.id != null && !isEdit)||(infoDetail.id != null&&isEdit&&infoDetail.manufacturer=='QT')"
            placeholder="请选择" v-model="infoDetail.deviceType" @change="checkInfoDetail">
            <el-option v-for="dict in deviceTypeOptions" :key="dict.dictValue" :label="dict.dictLabel"
              :value="dict.dictValue" />
          </el-select>
        </div>
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>设备名称</span>
          <el-input v-bind:disabled="infoDetail.id != null && !isEdit" @input="checkInfoDetail" placeholder="请输入"
            v-model="infoDetail.deviceName"></el-input>
        </div>
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>设备型号</span>
          <el-input v-bind:disabled="infoDetail.id != null && !isEdit" @input="checkInfoDetail" placeholder="请输入"
            v-model="infoDetail.deviceModel"></el-input>
        </div>
        <!-- <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>设备状态</span>
          <el-select placeholder="自动识别" disabled v-model="infoDetail.deviceStatus">
            <el-option v-for="dict in dict.type.device_use_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </div> -->
        <div v-show="infoDetail.deptId != null">
          <span><label class="addRedStar"></label>启停状态</span>
          <el-select v-bind:disabled="infoDetail.id != null && !isEdit" placeholder="请选择" v-model="infoDetail.useStatus"
            @change="checkInfoDetail">
            <el-option v-for="dict in dict.type.device_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </div>
        <div class="remarkClass" v-show="infoDetail.deptId != null">
          <span>备注</span>
          <el-input type="textarea" autosize placeholder="请输入" v-model="infoDetail.remark" maxlength="30"
            show-word-limit v-bind:disabled="infoDetail.id != null && !isEdit"></el-input>
        </div>
        <span v-if="infoDetail.id == null"
          v-show="infoDetail.deptId != null && infoDetail.manufacturer == 'QT'">注:将生成该设备专属实名链接</span>
        <div v-show="infoDetail.id != null && infoDetail.manufacturer == 'QT'">
          <el-divider></el-divider>
        </div>
        <div v-show="infoDetail.id != null && infoDetail.manufacturer == 'QT'" class="LinkClass">
          <span>专用实名链接</span>
          <el-input type="textarea" autosize disabled placeholder="请输入" v-model="infoDetail.realUri"></el-input>
        </div>
        <div v-show="infoDetail.id != null && infoDetail.manufacturer == 'QT'" class="cpClass">
          <span></span>
          <span @click="copy(infoDetail.realUri)">复制</span>
        </div>
      </div>
      <div v-show="!(infoDetail.id != null && !isEdit)">
        <el-divider></el-divider>
        <span v-if="!isAddOk">保存</span>
        <span class="clickAbleBtn" v-if="isAddOk && infoDetail.id == null" @click="savedialogVisible = true">保存</span>
        <span class="clickAbleBtn" v-if="isAddOk && infoDetail.id != null" @click="savedialogVisible = true">保存</span>
      </div>
    </el-drawer>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认删除所选设备（共 {{ selectNum }} 台）</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeDevice(checkedList)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="deldialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认删除该设备</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deldialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeDevice(clickId)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="savedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p v-if="infoDetail.id == null">确认录入该新设备</p>
      <p v-if="infoDetail.id != null">确定修改该设备信息</p>
      <p></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="savedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDevice" v-if="infoDetail.id == null">确 定</el-button>
        <el-button type="primary" @click="modifyDevice" v-if="infoDetail.id != null">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisibleAll" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认删除全部设备（共 {{ total }} 台）</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleAll = false">取 消</el-button>
        <el-button type="primary" @click="removeAllDevice">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="centerDialogVisible" width="29.5%" center :show-close="true" style="padding-top: 15%">
      <p>请选择录入量级</p>
      <p>批量录入时，超过可接入上限的设备会录入失败</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openUpdateSomeDrawer" type="primary" style="border-color: #1e6fff; background: #1e6fff">批量录入
        </el-button>
        <el-button type="primary" @click="openUpdateDrawer">单个录入</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="updateSomeDrawer" direction="rtl" size="43.05%" class="updateSomeDrawer"
      :before-close="handleSomeClose">
      <div slot="title">
        <span>批量录入新设备</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span></span>
          <span>选择归属组织</span>
        </div>
        <el-cascader class="margin65" :show-all-levels="true" v-model="selectedDept" :options="deptOptions"
          @change="handleSomeChange" ref="somecascader" :props="memberDrawerDefaultProps"></el-cascader>
        <div>
          <span></span>
          <span>设备信息文件</span>
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
            <span v-if="updateStatus == '2'" class="successP">录入成功</span>
            <span v-if="updateStatus == '3'" class="errorP">录入失败，请重试</span>
            <span v-if="updateStatus == '4'" class="warningP">已中断，请重试</span>
          </div>
          <el-progress v-bind:class="{ displayNode: updateStatus == '5' }" :percentage="percentage" :format="format"
            :status="progressStatus"></el-progress>
          <div>
            <span>{{ fileSize }}</span>
            <span v-show="updateStatus == '1' && false" @click="cancelUpload">取消上传</span>
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
        <span v-if="updateStatus == '0'">确认录入</span>
        <span v-if="updateStatus == '1'">录入中</span>
        <span class="clickAbleBtn" v-if="updateStatus == '2'" @click="reStart">继续录入</span>
        <span class="clickAbleBtn" @click="reStart" v-if="updateStatus == '3' || updateStatus == '4'">重新录入</span>
        <span class="clickAbleBtn" v-if="updateStatus == '5'" @click="uploadfile">确认录入</span>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
import { listData } from "@/api/system/dict/data";
import { treeselectDevice, treeselect, getDept } from "@/api/system/dept";
import { listUser } from "@/api/system/user";
export default {
  name: "deviceManage",
  dicts: [
    "device_status",
    "device_use_status",
    "rn_device_type",
    "device_manufacturer",
  ],
  components: {},
  data() {
    return {
      errorList: [],
      othreDevice: false,
      selectedDept: null,
      deviceSum: 0,
      deldialogVisible: false,
      clickId: null,
      savedialogVisible: false,
      isEdit: false,
      progressStatus: undefined,
      percentage: 45,
      updatedialogVisible: false,
      userList: [],
      updateStatus: "0",
      updateSomeDrawer: false,
      centerDialogVisible: false,
      dialogVisible: false,
      dialogVisibleAll: false,
      queryParams: {
        sn: null,
        accId: null,
        pageNum: 1,
        pageSize: 10,
        search: null,
        deptId: null,
        useStatus: null,
        deviceStatus: null,
      },
      manufacturerOptions: [],
      useStatusOptions: [],
      deviceStatusOptions: [],
      deviceTypeOptions: [],
      updateDrawer: false,
      updateSomeDrawer: false,
      changeRole: null,
      listRole: false,
      today: null,
      checkedList: [],
      selectNum: 0,
      total: null,
      checked: false,
      isIndeterminate: false,
      type: "VIN",
      inputSelect: null,
      deptOptions: [],
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      infoDetail: {
        orgId: null,
        remark: null,
        phone: null,
        bindUser: null,
        id: null, //设备id
        deptId: null, //组织id
        deviceSn: null,
        deviceId: null,
        deviceModel: null, //设备型号
        deviceName: null, //设备名称
        deviceStatus: '1', //设备状态
        deviceType: null, //设备类型
        remak: null, //备注
        manufacturer: null, //厂商
        useStatus: null, //启停状态
      },
      infoList: [],
      isAddOk: false,
      isCuC: false,
    };
  },
  computed: {
    deptId() {
      return this.$store.getters.deptId;
    },
    deptLevel() {
      return this.$store.getters.deptLevel;
    },
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    getDeviceTypeList(e, deviceType) {
      this.infoDetail.deviceType = deviceType;
      console.log(e, deviceType, '==============getDeviceTypeList======================');
      this.deviceTypeOptions = [];
      this.dict.type["rn_device_type"].forEach((el) => {
        if (el.raw.remark == e) {
          this.deviceTypeOptions.push(el.raw);
        }
      });
      this.checkInfoDetail();
    },
    // getUserList(deptId) {
    //   this.infoDetail.bindUser = null;
    //   this.infoDetail.phone = null;
    //   this.userList = [];
    //   listUser(
    //     this.addDateRange(
    //       {
    //         pageNum: 1,
    //         pageSize: 999,
    //         userName: undefined,
    //         phonenumber: undefined,
    //         status: undefined,
    //         deptId: deptId,
    //       },
    //       []
    //     )
    //   ).then((response) => {
    //     this.checkInfoDetail();
    //     if (this.deptLevel != 1) {
    //       response.rows.forEach((el) => {
    //         if (el.nickName.toString().indexOf("管理员") < 0) {
    //           this.userList.push({
    //             name: el.nickName,
    //             deptId: el.deptId,
    //             id: el.userId.toString(),
    //             phonenumber: el.phonenumber,
    //           });
    //         }
    //       });
    //     } else {
    //       response.rows.forEach((el) => {
    //         if (
    //           el.nickName.toString().indexOf("管理员") < 0 &&
    //           el.deptId != this.deptId
    //         ) {
    //           this.userList.push({
    //             name: el.nickName,
    //             deptId: el.deptId,
    //             id: el.userId.toString(),
    //             phonenumber: el.phonenumber,
    //           });
    //         }
    //       });
    //     }
    //   });
    // },
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
    setDleId(id) {
      this.deldialogVisible = true;
      this.clickId = id;
    },
    async modifyDevice() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "update-device",
        serviceParameter: {
          isDeleted: this.infoDetail.isDeleted,
          realUri: this.infoDetail.realUri,
          phone: this.infoDetail.phone.replace(/\s+/g, ""),
          bindUser: this.infoDetail.bindUser.replace(/\s+/g, ""),
          deviceSn: this.infoDetail.deviceSn.replace(/\s+/g, ""),
          deviceId: this.infoDetail.deviceId,
          remark: this.infoDetail.remark, //备注
          orgId: this.infoDetail.deptId,
          deptId: this.infoDetail.deptId,
          id: this.infoDetail.id, //设备id
          accId: this.infoDetail.deptId, //组织id
          deviceModel: this.infoDetail.deviceModel.replace(/\s+/g, ""), //设备型号
          deviceName: this.infoDetail.deviceName.replace(/\s+/g, ""), //设备名称
          deviceStatus: this.infoDetail.deviceStatus, //设备状态
          deviceType: this.infoDetail.deviceType, //设备类型
          remak: this.infoDetail.remark, //备注
          manufacturer: this.infoDetail.manufacturer,
          useStatus: this.infoDetail.useStatus, //启停状态
        },
        method: "post",
      });
      if (res) {
        if (res.success) {
          this.$message({
            message: "修改成功！",
            type: "success",
            showClose: true,
          });
          this.getList();
        } else {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        }
        this.updateDrawer = false;
        this.isAddOk = false;
        this.savedialogVisible = false;
      }
    },
    async getDetail(isEdit, id) {
      console.log(this.$refs["cascader"], '=================this.$refs["cascader"]================================');
      this.isEdit = isEdit;
      this.manufacturerOptions = [];
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "find-detail",
        serviceParameter: { id: id },
        method: "get",
      });
      if (res) {
        // this.getUserList(res.data.deptId);
        res.data.orgId = res.data.deptId;
        res.data.accId = res.data.deptId;
        res.data.remark = res.data.remak;
        this.infoDetail = res.data;
        if (res.data.manufacturer != 'QT') {
          this.dict.type["device_manufacturer"].forEach((el) => {
            if (el.raw.remark != "QT") {
              this.manufacturerOptions.push(el.raw);
            }
          });
        }
        else {
          this.dict.type["device_manufacturer"].forEach((el) => {
            this.manufacturerOptions.push(el.raw);
          });
        }
        this.getDeviceTypeList(res.data.manufacturer, res.data.deviceType);
      }
      this.$nextTick(() => {
        this.checkInfoDetail();
        this.updateDrawer = true;
      });
    },
    checkInfoDetail() {
      this.isAddOk = false;
      console.log(
        this.dict.type["device_manufacturer"],
        "===============================checkInfoDetail==============================="
      );
      if (this.infoDetail.manufacturer) {
        if (this.infoDetail.manufacturer != "QT") {
          if (
            this.infoDetail.deviceSn &&
            this.infoDetail.deviceSn.replace(/\s+/g, "").length > 0
          ) {
            if (this.infoDetail.deviceType) {
              if (
                this.infoDetail.deviceName &&
                this.infoDetail.deviceName.replace(/\s+/g, "")
                  .length > 0
              ) {
                if (
                  this.infoDetail.deviceModel &&
                  this.infoDetail.deviceModel.replace(/\s+/g, "")
                    .length > 0
                ) {
                  if (this.infoDetail.useStatus != null) {
                    if (this.infoDetail.bindUser &&
                      this.infoDetail.bindUser.replace(/\s+/g, "")
                        .length > 0) {
                      if (this.infoDetail.phone &&
                        this.infoDetail.phone.replace(/\s+/g, "")
                          .length == 11) {
                        this.isAddOk = true;
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.infoDetail.deviceType) {
            if (
              this.infoDetail.deviceName &&
              this.infoDetail.deviceName.replace(/\s+/g, "").length >
              0
            ) {
              if (
                this.infoDetail.deviceModel &&
                this.infoDetail.deviceModel.replace(/\s+/g, "")
                  .length > 0
              ) {
                if (this.infoDetail.useStatus != null) {
                  if (this.infoDetail.bindUser &&
                    this.infoDetail.bindUser.replace(/\s+/g, "")
                      .length > 0) {
                    if (this.infoDetail.phone &&
                      this.infoDetail.phone.replace(/\s+/g, "")
                        .length == 11) {
                      this.isAddOk = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    handleSomeChange() {
      let Node = this.$refs["somecascader"].getCheckedNodes()[0];
      let level = this.$refs["somecascader"].getCheckedNodes()[0].data.labelLevel;
      while (level > 2) {
        Node = Node.parent;
        level--;
      }
      this.$nextTick(() => {
        this.getOtherDevice(Node.data.id)
      })
    },
    handleChange(data) {
      console.log(data);
      this.infoDetail.accId = data;
      this.infoDetail.orgId = data;
      this.manufacturerOptions = [];
      if (this.infoDetail.id == null) {
        this.infoDetail.manufacturer = null;
        this.infoDetail.deviceType = null;
      }
      let Node = this.$refs["cascader"].getCheckedNodes()[0];
      let level = this.$refs["cascader"].getCheckedNodes()[0].data.labelLevel;
      while (level > 2) {
        Node = Node.parent;
        level--;
      }
      this.$nextTick(() => {
        if (this.isEdit && this.infoDetail.id) {
          this.dict.type["device_manufacturer"].forEach((el) => {
            if (el.raw.remark != "QT") {
              this.manufacturerOptions.push(el.raw);
            }
          });
        } else {
          this.getOtherDevice(Node.data.id)
        }
        // this.getUserList(data);
      })
    },
    async getOtherDevice(id) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameRule",
        serviceName: "find-config",
        method: "get",
        serviceParameter: {
          orgId: id,
        },
      });
      if (res) {
        if (res.data.otherDevice) {
          this.dict.type["device_manufacturer"].forEach((el) => {
            this.manufacturerOptions.push(el.raw);
          });
        }
        else {
          this.dict.type["device_manufacturer"].forEach((el) => {
            if (el.raw.remark != "QT") {
              this.manufacturerOptions.push(el.raw);
            }
          });
        }
      }
      if (err) {
        this.$message({
          message: "请先配置该组织的相关规则！",
          type: "success",
          showClose: true,
        });
        this.selectedDept = null;
      }
    },
    bindUserChange(e) {
      this.userList.forEach((el) => {
        if (el.id == e) {
          this.infoDetail.phone = el.phonenumber;
          this.checkInfoDetail();
        }
      });
    },
    handleClose() {
      this.updateDrawer = false;
      this.errorList = [];
    },
    handleSomeClose() {
      this.updateSomeDrawer = false;
      this.errorList = [];
      this.selectedDept = null;
    },
    format(percentage) {
      return percentage === 100 ? "满" : `${percentage}%`;
    },
    cancelUpload() {
      this.reStart();
    },
    reStart() {
      this.errorList = [];
      this.updateSomeDrawer = false;
      this.openUpdateSomeDrawer();
    },
    async uploadfile() {
      this.updateStatus = "1";
      const api = this.$$api.doFormDataReq({
        url_key: "realNameDevice",
        loading: !1,
        serviceParameter: {
          userName: Cookies.get("userName"),
          orgId: this.selectedDept,
        },
        data: {
          service_name: "new-import",
          service_parameter: {
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
        if (res.success && res.data.errorSize == 0) {
          this.updateStatus = "2";
          this.percentage = 100;
          this.progressStatus = "success";
          this.getList();
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
          this.getList();
        }
        else {
          this.updateStatus = "3";
          this.progressStatus = "exception";
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });

        }
      }
      if (err) {
        this.updateStatus = "3";
        this.progressStatus = "exception";
        console.log(err);
      }
    },
    async downloadtemplate() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "download-template",
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "设备信息文件模板获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "设备信息文件模板" + ".xls";
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
      if (this.selectedDept == null) {
        this.$message({
          message: "请先选择设备归属组织！",
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
    async addDevice() {
      if (this.infoDetail.deviceSn) {
        this.infoDetail.deviceSn = this.infoDetail.deviceSn.replace(/\s+/g, "");
      }
      this.infoDetail.deviceName = this.infoDetail.deviceName.replace(/\s+/g, "");
      this.infoDetail.deviceModel = this.infoDetail.deviceModel.replace(/\s+/g, "");
      this.infoDetail.bindUser = this.infoDetail.bindUser.replace(/\s+/g, "");
      this.infoDetail.phone = this.infoDetail.phone.replace(/\s+/g, "");
      this.infoDetail.remak = this.infoDetail.remark;
      console.log(this.infoDetail, "============addDevice================");
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "new-device",
        serviceParameter: this.infoDetail,
        method: "post",
      });
      if (res) {
        if (res.success) {
          this.$message({
            message: "录入成功！",
            type: "success",
            showClose: true,
          });

          this.getList();
        } else {
          this.$message({
            message: res.msg,
            type: "error",
            showClose: true,
          });
        }
        this.savedialogVisible = false;
        this.updateDrawer = false;
        this.isAddOk = false;
      }
    },
    openUpdateSomeDrawer() {
      this.centerDialogVisible = false;
      this.updateSomeDrawer = true;
      this.updateStatus = "0";
      this.progressStatus = undefined;
    },
    openUpdateDrawer() {
      this.selectedDept = null;
      this.centerDialogVisible = false;
      this.updateDrawer = true;
      this.infoDetail = {
        orgId: null,
        remark: null,
        phone: null,
        bindUser: null,
        id: null, //设备id
        deptId: null, //组织id
        deviceSn: null,
        deviceId: null,
        deviceModel: null, //设备型号
        deviceName: null, //设备名称
        deviceStatus: '1', //设备状态
        deviceType: null, //设备类型
        remak: null, //备注
        manufacturer: null, //厂商
        useStatus: null, //启停状态
      };
    },
    resetSelect() {
      this.queryParams = {
        sn: null,
        accId: null,
        pageNum: 1,
        pageSize: 10,
        search: null,
        deptId: null,
        useStatus: null,
        deviceStatus: null,
      };
      this.$nextTick(() => {
        this.getList();
      })
    },
    pageSizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    async removeAllDevice() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "delete-device",
        method: "get",
      });
      if (res) {
        this.dialogVisibleAll = false;
        this.$message({
          message: "删除成功！",
          type: "success",
          showClose: true,
        });
        this.getList();
      }
    },
    async removeDevice(id) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "modify-useDevice",
        serviceParameter: { ids: id.toString() },
        method: "get",
      });
      if (res) {
        this.deldialogVisible = false;
        this.dialogVisible = false;
        this.$message({
          message: "删除成功！",
          type: "success",
          showClose: true,
        });
        this.getList();
      }
    },
    checkList(isAll) {
      if (isAll) {
        this.dialogVisibleAll = true;
      } else {
        if (this.selectNum > 0) {
          this.dialogVisible = true;
        } else {
          this.$message({
            message: "请选择至少一项数据！",
            type: "warning",
            showClose: true,
          });
        }
      }
    },
    async getExportList() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "export-unAuth-list",
        serviceParameter: { ids: this.checkedList.toString() },
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "未实名号卡" + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });

        console.log("getExport", res);
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "未实名号卡" + this.today + ".xlsx";
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
        console.log("acacacac", err);
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
      console.log('===========treeselect==================', this.deptOptions)
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      console.log(this.isCuC, '=============this.isCuC====================')
      if (!this.isCuC) {
        this.queryParams.pageNum = 1;
      };
      this.isCuC = false;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDevice",
        serviceName: "find-list",
        serviceParameter: this.queryParams,
        method: "post",
      });
      if (err) {
        this.loadingList.close();
      }
      if (res) {
        this.selectNum = 0;
        this.checkedList = [];
        this.checked = false;
        this.isIndeterminate = false;
        res.data.list.forEach((element) => {
          element.checked = false;
          if (element.deptName == "") {
            element.deptName = "-";
          }
        });
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.loadingList.close();
      }
    },
  },
  created() { },
  mounted() {
    this.deptOptions = [];
    this.deptOptions.length = 0;
    this.listRole = auth.hasPermi("home:deviceManage:list");
    this.changeRole = auth.hasPermi("home:deviceManage:change");
    this.today = Cookies.get("today");
    treeselect().then((response) => {
      if (this.deptLevel == 1) {
        response.data.forEach((el) => {
          el.children.forEach((ele) => {
            this.deptOptions.push(ele)
          })
        })
      } else {
        this.deptOptions = response.data;
      }
    });
    this.getList();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.deviceManage {
  padding: toRem(15) toRem(40);

  .updateSomeDrawer {
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

        >div:nth-child(2) {
          margin-top: 0.19rem;
          margin-left: 0.13rem;
          width: toRem(402);
        }

        >div:nth-child(3),
        div:first-child {
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

  .updateDrawer {
    .el-drawer__body {
      >div:nth-child(2) {
        display: flex;
        flex-direction: column;
        margin: toRem(18) toRem(40) 0 toRem(40);
        font-size: toRem(14);
        justify-content: flex-start;

        >span {
          text-align: left;
          color: #343434;
          opacity: 0.8;
          margin-bottom: toRem(18);
        }

        >div {
          display: flex;
          align-items: center;
          margin-bottom: toRem(20);

          >span:first-child {
            width: toRem(110);
            text-align: left;
            color: #343434;
            display: flex;

            .addRedStar:before {
              margin-left: 0;
              margin-right: toRem(8);
              opacity: 0.65;
            }
          }

          >div:first-child {
            margin-top: toRem(5);
          }

          >div {
            width: toRem(300);
          }
        }

        ::v-deep .el-divider {
          height: toRem(1);
          width: toRem(502);
        }

        .remarkClass {
          ::v-deep .el-textarea__inner {
            width: toRem(300);
            height: toRem(60) !important;
            resize: none;
            font-size: toRem(14) !important;
          }
        }

        .LinkClass {
          align-items: flex-start;

          >span:first-child {
            height: toRem(40);
            margin-top: toRem(10);
          }

          ::v-deep .el-textarea__inner {
            width: toRem(300);
            height: toRem(90) !important;
            resize: none;
            font-size: toRem(14) !important;
          }
        }

        .cpClass {
          >span:last-child {
            width: toRem(56);
            height: toRem(22);
            line-height: toRem(22);
            color: white;
            font-size: toRem(12);
            font-weight: 600;
            cursor: pointer;
            background: #1e6fff;
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

  .operationArea {
    margin: toRem(20) 0 toRem(11) 0;

    >div:nth-child(2) {
      width: fit-content;
    }
  }

  .selectArea {
    align-items: flex-start;

    >div {
      >div {
        margin-right: toRem(10);
      }
    }
  }

  .el-divider--horizontal {
    margin: toRem(15) 0;
  }

  .infoTable {
    height: fit-content;

    >div {
      >span:first-child {
        width: toRem(46);
      }

      >span:nth-child(2),
      >span:nth-child(3) {
        width: toRem(180);
      }

      >span:nth-child(5),
      span:nth-child(6) {
        width: toRem(160);
      }

      >span:nth-child(4) {
        width: toRem(200);
      }

      >span:nth-child(7) {
        width: toRem(170);
      }

      >span:last-child {
        width: toRem(250);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 0;

        .el-divider--vertical {
          margin: 0 toRem(20);
        }

        >span:last-child {
          color: #e34d59;
        }
      }
    }
  }
}
</style>
