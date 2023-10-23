<template>
  <div class="orderManage">
    <el-image-viewer v-if="openImg" :on-close="closeImgViewer" :url-list="imgList" :z-index="9999" />
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">订单管理<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="selectArea">
      <div>
        <div>
          <el-select v-model="type" @change="getList">
            <el-option v-for="item in typeoptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-input v-model="inputSelect" placeholder="请输入" suffix-icon="el-icon-search" @change="getList"></el-input>
        </div>
        <el-input v-model="iccid" placeholder="ICCID" suffix-icon="el-icon-search" @change="getList">
        </el-input>
        <el-select v-model="queryParams.status" filterable placeholder="开通状态" @change="getList" clearable>
          <el-option v-for="item in realoptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="orderType" filterable placeholder="订单类型" multiple collapse-tags @change="getList" clearable>
          <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>

        <el-select v-model="newVehicleFlag" filterable placeholder="新车标识" multiple @change="getList" clearable
          collapse-tags>
          <el-option v-for="item in newVehicleFlagOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="vehicleBrand" filterable placeholder="车辆品牌" multiple collapse-tags @change="getList"
          clearable>
          <el-option v-for="item in vehicleBrandOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>

        <el-select v-model="ispCode" filterable placeholder="运营商" multiple collapse-tags clearable @change="getList">
          <el-option v-for="item in ispCodeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <!-- <span @click="getList">按筛选搜索</span>
      <span @click="resetSelect" class="resetBtn">重置</span> -->
      </div>
      <div v-if="showMoreSelect">
        <el-date-picker v-model="time" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date" type="daterange"
          clearable start-placeholder="实名认证起始时间" end-placeholder="结束时间" align="right">
        </el-date-picker>
        <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
          placeholder="组织名称" v-model="orgIds" @change="getList"></el-cascader>
        <el-select v-model="ispType" filterable placeholder="车联网卡类型" multiple collapse-tags @change="getList" clearable>
          <el-option v-for="item in ispTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="vehicleStatus" filterable placeholder="车辆状态" multiple @change="getList" clearable
          collapse-tags>
          <el-option v-for="item in vehicleStatusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="channelType" filterable placeholder="渠道类型" multiple collapse-tags @change="getList" clearable>
          <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <div style="opacity: 0;pointer-events:none"></div>
        <div style="opacity: 0;pointer-events:none"></div>
      </div>
      <span class="moreBtn" @click="showMoreSelect = true" v-if="!showMoreSelect">更多筛选项</span>
      <span class="moreBtn" @click="showMoreSelect = false" v-if="showMoreSelect">隐藏筛选项</span>

    </div>
    <el-divider></el-divider>
    <div class="operationArea">
      <div>
        <i class="el-icon-warning"></i>
        <span>已选 {{ selectNum }}</span>
        <span> /{{ total }} 条</span>
      </div>
      <span @click.stop="checkList">导出</span>
    </div>
    <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;" ref="multipleTable"
      @selection-change="handleSelectionChange" class="realNameTable" @select-all="selectAll">
      <el-table-column type="selection" width="76" align="center" fixed="left">
      </el-table-column>
      <el-table-column width="240" align="center">
        <template slot="header">订单时间
          <div><i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.applyDesc == 2 }"
              @click="changeOrder(2)" /><i class="el-icon-caret-bottom"
              v-bind:class="{ blueBtn: queryParams.applyDesc == 1 }" @click="changeOrder(1)" /> </div>

        </template>
        <template slot-scope="scope">{{ scope.row.applyTime }}
        </template>
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
      <el-table-column prop="orderTypeName" label="订单类型" width="135" align="center">
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
      <el-table-column prop="channelTypeName" label="渠道类型" width="140" align="center">
      </el-table-column>
      <el-table-column prop="ispTypeName" label="车联网卡类型" width="140" align="center">
      </el-table-column>
      <el-table-column prop="userName" label="操作人" width="140" align="center">
      </el-table-column>
      <el-table-column prop="userId" label="操作ID" width="140" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="110" align="center">
        <template slot-scope="scope">
          <span @click="opendrawer(scope.row)" class="btnBase blueBtn">详情</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="infoTable">
      <div class="tableHead">
        <span>
          <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
          </el-checkbox>
        </span>
        <span>订单号</span>
        <span>VIN</span>
        <span>ICCID</span>
        <span>订单类型</span>
        <span class="timeStatus">订单时间<i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.applyDesc == 2 }"
            @click="changeOrder(2)" /><i class="el-icon-caret-bottom"
            v-bind:class="{ blueBtn: queryParams.applyDesc == 1 }" @click="changeOrder(1)" /></span>
        <span>操作人</span>
        <span>操作ID</span>
        <span>操作</span>
      </div>
      <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
        <span>
          <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
        </span>
        <span>{{ node.applyNo }}</span>
        <span>{{ node.vin }}</span>
        <span>{{ node.iccid }}</span>
        <span>{{ node.orderTypeName }}</span>
        <span>{{ node.applyTime }}</span>
        <span>{{ node.userName }}</span>
        <span>{{ node.userId }}</span>
        <span class="blueBtn" @click="opendrawer(node)">详情</span>
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
    <el-drawer :visible.sync="drawer" direction="rtl" size="43.05%" class="drawer" :before-close="resetAll">
      <div slot="title">
        <span><span>订单管理-详情</span></span>
        <span @click="getExport(infoDetail.status)">导出</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div class="baseInfo" v-if="drawerType != 'AUTH_DW_GB'">
          <span><span>订单号</span>{{ infoDetail.applyNo }}</span>
          <span><span>申请时间</span>{{ infoDetail.applyTime }}</span>
          <span v-if="infoDetail.finishTime"><span>审核时间</span>{{ infoDetail.finishTime }}</span>
          <span><span>操作人</span>{{ infoDetail.userName }}</span>
          <span><span>操作ID</span>{{ infoDetail.userId }}</span>
          <span v-if="infoDetail.status == '2'" style="color: #e34d59"><span>拒绝原因</span>{{ infoDetail.remark }}</span>
        </div>
        <div class="baseInfo" v-if="drawerType == 'AUTH_DW_GB' && infoDetail.utilData">
          <span><span>订单号</span>{{ infoDetail.utilData.applyNo }}</span>
          <span><span>申请时间</span>{{ infoDetail.utilData.applyTimeStr }}</span>
          <span v-if="infoDetail.finishTime"><span>审核时间</span>{{ infoDetail.finishTime
          }}</span>
          <span><span>操作人</span>{{ infoDetail.utilData.userName }}</span>
          <span><span>操作ID</span>{{ infoDetail.utilData.userId }}</span>
          <span v-if="infoDetail.utilData.status == '2'" style="color: #e34d59"><span>拒绝原因</span>{{
            infoDetail.utilData.remark
          }}</span>
        </div>
        <div class="infoDialog ownerInfoDialog" v-if="drawerType == 'AUTH_GR_UP'">
          <p></p>
          <span>车主信息</span>
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
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
              <span>发票</span><span class="blueBtn" @click="downloadFile(infoDetail.invoice, '发票照片')"
                v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
              <span>行驶证</span><span class="blueBtn" @click="downloadFile(infoDetail.drivingLicense, '行驶证照片')"
                v-if="liableInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击查看</span>
            </div>
            <div>
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
        <span v-if="drawerType == 'AUTH_GR_UP'">以下为当前实名信息</span>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name" v-if="drawerType == 'AUTH_GR_GB'">
          <p></p>
          <span>解绑信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="ownerInfoStatus" @click="changeEyes('OW')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!ownerInfoStatus" @click="changeEyes('OW')" />
          <div>
            <div>
              <span>VIN</span><span>{{ infoDetail.vin }}</span>
            </div>
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
              <span>联系方式</span><span>{{ infoDetail.phone }}</span>
            </div>
            <div v-if="infoDetail.clearReason" style="color: #e34d59">
              <span>解绑原因</span><span>{{ infoDetail.clearReason }}</span>
            </div>
            <div v-if="infoDetail.photo">
              <span>证件照片</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.photo,
                  '证件照片'

                )
              " v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
          </div>
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
        <div class="infoDialog ownerInfoDialog" v-if="infoDetail.utilData">
          <p></p>
          <span>解绑信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="orgInfoStatus" @click="changeEyes('OR')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!orgInfoStatus" @click="changeEyes('OR')" />
          <div>
            <div>
              <span>VIN</span><span>{{ infoDetail.utilData.vin }}</span>
            </div>
            <div>
              <span>单位名称</span><span>{{ infoDetail.utilData.orgName }}</span>
            </div>
            <div>
              <span>统一社会信用代码</span><span>{{ infoDetail.utilData.orgCode }}</span>
            </div>
            <div>
              <span>单位证件类型</span><span>{{ infoDetail.utilData.certType }}</span>
            </div>
            <div>
              <span>联系人</span><span>{{ infoDetail.utilData.handlerName }}</span>
            </div>
            <div>
              <span>联系方式</span><span>{{ infoDetail.utilData.handlerPhone }}</span>
            </div>
            <div v-if="infoDetail.utilData.clearReason" style="color: #e34d59">
              <span>解绑原因</span><span>{{ infoDetail.utilData.clearReason }}</span>
            </div>
          </div>
        </div>
        <div class="infoDialog" v-for="(node, index) in infoDetail.cardListData" :key="index">
          <p></p>
          <span>卡信息</span>
          <div>
            <div>
              <span>MSISDN</span><span>{{ node.msisdn
              }}<img src="../assets/images/dialog-file.png" @click="copy(node.msisdn)" /></span>
            </div>
            <div>
              <span>ICCID</span><span>{{ node.iccid
              }}<img src="../assets/images/dialog-file.png" @click="copy(node.iccid)" /></span>
            </div>
            <div>
              <span>开通状态</span><span>{{ node.cardStatusName }}</span>
            </div>
          </div>
        </div>
        <span v-if="infoDetail.cardListData" class="tipClass">注：该车辆共
          {{ infoDetail.cardListData.length }} 张号卡，所有号卡将同步操作</span>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name" v-if="drawerType != 'AUTH_GR_GB'">
          <p></p>
          <span>车主信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="ownerInfoStatus" @click="changeEyes('OW')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!ownerInfoStatus" @click="changeEyes('OW')" />
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
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
              <span>发票</span><span class="blueBtn" @click="downloadFile(infoDetail.invoice, '发票照片')"
                v-if="ownerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
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
            <div>
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
        <div class="infoDialog orgInfoDialog" v-show="infoDetail.orgName">
          <p></p>
          <span>单位登记信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="orgInfoStatus" @click="changeEyes('OR')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!orgInfoStatus" @click="changeEyes('OR')" />
          <div>
            <div>
              <span>单位名称</span><span>{{ infoDetail.orgName }}</span>
            </div>
            <div>
              <span>统一社会信用代码</span><span>{{ infoDetail.orgCode }}</span>
            </div>
            <div>
              <span>证件地址</span><span>{{ infoDetail.certAddress }}</span>
            </div>
            <div>
              <span>通讯地址</span><span>{{ infoDetail.mailAddress }}</span>
            </div>
            <div v-show="infoDetail.certPhoto">
              <span>单位证件</span><span class="blueBtn" @click="downloadFile(infoDetail.certPhoto, '单位证件照')"
                v-if="orgInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!orgInfoStatus">点击查看</span>
            </div>
            <div>
              <span>单位授权委托书</span><span class="blueBtn" @click="
                downloadFile(infoDetail.authPaper, '单位授权委托书照片')
              " v-if="orgInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!orgInfoStatus">点击查看</span>
            </div>
          </div>
        </div>
        <div class="infoDialog orgOwnerInfoDialog" v-show="infoDetail.handlerName">
          <p></p>
          <span>单位责任人信息</span>
          <img src="../assets/images/eyes.png" v-show="false" v-if="handlerInfoStatus" @click="changeEyes('H')" />
          <img src="../assets/images/eyesClose.png" v-show="false" v-if="!handlerInfoStatus" @click="changeEyes('H')" />
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
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
              <span>发票</span><span class="blueBtn" @click="downloadFile(infoDetail.invoice, '发票照片')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.isInvoicesFlag && infoDetail.isInvoicesFlag == 1">
              <span>行驶证</span><span class="blueBtn" @click="downloadFile(infoDetail.drivingLicense, '行驶证照片')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
            <div>
              <span>证件照片</span><span class="blueBtn" @click="
                downloadIDCard(
                  infoDetail.handlerFrontPhoto,
                  infoDetail.handlerBackPhoto
                )
              " v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.handlerPhoto && infoDetail.handlerPhoto.length > 0">
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.handlerPhoto, '正面免冠照片')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.videoScreenshotFirst && infoDetail.videoScreenshotFirst.length > 0">
              <span>人像视频截图一</span><span class="blueBtn" @click="downloadFile(infoDetail.videoScreenshotFirst, '人像视频截图一')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
            <div v-show="infoDetail.videoScreenshotSecond && infoDetail.videoScreenshotSecond.length > 0">
              <span>人像视频截图二</span><span class="blueBtn" @click="downloadFile(infoDetail.videoScreenshotSecond, '人像视频截图二')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
            </div>
          </div>
        </div>

        <div class="infoDialog carInfoDialog"
          v-show="!(drawerType == 'AUTH_GR_GB' || drawerType == 'AUTH_DW_GB' || drawerType == 'AUTH_DW')">
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
        <span class="btnBase">通过</span>
        <span class="btnBase">拒绝</span>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
