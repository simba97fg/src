<template>
  <div class="index">
    <el-image-viewer v-if="openImg" :on-close="closeImgViewer" :url-list="imgList" :z-index="9999" />
    <div>
      <img src="../assets/images/index-bg.png" />
      <span>您好，{{ nickname }}</span>
      <span>{{ today }}</span>
    </div>
    <div>
      <div>
        <div>
          <div class="info">
            <p>全量卡数</p>
            <p>{{ this.summary.allCardNum }}</p>
            <p>
              <span>已实名</span><span class="blackFont">{{
                this.summary.allCardOpenedNum
              }}</span>
            </p>
            <p>
              <span>实名率</span><span>{{ this.summary.allCardPassPercent }}</span>
            </p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>存量卡数</p>
            <p>{{ this.summary.stockCardNum }}</p>
            <p>
              <span>已实名</span><span class="blackFont">{{
                this.summary.stockCardOpenedNum
              }}</span>
            </p>
            <p>
              <span>实名率</span><span>{{ this.summary.stockCardPassPercent }}</span>
            </p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>线上H5实名数</p>
            <p>{{ this.summary.onLineCardOpenedNum }}</p>
            <p>
              <span>线上渠道占全量卡</span>
            </p>
            <p>
              <span>{{ this.summary.onLinePassPercent }}</span>
            </p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>线下终端实名数</p>
            <p>{{ this.summary.offlineCardOpenedNum }}</p>
            <p>
              <span>线下渠道占全量卡</span>
            </p>
            <p>
              <span>{{ this.summary.offlinePassPercent }}</span>
            </p>
          </div>
        </div>
        <div>
          <div class="info">
            <p>二代身份证已实名</p>
            <p>{{ this.summary.idCardOpenedNum }}</p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>其他个人证件已实名</p>
            <p>{{ this.summary.otherCardOpenedNum }}</p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>已实名单位数</p>
            <p>{{ this.summary.orgNum }}</p>
          </div>
          <el-divider direction="vertical"></el-divider>
          <div class="info">
            <p>单位车辆数</p>
            <p>{{ this.summary.orgVehicleNum }}</p>
          </div>
        </div>
      </div>
      <div>
        <div>
          <span></span>
          <span>最新个人实名信息</span>
          <span @click="pushTo('0')">查看全部</span>
        </div>
        <div class="infoTable">
          <div class="tableHead">
            <span>VIN</span>
            <span>开通状态</span>
            <span>证件类型</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in realNameList" :key="index">
            <span>{{ node.vin }}</span>
            <span v-bind:class="{ blue: node.statusName == '已实名' }">{{
              node.statusName
            }}</span><span>{{ node.cardType }}</span>
            <span class="blueBtn btnBase" v-if="node.cardType != '-'" @click="openPersonDetail(node)">详情</span>
            <span class="blackBtn" v-if="node.cardType == '-'">-</span>
          </div>
          <div class="nodataLine" v-if="realNameList.length <= 0">
            <div style="width: 40%"></div>
            <span>暂无数据</span>
            <div style="width: 40%"></div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div>
        <span></span>
        <span>待审核</span>
      </div>
      <span @click="pushTo('1')">查看全部</span>
      <div>
        <el-radio-group v-model="tabPosition" @change="tabChange">
          <el-radio-button label="2">个人其他证件</el-radio-button>
          <el-radio-button label="3">单位证件</el-radio-button>
          <el-radio-button label="1">个人车辆解绑</el-radio-button>
          <el-radio-button label="4">单位车辆解绑</el-radio-button>
          <el-radio-button label="5" v-show="false">其他证件更新</el-radio-button>
        </el-radio-group>
        <el-divider></el-divider>
        <div class="infoTable" v-if="tabPosition == '1'">
          <div class="tableHead">
            <span></span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span>
              <span>
                证件号<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
                  @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>
            <span>申请时间</span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index">
            <span>{{ index + 1 }}</span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span>{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span>{{ node.applyTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="openAuditDetail(node, 'JB')">详情</span>
          </div>
          <div class="nodataLine" v-if="infoList.length <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unlock" v-if="tabPosition == '4'">
          <div class="tableHead">
            <span></span>
            <span>VIN</span>
            <span>卡数</span>
            <span>单位名称</span>
            <span> 证件类型</span>
            <span>申请时间</span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index">
            <span>{{ index + 1 }}></span>
            <span>{{ node.vin }}</span>
            <span>{{ node.num }}</span>
            <span class="showpadding">{{ node.orgName }}</span>
            <span>{{ node.certType }}</span>
            <span>{{ node.applyTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="openAuditDetail(node, 'DWJB')">详情</span>
          </div>
          <div class="nodataLine" v-if="infoList.length <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable others" v-if="tabPosition == '2'">
          <div class="tableHead">
            <span></span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span>
              <span>
                证件号<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
                  @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>

            <span>申请时间</span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index">
            <span>{{ index + 1 }}</span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span>{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span>{{ node.applyTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span class="blueBtn btnBase" @click="openAuditDetail(node, 'GR')"
              v-if="detailRole || detailChangeRole">详情</span>
            <span v-if="!detailRole && !detailChangeRole" class="disableBtn">详情</span>
          </div>
          <div class="nodataLine" v-if="infoList.length <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unit" v-if="tabPosition == '3'">
          <div class="tableHead">
            <span></span>
            <span>订单号</span>
            <span>单位名称</span>
            <span>
              <span>
                统一社会信用代码
                <img src="../assets/images/openEyes.png" v-show="false" v-if="orgCodeStatus"
                  @click="changeHeadEyes('O')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!orgCodeStatus"
                  @click="changeHeadEyes('O')" /></span></span>
            <span>单位证件类型</span>
            <span>
              <span>
                责任人证件号<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
                  @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span>
            </span>
            <span><span>责任人姓名
                <img src="../assets/images/openEyes.png" v-show="false" v-if="nameStatus" @click="changeHeadEyes('N')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!nameStatus"
                  @click="changeHeadEyes('N')" /></span>
            </span>
            <span>申请时间</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index">
            <span>{{ index + 1 }}</span>
            <span>{{ node.applyNo }}</span>
            <span>{{ node.orgName }}</span>
            <span>{{ node.orgCode }}</span>
            <span>{{ node.certType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span>{{ node.handlerName }}</span>
            <span>{{ node.applyTimeStr }}</span>
            <span class="blueBtn btnBase" @click="openAuditDetail(node, 'DW')">详情</span>
          </div>
          <div class="nodataLine" v-if="infoList.length <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="infoTable unlock" v-if="tabPosition == '5'">
          <div class="tableHead">
            <span></span>
            <span>VIN</span>
            <span>ICCID</span>
            <span>证件类型</span>
            <span><span>
                证件号<img src="../assets/images/openEyes.png" v-show="false" v-if="cardNumbStatus"
                  @click="changeHeadEyes('C')" />
                <img src="../assets/images/closeEyes.png" v-show="false" v-if="!cardNumbStatus"
                  @click="changeHeadEyes('C')" /></span></span>

            <span>申请时间</span>
            <span>订单号</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in infoList" :key="index">
            <span>{{ index + 1 }}</span>
            <span>{{ node.vin }}</span>
            <span>{{ node.iccid }}</span>
            <span class="showpadding">{{ node.cardType }}</span>
            <span>{{ node.cardNumb }}</span>
            <span>{{ node.applyTimeStr }}</span>
            <span>{{ node.applyNo }}</span>
            <span @click="openAuditDetail(node, 'GRGX')">详情</span>
          </div>
          <div class="nodataLine" v-if="infoList.length <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="refuseDialog" width="29.5%" center :show-close="false" style="padding-top: 15%"
      class="refuseDialog">
      <p><span>*</span>请填写拒绝原因</p>
      <el-divider></el-divider>
      <el-input type="textarea" autosize placeholder="请尽量准确、易理解的描述原因" v-model="refuseInput" @input="checkRefuseInput"
        maxlength="30" show-word-limit suffix-icon="">
      </el-input>
      <el-divider></el-divider>
      <span slot="footer" class="dialog-footer">
        <el-button @click="refuseDialog = false">取 消</el-button>
        <el-button type="primary" @click="auditOperation(false, node.id)" v-if="refuseInputOk">确 定</el-button>
        <el-button type="primary" class="disabledBtn" v-if="!refuseInputOk">确 定</el-button>
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
          <span v-if="tabPosition == '3'">单位实名认证详情</span>
          <span v-if="tabPosition == '4'">单位解绑申请详情</span>
          <span v-if="tabPosition == '5'">其他证件更新详情</span><span
            v-if="infoDetail.status == '0' || tabPosition == '4'">-待审核</span></span>
        <span @click="getExport(infoDetail.status)">导出</span>
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
        <span v-if="tabPosition == '5'">以下为当前实名信息</span>
        <div class="infoDialog ownerInfoDialog" v-show="infoDetail.name" v-if="tabPosition == '1'">
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
              <span>组织机构代码</span><span>{{ infoDetail.orgCode }}</span>
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
              <span>人像视频截图二</span><span class="blueBtn" @click="downloadFile(infoDetail.videoScreenshotFirst, '人像视频截图二')"
                v-if="handlerInfoStatus">点击查看</span>
              <span class="disabledBtn" v-if="!handlerInfoStatus">点击查看</span>
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
      <el-divider v-if="whichDialog == 'NP'"></el-divider>
      <div v-show="whichDialog == 'NP'">
        <span class="btnBase" @click="dialogVisible = true">通过</span>
        <span class="btnBase" @click="refuseDialog = true">拒绝</span>
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
  name: "Index",
  props: ["activeIndex"],
  components: {
    "el-image-viewer": () =>
      import("element-ui/packages/image/src/image-viewer"),
  },
  data() {
    return {
      openImg: false,
      imgList: [],
      today: null,
      detailRole: false,
      detailChangeRole: false,
      node: {},
      nickname: null,
      whichDialog: "P",
      refuseInput: null,
      refuseInputOk: false,
      refuseDialog: false,
      dialogVisible: false,
      infoDetail: {},
      drawer: false,
      realNameList: [],
      summary: {},
      tabPosition: "2",
      infoList: [],
      ownerInfoStatus: false,
      liableInfoStatus: false,
      orgInfoStatus: false,
      handlerInfoStatus: false,
      cardNumbStatus: false,
      nameStatus: false,
      phoneStatus: false,
      orgCodeStatus: false,
      addressStatus: false,
    };
  },
  watch: {
    $route(to, from) {
      this.getSummary();
    },
  },
  methods: {
    checkRefuseInput() {
      this.refuseInputOk =
        this.refuseInput.replace(/\s+/g, "").length > 0;
    },
    async getExport() {
      let params = { id: this.node.id, type: "AUTH_GR" };
      var filename = "个人实名";
      if (this.tabPosition == "1") {
        filename = "个人解绑";
        params.type = "AUTH_GR_GB";
      } else if (this.tabPosition == "3") {
        filename = "单位实名";
        params.type = "AUTH_DW";
      } else if (this.tabPosition == "4") {
        filename = "单位解绑";
        params.type = "AUTH_DW_GB";
      } else if (this.tabPosition == "5") {
        filename = "证件更新";
        params.type = "AUTH_GR_UP";
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "exportFlowDataDetail",
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });

      if (res) {
        this.$message({
          message:
            filename +
            "待审核" +
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
          filename + "待审核" + "详情" + this.node.vin.toString() + ".xlsx";
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

      if (this.whichDialog == "P") {
        this.getInfo(this.node.id, false, "realNameAuthPerson", "query-detail");
      } else {
        if (this.tabPosition == "2") {
          this.getInfo(
            this.node.id,
            "GR",
            "realNameWorkflow",
            "openFormDetail"
          );
        } else if (this.tabPosition == "3") {
          this.getInfo(
            this.node.id,
            "DW",
            "realNameWorkflow",
            "openFormDetail"
          );
        } else if (this.tabPosition == "1") {
          this.getInfo(
            this.node.id,
            "JB",
            "realNameWorkflow",
            "openFormDetail"
          );
        } else if (this.tabPosition == "4") {
          this.getInfo(
            this.node.id,
            "DWJB",
            "realNameWorkflow",
            "openFormDetail"
          );
        } else {
          this.getInfo(
            this.node.id,
            "GRGX",
            "realNameWorkflow",
            "openFormDetail"
          );
        }
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
    setNode(isyes, node) {
      this.node = node;
      if (isyes) {
        this.dialogVisible = true;
      } else {
        this.refuseDialog = true;
      }
    },
    async auditOperation(isYes, ids) {
      this.refuseDialog = false;
      this.dialogVisible = false;
      console.log(
        "-------------------auditOperation-----------------------",
        ids
      );
      let params = {
        type: "AUTH_GR_GB",
        ids: ids.toString(),
        status: null,
        remark: this.refuseInput,
      };
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
        this.refuseInput = null;
        this.drawer = false;
      }
      if (err) {
        console.log(err);
      }
    },
    openPersonDetail(node) {
      this.drawer = true;
      this.whichDialog = "P";
      this.node = node;
      this.tabPosition = "2";
      this.getInfo(node.id, false, "realNameAuthPerson", "query-detail");
    },
    openAuditDetail(node, type) {
      this.node = node;
      this.drawer = true;
      this.whichDialog = "NP";
      this.getInfo(node.id, type, "realNameWorkflow", "openFormDetail");
    },
    async getInfo(vid, type, key, name) {
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
        id: vid,
        status: 0,
        type: "AUTH_GR",
        handlerInfoStatus: handlerInfoStatus,
        ownerInfoStatus: ownerInfoStatus,
        orgInfoStatus: orgInfoStatus,
        liableInfoStatus: liableInfoStatus,
      };
      if (key == "realNameWorkflow") {
        if (type == "DW") {
          params.type = "AUTH_DW";
        } else if (type == "JB") {
          params.type = "AUTH_GR_GB";
        } else if (type == "DWJB") {
          params.type = "AUTH_DW_GB";
        } else if (type == "GRGX") {
          params.type = "AUTH_GR_UP";
        }
      } else {
        params.status = null;
        params.type = null;
      }
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: key,
        serviceName: name,
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
    async getExportList(ids, vin, key, name) {
      let params = {
        id: ids,
        vin: vin,
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: key,
        serviceName: name,
        serviceParameter: params,
        method: "get",
        fileRead: true,
      });
      if (res) {
        this.$message({
          message: "个人其他证件详情" + vin.toString() + "获取成功，正在下载！",
          type: "success",
          showClose: true,
        });
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
        const fileName = "个人其他证件详情" + vin.toString() + ".xlsx";
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
    async getrealNameList() {
      let params = {
        pageSize: 6,
        pageNum: 1,
      };
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameAuthPerson",
        serviceName: "query-list",
        serviceParameter: params,
        method: "get",
      });
      if (err) {
        console.log("err", err);
      }
      if (res) {
        res.data.list.forEach((element) => {
          if (!element.cardType) {
            element.cardType = "-";
          }
        });
        this.realNameList = res.data.list;
      }
    },
    tabChange() {
      this.cardNumbStatus = false;
      this.nameStatus = false;
      this.phoneStatus = false;
      this.orgCodeStatus = false;
      this.addressStatus = false;
      this.setParameters();
    },
    setParameters() {
      this.infoList = [];
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
        pageNum: 1,
        pageSize: 5,
        status: "0",
        type: "AUTH_GR_GB",
        cardNumbStatus: cardNumbStatus,
        nameStatus: nameStatus,
        phoneStatus: phoneStatus,
        orgCodeStatus: orgCodeStatus,
        addressStatus: addressStatus,
      };
      if (this.tabPosition == "2") {
        params.type = "AUTH_GR";
      } else if (this.tabPosition == "3") {
        params.type = "AUTH_DW";
      } else if (this.tabPosition == "1") {
        params.type = "AUTH_GR_GB";
      } else if (this.tabPosition == "4") {
        params.type = "AUTH_DW_GB";
      } else if (this.tabPosition == "5") {
        params.type = "AUTH_GR_UP";
      }
      this.getList(params);
    },
    async getList(params) {
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameWorkflow",
        serviceName: "openForm",
        serviceParameter: params,
        method: "get",
      });
      if (err) {
        console.log("err", err);
      }
      if (res) {
        this.infoList = res.data.list;
      }
    },
    async getSummary() {
      let params = {};
      let { res, err } = await Vue.prototype.$$api.do({
        url_key: "realNameBase",
        serviceName: "query-summary",
        serviceParameter: params,
        method: "get",
      });
      if (err) {
        console.log("err", err);
      }
      if (res) {
        res.data.otherCardOpenedNum = this.todivi(res.data.otherCardOpenedNum);
        res.data.orgNum = this.todivi(res.data.orgNum);
        res.data.orgVehicleNum = this.todivi(res.data.orgVehicleNum);
        res.data.offlineCardOpenedNum = this.todivi(
          res.data.offlineCardOpenedNum
        );
        res.data.stockCardOpenedNum = this.todivi(res.data.stockCardOpenedNum);
        res.data.stockCardNum = this.todivi(res.data.stockCardNum);
        res.data.allCardNum = this.todivi(res.data.allCardNum);

        res.data.onLineCardOpenedNum = this.todivi(
          res.data.onLineCardOpenedNum
        );
        res.data.allCardOpenedNum = this.todivi(res.data.allCardOpenedNum);
        res.data.idCardOpenedNum = this.todivi(res.data.idCardOpenedNum);
        this.summary = res.data;
      }
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
    pushTo(id) {
      console.log(this.$parent.$refs.child, "pushTo(id)");
      this.$parent.isClickList = true;
      if (id == "0") {
        this.$parent.activeIndex = "2";
        this.$router.push("/personalRealAuth");
      } else {
        this.$parent.activeIndex = "3";

        if (this.tabPosition == "1") {
          this.$router.push("/personCarUnbind");
        } else if (this.tabPosition == "2") {
          this.$router.push("/personOtherIdcard");
        } else if (this.tabPosition == "3") {
          this.$router.push("/unitIdcard");
        } else if (this.tabPosition == "4") {
          this.$router.push("/unitCarUnbind");
        } else if (this.tabPosition == "5") {
          Cookies.set("auditTab", "5");
        }

      }
    },
  },
  created() { },
  mounted() {
    var today =
      new Date().getFullYear() +
      (new Date().getMonth() + 1 > 9
        ? new Date().getMonth() + 1
        : "0" + (new Date().getMonth() + 1)
      ).toString() +
      (new Date().getDate() > 9
        ? new Date().getDate()
        : "0" + new Date().getDate()
      ).toString();
    Cookies.set("today", today);
    this.today =
      Cookies.get("today").substring(0, 4) +
      "/" +
      Cookies.get("today").substring(4, 6) +
      "/" +
      Cookies.get("today").substring(6, 8);
    this.detailRole = true;
    this.detailChangeRole = true;
    this.getSummary();
    this.setParameters();
    this.getrealNameList();
    this.nickname = Cookies.get("nickName");
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.index {
  padding: toRem(19) toRem(70);

  .drawer {
    .el-drawer__body {
      >div:nth-child(2) {
        >span {
          font-size: toRem(14);
          color: rgba(19, 20, 21, 0.49);
          display: flex;
          margin-top: toRem(15);
          margin-left: toRem(41);
        }
      }
    }
  }

  .blue {
    color: $RBlueColor !important;
  }

  >div:first-child {
    height: toRem(120);
    position: relative;

    img {
      height: toRem(120);
    }

    span {
      position: absolute;
      left: toRem(30);
    }

    >span:nth-child(2) {
      font-size: toRem(24);
      font-weight: 600;
      color: $RTextColor;
      top: toRem(16);
    }

    >span:last-child {
      display: flex;
      width: toRem(82);
      height: toRem(22);
      justify-content: center;
      align-items: center;
      background: $RBlueColor;
      border-radius: 2px;
      color: white;
      top: toRem(81);
      font-size: toRem(14);
      font-weight: 600;
    }
  }

  >div:nth-child(2) {
    margin: toRem(20) 0;
    height: toRem(323);
    display: flex;
    justify-content: space-between;

    >div:first-child {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: toRem(319);

      >div {
        background: #ffffff;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: toRem(19) toRem(30) toRem(12) toRem(20);
        width: toRem(665);

        .blackFont {
          font-weight: 600;
          color: black;
          margin-left: toRem(10);
        }

        .info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: toRem(128);
        }
      }

      >div {
        height: toRem(200);

        .el-divider--vertical {
          height: 100%;
          width: toRem(0.5);
        }

        >div {
          // height: toRem(127);

          >p {
            font-size: toRem(14);
            margin: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            width: 100%;
            text-align: left;
          }

          >p:first-child {
            font-size: toRem(14);
            margin-bottom: toRem(15);
            color: $RInfoColor;
          }

          >p:nth-child(2) {
            font-size: toRem(24);
            color: black;
            font-weight: 600;
          }

          >p:nth-child(3) {
            margin: toRem(25) 0 toRem(10) 0;
            font-size: toRem(14);
            color: $RInfoColor;
          }

          >p:nth-child(4) {
            font-size: toRem(16);
            font-weight: bold;
            color: #1e6fff;

            >span:nth-last-child(2) {
              display: inline-block;
              font-weight: 400;
              font-size: toRem(14);
              color: $RInfoColor;
              margin-right: toRem(10);
            }
          }
        }
      }

      >div:last-child {
        height: toRem(100);

        .info {
          justify-content: space-around;
          display: flex;
          height: 100%;

          >p:first-child {
            margin-bottom: 0;
          }
        }

        // >div {
        //   height: toRem(108.5);

        //   >p {
        //     font-size: toRem(12);
        //     margin: 0;
        //   }

        //   >p:first-child {
        //     font-size: toRem(14);
        //     color: $RInfoColor;
        //   }

        //   >p:nth-child(2),
        //   p:nth-child(4) {
        //     font-size: toRem(16);
        //     margin: toRem(5) 0 toRem(20) 0;
        //     font-weight: 600;
        //     color: black;
        //   }

        //   >p:nth-child(4) {
        //     margin: 0;
        //     margin-top: toRem(5);
        //   }

        //   >p:nth-child(3) {
        //     font-size: toRem(14);
        //     color: $RInfoColor;
        //   }
        // }

        // >div:nth-child(5),
        // div:nth-child(7) {
        //   >p:nth-child(2) {
        //     font-size: toRem(24);
        //     margin-top: toRem(10);
        //     margin-bottom: toRem(30);
        //   }
        // }
      }
    }

    >div:last-child {
      width: toRem(550);
      height: toRem(323);
      display: flex;
      flex-direction: column;

      >div:first-child {
        height: toRem(20);
        display: flex;
        align-items: center;

        >span {
          display: inline-block;
          padding: 0 toRem(10);
        }

        >span:first-child {
          padding: 0;
          background: $RBlueColor;
          width: toRem(4);
          height: toRem(20);
          border-radius: 1px;
        }

        >span:nth-child(2) {
          font-size: toRem(20);
          color: black;
          font-weight: 600;
          line-height: toRem(20);
        }

        >span:last-child {
          cursor: pointer;
          font-size: toRem(14);
          color: $RBlueColor;
          background: rgba(30, 111, 255, 0.09);
          border-radius: 13px;
          padding: toRem(4) toRem(12) toRem(5);
          margin-left: toRem(20);
        }
      }

      >div:last-child {
        margin-top: toRem(25);

        >div {
          >span:first-child {
            width: toRem(160);
          }

          >span:nth-child(2) {
            width: toRem(90);
          }

          >span:nth-child(3) {
            width: toRem(190);
          }

          >span:nth-child(4) {
            width: toRem(104);
          }
        }
      }
    }
  }

  >div:nth-child(3) {
    height: toRem(277);
    position: relative;

    span {
      display: inline-block;
    }

    >div:first-child {
      display: flex;
      justify-content: center;
      position: absolute;

      >span:first-child {
        background: $RBlueColor;
        width: toRem(4);
        height: toRem(20);
        border-radius: 1px;
      }

      >span:last-child {
        font-weight: 600;
        font-size: toRem(20);
        color: black;
        line-height: toRem(20);
        margin-left: toRem(10);
      }
    }

    >span {
      font-size: toRem(14);
      position: absolute;
      cursor: pointer;
      color: $RBlueColor;
      background: rgba(30, 111, 255, 0.09);
      border-radius: 13px;
      padding: toRem(3) toRem(12);
      top: toRem(25);
      right: toRem(0);
    }

    >div:last-child {
      padding-top: toRem(32);
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      ::v-deep .el-radio-button__orig-radio:checked+.el-radio-button__inner {
        background-color: $RBlueColor;
        border-color: $RBlueColor;
        border-radius: toRem(19) toRem(19) 0 0;
      }

      ::v-deep .el-radio-button__inner {
        border: none;
        font-size: toRem(16);
        letter-spacing: 1px;
        padding: toRem(9) toRem(17);
      }

      .el-divider {
        margin: 0;
        height: 1px;
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

.blackBtn {
  color: #2c3e50 !important;
  cursor: initial !important;
}

.DetailBtn {
  height: toRem(92);
  padding: 0 toRem(40);
  font-size: toRem(14);
  display: flex;
  align-items: center;

  >span {
    display: inline-block;
    height: toRem(38);
    line-height: toRem(38);
    border-radius: toRem(20);
    font-weight: 600;
  }

  >span:first-child {
    width: toRem(135);
    background: #1e6fff;
    border: 1px solid #1e6fff;
    color: white;
    margin-right: toRem(20);
  }

  >span:last-child {
    width: toRem(88);
    background: #ffffff;
    border: 1px solid #fc6478;
    color: #fc6478;
  }
}</style>
