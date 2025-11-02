'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dbMongo = require('../../config/db/mongo.json');
const commonUtil = require("../../app/utils/lottery/commonUtil");
const DatabaseService = require("../../app/services/databaseService");
const infiniteAgentService = require("../../app/services/agent/infiniteAgentService");
const buildAgentRelationController = require("../../app/services/agent/buildAgentRelationController");
const PlayerManager = require("../../app/common/dao/PlayerInfoManager");
const mongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const pinus_logger_1 = require("pinus-logger");
const Logger = pinus_logger_1.getLogger('server_out', __filename);
const oldAgentRelationTable = 'agent_info';
const oldAgentRelationDao = mongoManager.agent_info;
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function reconstruct() {
    try {
        const allOldAgentInfo = await oldAgentRelationDao.find({ agentLevel: { $ne: 0 } }, '-_id -__v', { sort: { agentLevel: 1 }, lean: true });
        const haveNoSuperior = [];
        let haveSuperior = [];
        allOldAgentInfo.forEach(inviteCodeInfo => {
            if (inviteCodeInfo.superior) {
                haveSuperior.push(inviteCodeInfo);
            }
            else {
                haveNoSuperior.push(inviteCodeInfo);
            }
        });
        let i = 1;
        for (let inviteCodeInfo of haveNoSuperior) {
            console.log(`开始处理第： ${i} of ${allOldAgentInfo.length} 个`);
            await dealWithOne(inviteCodeInfo, allOldAgentInfo);
            i++;
        }
        let newBatch;
        let changedBatchUidArr = haveNoSuperior.map(levelOne => levelOne.uid);
        let leftToChange;
        while (haveSuperior.length) {
            newBatch = [];
            leftToChange = [];
            for (let inviteCodeInfo of haveSuperior) {
                if (changedBatchUidArr.includes(inviteCodeInfo.superior)) {
                    newBatch.push(inviteCodeInfo.uid);
                    console.log(`开始处理第： ${i} of ${allOldAgentInfo.length} 个`);
                    await dealWithOne(inviteCodeInfo, allOldAgentInfo);
                    i++;
                }
                else {
                    leftToChange.push(inviteCodeInfo);
                }
            }
            haveSuperior = leftToChange;
            changedBatchUidArr = newBatch;
        }
        console.log(`处理完成:${i}`);
    }
    catch (error) {
        Logger.error(`重建失败，错误是：`, error);
    }
}
async function dealWithOne(oldAgentInfo, allOldAgentInfo) {
    let playerAndLock;
    let uid;
    let user;
    let userUpdateFields;
    let superiorAgentInfo;
    let updateAgentInfo;
    try {
        uid = oldAgentInfo.uid;
        playerAndLock = await PlayerManager.getPlayer({ uid }, true);
        if (!playerAndLock.player) {
            return;
        }
        playerAndLock.player.teamPeople = 0;
        await PlayerManager.updateOnePlayer(playerAndLock.player, ['teamPeople'], playerAndLock.lock);
        if (!oldAgentInfo.superior) {
            await buildAgentRelationController.addGroupInfo(uid);
        }
        else {
            superiorAgentInfo = commonUtil.getArrayMember(allOldAgentInfo, 'uid', oldAgentInfo.superior);
            if (!superiorAgentInfo) {
                throw '添加自己是未获取到上级的代理信息';
            }
            await buildAgentRelationController.buildSupSubRelation(oldAgentInfo.superior, uid);
        }
        updateAgentInfo = {};
        Object.assign(updateAgentInfo, oldAgentInfo);
        Reflect.deleteProperty(updateAgentInfo, 'group_line');
        await infiniteAgentService.externalUpdateAgent({ uid }, updateAgentInfo);
        let agentInfo = await infiniteAgentService.findAgentInfo({ uid }, 'group_id');
        if (!agentInfo) {
            throw '添加后未找到自己的信息';
        }
        const createdList = await infiniteAgentService.findAgentInfoList({ group_id: agentInfo.group_id }, 'uid group_line');
        let createdLength = createdList.length;
        if (createdLength) {
            let set = createdList.map(i => i.group_line);
            set = Array.from(new Set(set));
            if (set.length !== createdLength) {
                throw `出错了：group_line 有重复`;
            }
        }
        playerAndLock = await PlayerManager.getPlayer({ uid }, true);
        if (!playerAndLock.player) {
            return;
        }
        if (superiorAgentInfo) {
            playerAndLock.player.inviteCode = superiorAgentInfo.inviteCode;
        }
        else {
            playerAndLock.player.inviteCode = '';
        }
        await PlayerManager.updateOnePlayer(playerAndLock.player, ['inviteCode'], playerAndLock.lock);
    }
    catch (error) {
        Logger.error(`重建代理关系或更新代理信息失败：${JSON.stringify(oldAgentInfo)}，错误是：`, error);
        return Promise.reject(error);
    }
}
reconstruct();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRSZWxhdGlvblJlY29uc3RydWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvYWdlbnQvYWdlbnRSZWxhdGlvblJlY29uc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxpRUFBa0U7QUFDbEUsc0VBQXVFO0FBQ3ZFLHNGQUF1RjtBQUN2RixzR0FBdUc7QUFFdkcsd0VBQXlFO0FBQ3pFLDhFQUErRTtBQUMvRSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsd0JBQVMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHbkQsTUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUM7QUFFM0MsTUFBTSxtQkFBbUIsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0FBRXBELGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxXQUFXO0lBQ3RCLElBQUk7UUFFQSxNQUFNLGVBQWUsR0FBRyxNQUFNLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMs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