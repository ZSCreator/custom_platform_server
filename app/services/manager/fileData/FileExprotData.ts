/**
 * 导出系统数据
 */
import fs = require('fs');
import path = require('path');
import {getLogger} from "pinus-logger";
import GameRecordMysqlDao from '../../../common/dao/mysql/GameRecord.mysql.dao';
import PlayerManager from '../../../common/dao/daoManager/Player.manager';
import * as moment from "moment";
import * as Utils from '../../../utils';
import * as JSZip from 'jszip';
const ManagerErrorLogger = getLogger('global_error_filter', __filename);
const readAddress = '/data/fileData';
const paths = path.resolve(__dirname, readAddress);
import { Buffer } from 'buffer';


/**
 * 总后台   导出一段时间内的玩家输赢报表
 */
export const downGameRecordDataForPlatformName = async (platformUid: string, startTime: number, endTime: number, uid: string, thirdUid: string) => {
    let head = '代理号,第三方帐号 ,玩家帐号,游戏, 注单号,押注额,玩家利润,抽水,时间 ';//手动创建表头中的内容
    const startDateTime: string = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
    const endDateTime: string = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
    let path2 = null;
    let fws = null;
    try {
        let limit = 10000;  //查询一次的获取多少条数据
        let oneSheetLength = 1000000;
        const count = await GameRecordMysqlDao.fileOutDataForLength(platformUid, startDateTime, endDateTime, limit, uid, thirdUid);
        if (count == 0) {
            return Promise.reject("没有数据");
        }
        if(count > 10000000){
            return Promise.reject("数据超过1000W限制");
        }
        let filePaths = [];
        const sheet = Math.ceil(count / oneSheetLength);  //获取要分为几个csv文件夹
        let startId = 0;
        let fileName = null;
        let name = null;
        for (let j = 1; j <= sheet; j++) {
            if (uid) {
                fileName = `/game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            } else if (thirdUid) {
                fileName = `/game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            } else {
                fileName = `/game_record_platform_${platformUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_platform_${platformUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            let path1 = paths + fileName;
            path2 = path1;
            filePaths.push({path: path1, name: name})
            const fw = fs.createWriteStream(path1, {flags: 'a'});
            fws = fw;
            fw.write(head);
            let listData = '';
            let num = 0;
            //判断是否超过100W数据
            if (count > oneSheetLength * j) {
                num = Math.ceil(oneSheetLength / limit);
            } else {
                let lastLength = count - (oneSheetLength * (j - 1));
                num = Math.ceil(lastLength / limit);
            }
            if (num > 0) {
                for (let num_i = 1; num_i <= num; num_i++) {
                    const {list} = await GameRecordMysqlDao.fileOutDataForPlatformName(platformUid, startDateTime, endDateTime, limit, uid, thirdUid, startId);
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


        return {address: outFilePath};
    } catch (error) {
        fws.close();
        fs.unlinkSync(path2);
        ManagerErrorLogger.info(`downGameRecordDataForPlatformName ==>startTime: ${Utils.getYearAndDay(startTime)},endTime:${Utils.getYearAndDay(endTime)},error:${error}`);
        return Promise.reject(error);
    }
};


/**
 * 总后台   导出一段时间内的玩家输赢报表
 */
export const downGameRecordDataForAgent = async (platformUid: string, agentName: string, startTime: number, endTime: number, uid: string, thirdUid: string) => {
    let head = '代理号,第三方帐号 ,玩家帐号,游戏, 注单号,押注额,玩家利润,抽水,时间 ';//手动创建表头中的内容
    const startDateTime: string = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
    const endDateTime: string = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
    let path2 = null;
    let fws = null;
    try {
        let limit = 10000;  //查询一次的获取多少条数据
        let oneSheetLength = 1000000;

        const count = await GameRecordMysqlDao.fileOutDataForLengthForAgent(platformUid, agentName, startDateTime, endDateTime, limit, uid, thirdUid);

        if (count == 0) {
            return Promise.reject("没有数据");
        }
        if(count > 10000000){
            return Promise.reject("数据超过1000W限制");
        }
        let filePaths = [];
        const sheet = Math.ceil(count / oneSheetLength);  //获取要分为几个csv文件夹
        let startId = 0;
        let fileName = null;
        let name = null;
        for (let j = 1; j <= sheet; j++) {
            if (uid) {
                fileName = `/game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_uid_${uid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            } else if (thirdUid) {
                fileName = `/game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_thirdUid_${thirdUid}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            } else {
                fileName = `/game_record_platform_${platformUid}_agentName_${agentName}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
                name = `game_record_platform_${platformUid}_agentName_${agentName}_${Utils.getYearAndDay(startTime)}-${Utils.getYearAndDay(endTime)}_${j}.csv`;
            }
            let path1 = paths + fileName;
            path2 = path1;
            filePaths.push({path: path1, name: name})
            const fw = fs.createWriteStream(path1, {flags: 'a'});
            fws = fw;
            fw.write(head);
            let listData = '';
            let num = 0;
            //判断是否超过100W数据
            if (count > oneSheetLength * j) {
                num = Math.ceil(oneSheetLength / limit);
            } else {
                let lastLength = count - (oneSheetLength * (j - 1));
                num = Math.ceil(lastLength / limit);
            }
            if (num > 0) {
                for (let num_i = 1; num_i <= num; num_i++) {
                    const {list} = await GameRecordMysqlDao.fileOutDataForAgent(platformUid, agentName,startDateTime, endDateTime, limit, uid, thirdUid, startId);
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

        return {address: outFilePath};
    } catch (error) {
        fws.close();
        fs.unlinkSync(path2);
        ManagerErrorLogger.info(`downGameRecordDataForAgent ==>startTime: ${Utils.getYearAndDay(startTime)},endTime:${Utils.getYearAndDay(endTime)},error:${error}`);
        return Promise.reject(error);
    }
};

/**
 *  后台管理 -- 导出玩家列表
 *  query,options,gameName,startTime,endTime
 */

export const downPlayerData = async (startTime: string, endTime: string) => {
    try {
        let list = 'ID,上级ID,手机号码,累计充值,累计提现,持有金币,钱包金币,注册日期,登陆时间';//手动创建表头中的内容
        const fileName = `/PlayerInfo${startTime}--${endTime}.csv`;
        let address = readAddress + fileName;
        let path = paths + fileName;
        const selectFile = ["Player.uid", "Player.nickname", "Player.loginTime", "Player.createTime", "Player.addRmb", "Player.addTixian", "Player.walletGold", "Player.gold", "Player.loginTime"]
        const record = await PlayerManager.fileExprotData(startTime, endTime, selectFile);
        for (let item of record) {
            const cellPhone = '无';
            const superior = '无';
            const uid = item.uid;
            // const nickname = item.nickname;
            const createTime = item.createTime;
            const addRmb = item.addRmb / 100;
            const addTixian = item.addTixian / 100;
            const walletGold = item.walletGold / 100;
            const gold = Utils.sum(item.gold, true) / 100;
            const day = item.loginTime;
            list += "\r\n" + uid + "," + superior + ',' + cellPhone + ',' + addRmb + ',' + addTixian + ',' + gold + ',' + walletGold + ',' + createTime + ',' + day;
        }
        // if (i == 0) {
        // console.log('list',list);
        await write(path, list);
        // } else {
        //     await appendFile(path, list);
        // }

        return address;
    } catch (error) {
        ManagerErrorLogger.info(`downOrderBetData ==>startTime: ${startTime},error:${error}`);
        return;
    }
};

/**
 *  下载文件
 * @param address
 */

export const download = async (address) => {
    try {
        const f = path.resolve(address);
        // let size = fs.statSync(address).size;
        // let f = fs.createReadStream(address);
        return f;
    } catch (error) {
        ManagerErrorLogger.info(`download ==>startTime:,error:${error}`);
        return;
    }
};

/**
 *  判断文件是否存在
 * @param path
 */

function isFileExisted(path) {
    return new Promise(function (resolve, reject) {
        fs.access(path, (err) => {
            if (err) {
                reject(err.message);
            } else {
                resolve(true);
            }
        })
    })
}


/**
 * 创建文件，同时写入内容
 * @param path
 * @param list
 */


async function write(path, list) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, list, (error) => {
            if (error) {
                reject(error);
            }
            resolve('写入完成');
        });

    })
}

/**
 *  追加文件内容
 * @param path
 * @param list
 */
async function appendFile(path, list) {
    return new Promise((resolve, reject) => {
        fs.appendFile(path, list, (error) => {
            if (error) {
                reject(error);
            }
            resolve('追加完成')
        });

    })
}


/**
 * 压缩zip格式
 * @param filePaths 文件路径
 * @param outFilePath 输出文件路径
 */
async function zipFiles(filePaths: { path: string, name: string }[], outFilePath: string) {
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
                zip.file(p.name, Buffer.from(data));
                resolve(1);
            })
        })
    }));
    const content = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });

    console.warn('压缩后长度', content.length);

    fs.writeFileSync(outFilePath, content);


    return ;
}
