'use strict';
/**
 *   这个是无限返佣， 代理 = 玩家，
 *   直属代理的抽水*0.5+N级代理的抽水*（30%）ⁿ次方
 */
import MongoManager = require('../../common/dao/mongoDB/lib/mongoManager');
import AgentBackProfitsDontPerform = require('../agentMondelProfits/AgentBackProfitsDontPerform');
import Utils = require('../../utils');
const HttpErrorLog = require('pinus-logger').getLogger('server_out', __filename);
const DayPlayerProfitsPayRecord = MongoManager.day_player_profits_pay_record;
const PlayerProfits = MongoManager.player_profits;


/** 进行实时的返佣
 无限级别返佣模式，将抽水值作为返佣依据，无需除以2，直接全部用作返佣。
 前端采用旧版金猪内容，仅显示数据方面还有数据查询方面进行优化调整。
 推广详情这个页面因为牵扯到直属玩家的显示，如果遇到直属玩家过多的情况，有可能造成数据加载不了显示NaN的情况，需要优化（何逍已优化）
 代理和玩家不做区分，即代理=玩家。
 返佣计算方式=直属代理的抽水*0.5+N级代理的抽水*（30%）ⁿ次方
 举例说明：
 B=您的直属代理，税收为10000
 B1=B的直属代理，您的2级代理，税收为20000
 您的返利=10000*50%+（20000*30%）*30%=6800元

 */
export const addDayPlayerProfitsPayRecord = async (uid, nickname, input, nid, gameOrder, gameType, gameName) => {
    HttpErrorLog.info('addDayPlayerProfitsPayRecord', uid, nickname, input, nid, gameOrder, gameType, gameName, Utils.cDate());
    try {
        if (typeof input !== 'number' || input == 0) {
            return Promise.resolve();
        }
        //首先先判断有没有上级，如果没有上级就不用进行返佣
        // let tempInvites = await InfiniteAgentService.findAgentInfo({ uid }, 'superior');
        // if (tempInvites && tempInvites.superior) {
        //     //for循环每个玩家进行利润记录
        //     //这里是根据InfiniteAgent 这张表的上级来进行返利的，有上级则返利，没有上级，则不返利
        //     // const systemConfig = await GetDataService.getSystemConfig();
        //     // const info = {
        //     //     profits: 0,
        //     //     createTime: Date.now(),
        //     //     uid: uid,
        //     //     nickname: nickname,
        //     //     nid: nid,
        //     //     input: input,
        //     //     gameOrder,
        //     //     gameType,
        //     //     gameName,
        //     // }
        //     // let numLevel = 1;
        //     // let nextUid = uid;
        //     // let superior = tempInvites.superior;
        //     // let allProfits = 0; //总的上级返点
        //     // let selfProfits = 0; //自己的返点
        //     // let list = [];
        //     // const backProfitsRatio = systemConfig.wuXianConfig; //返佣的后台设置比列
        //     // await addDayPlayerProfitsPayRecordDB(info, nextUid, numLevel, superior, input, gameType, allProfits, selfProfits, list, backProfitsRatio);
        //     return Promise.resolve();
        // } else {
        //     return Promise.resolve();
        // }
    } catch (error) {
        await AgentBackProfitsDontPerform.addNotPlayerProfitsRecord(uid, nickname, input, nid, gameOrder, gameType, gameName, 0, '', '', error)
        console.log('addDayPlayerProfitsPayRecord ==>:', error);
        HttpErrorLog.error("addDayPlayerProfitsPayRecord ==>:", error);
        return Promise.resolve();
    }
}

async function addDayPlayerProfitsPayRecordDB(info, nextUid, numLevel, superior, input, gameType, allProfits, selfProfits, list, backProfitsRatio) {
    try {
        //自己不给自己返佣，如果有上级，就给上级返佣50%，然后再有上级就是30%
        let profits = 0;
        if (numLevel == 1) {
            profits = input * backProfitsRatio.ONE;
            info.profitsRatio = backProfitsRatio.ONE;
            allProfits = profits;
        } else {
            info.profitsRatio = backProfitsRatio.OTHER;
            profits = input * Math.pow(backProfitsRatio.OTHER, numLevel);
        }
        info.profits = profits;
        info.superior = superior;
        info.numLevel = numLevel;
        info.nextUid = nextUid;
        allProfits = allProfits + profits; //累加总返点
        await DayPlayerProfitsPayRecord.create(info);
        //将玩家的返水利润加在玩家的利润表里
        const playerProfitsDB = await PlayerProfits.findOne({ uid: superior });
        if (playerProfitsDB) {
            await PlayerProfits.updateOne({ uid: superior }, { "$inc": { "profits": info.profits } });
        } else {
            const data = {
                id: Utils.id(),
                profits: info.profits,
                extractProfits: 0,
                createTime: Date.now(),
                uid: superior,
            }
            await PlayerProfits.create(data);
        }
        // const superiorTemp = await InfiniteAgentService.findAgentInfo({ uid: superior });
        //将每日的代理流水进行更新
        // if (superiorTemp && superiorTemp.superior) {
        //     superior = superiorTemp.superior;
        //     nextUid = superiorTemp.uid;
        //     numLevel += 1;
        //     return await addDayPlayerProfitsPayRecordDB(info, nextUid, numLevel, superior, input, gameType, allProfits, selfProfits, list, backProfitsRatio);
        // }
    } catch (error) {
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

/**
 * 如果有代理每把返点有错误，那么就需要把当前在数据库中的错误进行返利
 * 如果已经修正了错误，那么修改该条数据的status =1,初始为0
 * @param uid
 * @param nickname
 * @param input
 * @param nid
 * @param gameOrder
 * @param gameType
 * @param gameName
 */


export const agentBackProfitsForErrorToTimer = async (startTime, endTime) => {
    HttpErrorLog.info('agentBackProfitsForErrorToTimer', Utils.cDate());
    try {
        // const records = await DayNotPlayerProfits.find({ status: 0, createTime: { $gt: startTime, $lt: endTime } });
        // if (records.length !== 0) {
        //     const systemConfig = await GetDataService.getSystemConfig();
        //     const backProfitsRatio = systemConfig.wuXianConfig; //返佣的后台设置比列
        //     for (let item of records) {
        //         const info = {
        //             profits: 0,
        //             createTime: item.createTime,
        //             uid: item.uid,
        //             nickname: item.nickname,
        //             nid: item.nid,
        //             input: item.input,
        //             gameOrder: item.gameOrder,
        //             gameType: item.gameType,
        //             gameName: item.gameName,
        //         }
        //         const nextUid = item.nextUid;
        //         const numLevel = item.numLevel;
        //         const superior = item.superior;
        //         const gameType = item.gameType;
        //         const input = item.input;
        //         const id = item.id;
        //         await addDayPlayerProfitsPayRecordDB(info, nextUid, numLevel, superior, input, gameType, 0, 0, [], backProfitsRatio)
        //         await DayNotPlayerProfits.update({ id }, { $set: { status: 1 } });
        //     }
        // }
        return Promise.resolve();
    } catch (error) {
        console.log('agentBackProfitsForErrorToTimer ==>', error);
        HttpErrorLog.error("agentBackProfitsForErrorToTimer ==>", error);
        return Promise.reject(error);
    }

}