export default {
  name: "orderManage",
  components: {
    "el-image-viewer": () =>
      import("element-ui/packages/image/src/image-viewer"),
  },
  data() {
    return {
      isCuC: false,
      showMoreSelect: false,
      orderTypeOptions: [],
      iccid: null,
      orderType: [],
      orgIds: [],
      props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      ispCode: [],
      ispType: [],
      vehicleStatus: [],
      newVehicleFlag: [],
      channelType: [],
      vehicleBrand: [],
      deptOptions: [],
      ispCodeOptions: [],
      ispTypeOptions: [],
      vehicleStatusOptions: [],
      channelTypeOptions: [],
      newVehicleFlagOptions: [],
      vehicleBrandOptions: [],
      multipleSelection: [],
      openImg: false,
      imgList: [],
      node: null,
      ownerInfoStatus: false,
      liableInfoStatus: false,
      orgInfoStatus: false,
      handlerInfoStatus: false,
      typeOptions: [
        {
          label: "实名",
          value: 1,
        },
        {
          label: "解绑",
          value: 2,
        },
      ],
      checkedList: [],
      selectNum: 0,
      total: 10,
      checked: false,
      isIndeterminate: false,
      type: "VIN",
      inputSelect: null,
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
      queryParams: {
        pageSize: 10,
        pageNum: 1,
        applyDesc: 1,
        vin: null,
        iccid: null,
        applyNo: null,
        status: null,
        orderType: [],
        applyStartTime: null,
        applyEndTime: null,
        orgIds: [],
        ispCode: [],
        ispType: [],
        vehicleStatus: [],
        newVehicleFlag: [],
        channelType: [],
        vehicleBrand: [],
      },
      time: [],
      infoDetail: {},
      drawer: false,
      infoList: [],
      drawerType: null,
      today: null,
    };
  },
  watch: {
    time() {
      this.getList();
    }
  },
  computed: {
    statusOptions() {
      return this.$store.getters.statusOptions;
    },
    deptOptions1() {
      return this.$store.getters.deptOptions;
    },

    cardTypeOptions() {
      return this.$store.getters.cardTypeOptions;
    },
    vehicleStatusOptions1() {
      return this.$store.getters.vehicleStatusOptions;
    },
    channelTypeOptions1() {
      return this.$store.getters.channelTypeOptions;
    },
    vehicleCardTypeOptions() {
      return this.$store.getters.vehicleCardTypeOptions;
    },
    orderTypeOptions1() {
      return this.$store.getters.orderTypeOptions;
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
    sizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    async getExport(status) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "exportFlowDataDetail",
        serviceParameter: { id: this.node.id, type: this.node.type },
        method: "get",
        fileRead: true,
      });
      var statusName = "";
      var filename = "订单管理";
      if (res) {
        this.$message({
          message:
            filename +
            statusName +
            "详情" +
            this.node.vin.toString() +
            "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        console.log("getExport", res);
        const blob = new Blob([res], { type: "application/vnd.ms-excel" });
        // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName =
          filename + statusName + "详情" + this.node.vin.toString() + ".xlsx";
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
    resetAll() {
      this.infoDetail = {};
      this.drawer = false;
      this.ownerInfoStatus = false;
      this.liableInfoStatus = false;
      this.orgInfoStatus = false;
      this.handlerInfoStatus = false;
    },
    changeEyes(which) {
      if (which == "OW") {
        this.ownerInfoStatus = !this.ownerInfoStatus;
      } else if (which == "L") {
        this.liableInfoStatus = !this.liableInfoStatus;
      } else if (which == "OR") {
        this.orgInfoStatus = !this.orgInfoStatus;
      } else {
        this.handlerInfoStatus = !this.handlerInfoStatus;
      }
      this.getDetail(this.node);
    },
    checkList() {
      console.log('==========checkList================')
      if (this.selectNum > 0) {
        this.getExportList(this.checkedList);
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async getExportList(ids) {
      console.log("getExportList");
      let params = {
        ids: ids.toString(),
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameOrder",
        serviceName: "export-order-list",
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      if (res) {
        console.log("getExport", res);
        this.$message({
          message: "订单列表" + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "订单列表" + this.today + ".xlsx";
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
    resetSelect() {
      this.type = "VIN";
      this.inputSelect = null;
      this.orderType = [];
      this.queryParams.applyStartTime = null;
      this.queryParams.applyEndTime = null;
      this.queryParams.status = null;
      this.iccid = null;
      this.orderType = [];
      this.newVehicleFlag = [];
      this.vehicleBrand = [];
      this.orgIds = [];
      this.ispCode = [];
      this.ispType = [];
      this.vehicleStatus = [];
      this.channelType = [];
      this.time = [];
      this.$nextTick(() => {
        this.getList();
      })
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
    async getDetail(node) {
      var handlerInfoStatus = 0;
      var ownerInfoStatus = 0;
      var orgInfoStatus = 0;
      var liableInfoStatus = 0;
      if (this.handlerInfoStatus) {
        handlerInfoStatus = 1;
      }
      if (this.ownerInfoStatus) {
        ownerInfoStatus = 1;
      }
      if (this.orgInfoStatus) {
        orgInfoStatus = 1;
      }
      if (this.liableInfoStatus) {
        liableInfoStatus = 1;
      }
      let params = {
        id: node.id,
        type: node.type,
        handlerInfoStatus: handlerInfoStatus,
        ownerInfoStatus: ownerInfoStatus,
        orgInfoStatus: orgInfoStatus,
        liableInfoStatus: liableInfoStatus,
      };
      this.drawerType = node.type;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "openFormDetail",
        serviceParameter: params,
        method: "get",
      });
      if (res) {
        this.infoDetail = res.data;
      }
      if (err) {
        console.log(err);
      }
    },
    opendrawer(node) {
      this.node = node;
      this.drawer = true;

      this.getDetail(node);
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
      this.checkedList = [];
      this.selectNum = 0;
      if (this.time) {
        this.queryParams.applyStartTime = this.time[0];
        this.queryParams.applyEndTime = this.time[1];
      }
      else {
        this.queryParams.applyStartTime = null;
        this.queryParams.applyEndTime = null;
      }
      this.queryParams.vin = null;
      this.queryParams.iccid = null;
      this.queryParams.applyNo = null;
      if (this.type == "VIN") {
        this.queryParams.vin = this.inputSelect;
      } else if (this.type == "ICCID") {
        this.queryParams.iccid = this.inputSelect;
      } else {
        this.queryParams.applyNo = this.inputSelect;
      }
      this.queryParams.iccid = this.iccid;
      this.queryParams.orderType = this.orderType.toString();
      this.queryParams.newVehicleFlag = this.newVehicleFlag.toString();
      this.queryParams.vehicleBrand = this.vehicleBrand.toString();
      this.queryParams.orgIds = this.orgIds.toString();
      this.queryParams.ispCode = this.ispCode.toString();
      this.queryParams.ispType = this.ispType.toString();
      this.queryParams.channelType = this.channelType.toString();
      this.queryParams.vehicleStatus = this.vehicleStatus.toString();
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameOrder",
        serviceName: "query-order-list",
        serviceParameter: this.queryParams,
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
        this.checked = false;
        this.isIndeterminate = false;
        this.infoList = res.data.list;
        this.total = res.data.total;
        console.log("orderList", res.data);
      }
      console.log(this.queryParams);
      this.loadingList.close();
    },
    changeOrder(num) {
      this.queryParams.applyDesc = num;
      this.getList();
    },
  },
  created() { },
  mounted() {
    this.realoptions = this.statusOptions;
    this.vehicleStatusOptions = this.vehicleStatusOptions1;
    this.channelTypeOptions = this.channelTypeOptions1;
    this.orderTypeOptions = this.orderTypeOptions1;
    this.ispTypeOptions = this.vehicleCardTypeOptions;
    this.newVehicleFlagOptions = this.vehicleFlagOptions;
    this.vehicleBrandOptions = this.vehicleBrandOptions1;
    this.ispCodeOptions = this.ispNameOptions;
    this.deptOptions = this.deptOptions1;
    this.getList();
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

.tipClass {
  font-size: .14rem;
  color: rgba(19, 20, 21, .69);
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  margin-top: 0.15rem;
  margin-left: 0.41rem;
}

.orderManage {
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

      >div:nth-child(3) {
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
      .timeStatus {
        position: relative;

        >i {
          position: absolute;
          top: toRem(9);
          right: toRem(10);
          cursor: pointer;
        }

        >i:last-child {
          top: toRem(16);
        }
      }

      >span:first-child {
        width: toRem(46);
      }

      >span:nth-child(2),
      span:nth-child(4) {
        width: toRem(220);
      }

      >span:nth-child(3) {
        width: toRem(175);
      }

      >span:nth-child(5) {
        width: toRem(130);
      }

      >span:nth-child(6) {
        width: toRem(180);
      }

      >span:nth-child(7) {
        width: toRem(120);
      }

      >span:nth-child(8) {
        width: toRem(180);
      }

      >span:nth-child(9) {
        width: toRem(100);
      }

      >span:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
