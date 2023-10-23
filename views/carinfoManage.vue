<template>
  <div class="carinfoManage" v-loading="loading">
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>T1数据管理</el-breadcrumb-item>
        <el-breadcrumb-item class="is-link">车辆信息管理<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div>
        <span @click="openUpdateDrawer(true)" v-if="changeRole">录入车辆及号卡信息</span>
        <span class="disabledBtn" v-if="!changeRole">录入车辆及号卡信息</span>
      </div>
    </div>

    <div class="tabsHead">
      <el-radio-group v-model="tabPosition" @change="tabChange">
        <el-radio-button label="1">待补齐</el-radio-button>
        <el-radio-button label="2">待上报T1</el-radio-button>
        <el-radio-button label="3">已上报T1</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent">
      <div>
        <div class="selectArea">
          <div>
            <el-input v-model="queryParams.vin" placeholder="请输入车辆识别码（VIN）" v-bind:disabled="!listRole"
              suffix-icon="el-icon-search" @change="getList"></el-input>
            <el-input v-model="iccid" placeholder="ICCID" v-bind:disabled="!listRole" suffix-icon="el-icon-search"
              @change="getList">
            </el-input>
            <el-select v-model="queryParams.operatorName" filterable placeholder="操作人" v-bind:disabled="!listRole"
              clearable @change="getList">
              <el-option v-for="item in userList" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <el-select v-model="newVehicleFlag" filterable placeholder="新车标识" v-bind:disabled="!listRole" multiple
              @change="getList" clearable collapse-tags>
              <el-option v-for="item in newVehicleFlagOptions" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="vehicleBrand" filterable placeholder="车辆品牌" v-bind:disabled="!listRole" multiple
              collapse-tags @change="getList" clearable>
              <el-option v-for="item in vehicleBrandOptions" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>

            <el-select v-model="ispType" filterable placeholder="车联网卡类型" v-bind:disabled="!listRole" multiple
              collapse-tags @change="getList" clearable>
              <el-option v-for="item in ispTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>

            <!-- <span @click="getList" v-if="listRole">按筛选搜索</span>
          <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
          <span @click="resetqueryParams" class="resetBtn" v-bind:class="{ 'disabledBtn': !listRole }">重置</span> -->
          </div>
          <div v-if="showMoreSelect">
            <el-date-picker value-format="yyyy-MM-dd" prefix-icon="el-icon-date" v-model="dateRange" clearable
              v-bind:disabled="!listRole" type="daterange" :picker-options="pickerOptions" start-placeholder="录入开始时间"
              end-placeholder="结束时间" align="right">
            </el-date-picker>
            <el-date-picker value-format="yyyy-MM-dd" prefix-icon="el-icon-date" v-model="updateTime" clearable
              v-if="tabPosition != '3'" v-bind:disabled="!listRole" type="daterange" :picker-options="pickerOptions"
              start-placeholder="更新开始时间" end-placeholder="结束时间" align="right">
            </el-date-picker>
            <el-date-picker value-format="yyyy-MM-dd" prefix-icon="el-icon-date" v-model="updateTime" clearable
              v-if="tabPosition == '3'" v-bind:disabled="!listRole" type="daterange" :picker-options="pickerOptions"
              start-placeholder="上报开始时间" end-placeholder="结束时间" align="right">
            </el-date-picker>
            <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
              placeholder="组织名称" v-model="orgIds" @change="getList"></el-cascader>
            <el-select v-model="ispCode" filterable placeholder="运营商" v-bind:disabled="!listRole" multiple collapse-tags
              clearable @change="getList">
              <el-option v-for="item in ispCodeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="vehicleStatus" filterable placeholder="车辆状态" v-bind:disabled="!listRole" multiple
              @change="getList" clearable collapse-tags>
              <el-option v-for="item in vehicleStatusOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <div style="opacity: 0;pointer-events:none"></div>
          </div>
          <span class="moreBtn" @click="showMoreSelect = true" v-if="!showMoreSelect">更多筛选项</span>
          <span class="moreBtn" @click="showMoreSelect = false" v-if="showMoreSelect">隐藏筛选项</span>
        </div>
        <div class="operationArea">
          <div>
            <i class="el-icon-warning"></i>
            <span>已选 {{ selectNum }}</span>
            <span>/{{ total }} 条</span>
          </div>
          <el-dropdown v-if="changeRole || exportRole">
            <el-button size="mini">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="tabPosition == '2' && changeRole"
                @click.native="operationList(undefined, false, '1')">批量上报</el-dropdown-item>
              <el-dropdown-item v-if="tabPosition == '2' && changeRole"
                @click.native="operationList(undefined, true, '1')">全部上报</el-dropdown-item>
              <el-dropdown-item v-if="exportRole" @click.native="operationList(undefined, false, '2')">批量导出
              </el-dropdown-item>
              <el-dropdown-item v-if="exportRole" @click.native="operationList(undefined, true, '2')">全部导出
              </el-dropdown-item>
              <el-dropdown-item v-if="tabPosition != '3' && changeRole"
                @click.native="operationList(undefined, false, '0')">批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <el-table :data="logList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;"
          ref="multipleTable" @selection-change="handleSelectionChange" class="realNameTable" @select-all="selectAll"
          @expand-change="clickOpen">
          <el-table-column type="selection" width="76" align="center" fixed="left">
          </el-table-column>
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand" style="display:flex;align-items: center;">
                <div class="openTab">
                  <el-form-item label="MSISDN">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.msisdn }}</span>
                  </el-form-item>
                  <el-form-item label="ICCID">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.iccid }}</span>
                  </el-form-item>
                  <el-form-item label="道路机动车辆生产企业名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleOrgName }}</span>
                  </el-form-item>
                  <el-form-item label="车企代码">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleOrgCode }}</span>
                  </el-form-item>
                  <el-form-item label="车辆识别代号或车架号（VIN）">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vin }}</span>
                  </el-form-item>
                  <el-form-item label="车辆类型">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleTypeName }}</span>
                  </el-form-item>
                  <el-form-item label="车辆产地">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleOriginTypeName }}</span>
                  </el-form-item>
                  <el-form-item label="车辆品牌">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleBrand }}</span>
                  </el-form-item>
                  <el-form-item label="车辆颜色">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleColour }}</span>
                  </el-form-item>
                  <el-form-item label="车辆通用名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleMode }}</span>
                  </el-form-item>
                  <el-form-item label="车辆名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleName }}</span>
                  </el-form-item>
                  <el-form-item label="车辆型号">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleNum }}</span>
                  </el-form-item>
                  <el-form-item label="车辆状态名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleStatusName }}</span>
                  </el-form-item>
                  <el-form-item label="新车标识名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.newVehicleFlagName }}</span>
                  </el-form-item>

                </div>
                <div class="openTab">
                  <el-form-item label="燃料种类">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleFuelTypeName }}</span>
                  </el-form-item>
                  <el-form-item label="发动机号码">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.engineNum }}</span>
                  </el-form-item>
                  <el-form-item label="电动机序列号">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.motorNum }}</span>
                  </el-form-item>
                  <el-form-item label="车辆出厂时间">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleDepartureTimeStr }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售时间">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleSalesTimeStr }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售信息变更时间">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleSalesChangeTimeStr }}</span>
                  </el-form-item>
                  <el-form-item label="车牌号码">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.licensePlateNumber }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售渠道名称">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleChannelName }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售渠道类型">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleChannelType }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售渠道员工姓名">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleStaffName }}</span>
                  </el-form-item>
                  <el-form-item label="车辆销售渠道地址">
                    <span v-if="props.row.infoDetail">{{ props.row.infoDetail.vehicleLogginAddress }}</span>
                  </el-form-item>
                  <el-form-item label="车联网卡类型">
                    <span v-if="props.row.infoDetail">{{ props.row.ispTypeName }}</span>
                  </el-form-item>
                  <el-form-item label="运营商">
                    <span v-if="props.row.infoDetail">{{ props.row.ispName }}</span>
                  </el-form-item>
                </div>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="operTime" width="240" align="center">
            <template slot="header">录入时间
              <div><i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.orderBy == 1 }"
                  @click="changeOrder(1)" /><i class="el-icon-caret-bottom"
                  v-bind:class="{ blueBtn: queryParams.orderBy == 0 }" @click="changeOrder(0)" /> </div>

            </template>
          </el-table-column>
          <el-table-column prop="newestTime" min-width="220" align="center">
            <template slot="header">
              <span v-if="tabPosition != '3'">最近更新时间</span>
              <span v-if="tabPosition == '3'">上报时间</span>
              <div><i class="el-icon-caret-top" v-bind:class="{ blueBtn: queryParams.orderBy == 3 }"
                  @click="changeOrder(3)" /><i class="el-icon-caret-bottom"
                  v-bind:class="{ blueBtn: queryParams.orderBy == 2 }" @click="changeOrder(2)" /> </div>
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

          <el-table-column prop="vehicleNum" label="车辆型号" min-width="180" align="center">
          </el-table-column>
          <el-table-column prop="vehicleMode" label="车型通用名称" min-width="180" align="center">
          </el-table-column>
          <el-table-column prop="statusName" label="车辆信息状态" min-width="180" align="center">
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
          <el-table-column prop="operatorName" label="操作人" width="140" align="center">
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="110" align="center">
            <template slot-scope="scope">
              <div class="operationBtn">
                <span v-if="tabPosition == '2' && changeRole" @click.stop="operationList(scope.row, false, '1')"
                  class="btnBase blueBtn">上报</span>
                <span v-if="tabPosition != '3' && changeRole" @click.stop="operationList(scope.row, false, '0')"
                  class="btnBase blueBtn redColor">删除</span>
                <span v-if="tabPosition == '2' && !changeRole" class=" blueBtn disableBtn">上报</span>
                <span v-if="tabPosition != '3' && !changeRole" class=" redColor disableBtn">删除</span>
                <span v-if="tabPosition == '3'" class=" redColor disableBtn">-</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="collapseList">
          <div class="listItem">
            <span>
              <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
              </el-checkbox>
            </span>
            <span>VIN</span>
            <span>车辆品牌</span>
            <span>车辆型号</span>
            <span>车型通用名称</span>
            <span>操作人</span>
            <span v-if="tabPosition == '3'">上报时间</span>
            <span v-if="tabPosition != '3'">录入时间</span>
            <span v-bind:class="{ infoWidth: tabPosition == '3' }">车辆信息状态</span>
            <span v-if="tabPosition != '3'">操作</span>
          </div>
          <div v-for="(node, index) in logList" :key="index" v-show="total > 0">
            <div class="listItem">
              <span>
                <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
              </span>
              <span class="iPosition" @click="clickOpen(node)"><i class="el-icon-arrow-right namePosition"
                  v-if="!node.isopen"></i>
                <i class="el-icon-arrow-down namePosition" v-if="node.isopen">
                </i>{{ node.vin }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleBrand }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleNum }}</span>
              <span @click="clickOpen(node)">{{ node.vehicleMode }}</span>
              <span style="color: #1e6fff; text-decoration: underline" @click="clickOpen(node)">{{ node.operatorName
              }}</span>
              <span @click="clickOpen(node)">{{ node.operTime }}</span>
              <span v-bind:class="{ infoWidth: tabPosition == '3' }" @click="clickOpen(node)">{{ node.statusName
              }}</span>
              <span v-if="tabPosition == '1' && changeRole" @click.stop="operationList(node, false, '0')">删除</span>
              <span v-if="tabPosition == '1' && !changeRole" class="disableBtn">删除</span>
              <span v-if="tabPosition == '2' && changeRole"><span
                  @click.stop="operationList(node, false, '1')">上报</span><span
                  @click.stop="operationList(node, false, '0')">删除</span></span>
              <span v-if="tabPosition == '2' && !changeRole"><span class="disableBtn">上报</span><span
                  class="disableBtn">删除</span></span>
            </div>
            <div v-show="node.isopen">
              <div v-if="node.infoDetail">
                <div>
                  <span>MSISDN</span>
                  <span>{{ node.infoDetail.msisdn }}</span>
                </div>
                <div>
                  <span>ICCID</span>
                  <span>{{ node.infoDetail.iccid }}</span>
                </div>
                <div>
                  <span>道路机动车辆生产企业名称</span>
                  <span>{{ node.infoDetail.vehicleOrgName }}</span>
                </div>
                <div>
                  <span>车辆识别代号或车架号（VIN）</span>
                  <span>{{ node.infoDetail.vin }}</span>
                </div>
                <div>
                  <span>车辆类型</span>
                  <span>{{ node.infoDetail.vehicleTypeName }}</span>
                </div>
                <div>
                  <span>车辆产地</span>
                  <span>{{ node.infoDetail.vehicleOriginTypeName }}</span>
                </div>
                <div>
                  <span>车辆品牌</span>
                  <span>{{ node.infoDetail.vehicleBrand }}</span>
                </div>
                <div>
                  <span>车辆名称</span>
                  <span>{{ node.infoDetail.vehicleName }}</span>
                </div>
                <div>
                  <span>车辆型号</span>
                  <span>{{ node.infoDetail.vehicleNum }}</span>
                </div>
                <div>
                  <span>车辆通用名称</span>
                  <span>{{ node.infoDetail.vehicleMode }}</span>
                </div>
                <div>
                  <span>车身颜色</span>
                  <span>{{ node.infoDetail.vehicleColour }}</span>
                </div>
              </div>
              <div v-if="node.infoDetail">
                <div>
                  <span>车辆状态名称</span>
                  <span>{{ node.infoDetail.vehicleStatusName }}</span>
                </div>
                <div>
                  <span>新车标识名称</span>
                  <span>{{ node.infoDetail.newVehicleFlagName }}</span>
                </div>
                <div>
                  <span>燃料种类</span>
                  <span>{{ node.infoDetail.vehicleFuelTypeName }}</span>
                </div>
                <div>
                  <span>发动机号码</span>
                  <span>{{ node.infoDetail.engineNum }}</span>
                </div>
                <div>
                  <span>电动机序列号</span>
                  <span>{{ node.infoDetail.motorNum }}</span>
                </div>
                <div>
                  <span>车辆出厂时间</span>
                  <span>{{ node.infoDetail.vehicleDepartureTimeStr }}</span>
                </div>
                <div>
                  <span>车辆销售时间</span>
                  <span>{{ node.infoDetail.vehicleSalesTimeStr }}</span>
                </div>
                <div>
                  <span>车辆销售信息变更时间</span>
                  <span>{{ node.infoDetail.vehicleSalesChangeTimeStr }}</span>
                </div>
                <div>
                  <span>车牌号码</span>
                  <span>{{ node.infoDetail.licensePlateNumber }}</span>
                </div>
                <div>
                  <span>车辆销售渠道名称</span>
                  <span>{{ node.infoDetail.vehicleChannelName }}</span>
                </div>
                <div>
                  <span>车辆销售渠道员工姓名</span>
                  <span>{{ node.infoDetail.vehicleStaffName }}</span>
                </div>
                <div>
                  <span>车辆销售渠道地址</span>
                  <span>{{ node.infoDetail.vehicleLogginAddress }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div> -->
        <div class="collapseListTotal">
          <span>共 {{ total }} 项数据</span>
          <el-pagination @size-change="sizeChange" @current-change="currentPageChange"
            :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]"
            :page-size.sync="queryParams.pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="updatedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确定录入该车辆及号卡信息至该组织</p>
      <p></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadfile">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确定{{ typeTitle }}该车辆及号卡数据</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="operationNodeOrList(node.id, false)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="somedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>
        确定{{ typeTitle }}所选车辆及号卡信息（共{{ checkedList.length }}项）
      </p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="somedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="operationNodeOrList(checkedList, true)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="alldialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确定全部{{ this.typeTitle }}（共{{ total }}项）</p>
      <p>此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alldialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="operationNodeOrList('all', false)">确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="updateDrawer" direction="rtl" :before-close="handleClose" size="43.05%"
      class="updateDrawer">
      <div slot="title">
        <span>录入车辆及号卡信息
          <!-- -<span v-if="templateType == 2">已同步工信部合格证信息</span><span
            v-if="templateType == 1">未同步工信部合格证信息</span> -->
        </span>
      </div>
      <el-divider></el-divider>
      <div>
        <div>
          <span></span>
          <span>选择组织</span>
        </div>
        <el-cascader class="margin65" :show-all-levels="true" v-model="deptId" :options="deptOptions"
          @change="handleChange" :props="memberDrawerDefaultProps"></el-cascader>
        <div>
          <span></span>
          <span>上报车辆及号卡信息</span>
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
            <span v-if="updateStatus == '2'" class="successP">录入成功</span>
            <span v-if="updateStatus == '3'" class="errorP">录入失败，请重试</span>
            <span v-if="updateStatus == '4'" class="warningP">已中断，请重试</span>
          </div>
          <el-progress v-bind:class="{ displayNode: updateStatus == '5' }" :percentage="percentage" :format="format"
            :status="progressStatus"></el-progress>
          <div>
            <span>{{ fileSize }}</span>
            <span v-show="updateStatus == '1'" @click="cancleUpload">取消上报</span>
            <span v-if="updateStatus == '3'">原因：上报数据格式错误</span>
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
          <span v-show="updateStatus == '2'" class="greenBtn">查看已录入车辆</span>
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
        <span v-if="updateStatus == '0'">确认录入</span>
        <span v-if="updateStatus == '1'">录入中</span>
        <span class="clickAbleBtn" v-if="updateStatus == '2'" @click="reStart">继续录入</span>
        <span class="clickAbleBtn" @click="reStart" v-if="updateStatus == '3' || updateStatus == '4'">重新录入</span>
        <span class="clickAbleBtn" v-if="updateStatus == '5'" @click="updatedialogVisible = true">确认录入</span>
      </div>
    </el-drawer>

    <el-dialog :visible.sync="errorListDialog" width="30%" center style="padding-top: 15%" :show-close="false">
      <p>错误数据详情列表</p>
      <div class="errorListDialogClass">
        <div> <span>VIN</span> <span v-for="(node, index) in upErrorList" :key="index">{{ node.vin }}</span></div>
        <div> <span>错误原因</span> <span v-for="(node, index) in upErrorList" :key="index">{{ node.errorMsg }}</span></div>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="errorListDialog = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="centerDialogVisible" width="29.5%" center :show-close="true" style="padding-top: 15%">
      <p>是否已同步工信部合格证信息</p>
      <p>请严格按实际选择</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openUpdateDrawer(false)" type="primary" style="border-color: #1e6fff; background: #1e6fff">
          已同步
        </el-button>
        <el-button type="primary" @click="openUpdateDrawer(true)">未同步</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import auth from "../plugins/auth";
