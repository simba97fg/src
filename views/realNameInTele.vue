<template>
    <div class="realNameInTele">

        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>工具</el-breadcrumb-item>
            <el-breadcrumb-item class="is-link">电信侧实名同步<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
            </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="selectArea">
            <div>
                <div>
                    <el-select v-model="type">
                        <el-option v-for="item in typeoptions" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input v-model="inputSelect" placeholder="请输入" @change="getList"></el-input>
                </div>


                <el-cascader :options="deptOptions" :props="props" collapse-tags clearable :show-all-levels="false"
                    placeholder="组织名称" @change="getList" v-model="queryParams.orgIds"></el-cascader>
                <el-select filterable placeholder="匹配状态" v-model="queryParams.pushStatus" @change="getList" clearable>
                    <el-option v-for="item in pushStatusOptions" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select filterable placeholder="操作类型" v-model="queryParams.businessType" @change="getList" clearable>
                    <el-option v-for="item in businessTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-date-picker v-model="time" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
                    type="daterange" start-placeholder="推送起始时间" end-placeholder="结束时间" align="right">
                </el-date-picker>
                <div style="opacity: 0;pointer-events:none"></div>
                <!-- <span @click="getList">按筛选搜索</span>
                <span @click="resetSelect" class="resetBtn">重置</span> -->
            </div>

        </div>
        <el-divider></el-divider>
        <div class="operationArea">
            <div>
                <i class="el-icon-warning"></i>
                <span>已选 {{ selectNum }}</span>
                <span> /{{ total }} 条</span>
            </div>
            <el-dropdown>
                <el-button size="mini">
                    更多操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="resetInstru(checkedList, true)">批量重试</el-dropdown-item>
                    <el-dropdown-item @click.native="resetInstru('all', true)">全部重试</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <el-table :data="infoList" border style="width: 100% ;height:fit-content;padding-bottom: 7px;"
            ref="multipleTable" class="realNameTable" @select-all="selectAll" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="76" align="center" :selectable="selectable">
            </el-table-column>
            <el-table-column prop="vin" label="VIN" width="250" align="center">
            </el-table-column>
            <el-table-column prop="iccid" label="ICCID" width="250" align="center">
            </el-table-column>
            <el-table-column prop="companyName" label="车企名称" width="210" align="center">
            </el-table-column>
            <el-table-column prop="applyNo" label="订单号" width="240" align="center">
            </el-table-column>
            <el-table-column prop="businessTypeName" label="操作类型" width="115" align="center">
            </el-table-column>
            <el-table-column prop="realNameStatusName" label="实名状态" width="115" align="center">
            </el-table-column>
            <el-table-column prop="pushStatusName" label="匹配状态" width="115" align="center">
            </el-table-column>
            <el-table-column width="210" align="center">
                <template slot="header">信息推送时间
                    <div>
                        <i class="el-icon-caret-top" v-bind:class="{ blueBtn: this.queryParams.timeDesc == 2 }"
                            @click="changeOrder(2)" /><i class="el-icon-caret-bottom"
                            v-bind:class="{ blueBtn: this.queryParams.timeDesc == 1 }" @click="changeOrder(1)" />
                    </div>

                </template>
                <template slot-scope="scope">{{ scope.row.pushTime }}
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="180" align="center">
            </el-table-column>
            <el-table-column prop="message" label="异常数据说明" width="180" align="center" show-overflow-tooltip>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="110" align="center">
                <template slot-scope="scope">
                    <span class="blueBtn" v-if="scope.row.message != '-'" @click="setNode(scope.row)">重试</span><span
                        class="blueBtn disableBtn" v-if="scope.row.message == '-'">重试</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChange()" @current-change="currentPageChange"
            :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]"
            :page-size.sync="queryParams.pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
        </el-pagination>
        <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新推送该指令</p>
            <p>此操作不可撤销</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="postNodeList(false, false)">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :visible.sync="somedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新推送已选指令（共{{ checkedList.length }}条）</p>
            <p>仅重新推送原结果为失败的数据项，此操作不可撤销</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="somedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="postNodeList(false, true)">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :visible.sync="alldialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新推送所有失败指令</p>
            <p>仅重新推送原结果为失败的数据项，此操作不可撤销</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="alldialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="postNodeList(true, false)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
