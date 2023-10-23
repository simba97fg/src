<template>
  <div class="userManage" v-loading="loading">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>工具</el-breadcrumb-item>
      <el-breadcrumb-item class="is-link">账号管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-dialog :visible.sync="showNewPassword" width="29.5%" :show-close="false" style="padding-top: 15%"
      class="showNewPasswordClass">
      <p>新密码<span>这是您唯一可以查看此密码的时间</span></p>
      <p>{{ newPassword }} <span @click="copy">复制</span></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showNewPassword = false">取 消</el-button>
        <el-button type="primary" @click="downloadPassword">下载.csv</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="resetPassword" width="29.5%" :show-close="false" style="padding-top: 15%"
      class="resetPasswordClass">
      <p>重置密码</p>
      <div>
        <span>访问密码</span>
        <div>
          <el-radio v-model="resetType" label="1">自定义密码</el-radio>
          <el-radio v-model="resetType" label="2">自动生成</el-radio>
        </div>
      </div>
      <div v-if="hidePassword" v-show="resetType == '1'">
        <el-input v-model="newPassword" show-password v-bind:class="{ redInput: !isPswOk }"
          @input="checkPassword(newPassword)">
        </el-input><img src="../assets/images/closeEyes.png" @click="hidePassword = false" />
      </div>
      <div v-if="!hidePassword" v-show="resetType == '1'">
        <el-input v-model="newPassword" v-bind:class="{ redInput: !isPswOk }" @input="checkPassword(newPassword)">
        </el-input><img src="../assets/images/openEyes.png" @click="hidePassword = true" />
      </div>
      <span v-show="resetType == '1'" v-bind:class="{ redSpan: !isPswOk }">长度为8-32
        个字符，包含大写字母，小写字母，数字，半角特殊字符（除空格）</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetPassword = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword" v-if="
          (isPswOk && newPassword.length > 7 && resetType == '1') ||
          resetType == '2'
        ">确 定</el-button>
        <el-button type="primary" class="disabledBtn" v-if="
          !(
            (isPswOk && newPassword.length > 7 && resetType == '1') ||
            resetType == '2'
          )
        ">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="deptDialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认移除选中组织</p>
      <p>该组织将被注销，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deptDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="beforedeleteDept">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认移除选中成员</p>
      <p>选中的成员账号将被注销，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteMembers">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="roleDialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
      <p>确认删除选中角色</p>
      <p>选中的角色将被注销，此操作不可撤销</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="beforeDeleteRole(roleNode.roleId)">确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer :visible.sync="drawer" direction="rtl" size="43.05%" :before-close="drawerCLose">
      <div slot="title">
        <span v-if="!deptInfo.isAddDept">修改组织基本信息</span>
        <span v-if="deptInfo.isAddDept">新建子组织</span>
      </div>
      <el-divider></el-divider>
      <div>
        <span v-show="!deptInfo.isAddDept">当前路径为：{{ deptInfo.deptPath }}</span>
        <div v-show="deptInfo.deptId != adminDeptId">
          <span v-if="!deptInfo.isAddDept">修改为</span>
          <span v-if="deptInfo.isAddDept">您正在</span>
          <el-cascader ref="cascader" :show-all-levels="false" v-model="deptInfo.belongDept" :options="deptOptions"
            @change="handleChange" :props="drawerDefaultProps"></el-cascader>
          <span v-if="!deptInfo.isAddDept">组织下子组织</span>
          <span v-if="deptInfo.isAddDept">组织下创建子组织</span>
        </div>
        <div>
          <span>子组织名称<label class="addRedStar"></label></span>
          <el-input v-model="deptInfo.deptName" @input="deptCheckL"></el-input>
        </div>
        <div v-show="deptInfo.deptLevel == 1">
          <span>车企编码<label class="addRedStar"></label></span>
          <el-input v-model="deptInfo.deptCode" @input="deptCheckL"></el-input>
        </div>
        <div class="orgClass">
          <span>描述</span>
          <el-input type="textarea" autosize v-model="deptInfo.deptDesc" maxlength="30" show-word-limit></el-input>
        </div>
      </div>
      <el-divider class="drawerBtnLine" v-if="true"></el-divider>
      <div>
        <span class="btnBase" @click="deptChange" v-if="!isDisabled">确定</span>
        <span class="btnBase disabledBtn" v-if="isDisabled">确定</span>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="memberDrawer" direction="rtl" size="43.05%" :before-close="MemberDrawerCLose">
      <div slot="title">
        <span v-if="!selectMember.isAddMember">成员详情</span>
        <span v-if="selectMember.isAddMember">新增成员</span>
      </div>
      <el-divider></el-divider>
      <div class="memberDrawer">
        <div v-if="selectMember.isAddMember">
          <span>登录账号ID<label class="addRedStar"></label></span>
          <el-input @input="checkL" placeholder="请输入" v-model="selectMember.userName"></el-input>
        </div>
        <div>
          <span>成员名称<label class="addRedStar"></label></span>
          <el-input @input="checkL" placeholder="请输入" v-model="selectMember.nickName"></el-input>
        </div>
        <div>
          <span>联系方式<label class="addRedStar"></label></span>
          <el-tooltip class="item" effect="dark" content="请输入11位联系方式" placement="top-end">
            <el-input @input="checkL" maxlength="11" placeholder="请输入" v-model="selectMember.phonenumber"></el-input>
          </el-tooltip>
        </div>
        <div>
          <span>归属组织</span>
          <el-cascader v-bind:disabled="selectMember.isInDept" :show-all-levels="false" v-model="selectMember.dept.deptId"
            :options="deptOptions" :props="memberDrawerDefaultProps"></el-cascader>
        </div>
        <div>
          <span>角色<label class="addRedStar"></label></span>
          <el-select @change="checkL" placeholder="请选择" v-model="selectMember.roles[0].roleId">
            <el-option v-for="item in roleList" :key="item.roleId" :label="item.showRoleName" :value="item.roleId">
            </el-option>
          </el-select>
        </div>
        <div v-if="!selectMember.isAddMember">
          <span>登录账号ID</span>
          <span>{{ selectMember.userName }}</span>
        </div>
        <div v-show="false">
          <span>登录密码</span>
          <span v-show="!selectMember.isAddMember">********</span>
          <span v-if="!selectMember.isAddMember" @click="resetPassword = true">密码重置</span>
          <span v-if="selectMember.isAddMember" @click="resetPassword = true">设置密码</span>
        </div>
        <div v-if="!selectMember.isAddMember">
          <span>加入时间</span>
          <span>{{ selectMember.remark }}</span>
        </div>
        <div v-if="!selectMember.isAddMember">
          <span>创建时间</span>
          <span>{{ selectMember.createTime }}</span>
        </div>
      </div>
      <el-divider class="drawerBtnLine" v-if="true"></el-divider>
      <div>
        <span class="btnBase" @click="updateMemberInfo" v-if="!isDisabled">确定</span>
        <span class="btnBase disabledBtn" v-if="isDisabled">确定</span>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="memberChangedrawer" direction="rtl" size="43.05%" :before-close="memberdrawerCLose">
      <div slot="title">
        <span v-if="isMemberIn">移入成员</span>
        <span v-if="!isMemberIn">移出成员</span>
      </div>
      <el-divider></el-divider>
      <div v-if="isMemberIn" class="memberIn">
        <div>
          <div>
            <span>选择要移入的组织成员</span>
            <div>
              <el-tree :data="MemberDeptTree" show-checkbox node-key="id" :props="defaultProps1">
              </el-tree>
            </div>
          </div>
          <div></div>
          <div>
            <span>已选择(1)</span>
            <div></div>
          </div>
        </div>
        <span>注：成员移入后，所属组织为最新移入到的组织</span>
      </div>
      <div v-if="!isMemberIn" class="memberOut">
        <span style="color: #343434">选择目标组织</span>
        <el-cascader :show-all-levels="true" v-model="selectedDeptId" :options="deptOptions"
          :props="memberDrawerDefaultProps"></el-cascader>
      </div>
      <el-divider class="drawerBtnLine" v-if="true"></el-divider>
      <div>
        <span class="btnBase" @click="memberChangeDept">确定</span>
      </div>
    </el-drawer>
    <div class="tabsHead">
      <el-radio-group v-model="tabPosition" @change="tabChange">
        <el-radio-button label="1">组织架构</el-radio-button>
        <el-radio-button label="2">成员管理</el-radio-button>
        <el-radio-button label="3" v-if="role.indexOf('admin') != -1">角色配置</el-radio-button>
      </el-radio-group>
      <el-divider></el-divider>
    </div>
    <div class="tabContent">
      <div v-if="tabPosition == '1'">
        <div class="deptList">
          <div>
            <div>
              <span v-show="deptInfo.deptName != '未分配'" v-if="addDeptRole" @click="openDeptDrawer(true)">新建子组织</span>
              <span v-show="deptInfo.deptName != '未分配'" v-if="!addDeptRole" class="disabledBtn">新建子组织</span>
              <span v-if="
                deleteDeptRole &&
                deptInfo.deptName != '未分配'
              " @click="clickDeptDelete">删除子组织</span>
              <span v-if="
                !deleteDeptRole &&
                deptInfo.deptName != '未分配'
              " class="disabledBtn">删除子组织</span>
            </div>
            <span @click="toUserManage">查看全部成员</span>
          </div>
          <div>
            <el-input placeholder="请输入组织名称" v-model="inputDeptName" suffix-icon="el-icon-search"></el-input>
          </div>
          <div>
            <el-tree :data="deptOptions" node-key="id" ref="tree" highlight-current :default-expanded-keys="defaultDept"
              :filter-node-method="filterNode" :props="defaultProps" @node-click="handleNodeClick">
            </el-tree>
          </div>
        </div>
        <div></div>
        <div class="deptDetail">
          <div>
            <span>基本信息</span><i class="el-icon-edit" @click="openDeptDrawer(false)"></i>
          </div>
          <div>
            <div>
              <span>组织名称</span><span>{{ deptInfo.deptName }}</span>
            </div>
            <div>
              <span>组织ID</span><span>{{ deptInfo.deptId }}</span>
            </div>
            <div>
              <span>描述</span><span>{{ deptInfo.deptDesc }}</span>
            </div>
          </div>
          <span>成员列表</span>
          <div>
            <div>
              <span @click="openMemberDrawer(null, true)" v-if="false && addUserRole">新增成员</span>
              <span class="disabledBtn" v-if="false && !addUserRole">新增成员</span>
              <span v-show="moveUserRole && false" @click="openMemberChangedrawer(true)">移入成员</span>
              <span v-show="!moveUserRole && false" class="disabledBtn">移入成员</span>
              <span v-if="moveUserRole" v-bind:class="{ disableBtn: checkedList.length == 0 }"
                @click="openMemberChangedrawer(false)">移出成员</span>
              <span v-if="!moveUserRole" class="disabledBtn">移出成员</span>
            </div>
            <el-input v-model="inputMemInfo" @blur="getMemberList(deptInfo.deptId, null, true)" placeholder="请输入登录账号ID"
              suffix-icon="el-icon-search"></el-input>
          </div>
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
              <span>成员名称</span>
              <span>登录账号ID</span>
              <span>联系方式</span>
              <span>角色</span>
            </div>
            <div class="tableContent" v-for="(node, index) in deptInfo.memberList" :key="index" v-show="total > 0">
              <span>
                <el-checkbox v-model="node.checked" @change="addSelected(node)" v-bind:disabled="
                  node.userName.indexOf('defaultUser_') >= 0 ||
                  node.userId == 1
                "></el-checkbox>
              </span>
              <el-tooltip class="item" effect="dark" content="点击查看详情" placement="top-start" v-if="
                !(
                  node.userName.indexOf('defaultUser_') != -1 ||
                  node.userId == 1
                )
              ">
                <span class="blueUnderlineBtn" @click="openMemberDrawer(node, false)">{{ node.nickName }}</span>
              </el-tooltip>
              <span class="blueUnderlineBtn disableBtn" v-if="
                node.userName.indexOf('defaultUser_') != -1 ||
                node.userId == 1
              ">{{ node.nickName }}</span>
              <span>{{ node.userName }}</span>
              <span v-if="
                !(
                  node.userName.indexOf('defaultUser_') != -1 ||
                  node.userId == 1
                )
              ">{{ node.phonenumber }}</span>
              <span v-if="
                node.userName.indexOf('defaultUser_') != -1 ||
                node.userId == 1
              ">-</span>
              <span v-if="node.userId != 1">{{
                node.roles[0].showRoleName
              }}</span>
              <span v-if="node.userId == 1">-</span>
            </div>
            <div class="nodataLine" v-if="total <= 0">
              <div></div>
              <span>暂无数据</span>
              <div></div>
            </div>
          </div>
          <el-pagination @size-change="getMemberList(deptInfo.deptId, null, true)"
            @current-change="getMemberList(deptInfo.deptId, null, true)" :current-page.sync="queryParams.pageNum"
            :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
            layout=" prev, pager, next,sizes,jumper" :total="total">
          </el-pagination>
        </div>
      </div>
      <div v-if="tabPosition == '2'" class="memberList">
        <div>
          <span class="blueBtn" @click="openMemberDrawer(null, false)" v-if="false && addUserRole">新增成员</span>
          <span class="blueBtn disabledBtn" v-if="false && !addUserRole">新增成员</span>
          <span class="blueBtn" @click="checkMemList" v-if="false && deleteUserRole">移除成员</span>
          <span class="blueBtn disabledBtn" v-if="false && !deleteUserRole">移除成员</span>
          <el-input v-model="inputMemInfo" @blur="getMemberList(undefined, null, true)" placeholder="请输入登录账号ID"
            suffix-icon="el-icon-search"></el-input>
        </div>
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
            <span>成员名称</span>
            <span>登录账号ID</span>
            <span>联系方式</span>
            <span>角色</span>
            <span>所属组织</span>
            <span>加入时间</span>
            <span>创建时间</span>
            <span>操作</span>
          </div>
          <div class="tableContent" v-for="(node, index) in deptInfo.memberList" :key="index" v-show="total > 0">
            <span>
              <el-checkbox v-model="node.checked" @change="addSelected(node)" v-bind:disabled="
                node.userName.indexOf('defaultUser_') >= 0 || node.userId == 1
              "></el-checkbox>
            </span>
            <span style="color: #1e6fff; text-decoration: underline">{{
              node.nickName
            }}</span>
            <span>{{ node.userName }}</span>
            <span v-if="
              !(
                (!addUserRole && !isManager) ||
                node.userName.indexOf('defaultUser_') >= 0 ||
                node.userId == 1
              )
            ">{{ node.phonenumber }}</span>
            <span v-if="
              (!addUserRole && !isManager) ||
              node.userName.indexOf('defaultUser_') >= 0 ||
              node.userId == 1
            ">-</span>
            <span v-if="node.userId != 1">{{
              node.roles[0].showRoleName
            }}</span>
            <span v-if="node.userId == 1">-</span>
            <span>{{ node.dept.deptName }}</span>
            <span v-if="node.userId != 1">{{ node.remark }}</span>
            <span v-if="node.userId == 1">-</span>
            <span>{{ node.createTime }}</span>
            <span><span @click="openMemberDrawer(node, false)" v-if="
              !(
                (!addUserRole && !isManager) ||
                node.userName.indexOf('defaultUser_') >= 0 ||
                node.userId == 1
              )
            " class="btnBase">编辑</span><span class="disableBtn" v-if="
  (!addUserRole && !isManager) ||
  node.userName.indexOf('defaultUser_') >= 0 ||
  node.userId == 1
