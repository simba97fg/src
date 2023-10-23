<template>
  <div class="testingAuth">
    <el-image-viewer v-if="openImg" :on-close="closeImgViewer" :url-list="imgList" :z-index="9999" />
    <el-drawer :visible.sync="drawer" direction="rtl" size="43.05%" class="drawer" :before-close="resetAll">
      <div slot="title">
        <span>测试期个人实名认证详情</span>
        <span @click="getExport(thisId, thisVin)" v-hasPermi="['home:testingAuth:export']">导出</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div class="baseInfo">
          <span><span>订单号</span>{{ infoDetail.applyNo }}</span>
          <span><span>申请时间</span>{{ infoDetail.applyTime }}</span>
          <span v-if="infoDetail.status == '0'"><span>审核时间</span>{{ infoDetail.finishTime }}</span>
          <span v-if="infoDetail.status == '1'"><span>审核通过</span>{{ infoDetail.finishTime }}</span>
          <span v-if="infoDetail.status == '2'"><span>审核拒绝</span>{{ infoDetail.finishTime }}</span>
          <span><span>操作人</span>{{ infoDetail.userName }}</span>
          <span><span>操作ID</span>{{ infoDetail.userId }}</span>
          <span v-if="infoDetail.status == '2'" style="color: #e34d59"><span>拒绝原因</span>{{ infoDetail.remark }}</span>
        </div>
        <div class="infoDialog" v-show="infoDetail.msisdn">
          <p></p>
          <span>卡信息</span>
          <div>
            <div>
              <span>MSISDN</span><span>{{ infoDetail.msisdn
              }}<img src="../assets/images/dialog-file.png" @click="copy(infoDetail.msisdn)" /></span>
            </div>
            <div>
              <span>ICCID</span><span>{{ infoDetail.iccid
              }}<img src="../assets/images/dialog-file.png" @click="copy(infoDetail.iccid)" /></span>
            </div>
            <div>
              <span>开通状态</span><span>{{ infoDetail.statusName }}</span>
            </div>
          </div>
        </div>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name">
          <p></p>
          <span>车主信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="ownerInfoStatus" @click="changeEyes('O')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!ownerInfoStatus" @click="changeEyes('O')" />
          <div>
            <div>
              <span>姓名</span><span>{{ infoDetail.name }}</span>
            </div>
            <div>
              <span>证件类型</span><span>{{ infoDetail.cardType }}</span>
            </div>
            <div>
              <span>证件号码</span><span>{{ infoDetail.cardNumb }}</span>
            </div>
            <div>
              <span>证件地址</span><span>{{ infoDetail.address }}</span>
            </div>
            <div>
              <span>有效期</span><span>{{ infoDetail.validityTime }}</span>
            </div>
            <div>
              <span>联系方式</span><span>{{ infoDetail.phone }}</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag == 1">
              <span>发票</span><span class="blueBtn" @click="downloadFile(infoDetail.invoice, '发票照片')"
                v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag == 1">
              <span>行驶证</span><span class="blueBtn" @click="downloadFile(infoDetail.drivingLicense, '行驶证照片')"
                v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div>
              <span>证件照片</span><span class="blueBtn" @click="
                downloadIDCard(infoDetail.frontPhoto, infoDetail.backPhoto)
              " v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.photo && infoDetail.photo.length > 0">
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.photo, '正面免冠照片')"
                v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.videoScreenshotFirst && infoDetail.videoScreenshotFirst.length > 0">
              <span>人像视频截图一</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.videoScreenshotFirst,
                  '人像视频截图一'
                )
              " v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.videoScreenshotSecond && infoDetail.videoScreenshotSecond.length > 0">
              <span>人像视频截图二</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.videoScreenshotSecond,
                  '人像视频截图二'
                )
              " v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
          </div>
        </div>
        <div class="infoDialog wtInfoDialog" v-show="infoDetail.wtFlag == 1">
          <p></p>
          <span>委托人信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="liableInfoStatus" @click="changeEyes('L')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!liableInfoStatus" @click="changeEyes('L')" />
          <div>
            <div>
              <span>姓名</span><span>{{ infoDetail.wtName }}</span>
            </div>
            <div>
              <span>证件类型</span><span>{{ infoDetail.wtCardType }}</span>
            </div>
            <div>
              <span>证件号码</span><span>{{ infoDetail.wtCardNumb }}</span>
            </div>
            <div>
              <span>证件地址</span><span>{{ infoDetail.wtAddress }}</span>
            </div>
            <div>
              <span>有效期</span><span>{{ infoDetail.wtValidityTime }}</span>
            </div>
            <div>
              <span>联系方式</span><span>{{ infoDetail.wtPhone }}</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag == 1">
              <span>发票</span><span class="blueBtn" @click="downloadFile(infoDetail.invoice, '发票照片')"
                v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag == 1">
              <span>行驶证</span><span class="blueBtn" @click="downloadFile(infoDetail.drivingLicense, '行驶证照片')"
                v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.photo && infoDetail.photo.length > 0">
              <span>证件照片</span><span class="blueBtn" @click="
                downloadIDCard(
                  infoDetail.wtFrontPhoto,
                  infoDetail.wtBackPhoto
                )
              " v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.wtPhoto && infoDetail.wtPhoto.length > 0">
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.wtPhoto, '正面免冠照片')"
                v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.wtVideoScreenshotFirst && infoDetail.wtVideoScreenshotFirst.length > 0">
              <span>人像视频截图一</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotFirst,
                  '人像视频截图一'
                )
              " v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.wtVideoScreenshotSecond && infoDetail.wtVideoScreenshotSecond.length > 0">
              <span>人像视频截图二</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotSecond,
                  '人像视频截图二'
                )
              " v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
          </div>
        </div>
        <div class="infoDialog" v-show="infoDetail.handlerName">
          <p></p>
          <span>单位责任人信息</span>
          <img src="../assets/images/eyes.png" v-show="false" />
          <div>
            <div>
              <span>姓名</span><span>{{ infoDetail.handlerName }}</span>
            </div>
            <div>
              <span>证件类型</span><span>{{ infoDetail.cardType }}</span>
            </div>
            <div>
              <span>证件号码</span><span>{{ infoDetail.cardNumb }}</span>
            </div>
            <div>
              <span>证件地址</span><span>{{ infoDetail.cardAddress }}</span>
            </div>
            <div>
              <span>有效期</span><span>{{ infoDetail.cardValidityTime }}</span>
            </div>
            <div>
              <span>联系方式</span><span>{{ infoDetail.handlerPhone }}</span>
            </div>
            <div>
              <span>证件照片</span><span class="blueBtn">点击查看</span>
            </div>
            <div>
              <span>人像视频</span><span class="blueBtn">点击查看</span>
            </div>
            <div>
              <span>正面免冠照片</span><span class="blueBtn">点击查看</span>
            </div>
          </div>
        </div>
        <div class="infoDialog" v-show="infoDetail.orgName">
          <p></p>
          <span>单位登记信息</span>
          <img src="../assets/images/eyes.png" v-show="false" />
          <div>
            <div>
              <span>单位名称</span><span>{{ infoDetail.orgName }}</span>
            </div>
            <div>
              <span>统一社会信用代码</span><span>{{ infoDetail.orgCode }}</span>
            </div>
            <div><span>证件地址</span><span>假数据</span></div>
            <div><span>通讯地址</span><span>假数据</span></div>
            <div>
              <span>单位证件</span><span class="blueBtn">点击查看</span>
            </div>
            <div>
              <span>单位授权委托书</span><span class="blueBtn">点击查看</span>
            </div>
          </div>
        </div>
        <div class="infoDialog carInfoDialog" v-show="infoDetail.vin">
          <p></p>
          <span>车辆信息</span>
          <div>
            <div>
              <span>车辆生产企业名称</span><span>{{ infoDetail.vehicleOrgName }}</span>
            </div>
            <div>
              <span>车辆识别码(VIN)</span><span>{{ infoDetail.vin
              }}<img src="../assets/images/dialog-file.png" @click="copy(infoDetail.vin)" /></span>
            </div>
            <div>
              <span>车辆状态名称</span>
              <span>{{ infoDetail.vehicleStatusName }}</span>
            </div>
            <div>
              <span>新车标识名称</span>
              <span>{{ infoDetail.newVehicleFlagName }}</span>
            </div>
            <div>
              <span>车辆产地</span><span>{{ infoDetail.vehicleOriginType }}</span>
            </div>
            <div>
              <span>车辆品牌</span><span>{{ infoDetail.vehicleBrand }}</span>
            </div>
            <div>
              <span>车辆名称</span><span>{{ infoDetail.vehicleName }}</span>
            </div>
            <div>
              <span>车辆型号</span><span>{{ infoDetail.vehicleType }}</span>
            </div>
            <div>
              <span>车辆通用名称</span><span>{{ infoDetail.vehicleMode }}</span>
            </div>
            <div>
              <span>车身颜色</span><span>{{ infoDetail.vehicleColour }}</span>
            </div>
            <div>
              <span>燃料种类</span><span>{{ infoDetail.vehicleFuelType }}</span>
            </div>
            <div>
              <span>发动机号码</span><span>{{ infoDetail.engineNum }}</span>
            </div>
            <div>
              <span>电动机序列号</span><span>{{ infoDetail.motorNum }}</span>
            </div>
            <div>
              <span>车辆出厂时间</span><span>{{ infoDetail.vehicleDepartureTime }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-divider v-if="false"></el-divider>
      <div v-show="false">
        <span class="btnBase" @click="dialogVisible = true">通过</span>
        <span class="btnBase" @click="refuseDialog = true">拒绝</span>
      </div>
    </el-drawer>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>实名记录</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">测试期个人实名记录<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <div>
          <el-select v-model="type" v-bind:disabled="!listRole" @change="getList">
            <el-option v-for="item in typeoptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-input v-model="inputSelect" placeholder="请输入" v-bind:disabled="!listRole" suffix-icon="el-icon-search"
            @change="getList">
          </el-input>
        </div>
        <el-input v-model="iccid" placeholder="ICCID" v-bind:disabled="!listRole" suffix-icon="el-icon-search"
          @change="getList">
        </el-input>
        <el-select v-model="realStatus" filterable placeholder="开通状态" v-bind:disabled="!listRole" @change="getList"
          clearable>
          <el-option v-for="item in realoptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="idType" filterable placeholder="证件类型" v-bind:disabled="!listRole" @change="getList" clearable>
          <el-option v-for="item in idTypeoptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-select v-model="idStatus" filterable placeholder="证件有效状态" v-bind:disabled="!listRole" @change="getList"
          clearable>
          <el-option v-for="item in idStatusoptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="newVehicleFlag" filterable placeholder="新车标识" v-bind:disabled="!listRole" multiple
          @change="getList" clearable collapse-tags>
          <el-option v-for="item in newVehicleFlagOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="vehicleBrand" filterable placeholder="车辆品牌" v-bind:disabled="!listRole" multiple collapse-tags
          @change="getList" clearable>
          <el-option v-for="item in vehicleBrandOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </div>
      <div v-if="showMoreSelect">
        <el-date-picker v-bind:disabled="!listRole" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
          v-model="time" type="daterange" start-placeholder="实名起始时间" end-placeholder="结束时间" align="right">
        </el-date-picker>
        <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
          placeholder="组织机构" v-model="orgIds" @change="getList"></el-cascader>
        <el-select v-model="ispCode" filterable placeholder="运营商" v-bind:disabled="!listRole" multiple collapse-tags
          clearable @change="getList">
          <el-option v-for="item in ispCodeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="ispType" filterable placeholder="车联网卡类型" v-bind:disabled="!listRole" multiple collapse-tags
          @change="getList" clearable>
          <el-option v-for="item in ispTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="vehicleStatus" filterable placeholder="车辆状态" v-bind:disabled="!listRole" multiple
          @change="getList" clearable collapse-tags>
          <el-option v-for="item in vehicleStatusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="channelType" filterable placeholder="渠道类型" v-bind:disabled="!listRole" multiple collapse-tags
          @change="getList" clearable>
          <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="orderType" filterable placeholder="订单类型" v-bind:disabled="!listRole" multiple collapse-tags
          @change="getList" clearable>
          <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
      <span class="disabledBtn" v-if="!listRole">按筛选搜索</span> -->
      <!-- <span @click="resetSelect" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span> -->
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
      <el-dropdown v-hasPermi="['home:testingAuth:export']" style="width: fit-content;">
        <el-button size="mini">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="checkList">批量导出
          </el-dropdown-item>
          <el-dropdown-item @click.native="getExportList('or')">全部导出
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;" ref="multipleTable"
      @selection-change="handleSelectionChange" class="realNameTable" @select-all="selectAll">
      <el-table-column type="selection" width="76" align="center" fixed="left">
      </el-table-column>
      <el-table-column prop="startTime" label="实名认证时间" width="220" align="center">
      </el-table-column>
      <el-table-column prop="vin" label="VIN" width="250" align="center">
      </el-table-column>
      <el-table-column prop="iccid" label="ICCID" width="250" align="center">
      </el-table-column>
      <el-table-column prop="deptName" label="组织名称" width="210" align="center">
      </el-table-column>
      <el-table-column prop="companyName" label="车企名称" width="210" align="center">
      </el-table-column>
      <el-table-column prop="applyNo" label="订单号" width="245" align="center">
      </el-table-column>
      <el-table-column prop="oderTypeName" label="订单类型" width="135" align="center">
      </el-table-column>
      <el-table-column prop="statusName" label="开通状态" width="115" align="center">
      </el-table-column>
      <el-table-column prop="cardType" label="证件类型" width="160" align="center">
      </el-table-column>
      <el-table-column prop="validityTime" label="证件有效期" min-width="150" align="center">
      </el-table-column>
      <el-table-column prop="ispName" label="运营商" width="115" align="center">
      </el-table-column>
      <el-table-column prop="vehicleBrand" label="车辆品牌" min-width="180" align="center">
      </el-table-column>
      <el-table-column prop="vehicleStatusName" label="车辆状态" width="115" align="center">
      </el-table-column>
      <el-table-column prop="newVehicleFlagName" label="新车标识" width="115" align="center">
      </el-table-column>
      <el-table-column prop="channelTypeName" label="渠道类型" width="140" align="center">
      </el-table-column>
      <el-table-column prop="ispTypeName" label="车联网卡类型" width="140" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="110" align="center">
        <template slot-scope="scope">
          <span v-if="detailRole" @click="getInfo(scope.row.id, scope.row.vin)" class="btnBase blueBtn">详情</span>
          <span v-if="!detailRole" class="blueBtn disableBtn">详情</span>

        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="infoTable">
      <div class="tableHead">
        <span
          ><el-checkbox
            size="large"
            v-model="checked"
            @change="clickAll(pageSize)"
            :indeterminate="isIndeterminate"
          ></el-checkbox
        ></span>
        <span>VIN</span>
        <span>ICCID</span>
        <span>开通状态</span>
        <span>证件类型</span>
        <span>证件有效期</span>
        <span>订单号</span>
        <span>操作</span>
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
        <span v-bind:class="{ blue: node.statusName == '已实名' }">{{
          node.statusName
        }}</span
        ><span>{{ node.cardType }}</span
        ><span class="timeStatus"
          ><span>{{ node.validityTime }}</span>
          <span class="red" v-if="node.cardState == 'Y' && node.num != 0"
            >{{ node.num }}天后过期</span
          >
          <span class="green" v-if="node.cardState == 'Y' && node.num == 0"
            >正常</span
          >
          <span class="gray" v-if="node.cardState == 'N'">已过期</span>
        </span>

        <span>{{ node.applyNo }}</span>
        <span
          v-if="detailRole"
          @click="getInfo(node.id, node.vin)"
          class="btnBase"
          >详情</span
        >
        <span v-if="!detailRole" class="disableBtn">详情</span>
      </div>
      <div class="nodataLine" v-if="total <= 0">
        <div></div>
        <span>暂无数据</span>
        <div></div>
      </div>
    </div> -->
    <el-pagination @size-change="sizeChange()" @current-change="currentPageChange" :current-page.sync="currentPage"
      :page-sizes="[10, 50, 100, 500]" :page-size.sync="pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from "vue";
import auth from "../plugins/auth";
import { treeselect } from "@/api/system/dept";
import Cookies from "js-cookie";
export default {
  name: "testingAuth",
  components: {
    "el-image-viewer": () =>
      import("element-ui/packages/image/src/image-viewer"),
  },
  data() {
    return {
      isCuC: false,
      iccid: null,
      orgIds: [],
      deptOptions: [],
      props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      ispCode: [],
      ispCodeOptions: [],
      ispType: [],
      vehicleStatus: [],
      channelType: [],
      orderType: [],
      newVehicleFlag: [],
      vehicleBrand: [],
      ispTypeOptions: [],
      vehicleStatusOptions: [],
      channelTypeOptions: [],
      orderTypeOptions: [],
      newVehicleFlagOptions: [],
      vehicleBrandOptions: [],
      time: [],
      multipleSelection: [],
      showMoreSelect: false,
      openImg: false,
      imgList: [],
      today: null,
      listRole: false,
      detailRole: false,
      inputSelect: null,
      checkedList: [],
      thisVin: "",
      thisId: "",
      infoDetail: {},
      selectNum: 0,
      currentPage: 1,
      total: 100,
      pageSize: 10,
      drawer: false,
      liableInfoStatus: false,
      ownerInfoStatus: false,
      checked: false,
      isIndeterminate: false,
      title: "",
      direction: "rtl",
      address: "",
      input: "",
      type: "VIN",
      idStatus: null,
      idStatusoptions: [],
      idType: null,
      idTypeoptions: [],
      realStatus: null,
      realoptions: [],
      typeoptions: [
        {
          value: "VIN",
          label: "VIN",
        },
        {
          value: "applyNo",
          label: "订单号",
        },
      ],
      infoList: [],
    };
  },
  watch: {
    time() {
      this.getList();
    }
  },
  computed: {
    deptOptions1() {
      return this.$store.getters.deptOptions;
    },
    cardStateOptions() {
      return this.$store.getters.cardStateOptions;
    },
    cardTypeOptions() {
      return this.$store.getters.cardTypeOptions;
    },
    channelTypeOptions1() {
      return this.$store.getters.channelTypeOptions;
    },
    statusOptions() {
      return this.$store.getters.statusOptions;
    },
    vehicleStatusOptions1() {
      return this.$store.getters.vehicleStatusOptions;
    },
    orderTypeOptions1() {
      return this.$store.getters.orderTypeOptions;
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
    selectAll(val) {
      if (!val.length && !this.infoList.length) {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.selectNum = this.multipleSelection.length;
    },
    sizeChange() {
      this.currentPage = 1;
      this.getList();
    },
    resetSelect() {
      this.inputSelect = null;
      this.type = "VIN";
      this.idStatus = null;
      this.idType = null;
      this.realStatus = null;
      this.iccid = null,
        this.orgIds = [],
        this.ispCode = [],
        this.ispType = [],
        this.vehicleStatus = [],
        this.channelType = [],
        this.orderType = [],
        this.newVehicleFlag = [],
        this.vehicleBrand = [],
        this.time = [];
      this.$nextTick(() => {
        this.getList();
      })
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

    showImgViewer() {
      this.openImg = true;
      const m = (e) => { e.preventDefault() };
      document.body.style.overflow = 'hidden';
      document.addEventListener("touchmove", m, false); // 禁止页面滑动
    },
    closeImgViewer() {
      this.openImg = false;
      const m = (e) => { e.preventDefault() };
      document.body.style.overflow = 'auto';
      document.removeEventListener("touchmove", m, true);
    },
    async downloadIDCard(front, back) {
      this.imgList = [];
      if (front.length > 0) {
        this.downloadBase64(front, "身份证正面照片");
      }
      if (back.length > 0) {
        this.downloadBase64(back, "身份证背面照片");
      }
      this.$nextTick(() => {
        this.showImgViewer();
      })
    },
    async downloadBase64(file, name) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameDownload",
        serviceName: "FileInline",
        serviceParameter: {
          fileName: file,
        },
        method: "get",
        responseType: "blob",
      });
      if (res) {
        let blob = new Blob([res], { type: "image/png" });
        let url = window.URL.createObjectURL(blob);
        this.imgList.push(url);
      }
    },
    async downloadFile(file, name) {
      this.imgList = [];
      if (file == "") {
        this.$message({
          message: name + "数据不存在",
          type: "warning",
          showClose: true,
        });
      } else if (file == "-") {
        this.$message({
          message: "信息加密，无法获取！（点击眼睛ICON可解密）",
          type: "warning",
          showClose: true,
        });
      } else {
        this.downloadBase64(file, name);
      }
      this.$nextTick(() => {
        this.showImgViewer();
      })
    },
    resetAll() {
      this.infoDetail = {};
      this.drawer = false;
      this.liableInfoStatus = false;
      this.ownerInfoStatus = false;
    },
    changeEyes(which) {
      if (which == "O") {
        this.ownerInfoStatus = !this.ownerInfoStatus;
      } else {
        this.liableInfoStatus = !this.liableInfoStatus;
      }
      this.getInfo(this.thisId, this.thisVin);
    },
    async getExport(id, vin) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "export-detail",
        serviceParameter: { id: id },
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message:
            "测试期个人实名认证详情" + vin.toString() + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        console.log("getExport", res);
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "测试期个人实名认证详情" + vin.toString() + ".xlsx";
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
    checkList() {
      if (this.multipleSelection.length > 0) {
        this.checkedList = [];
        this.multipleSelection.forEach((el) => {
          this.checkedList.push(el.id);
        })
        this.$nextTick(() => {
          this.getExportList(this.checkedList);
        })

      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async getExportList(ids) {
      if (ids == 'or') {
        this.$message({
          message: '全部导出请求已发送，请耐心等候',
          type: "success",
          showClose: true,
        });
      }
      let params = {
        ids: ids.toString(),
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "export-test-list",
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      if (res) {
        console.log("getExport", res);
        this.$message({
          message:
            "测试期个人实名认证记录" + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        this.checkedList = [];
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "测试期个人实名认证记录" + this.today + ".xls";
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
          message: "测试期个人实名认证记录全部导出请求失败，请稍候再试！",
          type: "error",
          showClose: true,
        });
      }
    },
    async getInfo(id, vin) {
      this.thisId = id;
      this.thisVin = vin;
      var ownerInfoStatus = 0;
      var liableInfoStatus = 0;
      if (this.ownerInfoStatus) {
        ownerInfoStatus = 1;
      }
      if (this.liableInfoStatus) {
        liableInfoStatus = 1;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "query-detail",
        serviceParameter: {
          id: id.toString(),
          ownerInfoStatus: ownerInfoStatus,
          liableInfoStatus: liableInfoStatus,
        },
        method: "get",
      });
      if (res) {
        this.infoDetail = res.data;
        while (1) {
          if (this.infoDetail.applyTime) {
            console.log(
              this.infoDetail.applyTime,
              "==============this.infoDetail.applyTime=========="
            );
            this.drawer = true;
            break;
          }
        }
      }
      if (err) {
        console.log(err);
      }
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
      this.selectNum = 0;
      this.checked = false;
      this.isIndeterminate = false;
      let params = {
        pageSize: this.pageSize || 10,
        pageNum: this.currentPage,
        vin: null,
        applyNo: null,
        iccid: this.iccid,
        cardState: this.idStatus,
        cardType: this.idType,
        status: this.realStatus,
        orgIds: this.orgIds.toString(),
        ispCode: this.ispCode.toString(),
        ispType: this.ispType.toString(),
        vehicleStatus: this.vehicleStatus.toString(),
        channelType: this.channelType.toString(),
        orderType: this.orderType.toString(),
        newVehicleFlag: this.newVehicleFlag.toString(),
        vehicleBrand: this.vehicleBrand.toString(),
        startTime: null,
        endTime: null,
      };
      if (this.time) {
        params.startTime = this.time[0];
        params.endTime = this.time[1];
      }
      if (this.type == "VIN") {
        params.vin = this.inputSelect;
      } else if (this.type == "ICCID") {
        params.iccid = this.inputSelect;
      } else {
        params.applyNo = this.inputSelect;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "query-test-list",
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
          if (!element.cardType) {
            element.cardType = "-";
          }
          if (!element.validityTime) {
            element.validityTime = "-";
          }
          if (!element.orgName) {
            element.orgName = "-";
          }
        });
        this.checkedList = [];
        this.infoList = res.data.list;
        this.total = res.data.total;
        console.log("personList", res.data);
        this.loadingList.close();
      }
    },
  },
  created() { },
  mounted() {
    this.idTypeoptions = this.cardTypeOptions;
    this.idStatusoptions = this.cardStateOptions;
    this.channelTypeOptions = this.channelTypeOptions1;
    this.realoptions = this.statusOptions;
    this.vehicleStatusOptions = this.vehicleStatusOptions1;
    this.orderTypeOptions = this.orderTypeOptions1;
    this.ispTypeOptions = this.vehicleCardTypeOptions;
    this.newVehicleFlagOptions = this.vehicleFlagOptions;
    this.vehicleBrandOptions = this.vehicleBrandOptions1;
    this.ispCodeOptions = this.ispNameOptions;
    this.deptOptions = this.deptOptions1;
    this.getList();
    this.detailRole = auth.hasPermi("home:testingAuth:detail");
    this.listRole = auth.hasPermi("home:testingAuth:list");
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

.testingAuth {
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

  .el-divider {
    margin: toRem(15) 0 toRem(13) 0;
  }

  .infoTable {
    height: fit-content;

    >div {
      .timeStatus {
        display: flex;
        align-items: center;

        .red {
          background: $RRedColor;
        }

        .green {
          background: rgba(75, 211, 130, 1);
        }

        .gray {
          background: #5e6d82;
          opacity: 0.6;
        }

        >span:first-child {
          text-align: right;
          width: toRem(135);
        }

        >span:last-child {
          margin-left: toRem(15);
          display: inline-block;
          border-radius: 2px;
          padding: 0 toRem(5);
          width: fit-content !important;
          font-size: toRem(10);
          color: white;
          font-weight: 600;
          height: toRem(18);
          line-height: toRem(18);
        }
      }

      >span:first-child {
        width: toRem(46);
      }

      >span:nth-child(2),
      span:nth-child(3),
      span:nth-child(7) {
        width: toRem(190);
      }

      >span:nth-child(4),
      span:last-child {
        width: toRem(125);
      }

      >span:nth-child(5),
      span:nth-child(6) {
        width: toRem(240);
      }

      >span:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
