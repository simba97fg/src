<template>
  <div class="manualAudit" ref="manualAudit">
    <el-image-viewer v-if="openImg" :on-close="closeImgViewer" :url-list="imgList" :z-index="9999" />
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item class="is-link">人工审核</el-breadcrumb-item>
    </el-breadcrumb>
    <el-dialog :visible.sync="moreRefuseDialog" width="29.5%" center :show-close="false" style="padding-top: 15%"
      class="refuseDialog">
      <p><span>*</span>请填写该批次被拒绝原因</p>
      <el-divider></el-divider>
      <el-input type="textarea" autosize placeholder="请尽量准确、易理解的描述原因" v-model="refuseInput" @input="checkRefuseInput"
        maxlength="30" show-word-limit suffix-icon="">
      </el-input>
      <el-divider></el-divider>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moreRefuseDialog = false">取 消</el-button>
        <el-button type="primary" @click="auditOperation(false, checkedList)" v-if="refuseInputOk">确 定</el-button>
        <el-button type="primary" class="disabledBtn" v-if="!refuseInputOk">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="moreDialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认该批次申请通过审核</p>
      <p style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        ">
        后台将自动进行T1上报以完成实名登记
        <span>数据状态同步约需5分钟</span>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moreDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="auditOperation(true, checkedList)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="refuseDialog" width="29.5%" center :show-close="false" style="padding-top: 15%"
      class="refuseDialog">
      <p v-if="activeName == 'third'">查看拒绝原因</p>
      <p v-if="activeName == 'first'"><span>*</span>请填写拒绝原因</p>
      <el-divider></el-divider>
      <p v-if="activeName == 'third'">
        {{ reason }}
      </p>
      <el-input v-if="activeName == 'first'" type="textarea" autosize placeholder="请尽量准确、易理解的描述原因" v-model="refuseInput"
        maxlength="30" show-word-limit @input="checkRefuseInput" suffix-icon="">
      </el-input>
      <el-divider></el-divider>
      <span slot="footer" class="dialog-footer">
        <el-button @click="refuseDialog = false" v-if="activeName == 'third'">关闭</el-button>
        <el-button @click="refuseDialog = false" v-if="activeName == 'first'">取 消</el-button>
        <el-button type="primary" @click="auditOperation(false, node.id)" v-if="activeName == 'first' && refuseInputOk">
          确 定</el-button>
        <el-button type="primary" class="disabledBtn" v-if="!(activeName == 'first' && refuseInputOk)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认通过审核</p>
      <p style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        ">
        后台将自动进行T1上报以完成实名登记
        <span>数据状态同步约需5分钟</span>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="auditOperation(true, node.id)">确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="drawer" direction="rtl" size="43.05%" class="drawer" :before-close="resetAll">
      <div slot="title">
        <span><span v-if="tabPosition == '1'">个人解绑申请详情</span>
          <span v-if="tabPosition == '2'">个人其他证件详情</span>
          <span v-if="tabPosition == '3'">单位证件认证详情</span>
          <span v-if="tabPosition == '4'">单位解绑申请详情</span>
          <span v-if="tabPosition == '5'">其他证件更新详情</span>-<span v-if="activeName == 'first'">待审核</span>
          <span v-if="activeName == 'second'">已通过</span>
          <span v-if="activeName == 'third'">已拒绝</span></span>
        <span @click="getExport(infoDetail.status)" v-if="exportRole">导出</span>
      </div>
      <el-divider></el-divider>
      <div>
        <div class="baseInfo" v-if="tabPosition != '4'">
          <span><span>订单号</span>{{ infoDetail.applyNo }}</span>
          <span><span>申请时间</span>{{ infoDetail.applyTime }}</span>
          <span v-if="infoDetail.status == '0'"><span>审核时间</span>{{ infoDetail.finishTime }}</span>
          <span v-if="infoDetail.status == '1'"><span>审核通过</span>{{ infoDetail.finishTime }}</span>
          <span v-if="infoDetail.status == '2'"><span>审核拒绝</span>{{ infoDetail.finishTime }}</span>
          <span><span>操作人</span>{{ infoDetail.userName }}</span>
          <span><span>操作ID</span>{{ infoDetail.userId }}</span>
          <span v-if="infoDetail.status == '2'" style="color: #e34d59"><span>拒绝原因</span>{{ infoDetail.remark }}</span>
        </div>
        <div class="baseInfo" v-if="tabPosition == '4' && infoDetail.utilData">
          <span><span>订单号</span>{{ infoDetail.utilData.applyNo }}</span>
          <span><span>申请时间</span>{{ infoDetail.utilData.applyTimeStr }}</span>
          <span v-if="infoDetail.utilData.status == '0'"><span>审核时间</span>{{ infoDetail.utilData.finishTimeStr }}</span>
          <span v-if="infoDetail.utilData.status == '1'"><span>审核通过</span>{{ infoDetail.utilData.finishTimeStr }}</span>
          <span v-if="infoDetail.utilData.status == '2'"><span>审核拒绝</span>{{ infoDetail.utilData.finishTimeStr }}</span>
          <span><span>操作人</span>{{ infoDetail.utilData.userName }}</span>
          <span><span>操作ID</span>{{ infoDetail.utilData.userId }}</span>
          <span v-if="infoDetail.utilData.status == '2'" style="color: #e34d59"><span>拒绝原因</span>{{
          infoDetail.utilData.remark
          }}</span>
        </div>
        <div class="infoDialog ownerInfoDialog" v-if="tabPosition == '5'">
          <p></p>
          <span>车主信息</span>
          <img src="../assets/images/eyes.png" v-if="liableInfoStatus" @click="changeEyes('L')" />
          <img src="../assets/images/eyesClose.png" v-if="!liableInfoStatus" @click="changeEyes('L')" />
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
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>

            <div>
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.wtPhoto, '正面免冠照片')"
                v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图一</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotFirst,
                  '人像视频截图一'
                )
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图二</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotSecond,
                  '人像视频截图二'
                )
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
          </div>
        </div>
        <span v-if="tabPosition == '5'">以下为当前实名信息</span>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name" v-if="tabPosition == '1'">
          <p></p>
          <span>解绑信息</span>
          <img src="../assets/images/eyes.png" v-if="ownerInfoStatus" @click="changeEyes('OW')" />
          <img src="../assets/images/eyesClose.png" v-if="!ownerInfoStatus" @click="changeEyes('OW')" />
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
          <img src="../assets/images/eyes.png" v-if="orgInfoStatus" @click="changeEyes('OR')" />
          <img src="../assets/images/eyesClose.png" v-if="!orgInfoStatus" @click="changeEyes('OR')" />
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
              }}<img src="../assets/images/dialog-file.png" @click="copy(infoDetail.msisdn)" /></span>
            </div>
            <div>
              <span>ICCID</span><span>{{ node.iccid
              }}<img src="../assets/images/dialog-file.png" @click="copy(infoDetail.iccid)" /></span>
            </div>
            <div>
              <span>开通状态</span><span>{{ node.cardStatusName }}</span>
            </div>
          </div>
        </div>
        <span v-if="infoDetail.cardListData">注：该车辆共
          {{ infoDetail.cardListData.length }} 张号卡，所有号卡将同步操作</span>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name" v-if="tabPosition != '1'">
          <p></p>
          <span>车主信息</span>
          <img src="../assets/images/eyes.png" v-if="ownerInfoStatus" @click="changeEyes('OW')" />
          <img src="../assets/images/eyesClose.png" v-if="!ownerInfoStatus" @click="changeEyes('OW')" />
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
            <div>
              <span>证件照片</span><span class="blueBtn" @click="
                downloadIDCard(infoDetail.frontPhoto, infoDetail.backPhoto)
              " v-if="ownerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击下载</span>
            </div>

            <div>
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.photo, '正面免冠照片')"
                v-if="ownerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图一</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.videoScreenshotFirst,
                  '人像视频截图一'
                )
              " v-if="ownerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图二</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.videoScreenshotSecond,
                  '人像视频截图二'
                )
              " v-if="ownerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!ownerInfoStatus">点击下载</span>
            </div>
          </div>
        </div>

        <div class="infoDialog wtInfoDialog" v-show="infoDetail.wtFlag == 1">
          <p></p>
          <span>委托人信息</span>
          <img src="../assets/images/eyes.png" v-if="liableInfoStatus" @click="changeEyes('L')" />
          <img src="../assets/images/eyesClose.png" v-if="!liableInfoStatus" @click="changeEyes('L')" />
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
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>

            <div>
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.wtPhoto, '正面免冠照片')"
                v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图一</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotFirst,
                  '人像视频截图一'
                )
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
            <div>
              <span>人像视频截图二</span><span class="blueBtn" @click="
                downloadFile(
                  infoDetail.wtVideoScreenshotSecond,
                  '人像视频截图二'
                )
              " v-if="liableInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!liableInfoStatus">点击下载</span>
            </div>
          </div>
        </div>
        <div class="infoDialog orgInfoDialog" v-show="infoDetail.orgName">
          <p></p>
          <span>单位登记信息</span>
          <img src="../assets/images/eyes.png" v-if="orgInfoStatus" @click="changeEyes('OR')" />
          <img src="../assets/images/eyesClose.png" v-if="!orgInfoStatus" @click="changeEyes('OR')" />
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
            <div>
              <span>单位证件</span><span class="blueBtn" @click="downloadFile(infoDetail.certPhoto, '单位证件照')"
                v-if="orgInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!orgInfoStatus">点击下载</span>
            </div>
            <div>
              <span>单位授权委托书</span><span class="blueBtn" @click="
                downloadFile(infoDetail.authPaper, '单位授权委托书照片')
              " v-if="orgInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!orgInfoStatus">点击下载</span>
            </div>
          </div>
        </div>
        <div class="infoDialog orgOwnerInfoDialog" v-show="infoDetail.handlerName">
          <p></p>
          <span>单位责任人信息</span>
          <img src="../assets/images/eyes.png" v-if="handlerInfoStatus" @click="changeEyes('H')" />
          <img src="../assets/images/eyesClose.png" v-if="!handlerInfoStatus" @click="changeEyes('H')" />
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
              <span>证件照片</span><span class="blueBtn" @click="
                downloadIDCard(
                  infoDetail.handlerFrontPhoto,
                  infoDetail.handlerBackPhoto
                )
              " v-if="handlerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击下载</span>
            </div>

            <div>
              <span>人像视频</span><span class="blueBtn" @click="downloadFile(infoDetail.handlerVideo, '人像视频')"
                v-if="handlerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击下载</span>
            </div>
            <div>
              <span>正面免冠照片</span><span class="blueBtn" @click="downloadFile(infoDetail.handlerPhoto, '正面免冠照片')"
                v-if="handlerInfoStatus">点击下载</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击下载</span>
            </div>
          </div>
        </div>
        <div class="infoDialog carInfoDialog" v-show="infoDetail.vin && tabPosition != '1'">
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
      <el-divider v-if="changeRole && activeName == 'first'"></el-divider>
      <div v-show="changeRole && activeName == 'first'">
        <span class="btnBase" @click="dialogVisible = true">通过</span>
        <span class="btnBase" @click="refuseDialog = true">拒绝</span>
      </div>
    </el-drawer>

    <div class="tabsHead">
      <el-radio-group v-model="tabPosition">
        <el-radio-button label="1">个人车辆解绑</el-radio-button>
        <el-radio-button label="4">单位车辆解绑</el-radio-button>
        <el-radio-button label="2">个人其他证件</el-radio-button>
        <el-radio-button label="3">单位证件</el-radio-button>
        <el-radio-button label="5" v-show="false">其他证件更新</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent">
      <div class="selectArea">
        <el-select v-model="type" v-bind:disabled="!listRole">
          <el-option v-for="item in typeoptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-input v-model="inputSelect" placeholder="请输入" v-bind:disabled="!listRole"></el-input>

        <el-select v-model="idType" filterable placeholder="证件类型" v-bind:disabled="!listRole">
          <el-option v-for="item in idTypeoptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-select v-bind:disabled="!listRole" v-model="type" filterable placeholder="是否委托" v-show="false">
        </el-select>
        <el-date-picker v-bind:disabled="!listRole" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
          v-model="time" type="datetimerange" :picker-options="pickerOptions" start-placeholder="申请起始时间"
          end-placeholder="结束时间" align="right">
        </el-date-picker>
        <span @click="setParameters" v-if="listRole">按筛选搜索</span>
        <span class="disabledBtn" v-if="!listRole">按筛选搜索</span>
        <span @click="resetSelect" class="resetBtn" v-bind="{ 'disabledBtn:': listRole }">重置</span>
      </div>
      <el-divider></el-divider>
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane label="待审核" name="first"></el-tab-pane>
        <el-tab-pane label="已通过" name="second"></el-tab-pane>
        <el-tab-pane label="已拒绝" name="third"></el-tab-pane>
        <el-dropdown v-if="tabPosition != '3' && tabPosition != '4'">
          <el-button size="mini">
            更多操作<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="activeName == 'first' && changeRole" @click.native="checkList(true, true)">批量通过
            </el-dropdown-item>
            <el-dropdown-item v-if="activeName == 'first' && changeRole" @click.native="checkList(true, false)">批量拒绝
            </el-dropdown-item>
            <el-dropdown-item @click.native="checkList(false)" v-if="exportRole">导出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span v-if="tabPosition == '3' || tabPosition == '4'" @click="checkList(false)">导出</span>
      </el-tabs>
      <div class="infoArea">
        <div class="operationArea">
          <div>
            <i class="el-icon-warning"></i>
            <span>已选 {{ selectNum }}</span>
            <span>/{{ total }} 条</span>
          </div>
          <el-checkbox v-model="checkSign" v-show="
            tabPosition == '1' || tabPosition == '2' || tabPosition == '5'
          ">同步一车多卡审核结果</el-checkbox>
        </div>
        <div class="infoTable unlock" v-if="tabPosition == '1'">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span><span>
                证件号<img src="../assets/images/openEyes.png" v-if="cardNumbStatus" @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>
            <span v-if="activeName == 'first'">申请时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: applyDesc == 2 }" @click="changeOrder(false, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 1 }"
                @click="changeOrder(false, 1)" /></span>
            <span v-if="activeName == 'second'">通过时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span v-if="activeName == 'third'">拒绝时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span class="showpadding">{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span v-if="activeName == 'first'">{{ node.applyTimeStr }}</span>
            <span v-if="activeName != 'first'">{{ node.finishTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="opendrawer(node, 'JB')">详情</span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unlock" v-if="tabPosition == '4'">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>
            <span>VIN</span>
            <span>卡数</span>
            <span>单位名称</span>
            <span> 证件类型</span>
            <span v-if="activeName == 'first'">申请时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: applyDesc == 2 }" @click="changeOrder(false, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 1 }"
                @click="changeOrder(false, 1)" /></span>
            <span v-if="activeName == 'second'">通过时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span v-if="activeName == 'third'">拒绝时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>
            <span>{{ node.vin }}</span>
            <span>{{ node.num }}</span>
            <span class="showpadding">{{ node.orgName }}</span>
            <span>{{ node.certType }}</span>
            <span v-if="activeName == 'first'">{{ node.applyTimeStr }}</span>
            <span v-if="activeName != 'first'">{{ node.finishTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="opendrawer(node, 'DWJB')">详情</span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable others" v-if="tabPosition == '2'">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span><span>
                证件号<img src="../assets/images/openEyes.png" v-if="cardNumbStatus" @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>

            <span v-if="activeName == 'first'">申请时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: applyDesc == 2 }" @click="changeOrder(false, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 1 }"
                @click="changeOrder(false, 1)" /></span>
            <span v-if="activeName == 'second'">通过时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span v-if="activeName == 'third'">拒绝时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span class="showpadding">{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span v-if="activeName == 'first'">{{ node.applyTimeStr }}</span>
            <span v-if="activeName != 'first'">{{ node.finishTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="opendrawer(node, 'GR')" v-if="detailRole || changeRole" class="btnBase">详情</span>
            <span v-if="!detailRole && !changeRole" class="disableBtn">详情</span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unit" v-if="tabPosition == '3'">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>

            <span>单位名称</span>
            <span>
              <span>
                统一社会信用代码
                <img src="../assets/images/openEyes.png" v-if="orgCodeStatus" @click="changeHeadEyes('O')" />
                <img src="../assets/images/closeEyes.png" v-if="!orgCodeStatus"
                  @click="changeHeadEyes('O')" /></span></span>
            <span>单位证件类型</span>
            <span>
              <span>责任人证件号<img src="../assets/images/openEyes.png" v-if="cardNumbStatus" @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-if="!cardNumbStatus" @click="changeHeadEyes('C')" /></span>
            </span>
            <span><span>责任人姓名
                <img src="../assets/images/openEyes.png" v-if="nameStatus" @click="changeHeadEyes('N')" />
                <img src="../assets/images/closeEyes.png" v-if="!nameStatus" @click="changeHeadEyes('N')" /></span>
            </span>
            <span v-if="activeName == 'first'">申请时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: applyDesc == 2 }" @click="changeOrder(false, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 1 }"
                @click="changeOrder(false, 1)" /></span>
            <span v-if="activeName == 'second'">通过时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span v-if="activeName == 'third'">拒绝时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>

            <span class="showpadding">{{ node.orgName }}</span>
            <span>{{ node.orgCode }}</span>
            <span class="showpadding">{{ node.certType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span>{{ node.handlerName }}</span>
            <span v-if="activeName == 'first'">{{ node.applyTimeStr }}</span>
            <span v-if="activeName != 'first'">{{ node.finishTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="opendrawer(node, 'DW')" v-if="detailRole || changeRole" class="btnBase">详情</span>
            <span v-if="!detailRole && !changeRole" class="disableBtn">详情</span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unlock" v-if="tabPosition == '5'">
          <div class="tableHead">
            <span>
              <el-checkbox v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate"></el-checkbox>
            </span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span><span>
                证件号<img src="../assets/images/openEyes.png" v-if="cardNumbStatus" @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>

            <span v-if="activeName == 'first'">申请时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: applyDesc == 2 }" @click="changeOrder(false, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: applyDesc == 1 }"
                @click="changeOrder(false, 1)" /></span>
            <span v-if="activeName == 'second'">通过时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span v-if="activeName == 'third'">拒绝时间<i class="el-icon-caret-top"
                v-bind:class="{ blueBtn: finishDesc == 2 }" @click="changeOrder(true, 2)" /><i
                class="el-icon-caret-bottom" v-bind:class="{ blueBtn: finishDesc == 1 }"
                @click="changeOrder(true, 1)" /></span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
            </span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span class="showpadding">{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span v-if="activeName == 'first'">{{ node.applyTimeStr }}</span>
            <span v-if="activeName != 'first'">{{ node.finishTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="opendrawer(node, 'GRGX')">详情</span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
      </div>
      <el-pagination @size-change="sizeChange()" @current-change="setParameters()" :current-page.sync="currentPage"
        :page-sizes="[10, 50, 100, 500]" :page-size.sync="pageSize" layout=" prev, pager, next,sizes,jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Cookies from "js-cookie";
import auth from "../plugins/auth";
import Vue from "vue";
export default {
  name: "manualAudit",
  components: {
    "el-image-viewer": () =>
      import("element-ui/packages/image/src/image-viewer"),
  },
  data() {
    return {
      openImg: false,
      imgList: [],
      refuseInputOk: false,
      pageSize: 10,
      exportRole: false,
      detailRole: false,
      listRole: false,
      changeRole: false,
      today: null,
      moreRefuseDialog: false,
      moreDialogVisible: false,
      infoDetail: {},
      node: {},
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
      idTypeoptions: [],
      idType: null,
      operation: null,
      selectNum: 0,
      total: 100,
      reason: "无",
      currentPage: 1,
      refuseInput: null,
      refuseDialog: false,
      dialogTitle: "12345",
      dialogVisible: false,
      drawer: false,
      infoList: [],
      activeName: "first",
      tabPosition: null,
      type: "VIN",
      typeoptions: [
        {
          value: "VIN",
          label: "VIN",
        },
        {
          value: "ICCID",
          label: "ICCID",
        },
        {
          value: "applyNo",
          label: "订单号",
        },
      ],
      ownerInfoStatus: false,
      liableInfoStatus: false,
      orgInfoStatus: false,
      handlerInfoStatus: false,
      cardNumbStatus: false,
      nameStatus: false,
      phoneStatus: false,
      orgCodeStatus: false,
      addressStatus: false,
      checkSign: false,
    };
  },

  watch: {
    // 如果路由有变化，会再次执行该方法
    tabPosition() {
      this.tabChange();
    },
  },
  methods: {
    checkRefuseInput() {
      this.refuseInputOk =
        this.refuseInput.replace(/\s+/g, "").length > 0;
    },
    sizeChange() {
      this.currentPage = 1;
      this.setParameters();
    },
    async getExport(status) {
      var filename = "个人车辆解绑";
      let params = {
        id: this.node.id,
        type: "AUTH_GR_GB",
      };
      if (this.tabPosition == "2") {
        params.type = "AUTH_GR";
        filename = "个人实名";
      } else if (this.tabPosition == "3") {
        params.type = "AUTH_DW";
        filename = "单位证件";
      } else if (this.tabPosition == "4") {
        params.type = "AUTH_DW_GB";
        filename = "单位车辆解绑";
      } else if (this.tabPosition == "5") {
        params.type = "AUTH_GR_UP";
        filename = "其他证件更新";
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "exportFlowDataDetail",
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      var statusName = "待审核";
      if (status == "1") {
        statusName = "已通过";
      } else if (status == "2") {
        statusName = "已拒绝";
      }

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
    resetSelect() {
      if (this.tabPosition == "3") {
        this.type = "单位名称";
      } else {
        this.type = "VIN";
      }
      this.inputSelect = null;
      this.idType = null;
      this.time = null;
    },
    downloadIDCard(front, back) {
      if (front == "" || back == "") {
        this.downloadFile(front, "证件照片");
      } else {
        this.downloadFile(front, "身份证正面照片");
        this.downloadFile(back, "身份证背面照片");
      }
    },
    async downloadFile(file, name) {
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
        let { res, err } = await Vue.prototype.$$api.do({
          url_key: "realNameWorkflow",
          serviceName: "downloadSftpFile",
          serviceParameter: {
            fileName: file,
          },
          method: "post",
          responseType: "blob",
        });
        if (res) {
          var fileType = ".mp4";
          if (file.indexOf("jpg") != -1) {
            fileType = ".jpg";
          } else if (file.indexOf("png") != -1) {
            fileType = ".png";
          }
          this.$message({
            message: name + "获取成功，正在下载！",
            type: "success",
            showClose: true,
          });
          const blob = new Blob([res], { type: "application/x-tar" });
          // axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
          const fileName = name + fileType;
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
      if (this.tabPosition == "1") {
        this.getInfo(this.node.id, "JB");
      } else if (this.tabPosition == "2") {
        this.getInfo(this.node.id, "GR");
      } else if (this.tabPosition == "3") {
        this.getInfo(this.node.id, "DW");
      } else if (this.tabPosition == "4") {
        this.getInfo(this.node.id, "DWJB");
      } else if (this.tabPosition == "5") {
        this.getInfo(this.node.id, "GRGX");
      }
    },
    changeHeadEyes(which) {
      if (which == "C") {
        this.cardNumbStatus = !this.cardNumbStatus;
      } else if (which == "N") {
        this.nameStatus = !this.nameStatus;
      } else if (which == "P") {
        this.phoneStatus = !this.phoneStatus;
      } else if (which == "O") {
        this.orgCodeStatus = !this.orgCodeStatus;
      } else if (which == "A") {
        this.addressStatus = !this.addressStatus;
      }
      this.setParameters();
    },
    changeOrder(isFinish, num) {
      if (isFinish) {
        this.finishDesc = num;
        this.applyDesc = null;
      } else {
        this.applyDesc = num;
        this.finishDesc = null;
      }
      this.setParameters();
    },
    opendrawer(node, type) {
      this.drawer = true;
      this.node = node;
      this.getInfo(node.id, type);
    },

    async getInfo(vid, type) {
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
        vin: null,
        id: vid,
        status: 0,
        type: "AUTH_GR",
        handlerInfoStatus: handlerInfoStatus,
        ownerInfoStatus: ownerInfoStatus,
        orgInfoStatus: orgInfoStatus,
        liableInfoStatus: liableInfoStatus,
      };
      if (type == "DW") {
        params.type = "AUTH_DW";
      } else if (type == "JB") {
        params.type = "AUTH_GR_GB";
      } else if (type == "DWJB") {
        params.type = "AUTH_DW_GB";
      } else if (type == "GRGX") {
        params.type = "AUTH_GR_UP";
      }
      if (this.activeName == "second") {
        params.status = 1;
      } else if (this.activeName == "third") {
        params.status = 2;
      }
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
    setNode(isyes, node) {
      this.node = node;
      if (isyes) {
        this.dialogVisible = true;
      } else {
        this.refuseDialog = true;
      }
    },
    checkList(isMore, isOk) {
      if (this.selectNum > 0) {
        if (isMore) {
          if (isOk) {
            this.moreDialogVisible = true;
          } else {
            this.moreRefuseDialog = true;
          }
        } else {
          this.getExportList(this.checkedList);
        }
      } else {
        this.$message({
          message: "请选择至少一项数据！",
          type: "warning",
          showClose: true,
        });
      }
    },
    async getExportList(ids) {
      let params = {
        ids: ids.toString(),
        type: "AUTH_GR_GB",
        status: "0",
      };
      var fileType = "个人车辆解绑待审核记录";
      if (this.activeName == "first") {
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
          fileType = "个人实名待审核记录";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
          fileType = "单位证件待审核记录";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
          fileType = "单位车辆解绑待审核记录";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
          fileType = "其他证件更新待审核记录";
        }
      } else if (this.activeName == "second") {
        fileType = "个人车辆解绑已通过记录";
        params.status = "1";
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
          fileType = "个人实名已通过记录";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
          fileType = "单位证件已通过记录";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
          fileType = "单位车辆解绑已通过记录";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
          fileType = "其他证件更新已通过记录";
        }
      } else {
        var fileType = "个人车辆解绑已拒绝记录";
        params.status = "2";
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
          fileType = "个人实名已拒绝记录";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
          fileType = "单位证件已拒绝记录";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
          fileType = "单位车辆解绑已拒绝记录";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
          fileType = "其他证件更新已拒绝记录";
        }
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "exportFlowData",
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: fileType + this.today + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
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
        console.log("acacacac", err);
      }
    },
    async auditOperation(isYes, ids) {

      this.refuseDialog = false;
      this.dialogVisible = false;
      this.moreRefuseDialog = false;
      this.moreDialogVisible = false;
      console.log(
        "-------------------auditOperation-----------------------",
        ids
      );
      let params = {
        type: "AUTH_GR_GB",
        ids: ids.toString(),
        status: null,
        remark: this.refuseInput,
        checkSign: 0,
      };
      if (this.checkSign) {
        params.checkSign = 1;
      }
      if (isYes) {
        params.status = "1";
      } else {
        params.status = "2";
      }
      if (this.tabPosition == "2") {
        params.type = "AUTH_GR";
      } else if (this.tabPosition == "3") {
        params.type = "AUTH_DW";
      } else if (this.tabPosition == "4") {
        params.type = "AUTH_DW_GB";
      } else if (this.tabPosition == "5") {
        params.type = "AUTH_GR_UP";
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "updateFlowStatus",
        serviceParameter: params,
        method: "post",
      });
      if (res) {
        this.setParameters();
        this.drawer = false;

      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getCardTypeComboBox",
        method: "get",
      });
      if (res) {
        this.idTypeoptions = res.data;
        console.log("idTypeoptions", this.idTypeoptions);
      }
      if (err) {
        console.log(err);
      }
    },
    async getoptions1() {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBox",
        serviceName: "getDWCardTypeComboBox",
        method: "get",
      });
      if (res) {
        this.idTypeoptions = res.data;
        console.log("idTypeoptions", this.idTypeoptions);
      }
      if (err) {
        console.log(err);
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
    openRefuseDialog(reason) {
      this.refuseDialog = true;
      this.reason = reason;
    },
    tabClick() {
      console.log(
        this.exportRole,
        this.changeRole,
        "==============tabClick==============="
      );
      this.cardNumbStatus = false;
      this.nameStatus = false;
      this.phoneStatus = false;
      this.orgCodeStatus = false;
      this.addressStatus = false;
      this.setParameters();
    },
    tabChange() {
      this.refuseInput = null;
      this.inputSelect = null;
      this.idType = null;
      this.time = null;
      this.activeName = "first";
      this.cardNumbStatus = false;
      this.nameStatus = false;
      this.phoneStatus = false;
      this.orgCodeStatus = false;
      this.addressStatus = false;
      if (this.tabPosition == "3") {
        (this.typeoptions = [
          {
            value: "单位名称",
            label: "单位名称",
          },
          {
            value: "applyNo",
            label: "订单号",
          },
          {
            value: "orgCode",
            label: "统一社会信用代码",
          },
        ]),
          (this.type = "单位名称");
        this.getoptions1();
      } else if (this.tabPosition == "4") {
        (this.typeoptions = [
          {
            value: "VIN",
            label: "VIN",
          },
          {
            value: "单位名称",
            label: "单位名称",
          },
        ]),
          (this.type = "VIN");
        this.getoptions1();
      } else {
        (this.typeoptions = [
          {
            value: "VIN",
            label: "VIN",
          },
          {
            value: "ICCID",
            label: "ICCID",
          },
          {
            value: "applyNo",
            label: "订单号",
          },
        ]),
          (this.type = "VIN");
        this.getoptions();
      }
      this.setParameters();
    },
    setParameters() {
      let time = null,
        time1 = null;
      if (this.time) {
        time = this.time[0];
        time1 = this.time[1];
      }

      var cardNumbStatus = 0;
      var nameStatus = 0;
      var phoneStatus = 0;
      var orgCodeStatus = 0;
      var addressStatus = 0;
      if (this.cardNumbStatus) {
        cardNumbStatus = 1;
      }
      if (this.nameStatus) {
        nameStatus = 1;
      }
      if (this.phoneStatus) {
        phoneStatus = 1;
      }
      if (this.orgCodeStatus) {
        orgCodeStatus = 1;
      }
      if (this.addressStatus) {
        addressStatus = 1;
      }
      let params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        status: "0",
        type: "AUTH_GR_GB",
        vin: null,
        applyNo: null,
        iccid: null,
        orgName: null,
        cardType: this.idType,
        applyDesc: this.applyDesc,
        finishDesc: this.finishDesc,
        applyStartTime: time,
        applyEndTime: time1,
        cardNumbStatus: cardNumbStatus,
        nameStatus: nameStatus,
        phoneStatus: phoneStatus,
        orgCodeStatus: orgCodeStatus,
        addressStatus: addressStatus,
      };

      if (this.type == "VIN") {
        params.vin = this.inputSelect;
      } else if (this.type == "applyNo") {
        params.applyNo = this.inputSelect;
      } else if (this.type == "ICCID") {
        params.iccid = this.inputSelect;
      } else {
        params.orgName = this.inputSelect;
      }
      if (this.activeName == "first") {
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
        }
      } else if (this.activeName == "second") {
        params.status = "1";
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
        }
      } else {
        params.status = "2";
        if (this.tabPosition == "2") {
          params.type = "AUTH_GR";
        } else if (this.tabPosition == "3") {
          params.type = "AUTH_DW";
        } else if (this.tabPosition == "4") {
          params.type = "AUTH_DW_GB";
        } else if (this.tabPosition == "5") {
          params.type = "AUTH_GR_UP";
        }
      }

      this.getList(params);
      this.operation = null;
    },
    async getList(params) {
      this.loadingList = this.$loading({
        lock: true,
        text: "数据加载中",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "openForm",
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
        this.checkedList = [];
        this.checked = false;
        this.isIndeterminate = false;
        this.selectNum = 0;
        this.infoList = res.data.list;
        this.total = res.data.total;
        this.loadingList.close();
      }
    },
  },
  created() { },
  mounted() {
    this.tabPosition = Cookies.get("auditTab") || "1";
    this.exportRole = auth.hasPermi("home:manualAudit:export");
    this.detailRole = auth.hasPermi("home:manualAudit:detail");
    this.changeRole = auth.hasPermi("home:manualAudit:change");
    this.listRole = auth.hasPermi("home:manualAudit:list");
    this.today = Cookies.get("today");
    Cookies.set("auditTab", "1");
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.manualAudit {
  .el-breadcrumb {
    margin-top: toRem(17);
    margin-bottom: toRem(32);
    margin-left: toRem(40);
  }

  .drawer {
    .el-drawer__body {
      >div:nth-child(2) {
        >span {
          font-size: toRem(14);
          color: rgba(19, 20, 21, 0.69);
          display: flex;
          margin-top: toRem(15);
          margin-left: toRem(41);
        }
      }
    }
  }

  .tabContent {
    padding: 0 toRem(40);

    .selectArea {
      >div:first-child {
        width: toRem(120);
      }

      >div:nth-child(2) {
        width: toRem(300);
      }

      >div:nth-child(3),
      div:nth-child(4),
      div:nth-child(5) {
        width: toRem(160);
        margin-right: toRem(10);
      }

      >div:nth-child(6) {
        width: toRem(336);
      }

      >span:nth-last-child(2) {
        margin-left: toRem(10);
      }
    }

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
            position: relative;

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
            width: toRem(46);
          }

          >span:nth-child(2),
          span:nth-child(3),
          span:nth-child(4),
          span:nth-child(5),
          span:nth-child(7) {
            width: toRem(195);
          }

          >span:nth-child(6) {
            width: toRem(160);
          }

          >span:nth-child(8) {
            width: toRem(120);
          }

          >span:last-child {
            cursor: pointer;
          }
        }
      }

      .others {
        >div {

          >span:nth-child(2),
          span:nth-child(3),
          span:nth-child(4),
          span:nth-child(5),
          span:nth-child(6),
          span:nth-child(7),
          span:nth-child(8) {
            width: toRem(190);
          }

          >span:last-child {
            width: toRem(110);
          }
        }
      }

      .unit {
        >div {
          .showpadding {
            padding: 0 toRem(7);
          }

          >span:first-child {
            width: toRem(46);
          }

          >span:nth-child(5) {
            width: toRem(200);
          }

          >span:nth-child(6) {
            width: toRem(140);
          }

          >span:nth-child(2),
          span:nth-child(3),
          span:nth-child(4),
          span:nth-child(7),
          span:nth-child(8) {
            width: toRem(170);
          }

          >span:nth-child(9) {
            width: toRem(90);
          }
        }
      }

      .blueBtn {
        color: #1e6fff !important;
        cursor: pointer !important;
      }
    }
  }
}
</style>
