"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.downPlayerData = exports.downGameRecordDataForAgent = exports.downGameRecordDataForPlatformName = void 0;
const fs = require("fs");
const path = require("path");
const pinus_logger_1 = require("pinus-logger");
const GameRecord_mysql_dao_1 = require("../../../common/dao/mysql/GameRecord.mysql.dao");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const moment = require("moment");
const Utils = require("../../../utils");
const JSZip = require("jszip");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('global_error_filter', __filename);
const readAddress = '/data/fileData';
const paths = path.resolve(__dirname, readAddress);
const buffer_1 = require("buffer");
const downGameRecordDataForPlatformName = async (platformUid, startTime, endTime, uid, thirdUid) => {
    let head = '代理号,第三方帐号 ,玩家帐号,游戏, 注单号,押注额,玩家利润,抽水,时间 ';
    const startDateTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
    const endDateTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
    let path2 = null;
    let fws = null;
    try {
        let limit = 10000;
        let oneSheetLength = 1000000;
        const count = await GameRecord_mysql_dao_1.default.fileOutDataForLength(platformUid, startDateTime, endDateTime, limit, uid, thirdUid);
        if (count == 0) {
            return Promise.reject("没有数据");
        }
        if (count > 10000000) {
            return Promise.reject("数据超过1000W限制");
        }
        let filePaths = [];
        const sheet = Math.ceil(count / oneSheetLength);
        let startId = 0;
        let fileName = null;
        let name = null;
        for (let j = 1; j <= sheet; j++) {
            if (uid) {
                fileName = `/game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            else if (thirdUid) {
                fileName = `/game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            else {
                fileName = `/game_record_platform_${platformUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_platform_${platformUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            let path1 = paths + fileName;
            path2 = path1;
            filePaths.push({ path: path1, name: name });
            const fw = fs.createWriteStream(path1, { flags: 'a' });
            fws = fw;
            fw.write(head);
            let listData = '';
            let num = 0;
            if (count > oneSheetLength * j) {
                num = Math.ceil(oneSheetLength / limit);
            }
            else {
                let lastLength = count - (oneSheetLength * (j - 1));
                num = Math.ceil(lastLength / limit);
            }
            if (num > 0) {
                for (let num_i = 1; num_i <= num; num_i++) {
                    const { list } = await GameRecord_mysql_dao_1.default.fileOutDataForPlatformName(platformUid, startDateTime, endDateTime, limit, uid, thirdUid, startId);
                    let length = list.length;
                    for (let i = 0; i < length; i++) {
                        const item = list[i];
                        const uid = item.uid;
                        const createTimeDate = item.createTimeDate;
                        const gname = item.gameName;
                        const input = item.validBet / 100;
                        const profit = item.profit / 100;
                        const thirdUid = item.thirdUid;
                        const groupRemark = item.groupRemark;
                        const gameOrder = `>${item.game_order_id}<`;
                        const commission = (item.bet_commission + item.win_commission + item.settle_commission) / 100;
                        listData += "\r\n" + groupRemark + "," + thirdUid + "," + uid + "," + gname + ',' + gameOrder + ',' + input + ',' + profit + ',' + commission + ',' + createTimeDate;
                    }
                    fw.write(listData);
                    if (length > 0) {
                        startId = list[length - 1].id + 1;
                    }
                    listData = '';
                }
            }
            fw.close();
        }
        let outFilePath = readAddress + `/game_record_platform_${platformUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}.zip`;
        const path = await zipFiles(filePaths, outFilePath);
        filePaths.forEach(p => fs.unlinkSync(p.path));
        return { address: outFilePath };
    }
    catch (error) {
        fws.close();
        fs.unlinkSync(path2);
        ManagerErrorLogger.info(`downGameRecordDataForPlatformName ==>startTime: ${Utils.getYearAndDay(startTime)},endTime:${Utils.getYearAndDay(endTime)},error:${error}`);
        return Promise.reject(error);
    }
};
exports.downGameRecordDataForPlatformName = downGameRecordDataForPlatformName;
const downGameRecordDataForAgent = async (platformUid, agentName, startTime, endTime, uid, thirdUid) => {
    let head = '代理号,第三方帐号 ,玩家帐号,游戏, 注单号,押注额,玩家利润,抽水,时间 ';
    const startDateTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
    const endDateTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
    let path2 = null;
    let fws = null;
    try {
        let limit = 10000;
        let oneSheetLength = 1000000;
        const count = await GameRecord_mysql_dao_1.default.fileOutDataForLengthForAgent(platformUid, agentName, startDateTime, endDateTime, limit, uid, thirdUid);
        if (count == 0) {
            return Promise.reject("没有数据");
        }
        if (count > 10000000) {
            return Promise.reject("数据超过1000W限制");
        }
        let filePaths = [];
        const sheet = Math.ceil(count / oneSheetLength);
        let startId = 0;
        let fileName = null;
        let name = null;
        for (let j = 1; j <= sheet; j++) {
            if (uid) {
                fileName = `/game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            else if (thirdUid) {
                fileName = `/game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            else {
                fileName = `/game_record_platform_${platformUid}_agentName_${agentName}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_platform_${platformUid}_agentName_${agentName}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            let path1 = paths + fileName;
            path2 = path1;
            filePaths.push({ path: path1, name: name });
            const fw = fs.createWriteStream(path1, { flags: 'a' });
            fws = fw;
            fw.write(head);
            let listData = '';
            let num = 0;
            if (count > oneSheetLength * j) {
                num = Math.ceil(oneSheetLength / limit);
            }
            else {
                let lastLength = count - (oneSheetLength * (j - 1));
                num = Math.ceil(lastLength / limit);
            }
            if (num > 0) {
                for (let num_i = 1; num_i <= num; num_i++) {
                    const { list } = await GameRecord_mysql_dao_1.default.fileOutDataForAgent(platformUid, agentName, startDateTime, endDateTime, limit, uid, thirdUid, startId);
                    let length = list.length;
                    for (let i = 0; i < length; i++) {
                        const item = list[i];
                        const uid = item.uid;
                        const createTimeDate = item.createTimeDate;
                        const gname = item.gameName;
                        const input = item.validBet / 100;
                        const profit = item.profit / 100;
                        const thirdUid = item.thirdUid;
                        const groupRemark = item.groupRemark;
                        const gameOrder = `>${item.game_order_id}<`;
                        const commission = (item.bet_commission + item.win_commission + item.settle_commission) / 100;
                        listData += "\r\n" + groupRemark + "," + thirdUid + "," + uid + "," + gname + ',' + gameOrder + ',' + input + ',' + profit + ',' + commission + ',' + createTimeDate;
                    }
                    fw.write(listData);
                    if (length > 0) {
                        startId = list[length - 1].id + 1;
                    }
                    listData = '';
                }
            }
            fw.close();
        }
        let outFilePath = readAddress + `/game_record_platform_${platformUid}_agentName_${agentName}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}.zip`;
        const path = await zipFiles(filePaths, outFilePath);
        filePaths.forEach(p => fs.unlinkSync(p.path));
        return { address: outFilePath };
    }
    catch (error) {
        fws.close();
        fs.unlinkSync(path2);
        ManagerErrorLogger.info(`downGameRecordDataForAgent ==>startTime: ${Utils.getYearAndDay(startTime)},endTime:${Utils.getYearAndDay(endTime)},error:${error}`);
        return Promise.reject(error);
    }
};
exports.downGameRecordDataForAgent = downGameRecordDataForAgent;
const downPlayerData = async (startTime, endTime) => {
    try {
        let list = 'ID,上级ID,手机号码,累计充值,累计提现,持有金币,钱包金币,注册日期,登陆时间';
        const fileName = `/PlayerInfo${startTime}--${endTime}.csv`;
        let address = readAddress + fileName;
        let path = paths + fileName;
        const selectFile = ["Player.uid", "Player.nickname", "Player.loginTime", "Player.createTime", "Player.addRmb", "Player.addTixian", "Player.walletGold", "Player.gold", "Player.loginTime"];
        const record = await Player_manager_1.default.fileExprotData(startTime, endTime, selectFile);
        for (let item of record) {
            const cellPhone = '无';
            const superior = '无';
            const uid = item.uid;
            const createTime = item.createTime;
            const addRmb = item.addRmb / 100;
            const addTixian = item.addTixian / 100;
            const walletGold = item.walletGold / 100;
            const gold = Utils.sum(item.gold, true) / 100;
            const day = item.loginTime;
            list += "\r\n" + uid + "," + superior + ',' + cellPhone + ',' + addRmb + ',' + addTixian + ',' + gold + ',' + walletGold + ',' + createTime + ',' + day;
        }
        await write(path, list);
        return address;
    }
    catch (error) {
        ManagerErrorLogger.info(`downOrderBetData ==>startTime: ${startTime},error:${error}`);
        return;
    }
};
exports.downPlayerData = downPlayerData;
const download = async (address) => {
    try {
        const f = path.resolve(address);
        return f;
    }
    catch (error) {
        ManagerErrorLogger.info(`download ==>startTime:,error:${error}`);
        return;
    }
};
exports.download = download;
function isFileExisted(path) {
    return new Promise(function (resolve, reject) {
        fs.access(path, (err) => {
            if (err) {
                reject(err.message);
            }
            else {
                resolve(true);
            }
        });
    });
}
async function write(path, list) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, list, (error) => {
            if (error) {
                reject(error);
            }
            resolve('写入完成');
        });
    });
}
async function appendFile(path, list) {
    return new Promise((resolve, reject) => {
        fs.appendFile(path, list, (error) => {
            if (error) {
                reject(error);
            }
            resolve('追加完成');
        });
    });
}
async function zipFiles(filePaths, outFilePath) {
    const zip = new JSZip();
    await Promise.all(filePaths.map(p => {
        return new Promise((resolve, reject) => {
            const s = fs.createReadStream(p.path);
            let data = '';
            s.on('data', (chunk) => {
                data += chunk;
            });
            s.on('end', () => {
                console.warn(`name: ${p.name}, path: ${p.path} length: ${data.length}`);
                zip.file(p.name, buffer_1.Buffer.from(data));
                resolve(1);
            });
        });
    }));
    const content = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    console.warn('压缩后长度', content.length);
    fs.writeFileSync(outFilePath, content);
    return;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUV4cHJvdERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbWFuYWdlci9maWxlRGF0YS9GaWxlRXhwcm90RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSx5QkFBMEI7QUFDMUIsNkJBQThCO0FBQzlCLCtDQUF1QztBQUN2Qyx5RkFBZ0Y7QUFDaEYsa0ZBQTBFO0FBQzFFLGlDQUFpQztBQUNqQyx3Q0FBd0M7QUFDeEMsK0JBQStCO0FBQy9CLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3hFLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO0FBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELG1DQUFnQztBQU16QixNQUFNLGlDQUFpQyxHQUFHLEtBQUssRUFBRSxXQUFtQixFQUFFLFNBQWlCLEVBQUUsT0FBZSxFQUFFLEdBQVcsRUFBRSxRQUFnQixFQUFFLEVBQUU7SUFDOUksSUFBSSxJQUFJLEdBQUcseUNBQXlDLENBQUM7SUFDckQsTUFBTSxhQUFhLEdBQVcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sV0FBVyxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMxRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSTtRQUNBLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFDN0IsTUFBTSxLQUFLLEdBQUcsTUFBTSw4QkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVB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