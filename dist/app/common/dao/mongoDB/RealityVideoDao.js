"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoManager = require("./lib/mongoManager");
const realityVideoUserInfoDao = mongoManager.reality_video_user_info;
const gameRecordDao = mongoManager.game_record;
class RealityVideoDao {
    static async findUser(uid) {
        try {
            const hasUserInfo = await realityVideoUserInfoDao.findOne({ uid });
            return hasUserInfo;
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|findUser|查询用户出错:${e.stack}`);
            return false;
        }
    }
    static async findUserByUserName(username) {
        try {
            const hasUserInfo = await realityVideoUserInfoDao.findOne({ username });
            return hasUserInfo;
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|findUser|查询用户出错:${e.stack}`);
            return false;
        }
    }
    static async saveOne({ uid, username, password, ratio_switch = 1, ratio = 0.5, ratio_setting = 0, integral = 0, lastLoginTime = Date.now(), createDateTime = Date.now(), updateDateTime = null, isDemoAccount = 1, nickname }) {
        try {
            const recordBody = {
                uid,
                username,
                password,
                ratio_switch,
                ratio,
                ratio_setting,
                integral,
                lastLoginTime,
                createDateTime,
                updateDateTime,
                isDemoAccount,
                nickname
            };
            await realityVideoUserInfoDao.create(recordBody);
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|saveOne|新增用户出错:${e.stack}`);
        }
    }
    static async updateOne({ _id }, params = {}) {
        if (Object.keys(params).length === 0)
            return;
        await realityVideoUserInfoDao.updateOne({ _id }, params);
    }
    ;
    static async findOneGameRecord({ uid, nid, playStatus = 0 }, otherParam = {}) {
        try {
            let bodyData = { uid, nid, playStatus };
            if (Object.keys(otherParam).length > 0)
                bodyData = Object.assign({}, bodyData, otherParam);
            const hasRecord = await gameRecordDao.findOne(bodyData);
            return hasRecord ? hasRecord : false;
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|findOneGameRecord|查询游戏记录出错:${e.stack}`);
            return false;
        }
    }
    static async findLastUpdateGameRecord({ uid, nid, playStatus = 1 }, otherParam = {}) {
        try {
            let bodyData = { uid, nid, playStatus };
            if (Object.keys(otherParam).length > 0)
                bodyData = Object.assign({}, bodyData, otherParam);
            const hasRecord = await gameRecordDao.find(bodyData).sort({ 'createTime': -1 }).limit(1);
            return hasRecord ? hasRecord : false;
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|findLastUpdateGameRecord|查询游戏记录出错:${e.stack}`);
            return false;
        }
    }
    static async saveGameRecord({ uid, nid, input, profit = 0, win = 0, gold = 0, playStatus = 0, nickname, gname = '真人视讯', createTime = Date.now(), privateRoom = false, isDealer = false, multiple = 0, addRmb = 0, addTixian = 0, playerCreateTime, bet_commission = 0, win_commission = 0, settle_commission = 0, way = 0, object = 0 }) {
        try {
            const recordBody = {
                uid,
                nid,
                input,
                profit,
                win,
                gold,
                playStatus,
                nickname,
                gname,
                createTime,
                privateRoom,
                isDealer,
                multiple,
                addRmb,
                addTixian,
                playerCreateTime,
                bet_commission,
                win_commission,
                settle_commission,
                way,
                object
            };
            await gameRecordDao.create(recordBody);
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|saveRecord|新增游戏记录出错:${e.stack}`);
        }
    }
    static async updateGameRecord({ _id, input, profit, win, gold, playStatus = 1 }) {
        try {
            await gameRecordDao.updateOne({ _id }, { input, profit, win, gold, playStatus });
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|updateGameRecord|更新游戏记录出错:${e.stack}`);
        }
    }
    static async selectListForOffsetPageTotalPage({ startTime, endTime, startPage = 0, pageSize = 20 }) {
        try {
            const count = await gameRecordDao
                .countDocuments({
                nid: '59',
                playStatus: 1,
                createTime: { $gt: startTime, $lt: endTime }
            });
            return count ? Math.ceil(count / pageSize) : 0;
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|selectListForOffsetPageCount|分页查询出错:${e.stack}`);
        }
    }
    static async selectListForOffsetPage({ startTime, endTime, startPage = 0, pageSize = 20 }) {
        try {
            const totalRecord = await gameRecordDao.find({
                nid: '59',
                playStatus: 1,
                createTime: { $gt: startTime, $lt: endTime }
            }, 'uid nickname nid input profit win createTime')
                .sort({ createTime: -1 })
                .skip(pageSize * (startPage - 1))
                .limit(pageSize)
                .exec();
            return totalRecord ? totalRecord : [];
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|selectListForOffsetPage|分页查询出错:${e.stack}`);
        }
    }
    static async selectList({ startTime, endTime }) {
        try {
            const totalRecord = await gameRecordDao.find({
                nid: '59',
                playStatus: 1,
            }, 'uid nickname nid input profit win createTime')
                .find({ createTime: { $gt: startTime, $lt: endTime } })
                .sort({ createTime: -1 })
                .exec();
            return totalRecord ? totalRecord : [];
        }
        catch (e) {
            console.error(`真人视讯|RealityVideoDao|selectListForOffsetPage|分页查询出错:${e.stack}`);
        }
    }
}
exports.default = RealityVideoDao;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbGl0eVZpZGVvRGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9SZWFsaXR5VmlkZW9EYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBb0Q7QUFDcEQsTUFBTSx1QkFBdUIsR0FBRyxZQUFZLENBQUMsdUJBQXVCLENBQUM7QUFDckUsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUUvQyxNQUFxQixlQUFlO0lBTWxDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVc7UUFDL0IsSUFBSTtZQUNGLE1BQU0sV0FBVyxHQUFHLE1BQU0sdUJBQXVCLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuRSxPQUFPLFdBQVcsQ0FBQztTQUNwQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDakUsT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7SUFPRCxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQWdCO1FBQzlDLElBQUk7WUFDRixNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDeEUsT0FBTyxXQUFXLENBQUM7U0FDcEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0lBaUJELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFBRSxL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