import { listUser } from "@/api/system/user";
import Vue from "vue";
import { treeselect } from "@/api/system/dept";
import Cookies from "js-cookie";
export default {
  name: "carinfoManage",
  components: {},
  data() {
    return {
      isCuC: false,
      showMoreSelect: false,
      iccid: null,
      orgIds: [],
      deptOptions: [],
      props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
      ispCode: [],
      ispCodeOptions: [],
      ispType: [],
      vehicleStatus: [],
      newVehicleFlag: [],
      vehicleBrand: [],
      ispTypeOptions: [],
      vehicleStatusOptions: [],
      newVehicleFlagOptions: [],
      vehicleBrandOptions: [],
      multipleSelection: [],
      centerDialogVisible: false,
      templateType: 1,
      errorListDialog: false,
      upErrorList: [],
      errorList: [],
      exportRole: null,
      listRole: false,
      changeRole: null,
      infoDetail: null,
      updatedialogVisible: false,
      somedialogVisible: false,
      vinList: null,
      progressStatus: undefined,
      files: null,
      deptId: null,
      userList: [],
      deptOptions: [],
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      updateStatus: "0",
      updateDrawer: false,
      typeTitle: "删除",
      alldialogVisible: false,
      checkedList: [],
      dialogVisible: false,
      checked: false,
      isIndeterminate: false,
      logList: [],
      fake: "假数据",
      currentPage: 1,
      selectNum: 0,
      total: 100,
      logStatus: [
        { value: 0, label: "成功" },
        {
          value: 1,
          label: "失败",
        },
      ],
      userNameIndex: [],
      userNameList: [],
      dateRange: [],
      updateTime: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        vin: null,
        iccid: null,
        status: null,
        startTime: null,
        endTime: null,
        updateStartTime: null,
        updateEndTime: null,
        operatorName: null,
        orderBy: 0,
        orgIds: [],
        ispCode: [],
        ispType: [],
        vehicleStatus: [],
        newVehicleFlag: [],
        channelType: [],
        vehicleBrand: [],
      },
      currentPage: 1,

      tabPosition: "1",
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
      progressStatus: undefined,
      batchNo: null,
      percentage: 0,
      node: null,
    };
  },
  computed: {
    userDeptId() {
      return this.$store.getters.deptId;
    },
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
    dateRange(oldV, newV) {
      if (!(newV && oldV && oldV.length == 0 && newV.length == 0)) {
        this.getList();
      }
    },
    updateTime(oldV, newV) {
      if (!(newV && oldV && oldV.length == 0 && newV.length == 0)) {
        this.getList();
      }
    }
  },
  methods: {
    currentPageChange() {
      this.isCuC = true;
      this.getList();
    },
    changeOrder(orderBy) {
      this.queryParams.orderBy = orderBy;
      this.getList();
    },
    selectAll(val) {
      if (!val.length && !this.logList.length) {
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
    resetSelect() {
      this.queryParams.vin = null;
      this.queryParams.operatorName = null;
      this.iccid = null;
      this.newVehicleFlag = [];
      this.vehicleBrand = [];
      this.orgIds = [];
      this.ispCode = [];
      this.ispType = [];
      this.vehicleStatus = [];
      this.dateRange = [];
      this.updateTime = [];
      this.$nextTick(() => {
        this.getList();
      })
    },
    changetemplateType(num) {
      this.templateType = num;
    },
    sizeChange() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    async clickOpen(node) {
      console.log('==================clickOpen============================', node)
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameCarManage",
        serviceName: "query-vehicle-detail",
        method: "get",
        serviceParameter: {
          id: node.id,
        },
      });
      if (res) {
        node.infoDetail = res.data;
      }

    },
    reStart() {
      this.updateDrawer = false;
      this.errorList = [];
      if (this.templateType == 1) {
        this.openUpdateDrawer(true);
      } else {
        this.openUpdateDrawer(false)
      }

    },
    cancleUpload() {
      this.clearuploadstatus();
      this.reStart();
    },
    format(percentage) {
      return percentage === 100 ? "满" : `${percentage}%`;
    },
    async openUpdateDrawer(isTemplateType) {
      if (isTemplateType) {
        this.templateType = 1;
      }
      else {
        this.templateType = 2;
      }
      this.centerDialogVisible = false;
      this.updateDrawer = true;
      this.progressStatus = undefined;
      this.updateStatus = "0";
      this.deptId = null;
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameCarManage",
        serviceName: "create-batchNo",
        method: "get",
      });
      if (res) {
        this.batchNo = res.data;
      }
    },
    handleChange() { },
    async downloadtemplate() {
      if (this.templateType == 2) {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "download-template-other",
          method: "get",
          fileRead: true,
        });
        if (res) {
          this.$message({
            message: "录入车辆及号卡信息模板(已同步工信部合格证信息)获取成功，正在下载！",
            type: "success",
            showClose: true,
          });
          const blob = new Blob([res], { type: "application/vnd.ms-excel" });
          // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
          const fileName = "录入车辆及号卡信息模板(已同步工信部合格证信息)" + ".xls";
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
      } else {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "download-template",
          method: "get",
          fileRead: true,
        });
        if (res) {
          this.$message({
            message: "录入车辆及号卡信息模板获取成功，正在下载！",
            type: "success",
            showClose: true,
          });
          const blob = new Blob([res], { type: "application/vnd.ms-excel" });
          // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题upload
          const fileName = "录入车辆及号卡信息模板" + ".xls";
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
      this.updatedialogVisible = false;
      this.loading2 = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const api = this.$$api.doFormDataReq({
        url_key: "realNameCarManage",
        loading: !1,
        serviceParameter: {
          batchNo: this.batchNo.toString(),
          userName: Cookies.get("userName"),
          orgId: this.deptId.toString(),
          templateType: this.templateType,
        },
        data: {
          service_name: "upload-file",
          service_parameter: {
            batchNo: this.batchNo.toString(),
            userName: Cookies.get("userName"),
            orgId: this.deptId.toString(),
            templateType: this.templateType,
          },
        },
        files: {
          file: this.files[0],
        },
      });
      let { res, err } = await api.promise;
      if (res) {
        this.loading2.close();
        if (res.success) {
          this.getLoadingRate();
          this.updateStatus = "1";
        }
        else {
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
        this.loading2.close();
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
          url_key: "realNameCarManage",
          serviceName: "query-upload-status",
          method: "post",
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
                message: "录入成功！",
                type: "success",
                showClose: true,
              });
              let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameCarManage",
                serviceName: "query-upload-List",
                serviceParameter: { batchNo: this.batchNo },
                method: "get",
              });
              if (res) {
                this.vinList = res.data.uploadList;
              }
              this.getList();
            }
          } else if (res.businessCode == '0') {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            });
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
    async clearuploadstatus() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameCarManage",
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
        url_key: "realNameCarManage",
        serviceName: "clear-document",
        method: "post",
        serviceParameter: {
          batchNo: this.batchNo,
        },
      });
      if (res) {
      }
    },
    handleClose() {
      this.errorList = [];
      this.updateDrawer = false;
      this.getList();
    },
    checkList() {
      if (this.selectNum > 0) {
        this.somedialogVisible = true;
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async queryreportstatus() {
      console.log("queryreportstatus");
      let businessCode = '2';
      while (businessCode != "1") {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "query-report-status",
          method: "post",

        });
        if (res) {
          businessCode = res.businessCode;
          if (res.businessCode == '1') {
            if (res.data.errorList.length > 0) {
              this.upErrorList = res.data.errorList;
              this.errorListDialog = true;
              this.$message({
                message: "成功" + res.data.success + '条，失败' + res.data.error + '条',
                type: "info",
                showClose: true,
                duration: 0
              });
            } else {
              this.$message({
                message: "上报成功！",
                type: "success",
                showClose: true,
              });
              this.getList();
            }
          } else if (res.businessCode == '0') {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            });
            break;
          }

        }
        if (err) {
          console.log(err);
        }
      }
    },
    async operationNodeOrList(ids, ismore) {
      this.upErrorList = [];
      if (this.typeTitle == "上报") {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "push-vehicle",
          method: "post",
          serviceParameter: {
            ids: ids.toString(),
          },
        });
        if (res) {
          if (res.success) {
            this.queryreportstatus();
          } else {
            this.$message({
              message: res.msg,
              type: "error",
              showClose: true,
            });
          }
          // if (!ismore && ids != "all") {
          //   this.queryreportstatus(ids);
          // } else {
          //   this.queryreportstatus(ids);
          // }
        }
      } else if (this.typeTitle == "删除") {
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "delete-vehicle",
          method: "post",
          serviceParameter: {
            ids: ids.toString(),
          },
        });
        if (res) {
          if (res.data) {
            this.$message({
              message: "删除成功！",
              type: "success",
              showClose: true,
            });
          }
        }
      } else {
        var fileTypeName = '待补齐'
        var fileType = '.xls'
        if (ids == 'all') {
          fileType = '.zip';
          this.alldialogVisible = false;
          this.$message({
            message: '全部导出请求已发送，请耐心等候',
            type: "success",
            showClose: true,
          });
        } else {
          fileType = '.xls'
        }
        var ss = 0
        if (this.tabPosition == 1) {
          ss = 0
        } else if (this.tabPosition == 2) {
          ss = 1
          fileTypeName = '待上报'
        }
        else {
          ss = 2
          fileTypeName = '已上报'
        }
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameCarManage",
          serviceName: "batch-export",
          method: "get",
          serviceParameter: {
            ids: ids.toString(),
            status: ss
          },
          fileRead: true,
        });
        if (res) {
          this.$message({
            message:
              "车辆" + fileTypeName + "记录" + Cookies.get("today") + "获取成功，正在下载！",
            type: "success",
            showClose: true,
          });
          const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
          const fileName = "车辆" + fileTypeName + "记录" + Cookies.get("today") + fileType;
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
      }
      this.$nextTick(() => {
        this.dialogVisible = false;
        this.somedialogVisible = false;
        this.alldialogVisible = false;
        this.getList();
      });
    },
    operationList(node, isAll, type) {
      if (type == "0") {
        this.typeTitle = "删除";
      } else if (type == "1") {
        this.typeTitle = "上报";
      } else {
        this.typeTitle = "导出";
      }
      if (isAll) {
        this.alldialogVisible = true;
      } else {
        if (node) {
          this.dialogVisible = true;
          this.node = node;
        } else {
          this.checkList();
        }
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
      this.checked = this.selectNum == this.logList.length;
      this.isIndeterminate =
        this.selectNum > 0 && this.selectNum < this.logList.length;
      console.log("this.checkedList", this.checkedList);
    },
    clickAll() {
      this.selectNum = 0;
      this.checkedList = [];
      this.logList.forEach((el) => {
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
    tabChange() {
      this.resetqueryParams();
    },
    resetqueryParams() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        vin: null,
        status: null,
        startTime: null,
        endTime: null,
        updateStartTime: null,
        updateEndTime: null,
        orderBy: 0,
        operatorName: null,
      };
      this.dateRange = [];
      this.updateTime = [];
      this.getList();
    },
    async getList() {
      if (!this.isCuC) {
        this.queryParams.pageNum = 1;
      };
      this.isCuC = false;
      this.loading1 = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (this.dateRange) {
        this.queryParams.startTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.startTime = null;
        this.queryParams.endTime = null;
      }
      if (this.updateTime) {
        this.queryParams.updateStartTime = this.updateTime[0];
        this.queryParams.updateEndTime = this.updateTime[1];
      } else {
        this.queryParams.updateStartTime = null;
        this.queryParams.updateEndTime = null;
      }
      this.queryParams.status = "0";
      if (this.tabPosition == "2") {
        this.queryParams.status = "1";
      } else if (this.tabPosition == "3") {
        this.queryParams.status = "2";
      }
      this.queryParams.iccid = this.iccid;
      this.queryParams.newVehicleFlag = this.newVehicleFlag.toString();
      this.queryParams.vehicleBrand = this.vehicleBrand.toString();
      this.queryParams.orgIds = this.orgIds.toString();
      this.queryParams.ispCode = this.ispCode.toString();
      this.queryParams.ispType = this.ispType.toString();
      this.queryParams.vehicleStatus = this.vehicleStatus.toString();
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameCarManage",
        serviceName: "query-vehicle-list",
        serviceParameter: this.queryParams,
        method: "get",
      });
      if (res) {
        res.data.list.forEach((el) => {
          el.checked = false;
          el.isopen = false;
          el.infoDetail = null;
        });
        this.selectNum = 0;
        this.checkedList = [];
        this.checked = false;
        this.isIndeterminate = false;
        this.logList = res.data.list;
        this.total = res.data.total;
        this.loading1.close();
      }
    },
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
    this.vehicleStatusOptions = this.vehicleStatusOptions1;
    this.ispTypeOptions = this.vehicleCardTypeOptions;
    this.newVehicleFlagOptions = this.vehicleFlagOptions;
    this.vehicleBrandOptions = this.vehicleBrandOptions1;
    this.ispCodeOptions = this.ispNameOptions;
    this.deptOptions = this.deptOptions1;
    this.listRole = auth.hasPermi("home:carinfoManage:list");
    this.exportRole = auth.hasPermi("home:carinfoManage:export");
    this.changeRole = auth.hasPermi("home:carinfoManage:change");
    this.getBox();
    this.getList();
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.carinfoManage {
  .errorListDialogClass {
    padding: 0 toRem(10);
    display: flex;
    width: 100%;

    >div {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      justify-content: space-around;
    }

    >div:first-child {
      flex: 0.75;
    }

    >div:last-child {
      flex: 1.2;
    }
  }

  // .typeChoice {
  //   opacity: 0.4;
  //   font-size: toRem(16);
  //   cursor: pointer;

  //   >span:hover {
  //     color: #1d6efd;
  //   }
  // }

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
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
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

  >div:first-child {
    display: flex;
    justify-content: space-between;
    padding: 0 toRem(40);
    padding-right: toRem(27);
    height: fit-content;
    align-items: center;

    .el-breadcrumb {
      margin: toRem(9) 0 toRem(15);
    }

    >div:last-child {
      display: flex;
      height: fit-content;
      margin-top: toRem(15);

      >span {
        cursor: pointer;
        display: inline-block;
        font-size: toRem(12);
        line-height: toRem(32);
        height: toRem(32);
        opacity: 0.9;
      }

      >span:first-child {
        height: toRem(40);
        background: #1E6FFF;
        width: toRem(170);
        color: white;
        line-height: toRem(40);
        font-size: toRem(14);
      }

      >span:nth-child(2) {
        width: toRem(71);
      }

      >span:hover {
        opacity: 1;
      }
    }
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

    .openTab {
      margin-left: toRem(95);
      display: flex;
      flex-direction: column;
      margin-bottom: toRem(15);

      span {
        font-size: 14px !important;
      }

      .el-form-item {
        width: toRem(600);
        height: toRem(20);
      }
    }

    >div {
      background-color: white;
      margin: 0 toRem(40);
      min-height: toRem(785);
      height: fit-content;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
      padding: toRem(20) toRem(29);
      padding-top: toRem(35);

      .operationArea {
        margin: toRem(20) 0 toRem(11) 0;

        >div:nth-child(2) {
          width: fit-content;
        }
      }

      .operationBtn {
        display: flex;
        justify-content: space-around;

        .redColor {
          color: #f56c6c;
        }
      }

      .selectArea {
        .moreBtn {
          top: toRem(-28);
        }

        >div {
          >div {
            width: toRem(175);
          }

          >div:first-child,
          >div:nth-child(2) {
            width: toRem(275);
          }
        }
      }

      .collapseList {
        >div>div:nth-child(2) {
          >div {
            >div {
              >span:first-child {
                width: toRem(216);
              }
            }
          }
        }

        .listItem {
          cursor: pointer;

          >span:first-child {
            width: toRem(46);
          }

          >span:nth-child(2) {
            width: toRem(200);
          }

          >span:nth-child(3),
          span:nth-child(8),
          span:nth-child(9) {
            width: toRem(134);
          }

          >span:nth-child(4),
          span:nth-child(5),
          span:nth-child(6),
          span:nth-child(7) {
            width: toRem(160);
          }

          >span:last-child {
            margin-right: 0;
            display: flex;
            justify-content: space-evenly;
            color: #fc6478;

            >span:first-child {
              color: #1e6fff;
            }
          }

          .infoWidth {
            width: toRem(260) !important;
            color: #2c3e50 !important;
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
    }
  }
}
</style>