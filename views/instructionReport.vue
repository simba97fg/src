<template>
    <div class="instructionReport">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>工具</el-breadcrumb-item>
            <el-breadcrumb-item class="is-link">指令采集响应<i class="el-icon-refresh resetBtnIcon" @click="resetSelect"></i>
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
                <el-select filterable placeholder="响应状态" v-model="queryParams.status" @change="getList" clearable>
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
                <el-date-picker v-model="time" value-format="yyyy-MM-dd HH:mm:ss" prefix-icon="el-icon-date"
                    type="daterange" start-placeholder="下发起始时间" end-placeholder="结束时间" align="right">
                </el-date-picker>
                <div style="opacity: 0;pointer-events:none"></div>
                <div style="opacity: 0;pointer-events:none"></div>
                <div style="opacity: 0;pointer-events:none"></div>
            </div>



            <!-- <span @click="getList">按筛选搜索</span>
            <span @click="resetSelect" class="resetBtn">重置</span> -->
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
                    <el-dropdown-item @click.native="checkList">批量导出</el-dropdown-item>
                    <el-dropdown-item @click.native="resetInstru(checkedList, true)">批量重试</el-dropdown-item>
                    <el-dropdown-item @click.native="resetInstru('all', true)">全部重试</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div class="infoTable">
            <div class="tableHead">
                <span>
                    <el-checkbox size="large" v-model="checked" @change="clickAll()" :indeterminate="isIndeterminate">
                    </el-checkbox>
                </span>
                <span>车企名称</span>
                <span>统一社会信用代码</span>
                <span>ICCID</span>
                <span class="timeStatus">指令下发时间<i class="el-icon-caret-top"
                        v-bind:class="{ blueBtn: queryParams.requestDesc == 2 }" @click="changeOrder(2)" /><i
                        class="el-icon-caret-bottom" v-bind:class="{ blueBtn: queryParams.requestDesc == 1 }"
                        @click="changeOrder(1)" />
                </span>
                <span class="timeStatus">指令响应时间<i class="el-icon-caret-top"
                        v-bind:class="{ blueBtn: queryParams.responseDesc == 2 }" @click="changeOrder1(2)" /><i
                        class="el-icon-caret-bottom" v-bind:class="{ blueBtn: queryParams.responseDesc == 1 }"
                        @click="changeOrder1(1)" />
                </span>
                <span>响应状态</span>
                <span>失败原因</span>
                <span>操作</span>
            </div>
            <div class="tableContent" v-for="(node, index) in infoList" :key="index" v-show="total > 0">
                <span>
                    <el-checkbox v-model="node.checked" @change="addSelected(node)"></el-checkbox>
                </span>
                <span>{{ node.orgName }}</span>
                <span>{{ node.orgCode }}</span>
                <span>{{ node.iccid }}</span>
                <span>{{ node.requestTime }}</span>
                <span>{{ node.operTime }}</span>
                <span>{{ node.statusName }}</span>
                <span>{{ node.errorMsg }}</span>
                <span> <span class="blueBtn" v-if="node.status == 300" @click="resetInstru(node, false)">重试</span><span
                        class="blueBtn disableBtn" v-if="node.status != 300">重试</span> <span class="blueBtn"
                        @click="getExportList(node.id, false, node.iccid)">导出</span></span>

            </div>
            <div class="nodataLine" v-if="total <= 0">
                <div></div>
                <span>暂无数据</span>
                <div></div>
            </div>
        </div>
        <el-pagination @size-change="sizeChange()" @current-change="currentPageChange"
            :current-page.sync="queryParams.pageNum" :page-sizes="[10, 50, 100, 500]"
            :page-size.sync="queryParams.pageSize" layout=" prev, pager, next,sizes,jumper" :total="total">
        </el-pagination>
        <el-dialog :visible.sync="dialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新下发该指令</p>
            <p>此操作不可撤销</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="postNodeList(false, false)">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :visible.sync="somedialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新下发已选指令（共{{ checkedList.length }}条）</p>
            <p>仅重新下发原结果为失败的数据项，此操作不可撤销</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="somedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="postNodeList(false, true)">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :visible.sync="alldialogVisible" width="29.5%" center :show-close="false" style="padding-top: 15%">
            <p>确认重新下发所有失败指令</p>
            <p>仅重新下发原结果为失败的数据项，此操作不可撤销</p>
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
export default {
    name: "instructionReport",
    components: {
        "el-image-viewer": () =>
            import("element-ui/packages/image/src/image-viewer"),
    },
    data() {
        return {
            isCuC: false,
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
            typeOptions: [
            ],
            checkedList: [],
            selectNum: 0,
            total: 10,
            checked: false,
            isIndeterminate: false,
            type: "orgName",
            inputSelect: null,
            typeoptions: [
                {
                    value: "orgName",
                    label: "车企名称",
                },
                {
                    value: "ICCID",
                    label: "ICCID",
                },
            ],
            queryParams: {
                pageSize: 10,
                pageNum: 1,
                iccid: null,
                orgName: null,
                status: null,
                startTime: null,
                endTime: null,
                requestDesc: 1,
                responseDesc: 1
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
                url_key: "realNameCollect",
                serviceName: "restart-Push",
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
            this.queryParams.responseDesc = null;
            this.queryParams.requestDesc = num;
            this.getList();
        },
        changeOrder1(num) {
            this.queryParams.requestDesc = null;
            this.queryParams.responseDesc = num;
            this.getList();
        },
        resetSelect() {
            this.type = "orgName";
            this.inputSelect = null;
            this.queryParams.orgName = null;
            this.queryParams.iccid = null;
            this.queryParams.status = null;
            this.queryParams.startTime = null;
            this.queryParams.endTime = null;
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
        async getBox() {
            let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameBox",
                serviceName: "getRespondStatusBox",
                method: "get",
            });
            if (res) {
                this.typeOptions = res.data;
            }
        },

        checkList() {
            if (this.selectNum > 0) {
                this.getExportList(this.checkedList, true);
            } else {
                this.$message({
                    message: "请选择至少一项数据！",
                    type: "warning",
                    showClose: true,
                });
            }
        },
        async getExportList(ids, isList, iccid) {
            console.log("getExportList");
            let params = {
                ids: ids.toString(),
            };
            let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameCollect",
                serviceName: "export-data",
                serviceParameter: params,
                method: "get",
                fileRead: true,
            });
            if (res) {
                console.log("getExport", res);
                if (isList) {
                    this.$message({
                        message: "指令列表" + this.today + "获取成功，正在下载！",
                        type: "success",
                        showClose: true,
                    });
                } else {
                    this.$message({
                        message: "ICCID：" + iccid + "获取成功，正在下载！",
                        type: "success",
                        showClose: true,
                    });
                }
                let fileTemp = "ICCID：" + iccid;
                if (isList) {
                    fileTemp = "指令列表" + this.today;
                }
                const blob = new Blob([res], { type: "application/vnd.ms-excel" }); //axiosData.responseType = 'blob'; //这句话解决导出文件乱码问题
                const fileName = fileTemp + ".xlsx";
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
                this.queryParams.startTime = this.time[0];
                this.queryParams.endTime = this.time[1];
            }
            if (this.type == "ICCID") {
                this.queryParams.iccid = this.inputSelect;
            } else {
                this.queryParams.orgName = this.inputSelect;
            }
            let { res, err } = await Vue.prototype.$$api.do({
                url_key: "realNameCollect",
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
        this.getBox();
        this.getList();
        this.today = Cookies.get("today");
    },
    beforeDestroy() { },
}
</script>

<style lang="scss" scoped>
@import "@/scss/realmgn.scss";

.instructionReport {
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
                width: toRem(295);
                display: flex;

                >div:first-child {
                    width: toRem(105);
                    margin-right: 0;
                }

                >div:nth-child(2) {
                    width: toRem(190);
                }
            }

            >div:nth-child(3) {
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
            span:nth-child(4),
            >span:nth-child(8) {
                width: toRem(206);
            }

            >span:nth-child(3),
            >span:nth-child(5),
            >span:nth-child(6) {
                width: toRem(160);
            }


            >span:nth-child(7) {
                width: toRem(80);
            }

            >span:nth-child(9) {
                width: toRem(130);
            }

            >span:last-child {
                margin-right: 0;
                display: flex;
                justify-content: space-evenly;
            }
        }
    }
}
</style>