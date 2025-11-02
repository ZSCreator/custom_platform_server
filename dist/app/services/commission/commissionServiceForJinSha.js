"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTiquPlayerProfitsRecordForJinsha = exports.getPlayerTiquAllProfits = exports.getPlayerTiquYuzhiRecords = exports.getPlayerProfitsForJinsha = exports.getPromoteSelfProfitsDetailForJinsha = exports.getPromoteSelfProfitsRecordForJinSha = exports.getPromoteDetailForJinSha = exports.getPromoteCommissionInfoForJinSha = void 0;
const AgentYuzhiRecordManager = require("../../dao/domainManager/agentBckManager/agentYuzhiRecordManager");
const AgentBackProfitsManager = require("../../dao/domainManager/agentBckManager/agentBackProfitsManager");
const MongoManager = require("../../common/dao/mongoDB/lib/mongoManager");
const Utils = require("../../utils/index");
const GlobalErrorLog = require('pinus-logger').getLogger('server_out', __filename);
const PlayerProfitDao = MongoManager.player_profits;
const AgentYuzhiRecord = MongoManager.agent_yuzhi_record;
const AgentBackDayRecord = MongoManager.agentBack_day_record;
const getPromoteCommissionInfoForJinSha = async (player) => {
    try {
        return {};
    }
    catch (error) {
        console.log('CommissionService.getPromoteCommissionInfoForJinSha ==>', error);
        GlobalErrorLog.error('CommissionService.getPromoteCommissionInfoForJinSha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPromoteCommissionInfoForJinSha = getPromoteCommissionInfoForJinSha;
const getPromoteDetailForJinSha = async (uid) => {
    try {
        const startTime = Utils.zerotime();
        const endTime = Utils.zerotime() + 24 * 60 * 60 * 1000;
        const [agentBackData, dayAgentBackData, dayTiquData, playerProfits] = await Promise.all([
            AgentBackProfitsManager.findAgentBackRecord({ uid: uid }, 'superior zhishuPeople jianjiePeople alreadyTiqu yesDayZhishuProfits yesDayJianjieProfits  jianjieProfits zhijieProfits allProfits '),
            AgentBackDayRecord.findOne({ uid, createTime: { $gt: startTime, $lt: endTime } }, 'dayPeople allProfits jianjieProfits zhijieProfits zhishuPeople jianjiePeople'),
            AgentYuzhiRecord.aggregate().match({ dailiUid: uid, type: 1, createTime: { $gt: startTime, $lt: endTime } }).group({ _id: {}, 'yuzhiProfits': { $sum: '$yuzhiProfits' } }),
            PlayerProfitDao.findOne({ uid }, 'profits '),
        ]);
        let superior = '无';
        let zhishuPeople = 0;
        let jianjiePeople = 0;
        let yesDayZhishuProfits = 0;
        let yesDayJianjieProfits = 0;
        let jianjieProfits = 0;
        let zhijieProfits = 0;
        let alreadyTiqu = 0;
        if (!agentBackData) {
        }
        else {
            zhishuPeople = agentBackData.zhishuPeople;
            jianjiePeople = agentBackData.jianjiePeople;
            yesDayZhishuProfits = agentBackData.yesDayZhishuProfits;
            yesDayJianjieProfits = agentBackData.yesDayJianjieProfits;
            jianjieProfits = agentBackData.jianjieProfits;
            zhijieProfits = agentBackData.zhijieProfits;
            alreadyTiqu = agentBackData.alreadyTiqu;
            superior = agentBackData.superior;
        }
        let dayAllProfits = 0;
        let dayZhishuPeople = 0;
        let dayJianjiePeople = 0;
        let dayPeople = 0;
        if (dayAgentBackData) {
            dayAllProfits = dayAgentBackData.allProfits;
            dayZhishuPeople = dayAgentBackData.zhishuPeople;
            dayJianjiePeople = dayAgentBackData.jianjiePeople;
            dayPeople = dayAgentBackData.dayPeople;
        }
        const allTeamProfits = jianjieProfits + zhijieProfits + dayAllProfits;
        if (dayTiquData.length != 0) {
            alreadyTiqu += dayTiquData[0].yuzhiProfits;
        }
        const detailDate = {
            uid,
            superior: superior,
            zhishuPeople: zhishuPeople + dayZhishuPeople,
            jianjiePeople: jianjiePeople + dayJianjiePeople,
            dayPeople: dayPeople,
            allTeamProfits: allTeamProfits,
            canProfits: playerProfits ? playerProfits.profits : 0,
            alreadyTiqu: alreadyTiqu,
            yesDayZhishuProfits: yesDayZhishuProfits,
            yesDayJianjieProfits: yesDayJianjieProfits,
        };
        return detailDate;
    }
    catch (error) {
        console.log('CommissionService.getPromoteDetailForJinSha ==>', error);
        GlobalErrorLog.error('CommissionService.getPromoteDetailForJinSha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPromoteDetailForJinSha = getPromoteDetailForJinSha;
const getPromoteSelfProfitsRecordForJinSha = async (uid) => {
    try {
        const selfProfitsRecords = await AgentBackDayRecord.find({ uid, allProfits: { $gt: 0 } }, 'allProfits createTime').sort('-createTime').limit(7);
        let resultList = [];
        for (let item of selfProfitsRecords) {
            const info = {
                createTime: item.createTime,
                allProfits: item.allProfits,
            };
            resultList.push(info);
        }
        return resultList;
    }
    catch (error) {
        console.log('CommissionService.getPromoteSelfProfitsRecordForJinSha ==>', error);
        GlobalErrorLog.error('CommissionService.getPromoteSelfProfitsRecordForJinSha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPromoteSelfProfitsRecordForJinSha = getPromoteSelfProfitsRecordForJinSha;
const getPromoteSelfProfitsDetailForJinsha = async (uid, createTime, page, count) => {
    try {
        let start = 0;
        if (page) {
            start = count * (page - 1);
        }
        const startTime = Utils.zerotime(createTime);
        const endTime = startTime + 24 * 60 * 60 * 1000;
        const match = { superior: uid, createTime: { $gt: startTime, $lt: endTime }, $or: [{ allProfits: { $gt: 0 } }, { selfProfits: { $gt: 0 } }] };
        const [allLength, detailDayProfitsRecords] = await Promise.all([
            AgentBackDayRecord.countDocuments(match),
            AgentBackDayRecord.find(match, 'allProfits selfProfits uid ').sort('-createTime').skip(start).limit(count)
        ]);
        const allPage = Math.ceil(allLength / count);
        let resultList = [];
        for (let item of detailDayProfitsRecords) {
            const info = {
                uid: item.uid,
                allProfits: item.allProfits + item.selfProfits ? item.selfProfits : 0,
                profits: item.selfProfits ? item.selfProfits : 0,
            };
            resultList.push(info);
        }
        return { resultList, allPage };
    }
    catch (error) {
        console.log('CommissionService.getPromoteSelfProfitsRecordForJinSha ==>', error);
        GlobalErrorLog.error('CommissionService.getPromoteSelfProfitsRecordForJinSha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPromoteSelfProfitsDetailForJinsha = getPromoteSelfProfitsDetailForJinsha;
const getPlayerProfitsForJinsha = async (uid) => {
    try {
        const playerProfits = await PlayerProfitDao.findOne({ uid }, 'profits');
        const profits = playerProfits ? playerProfits.profits : 0;
        return profits;
    }
    catch (error) {
        console.log('CommissionService.getPlayerProfitsForJinsha ==>', error);
        GlobalErrorLog.error('CommissionService.getPlayerProfitsForJinsha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPlayerProfitsForJinsha = getPlayerProfitsForJinsha;
const getPlayerTiquYuzhiRecords = async (uid, startTime, endTime) => {
    try {
        let match = {};
        if (startTime == 0) {
            match = { dailiUid: uid };
        }
        else {
            match = { dailiUid: uid, createTime: { $gt: startTime, $lt: endTime } };
        }
        const tiquRecords = await AgentYuzhiRecordManager.findAgentYuzhiRecordList(match, 'yuzhiProfits createTime uid ');
        return tiquRecords;
    }
    catch (error) {
        console.log('CommissionService.getPlayerTiquYuzhiRecords ==>', error);
        GlobalErrorLog.error('CommissionService.getPlayerTiquYuzhiRecords ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPlayerTiquYuzhiRecords = getPlayerTiquYuzhiRecords;
const getPlayerTiquAllProfits = async (uid, startTime, endTime) => {
    try {
        let match = {};
        if (startTime == 0) {
            match = { dailiUid: uid };
        }
        else {
            match = { dailiUid: uid, createTime: { $gt: startTime, $lt: endTime } };
        }
        const allTiquDate = await AgentYuzhiRecord.aggregate().match(match)
            .group({ _id: {}, 'profits': { $sum: '$yuzhiProfits' } });
        let alreadyTiqu = 0;
        if (allTiquDate.length != 0) {
            alreadyTiqu = allTiquDate[0].profits;
        }
        return alreadyTiqu;
    }
    catch (error) {
        console.log('CommissionService.getPlayerTiquAllProfits ==>', error);
        GlobalErrorLog.error('CommissionService.getPlayerTiquAllProfits ==>', error);
        return Promise.resolve(error);
    }
};
exports.getPlayerTiquAllProfits = getPlayerTiquAllProfits;
const getTiquPlayerProfitsRecordForJinsha = async (uid) => {
    try {
        const tiquPlayerProfitsRecords = await AgentYuzhiRecord.find({ dailiUid: uid, type: 1 }, 'createTime dailiUid yuzhiProfits ').sort('-createTime').limit(10);
        const result = [];
        for (let item of tiquPlayerProfitsRecords) {
            let info = {
                createTime: item.createTime,
                uid: item.dailiUid,
                profits: item.yuzhiProfits,
            };
            result.push(info);
        }
        return result;
    }
    catch (error) {
        console.log('CommissionService.getTiquPlayerProfitsRecordForJinsha ==>', error);
        GlobalErrorLog.error('CommissionService.getTiquPlayerProfitsRecordForJinsha ==>', error);
        return Promise.resolve(error);
    }
};
exports.getTiquPlayerProfitsRecordForJinsha = getTiquPlayerProfitsRecordForJinsha;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWlzc2lvblNlcnZpY2VGb3JKaW5TaGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvY29tbWlzc2lvbi9jb21taXNzaW9uU2VydmljZUZvckppblNoYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwyR0FBNEc7QUFDNUcsMkdBQTRHO0FBQzVHLDBFQUEyRTtBQUMzRSwyQ0FBNEM7QUFDNUMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkYsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBQztBQUNwRCxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztBQUN6RCxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQztBQU90RCxNQUFNLGlDQUFpQyxHQUFHLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUM5RCxJQUFJO1FBUUEsT0FBTyxFQUFHLENBQUM7S0FDZDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyx5REFBeUQsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RSxjQUFjLENBQUMsS0FBSyxDQUFDLHlEQUF5RCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQztBQUNMLENBQUMsQ0FBQztBQWZXLFFBQUEsaUNBQWlDLHFDQWU1QztBQU1LLE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ25ELElBQUk7UUFDQSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFF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