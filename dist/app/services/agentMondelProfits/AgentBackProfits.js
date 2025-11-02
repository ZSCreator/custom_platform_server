'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentBackProfitsForErrorToTimer = exports.addDayPlayerProfitsPayRecord = void 0;
const MongoManager = require("../../common/dao/mongoDB/lib/mongoManager");
const AgentBackProfitsDontPerform = require("../agentMondelProfits/AgentBackProfitsDontPerform");
const Utils = require("../../utils");
const HttpErrorLog = require('pinus-logger').getLogger('server_out', __filename);
const DayPlayerProfitsPayRecord = MongoManager.day_player_profits_pay_record;
const PlayerProfits = MongoManager.player_profits;
const addDayPlayerProfitsPayRecord = async (uid, nickname, input, nid, gameOrder, gameType, gameName) => {
    HttpErrorLog.info('addDayPlayerProfitsPayRecord', uid, nickname, input, nid, gameOrder, gameType, gameName, Utils.cDate());
    try {
        if (typeof input !== 'number' || input == 0) {
            return Promise.resolve();
        }
    }
    catch (error) {
        await AgentBackProfitsDontPerform.addNotPlayerProfitsRecord(uid, nickname, input, nid, gameOrder, gameType, gameName, 0, '', '', error);
        console.log('addDayPlayerProfitsPayRecord ==>:', error);
        HttpErrorLog.error("addDayPlayerProfitsPayRecord ==>:", error);
        return Promise.resolve();
    }
};
exports.addDayPlayerProfitsPayRecord = addDayPlayerProfitsPayRecord;
async function addDayPlayerProfitsPayRecordDB(info, nextUid, numLevel, superior, input, gameType, allProfits, selfProfits, list, backProfitsRatio) {
    try {
        let profits = 0;
        if (numLevel == 1) {
            profits = input * backProfitsRatio.ONE;
            info.profitsRatio = backProfitsRatio.ONE;
            allProfits = profits;
        }
        else {
            info.profitsRatio = backProfitsRatio.OTHER;
            profits = input * Math.pow(backProfitsRatio.OTHER, numLevel);
        }
        info.profits = profits;
        info.superior = superior;
        info.numLevel = numLevel;
        info.nextUid = nextUid;
        allProfits = allProfits + profits;
        await DayPlayerProfitsPayRecord.create(info);
        const playerProfitsDB = await PlayerProfits.findOne({ uid: superior });
        if (playerProfitsDB) {
            await PlayerProfits.updateOne({ uid: superior }, { "$inc": { "profits": info.profits } });
        }
        else {
            const data = {
                id: Utils.id(),
                profits: info.profits,
                extractProfits: 0,
                createTime: Date.now(),
                uid: superior,
            };
            await PlayerProfits.create(data);
        }
    }
    catch (error) {
        console.log('addDayPlayerProfitsPayRecordDB ==>', error);
        HttpErrorLog.error("addDayPlayerProfitsPayRecordDB ==>", error);
        const uid = info.uid;
        const nickname = info.nickname;
        const nid = info.nid;
        const gameOrder = info.gameOrder;
        const gameName = info.gameName;
        await AgentBackProfitsDontPerform.addNotPlayerProfitsRecord(uid, nickname, input, nid, gameOrder, gameType, gameName, numLevel, nextUid, superior, error);
        return Promise.reject(error);
    }
}
const agentBackProfitsForErrorToTimer = async (startTime, endTime) => {
    HttpErrorLog.info('agentBackProfitsForErrorToTimer', Utils.cDate());
    try {
        return Promise.resolve();
    }
    catch (error) {
        console.log('agentBackProfitsForErrorToTimer ==>', error);
        HttpErrorLog.error("agentBackProfitsForErrorToTimer ==>", error);
        return Promise.reject(error);
    }
};
exports.agentBackProfitsForErrorToTimer = agentBackProfitsForErrorToTimer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWdlbnRCYWNrUHJvZml0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9hZ2VudE1vbmRlbFByb2ZpdHMvQWdlbnRCYWNrUHJvZml0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLDBFQUEyRTtBQUMzRSxpR0FBa0c7QUFDbEcscUNBQXNDO0FBQ3RDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pGLE1BQU0seUJBQXlCLEdBQUcsWUFBWSxDQUFDLDZCQUE2QixDQUFDO0FBQzdFLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxjQUFjLENBQUM7QUFlM0MsTUFBTSw0QkFBNEIsR0FBRyxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUU7SUFDM0csWUFBWSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDM0gsSUFBSTtRQUNBLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDekMsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7S0E4Qko7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sMkJBQTJCLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUss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