// @ is an alias to /src
import Vue from "vue";
import auth from "../plugins/auth";
import Cookies from "js-cookie";
import { treeselect } from "@/api/system/dept";
export default {
    name: "realNameInTele",
    components: {
        "el-image-viewer": () =>
            import("element-ui/packages/image/src/image-viewer"),
    },
    data() {
        return {
            isCuC: false,
            deptOptions: [],
            props: { multiple: true, checkStrictly: true, value: 'id', emitPath: false },
            multipleSelection: [],
            dialogVisible: false,
            somedialogVisible: false,
            alldialogVisible: false,
            openImg: false,
            imgList: [],
            node: null,
            ownerInfoStatus: false,
            liableInfoStatus: false,
            orgInfoStatus: false,
            handlerInfoStatus: false,
            businessTypeOptions: [{
                value: 1,
                label: '实名',
            }, {
                value: 2,
                label: '解绑',
            }],

            pushStatusOptions: [{
                value: 1,
                label: '已匹配',
            }, {
                value: 0,
                label: '未匹配',
            }
            ],
            checkedList: [],
            selectNum: 0,
            total: 10,
            checked: false,
            isIndeterminate: false,
            type: "VIN",
            inputSelect: null,
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
            queryParams: {
                pageSize: 10,
                pageNum: 1,
                iccid: null,
                vin: null,
                applyNo: null,
                pushStatus: null,
                businessType: null,
                pushStartTime: null,
                pushEndTime: null,
                timeDesc: 1,
                orgIds: []
            },
            time: null,
            infoDetail: {},
            drawer: false,
            infoList: [],
            drawerType: null,
            today: null,
        }
    },
    watch: {
        time() {
            this.getList();
        }
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
        selectable(row, index) {
            if (row.message != '-')
                return true;
        },
        setNode(node) {
            this.node = node;
            this.dialogVisible = true;
        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
            this.selectNum = this.multipleSelection.length;
            this.$nextTick(() => {
                this.checkedList = [];
                this.multipleSelection.forEach((el) => {
                    this.checkedList.push(el.id)
                })
            })
        },
        async postNodeList(isAll, isList) {
            let ids = 'all'
            if (!isAll) {
                if (isList) {
                    ids = this.checkedList.toString();
                }
                else {
                    ids = this.node.id
                }
            }
            let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameNonChannel",
                serviceName: "restart-push",
                serviceParameter: { ids: ids },
                method: "post",
            });
            if (res) {
                if (res.businessCode == "0") {
                    this.$message({
                        message: res.msg,
                        type: "error",
                        showClose: true,
                    });
                } else if (res.businessCode == "1") {
                    this.$message({
                        message: "失败项重试成功！",
                        type: "success",
                        showClose: true,
                    });
                    this.getList();
                }
                this.node = null;
                this.dialogVisible = false;
                this.somedialogVisible = false;
                this.alldialogVisible = false;
            }
            if (err) {
            }
        },
        resetInstru(ids, isList) {
            if (ids == 'all') {
                this.alldialogVisible = true;
            }
            else {
                if (isList) {
                    if (this.selectNum > 0) {
                        this.somedialogVisible = true;
                    }
                    else {
                        this.$message({
                            message: "请选择至少一项数据！",
                            type: "warning",
                            showClose: true,
                        });
                    }
                }
                else {
                    this.dialogVisible = true;
                    this.node.id = ids;
                }
            }
        },
        sizeChange() {
            this.queryParams.pageNum = 1;
            this.getList();
        },
        changeOrder(num) {
            this.queryParams.timeDesc = num;
            this.getList();
        },
        resetSelect() {
            this.type = "VIN";
            this.inputSelect = null;
            this.queryParams.vin = null;
            this.queryParams.iccid = null;
            this.queryParams.applyNo = null;
            this.queryParams.pushStartTime = null;
            this.queryParams.pushEndTime = null;
            this.queryParams.pushStatus = null;
            this.queryParams.businessType = null;
            this.queryParams.timeDesc = 1;
            this.queryParams.orgIds = [];
            this.time = [];
            this.$nextTick(() => {
                this.getList();
            })
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
            this.queryParams.orgIds = this.queryParams.orgIds.toString();
            this.selectNum = 0;
            if (this.time) {
                this.queryParams.pushStartTime = this.time[0];
                this.queryParams.pushEndTime = this.time[1];
            }
            if (this.type == "ICCID") {
                this.queryParams.iccid = this.inputSelect;
            } else if (this.type == "VIN") {
                this.queryParams.vin = this.inputSelect;
            } else {
                this.queryParams.applyNo = this.inputSelect;
            }
            let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameNonChannel",
                serviceName: "query-list",
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
                this.loadingList.close();
            }
        },
    },
    created() { },
    mounted() {
        treeselect().then((response) => {
            this.deptOptions = response.data;
        });
        this.getList();
        this.today = Cookies.get("today");
    },
    beforeDestroy() { },
}
</script>

<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.realNameInTele {
    padding: toRem(17) toRem(40) toRem(39) toRem(40);




    .blueBtn {
        color: #1e6fff !important;
        cursor: pointer !important;
    }

    .disableBtn {
        opacity: 0.3;
        cursor: not-allowed !important;
    }

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

            >div:nth-child(5) {
                width: toRem(350);
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


}
</style>