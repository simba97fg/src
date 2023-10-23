const comboBox = {
    state: {
        cardStateOptions: [], //证件状态
        cardTypeOptions: [], //证件类型
        channelTypeOptions: [], //渠道类型
        vehicleStatusOptions: [], //车辆状态
        dWCardTypeOptions: [], //单位证件类型
        flowOptions: [], //流程状态
        ispNameOptions: [], //运营商
        operatorNameOptions: [], //操作人
        orderSceneTypeOptions: [], //订单场景类型
        orderTypeOptions: [], //订单类型
        // replaceOperatorNameOptions:[],
        respondStatusOptions: [], //响应状态
        statusOptions: [], //实名状态
        // unboundOperatorNameOptions:[],
        // uploadOperatorNameOptions:[],
        vehicleBrandOptions: [], //车辆品牌
        vehicleCardTypeOptions: [], //车联网卡类型
        vehicleFlagOptions: [], //新车标识
        deptOptions: []//组织机构
    },

    mutations: {
        SET_CARDSTATE: (state, cardStateOptions) => {
            state.cardStateOptions = cardStateOptions
        },
        SET_CARDTYPE: (state, cardTypeOptions) => {
            state.cardTypeOptions = cardTypeOptions
        },
        SET_CHANNELTYPE: (state, channelTypeOptions) => {
            state.channelTypeOptions = channelTypeOptions
        },
        SET_VEHICLESTATUS: (state, vehicleStatusOptions) => {
            state.vehicleStatusOptions = vehicleStatusOptions
        },
        SET_DWCARDTYPE: (state, dWCardTypeOptions) => {
            state.dWCardTypeOptions = dWCardTypeOptions
        },
        SET_FLOW: (state, flowOptions) => {
            state.flowOptions = flowOptions
        },
        SET_ISPNAME: (state, ispNameOptions) => {
            state.ispNameOptions = ispNameOptions
        },
        SET_OPERATORNAME: (state, operatorNameOptions) => {
            state.operatorNameOptions = operatorNameOptions
        },
        SET_ORDERSCENETYPE: (state, orderSceneTypeOptions) => {
            state.orderSceneTypeOptions = orderSceneTypeOptions
        },
        SET_ORDERTYPE: (state, orderTypeOptions) => {
            state.orderTypeOptions = orderTypeOptions
        },
        // SET_CARDTYPE: (state, replaceOperatorNameOptions) => {
        //     state.replaceOperatorNameOptions = replaceOperatorNameOptions
        // },
        SET_RESPONDSTATUS: (state, respondStatusOptions) => {
            state.respondStatusOptions = respondStatusOptions
        },
        SET_STATUS: (state, statusOptions) => {
            state.statusOptions = statusOptions
        },
        // SET_CARDTYPE: (state, unboundOperatorNameOptions) => {
        //     state.unboundOperatorNameOptions = unboundOperatorNameOptions
        // },
        // SET_CHANNELTYPE: (state, uploadOperatorNameOptions) => {
        //     state.uploadOperatorNameOptions = uploadOperatorNameOptions
        // },
        SET_VEHICLEBRAND: (state, vehicleBrandOptions) => {
            state.vehicleBrandOptions = vehicleBrandOptions
        },
        SET_VEHICLECARDTYPE: (state, vehicleCardTypeOptions) => {
            state.vehicleCardTypeOptions = vehicleCardTypeOptions
        },
        SET_VEHICLEFLAG: (state, vehicleFlagOptions) => {
            state.vehicleFlagOptions = vehicleFlagOptions
        },
        SET_DEPT: (state, deptOptions) => {
            state.deptOptions = deptOptions
        }
    },

    actions: {
        GetCardState({ commit, state }, options) {
            commit('SET_CARDSTATE', options);
        },
        GetCardType({ commit, state }, options) {
            commit('SET_CARDTYPE', options);
        },
        GetChannelType({ commit, state }, options) {
            commit('SET_CHANNELTYPE', options);
        },
        GetDWCardType({ commit, state }, options) {
            commit('SET_DWCARDTYPE', options);
        },
        GetFlow({ commit, state }, options) {
            commit('SET_FLOW', options);
        },
        GetIspName({ commit, state }, options) {
            commit('SET_ISPNAME', options);
        },
        GetOrderSceneType({ commit, state }, options) {
            commit('SET_ORDERSCENETYPE', options);
        },
        GetOrderType({ commit, state }, options) {
            commit('SET_ORDERTYPE', options);
        },
        GetRespondStatus({ commit, state }, options) {
            commit('SET_RESPONDSTATUS', options);
        },
        GetStatus({ commit, state }, options) {
            commit('SET_STATUS', options);
        },
        GetVehicleBrand({ commit, state }, options) {
            commit('SET_VEHICLEBRAND', options);
        },
        GetVehicleCardType({ commit, state }, options) {
            commit('SET_VEHICLECARDTYPE', options);
        },
        GetVehicleFlag({ commit, state }, options) {
            commit('SET_VEHICLEFLAG', options);
        },
        GetVehicleStatus({ commit, state }, options) {
            commit('SET_VEHICLESTATUS', options);
        },
        GetDept({ commit, state }, options) {
            commit('SET_DEPT', options);
        },
    }
}

export default comboBox