">编辑</span><span v-if="
  !(
    (!deleteUserRole && !isManager) ||
    node.userName.indexOf('defaultUser_') >= 0 ||
    node.userId == 1
  )
" @click="setCheckedList(node.userId)" class="btnBase">移除</span><span v-if="
  (!deleteUserRole && !isManager) ||
  node.userName.indexOf('defaultUser_') >= 0 ||
  node.userId == 1
" class="disableBtn">移除</span>
            </span>
          </div>
          <div class="nodataLine" v-if="total <= 0">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div>
          <el-pagination @size-change="getMemberList(deptInfo.deptId, null, true)"
            @current-change="getMemberList(deptInfo.deptId, null, true)" :current-page.sync="queryParams.pageNum"
            :page-sizes="[10, 50, 100, 500]" :page-size.sync="queryParams.pageSize"
            layout=" prev, pager, next,sizes,jumper" :total="total">
          </el-pagination>
        </div>
      </div>
      <div v-if="tabPosition == '3'">
        <div class="roleList">
          <div>
            <span>角色列表</span>
            <span class="blueBtn" @click="setNewRole"> 新建角色</span>
          </div>
          <div class="infoTable">
            <div class="tableHead">
              <span>序号</span>
              <span>角色名称</span>
              <span>操作</span>
            </div>
            <div class="tableContent" v-for="(node, index) in roleList" :key="index">
              <span>{{ index + 1 }}</span>
              <span>{{ node.showRoleName }}</span>
              <span v-if="node.roleKey != 'auth_admin'"><span @click="setRoleInfo(node)" class="btnBase">编辑</span><span
                  @click="setDeleteNode(node)" class="btnBase">删除</span></span>
              <span v-if="node.roleKey == 'auth_admin'" @click="setRoleInfo(node)" class="btnBase">查看</span>
            </div>
          </div>
        </div>
        <div></div>
        <div class="roleDetail" v-if="!isClickRole">
          <div class="nodataLine">
            <div></div>
            <span>暂无数据</span>
            <div></div>
          </div>
        </div>
        <div class="roleDetail" v-if="isClickRole">
          <div>
            <span>角色名称<label class="addRedStar"></label></span>
            <div>
              <el-input placeholder="请输入角色名称" v-model="roleInfo.showRoleName" v-bind:disabled="isAdmin"></el-input>
              <span>仅支持1-32字符的英文字母、数字、汉字、符号@&-:[]组合</span>
            </div>
          </div>
          <div>
            <span>角色范围<label v-show="false" class="addRedStar"></label></span>
            <el-cascader v-bind:disabled="isAdmin" :options="roleDeptOptions" :props="{
              emitPath: false,
              multiple: true, checkStrictly: true, children: 'children',
              label: 'label',
              value: 'id',
            }" clearable v-model="roleDeptList" :show-all-levels="false"></el-cascader>
          </div>
          <div>
            <span>权限范围<label class="addRedStar"></label></span>
            <div>
              <div v-for="(node, index) in menuList" :key="index">
                <el-checkbox v-bind:disabled="isAdmin" :indeterminate="node.indeterminate" v-model="node.checked"
                  @change="changeAll(node)">{{ node.menuName }}</el-checkbox>
                <div>
                  <el-checkbox v-bind:disabled="isAdmin" v-for="btnNode in node.children" v-model="btnNode.checked"
                    :label="btnNode.menuName" v-show="btnNode.menuName != '额度管理'" :key="btnNode.menuId"
                    @change="changeSome(node, btnNode)">{{
                      btnNode.menuName
                    }}</el-checkbox>
                </div>
              </div>
            </div>
          </div>
          <span class="blueBtn" style="margin-left: auto; margin-bottom: 10px"
            v-if="roleInfo.roleId != 1 && roleInfo.roleKey != 'auth_admin'" @click="updateRoleInfo">保存</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { encrypt, decrypt } from "@/utils/jsencrypt";
import {
  treeselect as menuTreeselect,
  roleMenuTreeselect,
} from "@/api/system/menu";
import { listMenu } from "@/api/system/menu";
import {
  listRole,
  getRole,
  delRole,
  addRole,
  updateRole,
} from "@/api/system/role";
import {
  getDept,
  delDept,
  addDept,
  updateDept,
  treeselect,
  listDept,
} from "@/api/system/dept";
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
} from "@/api/system/user";
import { pinyin } from "../utils/Convert_Pinyin.js";
import { getToken } from "@/utils/auth";
import Cookies from "js-cookie";
import auth from "@/plugins/auth";
export default {
  name: "userManage",
  components: {},
  data() {
    return {
      adminDeptId: null,
      roleDeptOptions: [],
      roleDeptList: [],
      oldRoleDeptList: [],
      roleNode: null,
      roleDialogVisible: false,
      isClickRole: false,
      menuLen: 0,
      isPswOk: true,
      isManager: false,
      isAdmin: false,
      deptDialogVisible: false,
      thisClickUserId: null,
      parentDeptId: [],
      MemberDeptTree: [],
      treeAddDeptList: [],
      treeAddMemberList: [],
      addDeptRole: null,
      deleteDeptRole: null,
      editDeptRole: null,
      addUserRole: null,
      deleteUserRole: null,
      editUserRole: null,
      moveUserRole: null,
      mustHaveMenuList: [],
      thisNode: {},
      isDisabled: true,
      newPassword: "",
      hidePassword: true,
      isMemberIn: false,
      selectedDeptId: null,
      memberChangedrawer: false,
      loading: false,
      countNum: 0,
      moveMembersList: [],
      permissions: [],
      role: "user",
      checkedList: [],
      checkedMemberList: [],
      dialogVisible: false,
      resetPassword: false,
      showNewPassword: false,
      resetType: "1",
      roleInfo: {
        dataScope: "4",
        roleId: undefined,
        showRoleName: '',
        roleName: undefined,
        roleKey: undefined,
        roleSort: 5,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined,
        checkedKeys: [],
      },
      formatMemberList: [],
      memberDrawer: false,
      selectMember: {
        oldDeptId: null,
        isInDept: false,
        nickName: "",
        userName: "",
        phonenumber: "",
        dept: { deptName: null, deptId: 201 },
        userId: "",
        password: null,
        remark: null,
        createTime: null,
        isAddMember: false,
        roles: [{ roleId: null, roleName: null, showRoleName: '' }],
      },
      menuList: [],
      roleList: [],
      inputDeptName: null,
      inputMemInfo: null,
      checked: false,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
      },
      deptInfo: {
        isAddDept: false,
        deptPath: null,
        belongDept: undefined,
        deptName: null,
        deptId: null,
        deptDesc: null,
        deptCode: null,
        deptLevel: null,
        memberList: [],
      },
      drawer: false,
      isIndeterminate: false,
      total: 100,
      selectNum: 0,
      tabPosition: "1",
      deptOptions: [],
      defaultDept: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      defaultProps1: {
        children: "children",
        label: "deptName",
      },
      drawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
      memberDrawerDefaultProps: {
        checkStrictly: true,
        emitPath: false,
        children: "children",
        label: "label",
        value: "id",
      },
    };
  },
  computed: {
    getPermissions() {
      return this.$store.getters.permissions;
    },
    deptId() {
      return this.$store.getters.deptId;
    },
    roleName() {
      return this.$store.getters.roleName;
    },
    roleId() {
      return this.$store.getters.roleId;
    },
    deptLevel() {
      return this.$store.getters.deptLevel;
    },
  },
  watch: {
    // 根据名称筛选组织树
    inputDeptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    resetDeptListForRole(oldList, newList, roleId, isNew) {
      console.log('==============resetDeptListForRole=====================', oldList, newList, roleId, isNew, Number(oldList[0]), typeof (newList[0]) == 'string');

      if (!(typeof (newList[0]) == 'string') || newList.length == 0) {
        if (!isNew) {
          oldList.forEach((el) => {
            if (newList.indexOf(Number(el)) >= 0) {
              newList.splice(newList.indexOf(Number(el)), 1);
            }
            else if (Number(el) !== 0) {
              let queryParams = {
                pageNum: 1,
                pageSize: 10,
                userName: "defaultUser_",
                phonenumber: undefined,
                status: undefined,
                deptId: Number(el),
              };
              listUser(this.addDateRange(queryParams, [])).then((response) => {
                if (response.rows.length >= 1) {
                  getUser(response.rows[0].userId).then((res) => {
                    let ids = [];
                    res.roleIds.forEach((element) => {
                      if (element != roleId) {
                        ids.push(element);
                      }
                    });
                    let params = {
                      userId: res.data.userId,
                      userName: res.data.userName,
                      nickName: res.data.nickName,
                      phonenumber: res.data.phonenumber,
                      deptId: res.data.deptId,
                      remark: res.data.remark,
                      roleIds: ids,
                    };
                    updateUser(params).then((responsef) => {
                    });
                  });
                }
              });
            }
          })
        }
        this.$nextTick(() => {
          console.log('==========resetDeptListForRole======= nextTick========', newList, oldList, roleId);
          newList.forEach((el) => {
            let queryParams = {
              pageNum: 1,
              pageSize: 10,
              userName: "defaultUser_",
              phonenumber: undefined,
              status: undefined,
              deptId: el,
            };
            listUser(this.addDateRange(queryParams, [])).then((response) => {
              if (response.rows.length >= 1) {
                getUser(response.rows[0].userId).then((res) => {
                  let ids = [];
                  res.roleIds.forEach((element) => {
                    ids.push(element);
                  });
                  ids.push(roleId);
                  let params = {
                    userId: res.data.userId,
                    userName: res.data.userName,
                    nickName: res.data.nickName,
                    phonenumber: res.data.phonenumber,
                    deptId: res.data.deptId,
                    remark: res.data.remark,
                    roleIds: ids,
                  };
                  updateUser(params).then((responsef) => {
                  });
                });
              }
            });
          })
        })
      }

    },

    setNewRole() {
      this.roleDeptList = [];
      this.isClickRole = true;
      this.resetRoleInfo();
    },
    checkMemList() {
      if (this.selectNum > 0) {
        this.dialogVisible = true;
      } else {
        this.$message({
          message: "请选择至少一位成员",
          type: "warning",
          showClose: true,
        });
      }
    },
    setMemberDeptTree() {
      this.treeAddMemberList = [];
      var parentDeptId = [];
      listDept({
        deptName: undefined,
        status: undefined,
      }).then((response) => {
        response.data.forEach((el) => {
          if (parentDeptId.indexOf(el.parentId) < 0) {
            parentDeptId.push(el.parentId);
          }
        });
        this.treeAddDeptList = this.handleTree(response.data, "deptId");
        this.$nextTick(() => {
          this.setMemberToDeptTree(
            parentDeptId,
            response.data,
            this.treeAddDeptList,
            this.treeAddMemberList
          );
        });
      });
    },
    setMemberToDeptTree(parentDeptId, list, treeAddDeptList) {
      console.log(parentDeptId);
      list.forEach((el) => {
        var treeAddMemberList = [];
        if (parentDeptId.indexOf(el.deptId) < 0) {
          listUser(
            this.addDateRange(
              {
                pageNum: 1,
                pageSize: 999,
                userName: undefined,
                phonenumber: undefined,
                status: undefined,
                deptId: el.deptId,
              },
              []
            )
          ).then((response) => {
            response.rows.forEach((ele) => {
              if (ele.userId != 1) {
                treeAddMemberList.push({
                  deptId: ele.userId,
                  deptName: ele.nickName,
                  id: ele.userId,
                  parentId: el.deptId,
                });
              }
            });
            this.$nextTick(() => {
              el.children = treeAddMemberList;
            });
          });
        }
      });
      this.$nextTick(() => {
        this.MemberDeptTree = this.handleTree(list, "deptId");
        this.$nextTick(() => {
          console.log(
            this.MemberDeptTree,
            "==========treeAddMemberList==============="
          );
        });
      });
    },
    downloadPassword() {
      this.showNewPassword = false;
      let data = [this.newPassword];
      const blob = new Blob(data, { type: "text/csv,charset=UTF-8" });
      const url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.download = "密码.csv";
      link.href = url;
      link.click();
    },
    deptCheckL() {
      this.isDisabled = true;
      console.log(this.deptInfo.deptLevel, this.deptInfo.deptCode);
      if (
        this.deptInfo.deptName != null &&
        this.deptInfo.deptName.replace(/\s+/g, "").length > 0 &&
        this.deptInfo.deptLevel != 1
      ) {
        this.isDisabled = false;
      }
      if (
        this.deptInfo.deptName != null &&
        this.deptInfo.deptName.replace(/\s+/g, "").length > 0 &&
        this.deptInfo.deptLevel == 1 &&
        this.deptInfo.deptCode != null &&
        this.deptInfo.deptCode.replace(/\s+/g, "").length > 0
      ) {
        this.isDisabled = false;
      }
    },
    checkL() {
      this.isDisabled = true;

      if (this.selectMember.userName && this.selectMember.userName.replace(/\s+/g, "").length > 0) {
        if (
          this.selectMember.nickName &&
          this.selectMember.nickName.replace(/\s+/g, "").length > 0
        ) {
          if (
            this.selectMember.phonenumber &&
            this.selectMember.phonenumber.replace(/\s+/g, "").length == 11
          ) {
            if (this.selectMember.roles) {
              if (this.selectMember.roles[0].roleId != null) {
                if (this.selectMember.password != null) {
                  this.isDisabled = false;
                } else if (!this.selectMember.isAddMember) {
                  console.log(
                    this.selectMember.isAddMember,
                    "======this.selectMember.isAddMember====="
                  );
                  this.isDisabled = false;
                }
              }
            }
          }
        }
      }
    },
    toUserManage() {
      this.tabPosition = "2";
      this.getMemberList(undefined, null, true);
    },
    copy() {
      var oinput = document.createElement("input");
      oinput.value = this.newPassword;
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
    updatePassword() {
      this.selectMember.password = this.newPassword;
      if (this.resetType == "2") {
        this.newPassword = this.randomString(10);
        while (!this.checkPassword(this.newPassword)) {
          this.newPassword = this.randomString(10);
        }
        this.$nextTick(() => {
          this.showNewPassword = true;
        });
      }
      if (!this.selectMember.isAddMember) {
        resetUserPwd(this.selectMember.userId, this.newPassword).then(
          (response) => {
            this.$message({
              message: "更新成功！",
              type: "success",
              showClose: true,
            });
          }
        );
      } else {
        this.$message({
          message: "密码设置成功！",
          type: "success",
          showClose: true,
        });
      }
      this.resetPassword = false;
      this.checkL();
    },
    memberChangeDept() {
      this.loading = true;
      if (this.selectedDeptId != null) {
        this.checkedMemberList.forEach((el) => {
          let params = {
            userId: el.userId,
            userName: el.userName,
            nickName: el.nickName,
            phonenumber: el.phonenumber,
            deptId: this.selectedDeptId,
            remark: this.returnNewDate(),
            roleIds: [el.roles[0].roleId],
          };
          updateUser(params).then((response) => { });
        });
        console.log(
          this.selectedDeptId,
          "====================memberChangeDept============="
        );
      } else {
      }
      this.memberChangedrawer = false;
      setTimeout(this.afterChange, 1000);
    },
    afterChange() {
      this.getMemberList(this.deptInfo.deptId, null, true);
      this.loading = false;
    },
    memberdrawerCLose() {
      this.memberChangedrawer = false;
      this.selectedDeptId = null;
    },
    openMemberChangedrawer(isMemberIn) {
      this.setMemberDeptTree();
      this.isMemberIn = isMemberIn;
      this.selectedDeptId = null;
      this.memberChangedrawer = true;
      if (!isMemberIn && this.checkedList.length == 0) {
        this.memberChangedrawer = false;
      }
    },
    ishasPermissions(P) {
      return this.permissions.includes(P);
    },
    //点击成员管理的移除
    setCheckedList(id) {
      this.checkedList = [id];
      this.dialogVisible = true;
    },
    //点击全选
    clickAll() {
      this.selectNum = 0;
      this.checkedList = [];
      this.checkedMemberList = [];
      this.deptInfo.memberList.forEach((el) => {
        console.log('=================clickAll===============', el);
        el.checked = this.checked;
        if (
          this.checked &&
          !(el.userName.indexOf("defaultUser_") >= 0 || el.userId == 1)
        ) {
          this.selectNum++;
          this.checkedList.push(el.userId);
          this.checkedMemberList.push(el);
          console.log("this.checkedList", this.checkedList);
          console.log("this.checkedMemberList", this.checkedMemberList);
        }
      });
      this.isIndeterminate =
        this.selectNum > 0 && this.selectNum < this.deptInfo.memberList.length;
      if (this.selectNum == this.deptInfo.memberList.length) {
        this.isIndeterminate = false;
      }
      console.log("this.checkedList", this.checkedList);
      console.log("this.checkedMemberList", this.checkedMemberList);
    },
    //选择成员
    addSelected(node) {
      console.log("this.checkedList", this.checkedList);
      console.log("this.checkedMemberList", this.checkedMemberList);
      if (node.checked) {
        this.selectNum++;
        this.checkedList.push(node.userId);
        this.checkedMemberList.push(node);
      } else {
        this.selectNum--;
        this.checkedList.splice(this.checkedList.indexOf(node.userId), 1);
        this.checkedMemberList.splice(this.checkedMemberList.indexOf(node), 1);
      }
      this.checked = this.selectNum == this.deptInfo.memberList.length;
      this.isIndeterminate =
        this.selectNum > 0 && this.selectNum < this.deptInfo.memberList.length;
      console.log("this.checkedList", this.checkedList);
      console.log("this.checkedMemberList", this.checkedMemberList);
    },
    //成员删除
    deleteMembers() {
      delUser(this.checkedList).then((response) => {
        this.$message({
          message: "删除成功！",
          type: "success",
          showClose: true,
        });
        this.getMemberList(this.deptInfo.deptId, null, true);
        this.dialogVisible = false;
      });
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then((response) => {
        return response;
      });
    },
    beforeDeleteRole(roleId) {
      this.roleDialogVisible = false;
      if (this.isManager) {
        delRole(roleId).then((res) => {
          this.$message({
            message: "删除成功！",
            type: "success",
            showClose: true,
          });
          this.isClickRole = false;
          this.resetRoleInfo();
          this.getRoleList();
        });
      } else {
        let queryParams = {
          pageNum: 1,
          pageSize: 10,
          userName: "defaultUser_",
          phonenumber: undefined,
          status: undefined,
          deptId: this.deptId,
        };
        listUser(this.addDateRange(queryParams, [])).then((response) => {
          if (response.rows.length >= 1) {
            getUser(response.rows[0].userId).then((res) => {
              let ids = [];
              res.roleIds.forEach((element) => {
                if (element != roleId) {
                  ids.push(element);
                }
              });
              let params = {
                userId: res.data.userId,
                userName: res.data.userName,
                nickName: res.data.nickName,
                phonenumber: res.data.phonenumber,
                deptId: res.data.deptId,
                remark: res.data.remark,
                roleIds: ids,
              };
              updateUser(params).then((responsef) => {
                this.$message({
                  message: "删除成功！",
                  type: "success",
                  showClose: true,
                });
                this.isClickRole = false;
                this.resetRoleInfo();
                this.getRoleList();
              });
            });
          }
        });
      }

    },
    setDeleteNode(node) {
      this.roleNode = node;
      this.roleDialogVisible = true;
    },
    //设置角色信息
    setRoleInfo(node) {
      this.oldRoleDeptList = [];
      this.roleDeptList = [];
      this.isClickRole = true;
      this.resetRoleInfo();
      const roleMenu = this.getRoleMenuTreeselect(node.roleId);
      getRole(node.roleId).then((response) => {
        response.data.showRoleName = response.data.roleName.substring(
          0,
          response.data.roleName.indexOf("|")
        );
        this.roleInfo = response.data;
        if (response.data.roleKey == "auth_admin") {
          this.isAdmin = true;
        }
        if (response.data.remark) {
          this.oldRoleDeptList = response.data.remark.split(',');
          this.roleDeptList = response.data.remark.split(',');
        }
        console.log('==========oldRoleDeptList===========', this.oldRoleDeptList)
        this.$nextTick(() => {
          roleMenu.then((res) => {
            let checkedKeys = res.checkedKeys;
            this.roleInfo.checkedKeys = res.checkedKeys;
            console.log(
              res.checkedKeys,
              "================================setRoleInfo=================================="
            );
            checkedKeys.forEach((v) => {
              this.changeMenuListCheck(v);
            });
          });
        });
      });
    },
    //权限全选
    changeAll(node) {
      node.children.forEach((el) => {
        el.checked = node.checked;
      });
      node.indeterminate = false;
      if (!node.checked) {
        node.checkedLen = 0;
      } else {
        node.checkedLen = node.children.length;
      }
    },
    //部分权限改变
    changeSome(node, btnNode) {
      if (btnNode.checked) {
        node.checkedLen++;
        node.checked = true;
        node.indeterminate = !(node.checkedLen == node.children.length);
      } else {
        node.checkedLen--;
        node.indeterminate = true;
        if (node.checkedLen == 0) {
          node.indeterminate = false;
          node.checked = false;
        }
      }
      console.log(this.getMenuAllCheckedKeys());
      console.log(this.mustHaveMenuList);
    },
    //修改权限范围的选择
    changeMenuListCheck(id) {
      this.menuList.forEach((el) => {
        el.children.forEach((ele) => {
          // ele.disabled = false;
          // if (ele.orderNum == 0) {
          //   ele.disabled = true;
          // }
          if (ele.menuId == id) {
            el.checkedLen = el.checkedLen + 1;
            el.checked = true;
            ele.checked = true;
            el.indeterminate = true;

            if (el.checkedLen == el.children.length) {
              el.indeterminate = false;
              el.checked = true;
            }
          }
        });
      });
    },
    getMenuAllCheckedKeys() {
      var keys = [];
      this.menuList.forEach((el) => {
        if (el.checked) {
          keys.push(el.menuId);
          el.children.forEach((ele) => {
            if (ele.checked) {
              keys.push(ele.menuId);
            }
          });
        }
      });
      return keys;
    },
    //编辑或新增角色
    updateRoleInfo() {
      this.isClickRole = false;
      this.roleInfo.roleName = this.roleInfo.showRoleName.replace(/\s+/g, "") + "|" + this.deptId;
      this.roleInfo.remark = this.roleDeptList.join(',');
      if (!this.roleInfo.showRoleName.replace(/\s+/g, "").length > 0) {
        this.$message({
          message: "角色名称不可为空",
          type: "error",
          showClose: true,
        });
        this.isClickRole = true;
      }
      else if (this.getMenuAllCheckedKeys().length <= 0) {
        this.$message({
          message: "请至少选择一项权限！",
          type: "error",
          showClose: true,
        });
        this.isClickRole = true;
      }
      else
        if (this.roleInfo.roleId != undefined) {
          this.roleInfo.menuIds = this.getMenuAllCheckedKeys().concat(
            this.mustHaveMenuList
          );
          if (this.roleInfo.roleName.indexOf('超级管理员') != -1) {
            this.roleInfo.roleKey = this.randomString(8) + "admin";
          }
          updateRole(this.roleInfo).then((response) => {
            this.resetDeptListForRole(this.oldRoleDeptList, this.roleDeptList, this.roleInfo.roleId, false);
            this.$message({
              message: "修改成功！",
              type: "success",
              showClose: true,
            });
            this.isClickRole = false;

            this.$nextTick(() => {
              this.resetRoleInfo();
              this.getRoleList();
            })

          });
        } else {
          this.roleInfo.menuIds = this.getMenuAllCheckedKeys().concat(
            this.mustHaveMenuList
          );
          if (this.roleInfo.roleName.indexOf('超级管理员') != -1) {
            this.roleInfo.roleKey = this.randomString(8) + "admin";
          } else {
            this.roleInfo.roleKey = this.randomString(8);
          }
          addRole(this.roleInfo).then((response) => {
            if (this.isManager) {
              this.$message({
                message: "新增成功！",
                type: "success",
                showClose: true,
              });
              this.isClickRole = false;
              this.resetRoleInfo();
              this.getRoleList();
            } else {
              this.getHideUser(response.data);
            }
            this.resetDeptListForRole(this.oldRoleDeptList, this.roleDeptList, response.data, true)
          });
        }
    },
    getHideUser(roleId) {
      let queryParams = {
        pageNum: 1,
        pageSize: 10,
        userName: "defaultUser_",
        phonenumber: undefined,
        status: undefined,
        deptId: this.deptId,
      };
      listUser(this.addDateRange(queryParams, [])).then((response) => {
        if (response.rows.length >= 1) {
          getUser(response.rows[0].userId).then((res) => {
            let ids = [];
            res.roleIds.forEach((element) => {
              ids.push(element);
            });
            ids.push(roleId);
            let params = {
              userId: res.data.userId,
              userName: res.data.userName,
              nickName: res.data.nickName,
              phonenumber: res.data.phonenumber,
              deptId: res.data.deptId,
              remark: res.data.remark,
              roleIds: ids,
            };
            updateUser(params).then((responsef) => {
              this.$message({
                message: "新增成功！",
                type: "success",
                showClose: true,
              });
              this.resetRoleInfo();
              this.getRoleList();
            });
          });
        }
      });
    },
    //重置角色信息
    resetRoleInfo() {
      this.roleInfo = {
        dataScope: "4",
        roleId: undefined,
        showRoleName: '',
        roleName: undefined,
        roleKey: undefined,
        roleSort: 6,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined,
        checkedKeys: [],
      };
      this.isAdmin = false;
      console.log(this.menuList);
      this.menuList.forEach((el) => {
        el.checkedList = [];
        el.checked = false;
        el.indeterminate = false;
        el.checkedLen = 0;
        el.children.forEach((ele) => {
          ele.checked = false;
        });
      });
    },
    //编辑或新增成员信息
    returnNewDate() {
      console.log(new Date(), "returnNewDate");
      let str =
        new Date().getFullYear() +
        "-" +
        (new Date().getMonth() + 1 > 9
          ? new Date().getMonth() + 1
          : "0" + (new Date().getMonth() + 1)
        ).toString() +
        "-" +
        (new Date().getDate() > 9
          ? new Date().getDate()
          : "0" + new Date().getDate()
        ).toString() +
        " " +
        (new Date().getHours() > 9
          ? new Date().getHours()
          : "0" + (new Date().getHours())
        ).toString() +
        ":" +
        (new Date().getMinutes() > 9
          ? new Date().getMinutes()
          : "0" + (new Date().getMinutes())
        ).toString() +
        ":" +
        (new Date().getSeconds() > 9
          ? new Date().getSeconds()
          : "0" + (new Date().getSeconds())
        ).toString();
      console.log(str, "returnNewDate");
      return str;
    },
    updateMemberInfo() {
      let params = {
        userId: undefined,
        nickName: this.selectMember.nickName.replace(/\s+/g, ""),
        phonenumber: this.selectMember.phonenumber.replace(/\s+/g, ""),
        userName: this.selectMember.userName.replace(/\s+/g, ""),
        deptId: this.selectMember.dept.deptId,
        remark: this.selectMember.remark,
        roleIds: [this.selectMember.roles[0].roleId],
      };
      if (this.selectMember.isAddMember) {
        params.password = encrypt(this.newPassword);
        params.remark = this.returnNewDate();
        addUser(params).then((response) => {
          this.getMemberList(this.deptInfo.deptId, null, true);
          this.$message({
            message: "新增成功",
            type: "success",
            showClose: true,
          });
        });
      } else {
        if (this.selectMember.oldDeptId != this.selectMember.dept.deptId) {
          params.remark = this.returnNewDate();
        }
        params.userId = this.selectMember.userId;
        updateUser(params).then((response) => {
          this.getMemberList(this.deptInfo.deptId, null, true);
          this.$message({
            message: "修改成功！",
            type: "success",
            showClose: true,
          });
        });
      }
      this.memberDrawer = false;
    },

    //成员编辑框点击关闭按钮
    MemberDrawerCLose() {
      this.memberDrawer = false;
      this.getMemberList(this.deptInfo.deptId, null, true);
    },
    //打开编辑或新增成员弹窗
    openMemberDrawer(node, isInDept) {
      this.resetMember();
      this.newPassword = "";
      this.isPswOk = true;
      if (isInDept) {
        this.selectMember.dept.deptId = this.deptInfo.deptId;
        this.selectMember.oldDeptId = this.deptInfo.deptId;
        this.selectMember.dept.deptName = this.deptInfo.deptName;
        this.selectMember.isInDept = isInDept;
      }
      if (node) {
        this.selectMember = node;
        this.selectMember.isAddMember = false;
        this.selectMember.oldDeptId = node.dept.deptId;
      }
      this.memberDrawer = true;
      this.checkL();
    },
    //重置成员信息
    resetMember() {
      this.selectMember = {
        oldDeptId: null,
        isInDept: false,
        userName: "",
        phonenumber: "",
        dept: { deptName: "", deptId: 201 },
        userId: "",
        password: null,
        remark: null,
        createTime: null,
        isAddMember: true,
        roles: [{ roleId: null, roleName: null, showRoleName: '' }],
      };
    },
    //查询成员详情
    getMemberDetail(userId) {
      getUser(userId).then((response) => {
        if (response.roleIds.length > 1) {
          response.data.roles[0].roleName = this.roleName;
          response.data.roles[0].showRoleName = this.roleName.substring(
            0,
            this.roleName.indexOf("|")
          );
        }
        if (response.roleIds.length > 0) {
          response.data.roles[0].showRoleName =
            response.data.roles[0].roleName.substring(
              0,
              response.data.roles[0].roleName.indexOf("|")
            );
        }

        this.deptInfo.memberList.push(response.data);
      });
    },
    //查询权限列表
    getMenuList() {
      this.mustHaveMenuList = [];
      this.menuLen = 0;
      listMenu({
        menuName: undefined,
        visible: undefined,
      }).then((response) => {
        response.data.forEach((el) => {
          el.checked = false;
          el.checkedList = [];
          el.checkedLen = 0;
          if (el.perms.indexOf("system") != -1) {
            this.mustHaveMenuList.push(el.menuId);
            this.menuLen++;
          }
          if (el.menuType == "M") {
            this.mustHaveMenuList.push(el.menuId);
            this.menuLen++;
          }
          if (el.perms.indexOf("home:") != -1) {
            this.menuLen++;
          }
        });
        console.log(
          this.mustHaveMenuList,
          "=================getMenuList=============================="
        );
        this.handleTree(response.data, "menuId").forEach((el) => {
          console.log(
            el,
            "=================getMenuList=============================="
          );
          if (el.menuName == "实名制管理后台") {
            this.setMenuList(el.children);
          }
        });
      });
    },
    setMenuList(list) {
      this.menuList = list;
    },
    //查询角色列表
    getRoleList() {
      this.roleList = [];
      let queryParams = {
        pageNum: 1,
        pageSize: 999,
        roleName: undefined,
        roleKey: undefined,
        status: undefined,
      };
      let dateRange = [];
      listRole(this.addDateRange(queryParams, dateRange)).then((response) => {
        if (this.deptLevel == 1) {
          response.rows.forEach((el) => {
            el.showRoleName = el.roleName.substring(0, el.roleName.indexOf("|"));
            if (el.roleKey != "admin" && el.roleKey != "sws_admin") {
              this.roleList.push(el);
            }
          });
        } else {
          response.rows.forEach((el) => {
            el.showRoleName = el.roleName.substring(0, el.roleName.indexOf("|"));
            if (el.roleKey != "admin" && el.roleKey != "sws_admin" && el.roleKey != 'auth_admin') {
              this.roleList.push(el);
            }
          });
        }
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //点击drawer关闭按钮
    drawerCLose() {
      this.drawer = false;
      this.getDeptInfo(this.$refs.tree.getCurrentKey());
    },
    //改变所属组织
    handleChange() {
      console.log(this.deptInfo.belongDept, "handleChange");
      this.deptInfo.deptLevel =
        this.$refs["cascader"].getCheckedNodes()[0].data.labelLevel;
    },
    //组织节点被点击，查询组织基本信息和所属成员列表
    handleNodeClick(data, node) {
      this.checked = false;

      var deptPath = "";
      var currNodeName = node.data.label;
      var currNode = node;
      while (currNode.parent != null) {
        deptPath = currNodeName + " > " + deptPath;
        currNode = currNode.parent;
        currNodeName = currNode.data.label;
      }
      if (deptPath) {
        this.deptInfo.deptPath = deptPath.substring(0, deptPath.length - 3);
      }
      this.deptInfo.deptLevel = this.$refs.tree.getCurrentNode().labelLevel;
      console.log(this.$refs.tree.getCurrentNode(), "handleNodeClick");

      this.getDeptInfo(node.data.id);
    },
    //查询组织基本信息
    getDeptInfo(id) {
      this.deptInfo.deptCode = null;
      getDept(id).then((response) => {
        this.deptInfo.deptName = response.data.deptName;
        this.deptInfo.deptId = response.data.deptId;
        this.deptInfo.deptDesc = response.data.leader;
        this.deptInfo.belongDept = response.data.parentId;
        if (response.data.deptCode) {
          this.deptInfo.deptCode = response.data.deptCode;
        }
        this.getMemberList(id, response.data.deptName, null, false);
      });
    },
    //查询点击组织的所属成员列表
    getMemberList(deptId, deptName, isSelect) {
      this.checkedList = [];
      this.checkedMemberList = [];
      this.selectNum = 0;
      this.deptInfo.memberList = [];
      this.deptInfo.memberList.length = 0;
      this.queryParams.deptId = deptId;
      this.queryParams.userName = this.inputMemInfo;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.checked = false;
          this.isIndeterminate = false;
          this.checkedList = [];
          if (!isSelect) {
            if (response.rows.length == 0) {
              this.addHideUser(deptId, deptName);
            }
          }
          response.rows.forEach((element) => {
            element.checked = false;
            if (element.remark) {
              element.remark =
                element.remark.substring(0, element.remark.indexOf("T")) +
                " " +
                element.remark.substring(
                  element.remark.indexOf("T") + 1,
                  element.remark.indexOf(".")
                );
            } else {
              element.remark = "-";
            }
            this.getMemberDetail(element.userId);
          });
          this.total = response.total;
        }
      );
      console.log();
    },
    tabChange() {
      this.inputMemInfo = null;
      this.selectNum = 0;
      this.checked = false;
      this.checkedList = [];
      this.checkedMemberList = [];
      if (this.tabPosition == "1") {
        this.getTreeselect();
      } else if (this.tabPosition == "2") {
        this.getMemberList(undefined, undefined, true);
        this.deptInfo.deptId = undefined;
        treeselect().then((response) => {
          this.deptOptions = response.data;
        });
      } else {
        this.resetRoleInfo();
        this.isClickRole = false;
        this.getRoleList();
        this.getMenuList();
      }
    },
    getTreeselect() {
      treeselect().then((response) => {
        this.adminDeptId = response.data[0].id;
        this.deptOptions = response.data;
        this.$nextTick(function () {
          this.setDefaultDept(response.data[0]);
          console.log(
            this.deptOptions,
            "=======================getTreeselect======================"
          );
        });
      });
    },
    setDefaultDept(data) {
      var currNode = data;
      var deptPath = "";
      console.log(
        currNode,
        "---------------------setDefaultDept----------------------------------"
      );
      while (currNode.children) {
        console.log(currNode);
        deptPath += currNode.label + " > ";
        this.defaultDept.push(currNode.id);
        currNode = currNode.children[0];
      }
      this.deptInfo.deptPath = deptPath + currNode.label;
      this.deptInfo.deptLevel = currNode.labelLevel;
      console.log(this.deptInfo.deptLevel);
      this.getDeptInfo(currNode.id);
      if (this.$refs.tree.setCurrentKey(currNode.id)) {

      }
    },
    //先删除成员
    beforedeleteDept() {
      if (this.thisClickUserId) {
        delUser(this.thisClickUserId).then((response) => {
          if (response.code) {
            this.deleteDept();
          }
          else {
            this.$message({
              message: response.msg,
              type: "error",
              showClose: true,
            });
          }
        });
      } else {
        this.deleteDept();
      }

    },
    //点击删除按钮
    clickDeptDelete() {
      this.thisClickUserId = null;
      if (this.$refs.tree.getCurrentNode().children) {
        this.$message({
          message: "存在下级组织，无法删除！",
          type: "error",
          showClose: true,
        });
      } else {
        listUser(
          this.addDateRange(
            {
              pageNum: 1,
              pageSize: 999,
              userName: undefined,
              phonenumber: undefined,
              status: undefined,
              deptId: this.$refs.tree.getCurrentNode().id,
            },
            []
          )
        ).then((response) => {

          if (response.rows.length > 1) {
            this.$message({
              message: "请先将该组织下非默认管理员的成员移出或移除！",
              type: "warning",
              showClose: true,
            });
          } else if (response.rows.length == 1) {
            this.thisClickUserId = response.rows[0].userId;
            this.$nextTick(() => {
              this.deptDialogVisible = true;
            });
          } else {
            this.thisClickUserId = null;
            this.deptDialogVisible = true;
          }
        });
      }
    },
    //移动组织原有成员
    removeDeptHas() {
      this.loading = true;
      let queryParams = {
        pageNum: 1,
        pageSize: 999,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: this.$refs.tree.getCurrentNode().id, //删除的组织id
      };
      listUser(this.addDateRange(queryParams, [])).then((response) => {
        if (response.rows.length > 0) {
          response.rows.forEach((ele) => {
            getUser(ele.userId).then((response) => {
              let params = {
                userId: response.data.userId,
                nickName: response.data.nickName,
                phonenumber: response.data.phonenumber,
                userName: response.data.userName,
                deptId: 201,
                roleIds: [response.data.roles[0].roleId],
              };
              updateUser(params).then((response) => { });
            });
          });
        }
      });
      setTimeout(this.deleteDept, 1000);
    },
    deleteDept() {
      delDept(this.$refs.tree.getCurrentNode().id).then((response1) => {
        this.getTreeselect();
        this.loading = false;
        this.deptDialogVisible = false;
        this.getDeptOptions();
        this.$message({
          message: "删除成功！",
          type: "success",
          showClose: true,
        });
      });
    },
    //成员调度
    moveMembers(deptId) { },
    getRoleDeptOptions() {
      this.roleDeptOptions = [];
      treeselect().then((response) => {
        response.data.forEach((el) => {
          if (el.children) {
            el.children.forEach((ele) => {
              this.roleDeptOptions.push(ele);
            })
          }

        })
      });
    },
    getDeptOptions() {
      treeselect().then((response) => {
        this.$store
          .dispatch("GetDept", response.data)
      });
    },
    //编辑组织
    deptChange() {
      let form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        orderNum: 1,
        leader: undefined,
        phone: undefined,
        remark: undefined,
        deptCode: undefined,
        status: "0",
      };
      form.parentId = this.deptInfo.belongDept;
      form.leader = this.deptInfo.deptDesc;
      form.deptName = this.deptInfo.deptName.replace(/\s+/g, "");
      if (this.deptInfo.deptLevel == 1) {
        form.deptCode = this.deptInfo.deptCode.replace(/\s+/g, "");
      }
      if (this.deptInfo.deptId != null) {
        form.deptId = this.deptInfo.deptId;
        updateDept(form).then((response) => {
          this.$message({
            message: "修改成功！",
            type: "success",
            showClose: true,
          });
          this.getTreeselect();
          this.getRoleDeptOptions();
          this.getDeptOptions();
        });
      } else {
        addDept(form).then((response) => {
          this.$message({
            message: "新增成功！",
            type: "success",
            showClose: true,
          });
          this.getTreeselect();
          this.getRoleDeptOptions();
          this.getDeptOptions();
        });
      }
      this.drawer = false;
    },
    //新增隐藏用户，用于管理角色
    addHideUser(deptId, deptName) {
      listRole(
        this.addDateRange(
          {
            pageNum: 1,
            pageSize: 10,
            roleName: undefined,
            roleKey: "auth_admin",
            status: undefined,
          },
          []
        )
      ).then((response) => {
        let params = {
          nickName: deptName + "初始管理员",
          userName: "defaultUser" + "_" + deptId,
          deptId: deptId,
          password: encrypt("A8J.2a!n5O."),
          roleIds: [response.rows[0].roleId],
          remark: this.returnNewDate(),
        };
        addUser(params).then((response) => { });
      });
    },
    //重置组织信息
    resetDeptInfo() {
      this.deptInfo = {
        isAddDept: false,
        deptPath: null,
        belongDept: this.$refs.tree.getCurrentKey() || undefined,
        deptName: null,
        deptId: null,
        deptDesc: null,
        deptCode: null,
        deptLevel: this.$refs.tree.getCurrentNode().labelLevel,
        memberList: [],
      };
    },
    //新增或编辑组织
    openDeptDrawer(isAddDept) {
      if (isAddDept) {
        this.resetDeptInfo();
      } else {
        this.deptInfo.deptLevel =
          this.$refs.tree.getCurrentNode().labelLevel - 1;
      }
      this.drawer = true;
      this.deptInfo.isAddDept = isAddDept;
      this.deptCheckL();
    },
    checkPassword(psw) {
      var testPassword =
        /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[!#@*&.])[a-zA-Z\d!#@*&.]*$/;

      this.isPswOk = testPassword.test(psw.replace(/\s+/g, ""));
      return testPassword.test(psw.replace(/\s+/g, ""));
    },
    //随机字符串
    randomString(len) {
      len = len || 8;
      var $chars =
        "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678.@$!%*#_~?&^"; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
      var maxPos = $chars.length;
      var pwd = "";
      for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
    },
  },
  created() {
    this.tabChange();
    this.getRoleList();
    this.role = Cookies.get("role");
    console.log(
      this.role,
      "==================created============================"
    );
  },
  mounted() {
    this.getRoleDeptOptions();
    this.permissions = this.getPermissions;
    this.isManager = Cookies.get("role") == "admin";
    // this.addDeptRole = auth.hasPermi("home:userManage:addDept");
    // this.deleteDeptRole = auth.hasPermi("home:userManage:deleteDept");
    // this.editDeptRole = auth.hasPermi("home:userManage:editDept");
    // this.addUserRole = auth.hasPermi("home:userManage:addUser");
    // this.deleteUserRole = auth.hasPermi("home:userManage:deleteUser");
    // this.editUserRole = auth.hasPermi("home:userManage:editUser");
    // this.moveUserRole = auth.hasPermi("home:userManage:moveUser");

    this.addDeptRole = true;

    this.deleteDeptRole = true;

    this.editDeptRole = true;

    this.addUserRole = true;

    this.deleteUserRole = true;

    this.editUserRole = true;

    this.moveUserRole = true;
  },
  beforeDestroy() { },
};
</script>
<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.userManage {
  font-size: toRem(14);

  .showNewPasswordClass {
    ::v-deep .el-dialog {
      .el-dialog__body {
        >p:first-child {
          width: 95%;
          text-align: left;
          margin-left: 0.3rem;
          margin-bottom: toRem(20);

          >span {
            font-weight: 400;
            color: rgba(0, 0, 0, 0.4);
            display: inline-block;
            margin-left: toRem(8);
          }
        }

        >p:nth-child(2) {
          color: #262626;

          >span {
            display: inline-block;
            margin-left: toRem(15);
            cursor: pointer;
            color: #1e6fff;
          }
        }
      }
    }
  }

  .resetPasswordClass {
    ::v-deep .el-dialog {
      .el-dialog__header {
        padding: 0;
      }

      .el-dialog__body {
        align-items: flex-start;
        padding: toRem(20) 0 0 toRem(30);

        >p:first-child {
          margin: 0 0 toRem(20) 0;
        }

        span {
          color: rgba(0, 0, 0, 0.4);
          font-size: toRem(14);
        }

        >div:nth-child(2) {
          display: flex;
          align-items: center;

          >span {
            display: inline-block;
            height: toRem(22);
            line-height: toRem(17.5);
            width: toRem(96);
            text-align: left;
          }

          .el-radio {
            font-size: toRem(14);

            .el-radio__inner {
              width: toRem(14);
              height: toRem(14);
            }

            .el-radio__label {
              color: rgba(0, 0, 0, 0.9);
            }
          }
        }

        >div:nth-child(3) {
          margin-top: toRem(13);
          margin-left: toRem(96);
          width: toRem(250);
          position: relative;

          .el-input__inner {
            height: toRem(32);
            border-radius: toRem(4);
            border: 1px solid #dcdfe6;
          }

          .el-input__suffix {
            display: none;
          }

          >img {
            position: absolute;
            height: 0.16rem;
            top: 0.085rem;
            right: 0.12rem;
            cursor: pointer;
          }
        }

        >span {
          margin-left: toRem(96);
          display: inline-block;
          text-align: left;
          font-size: toRem(10);
          width: toRem(250);
          margin-top: toRem(4);
        }
      }
    }
  }

  .disableBtn {
    color: #b0b0b0 !important;
    cursor: not-allowed !important;
  }

  .blueUnderlineBtn {
    color: #1e6fff !important;
    text-decoration: underline;
    cursor: pointer;
  }

  .blueBtn {
    width: toRem(96);
    height: toRem(32);
    line-height: toRem(30);
    background: #1e6fff;
    border: 1px solid #1e6fff;
    display: inline-block;
    border-radius: toRem(2);
    color: white;
    cursor: pointer;
    opacity: 0.85;
  }

  .blueBtn:hover {
    opacity: 1;
  }

  .el-drawer__body {
    >div:nth-child(2) {
      margin-left: toRem(40);
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      >span:first-child {
        color: rgba(0, 0, 0, 0.4);
        margin-bottom: toRem(20);
      }

      >div {
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: toRem(10);

        >span:first-child {
          font-weight: 600;
          color: #343434;
          display: inline-block;
          width: toRem(95);
          text-align: left;
        }

        >div {
          text-align: left;
          width: fit-content;
        }

        ::v-deep .el-input__inner {
          height: toRem(36);
          width: toRem(330);
        }

        ::v-deep .el-input--medium .el-input__icon {
          font-size: toRem(12);
          margin-right: toRem(10);
        }
      }

      >div:nth-child(2) {
        ::v-deep .el-input__inner {
          width: toRem(230);
        }

        >span:last-child {
          color: #343434;
          margin-left: toRem(17);
        }
      }

      >div:nth-child(5) {
        align-items: flex-start;

        ::v-deep .el-textarea__inner {
          width: toRem(330);
          height: toRem(90) !important;
          resize: none;
          font-size: toRem(14) !important;
        }
      }
    }

    .orgClass {
      >span:first-child {
        height: toRem(40);
        margin-top: toRem(10);
      }
    }

    .memberDrawer {
      >div {
        >span {
          height: toRem(36);
          line-height: toRem(36);
        }

        ::v-deep .el-input__inner {
          width: toRem(410) !important;
        }

        >span:nth-child(2) {
          color: rgba(0, 0, 0, 0.65);
          margin-right: toRem(15);
        }

        >span:nth-child(3) {
          cursor: pointer;
          color: #1e6fff;
        }
      }
    }

    .memberOut {
      >span:first-child {
        font-weight: 600;
        margin-bottom: toRem(10) !important;
      }

      ::v-deep .el-cascader {
        width: toRem(410);

        >div {
          .el-input__inner {
            width: toRem(410) !important;
          }
        }
      }
    }

    .memberIn {
      >div:first-child {
        margin-bottom: toRem(19);

        >div:first-child,
        div:nth-child(3) {
          width: toRem(240);

          >span {
            font-weight: 600;
            color: #343434;
          }

          >div {
            width: toRem(240);
            height: toRem(348);
            background: #ffffff;
            border-radius: toRem(3);
            border: 1px solid #dcdcdc;
            margin-top: toRem(13);
          }
        }

        >div:nth-child(2) {
          width: toRem(48);
        }
      }

      >span:nth-child(2) {
        opacity: 0.45;
        color: #343434;
      }
    }
  }

  .el-breadcrumb {
    margin-top: toRem(17);
    margin-bottom: toRem(32);
    margin-left: toRem(40);
  }

  .tabsHead {
    margin-bottom: 0;
  }

  .tabContent {
    background-color: rgba(243, 244, 247, 1);

    ::v-deep .el-input__inner {
      height: toRem(32);
    }

    ::v-deep .el-input__icon {
      color: #1e6fff !important;
      line-height: toRem(32);
      font-size: toRem(12);
      margin-right: toRem(10);
      cursor: pointer;
    }

    >div {
      background: white;
      min-height: toRem(786);
      margin: 0 toRem(40);
      display: flex;

      >div {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      >div:first-child {
        width: toRem(459);
        padding: toRem(19) toRem(30);

        >div {
          display: flex;
          font-size: toRem(14);
        }
      }

      .deptList {
        >div:first-child {
          justify-content: space-between;
          margin-bottom: toRem(10);

          span {
            color: #1e6fff;
            display: inline-block;
            cursor: pointer;
            height: toRem(32);
            line-height: toRem(32);
          }

          >div:first-child {
            >span {
              width: toRem(96);
              background: #ffffff;
              border: 1px solid rgba(0, 0, 0, 0.15);
              color: rgba(0, 0, 0, 0.65);

              border-radius: 4px;
            }

            >span:first-child {
              background: #1e6fff;
              border: 1px solid #1e6fff;
              color: white;
              margin-right: toRem(16);
            }
          }
        }

        >div:nth-child(3) {
          margin-top: toRem(25);

          ::v-deep .el-tree {
            .el-tree-node__content:hover {
              background-color: #ecf2fe;
            }

            .el-tree-node__content {
              width: toRem(398);
              height: toRem(28);
              display: flex;
              align-items: center;

              span {
                font-size: toRem(14) !important;
              }

              >.el-tree-node__expand-icon {
                padding-right: toRem(10);
              }
            }
          }
        }
      }

      >div:nth-child(2) {
        background-color: #e7e7e7;
        width: 1px;
        height: toRem(780);
        margin-top: toRem(6);
      }

      >div:nth-child(3) {
        width: toRem(900);
        align-items: flex-start;

        >div {
          width: 100%;
          text-align: left;
        }
      }

      .deptDetail {
        padding: toRem(26) toRem(25) 0 toRem(21);

        >div {
          width: 100%;
          text-align: left;

          span {
            color: #424549;
          }
        }

        >div:first-child {
          font-size: toRem(18);
          font-weight: 600;

          >i {
            margin-left: toRem(10);
            cursor: pointer;
          }
        }

        >div:nth-child(2) {
          display: flex;
          flex-direction: column;
          margin: toRem(16) 0 toRem(29) 0;

          >div {
            display: flex;
            align-items: center;
            margin-bottom: toRem(15);

            >span {
              display: inline-block;
            }

            >span:first-child {
              width: toRem(76);
              opacity: 0.68;
            }
          }
        }

        >span:nth-child(3) {
          font-size: toRem(18);
          font-weight: 600;
        }

        >div:nth-child(4) {
          margin: toRem(20) 0;
          display: flex;
          justify-content: space-between;
          align-items: center;

          >div:first-child {
            span {
              display: inline-block;
              width: toRem(96);
              height: toRem(32);
              line-height: toRem(32);
              font-size: toRem(14);
              background: #ffffff;
              border: 1px solid rgba(0, 0, 0, 0.15);
              color: rgba(0, 0, 0, 0.6);
              text-align: center;
              margin-right: toRem(16);
              cursor: pointer;
            }

            >span:first-child {
              background: #1e6fff;
              border: 1px solid #1e6fff;
              color: white;
            }

            >span:nth-child(2) {
              color: #1e6fff;
            }
          }

          >div:nth-child(2) {
            width: toRem(300);
          }
        }

        .infoTable {
          height: fit-content !important;

          >div {
            >span {
              text-align: center;
              width: toRem(200);
            }

            >span:first-child {
              width: toRem(46);
            }
          }
        }

        >div:last-child {
          text-align: right;
        }
      }

      .roleList {
        >div:first-child {
          justify-content: space-between;

          >span:first-child {
            font-size: toRem(18);
            font-weight: 600;
            color: #424549;
          }
        }

        .infoTable {
          margin-top: toRem(20);
          height: fit-content !important;
          flex-direction: column;

          >div {
            >span {
              text-align: center;
              height: toRem(40);
            }

            >span:first-child {
              width: toRem(80);
            }

            >span:nth-child(2) {
              width: toRem(200);
            }

            >span:nth-child(3) {
              width: toRem(120);
              display: flex;
              justify-content: space-evenly;

              >span:last-child {
                color: rgba(252, 100, 120, 1);
              }
            }
          }
        }
      }

      .roleDetail {
        padding: toRem(22) toRem(94) 0 toRem(32);

        .nodataLine {
          align-items: center;
          margin-top: toRem(200);
        }

        >div {
          display: flex;
          align-items: flex-start;

          >span {
            display: inline-block;
            width: toRem(77);
            height: toRem(32);
            line-height: toRem(32);
          }
        }

        >div:first-child {
          ::v-deep .el-input__inner {
            width: toRem(330);
            margin-bottom: toRem(5);
          }

          >div {
            >span {
              font-size: toRem(12);
              color: rgba(0, 0, 0, 0.35);
            }
          }
        }

        >div:nth-child(2) {
          margin-top: toRem(15);

          >span {
            margin-right: toRem(9.7);
          }

          >div {
            width: 100%;
          }
        }

        >div:nth-child(3) {
          margin: toRem(30) 0 0;

          >span:first-child {
            line-height: toRem(14);
          }

          >div:last-child>div {
            margin-bottom: toRem(15);

            ::v-deep span {
              font-size: toRem(14);
            }

            ::v-deep .el-checkbox {
              display: flex;
              align-items: center;
              width: toRem(160);
              margin-bottom: toRem(10);
            }

            >div:nth-child(2) {
              display: flex;
              width: toRem(692);
              height: fit-content;
              flex-wrap: wrap;
              background: #f1f2f5;
              border-radius: toRem(2);
              margin-top: toRem(10);
              padding: toRem(16) toRem(24) toRem(6);
            }
          }
        }
      }
    }

    ::v-deep .memberList {
      flex-direction: column;
      padding: toRem(19) toRem(30);

      >div {
        align-items: center;
        width: 100% !important;
        height: fit-content !important;
      }

      >div:first-child {
        flex-direction: row;
        padding: 0;
        justify-content: flex-start;

        .blueBtn {
          margin-right: toRem(16);
        }

        >span:nth-child(2) {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.15);
          color: #1e6fff;
        }

        >div:last-child {
          width: toRem(300);
          margin-left: auto;
        }
      }

      .operationArea {
        text-align: left;
        margin-top: toRem(20) 0 toRem(11);

        >div {
          width: 100%;
        }
      }

      >div:nth-child(2) {
        background-color: white;
      }

      .infoTable {
        >div {
          >span {
            width: toRem(160);
            text-align: center;
          }

          >span:first-child {
            width: toRem(46);
          }

          >span:last-child {
            width: toRem(118);
            display: flex;
            justify-content: space-evenly;

            >span:last-child {
              color: rgba(252, 100, 120, 1);
            }
          }
        }
      }

      >div:nth-child(4) {
        align-items: flex-end;
      }
    }
  }
}
</style>
