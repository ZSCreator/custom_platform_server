import { Injectable } from '@nestjs/common';
import { getLogger } from "pinus-logger";
const ManagerErrorLogger = getLogger('http', __filename);
import ThirdApiWarnGoldRedisDao from "../../../../../../common/dao/redis/ThirdApiWarnGold.redis.dao";
import OnlinePlayerRedisDao from "../../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import DayCreatePlayerRedisDao from "../../../../../../common/dao/redis/DayCreatePlayer.redis.dao";
import DayLoginPlayerRedisDao from "../../../../../../common/dao/redis/DayLoginPlayer.redis.dao";
import PlayerManagerDao from "../../../../../../common/dao/daoManager/Player.manager";
import GameManager from "../../../../../../common/dao/daoManager/Game.manager";
import GameRecordDateTableMysqlDao from "../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import GameRecordMysqlDao from "../../../../../../common/dao/mysql/GameRecord.mysql.dao";
import ThirdGoldRecordMysqlDao from "../../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao";
import { Player } from "../../../../../../common/dao/mysql/entity/Player.entity";
import PlayerAgentMysqlDao from "../../../../../../common/dao/mysql/PlayerAgent.mysql.dao";
import ThirdGoldRecordRedisDao from "../../../../../../common/dao/redis/ThirdGoldRecord.redis.dao";
const game_scenes = require('../../../../../../../config/data/game_scenes.json');
import { random } from '../../../../../../utils';
import * as moment from "moment";
import PlatformNameAgentListRedisDao from "../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
const agent_name = require('../../../../../../../config/data/agent_name.json');

@Injectable()
export class ThirdApiService {
    /**
     * 第三方 API 的相关功能， 获取游戏记录
     * @param money   初始化金币
     */
    async getGameRecrodApiForMoreTable(managerUid :string, rootAgent : string ,page: number, startTime: string, endTime: string, managerAgent: string, thirdUid: string, nid: string, pageSize: number ,gameOrder : string ,roundId : string): Promise<any> {
        try {
            if (!managerAgent) {
                return Promise.reject('该后台账号不存在代理');
            }
            const agent = await PlayerAgentMysqlDao.findOne({ platformName: managerAgent });
            if (!agent) {
                return Promise.reject('该后台账号的代理不存在');
            }

            if (thirdUid) {
                // @ts-ignore
                const player: Player = await PlayerManagerDao.findOne({ thirdUid: thirdUid }, false);
                if(!player){
                    return Promise.reject("该账号不存在")
                }
                if(rootAgent !== managerAgent){
                    if (player.groupRemark !== agent.platformName) {
                        return Promise.reject("该第三方账号id不属于该代理")
                    }
                }else{
                    if (player.group_id !== managerUid) {
                        return Promise.reject("该第三方账号id不属于该平台")
                    }
                }

            }
            let platformUid = agent.rootUid;
            if(!platformUid){
                return Promise.reject("该代理的数据错误，查询失败")
            }
            //获取要查询的表组成数组
            let table1 = null ;  //今日表
            let table2 = null ;   // 月表
            if(startTime && endTime){
                const start = moment(startTime).format("YYYYMM");
                const end = moment(endTime).format("YYYYMM");
                if(start != end){
                    table1 = start;
                    table2 = end;
                }else{
                    table1 = start;
                }
            }else{
                let today = moment().format("YYYYMM");
                table1 = today;
            }
            let where = null;

            if (startTime && endTime) {
                where =  `Sp_GameRecord.createTimeDate > "${startTime}"  AND Sp_GameRecord.createTimeDate <= "${endTime}"`;
            }else{
                let start = moment().format("YYYY-MM-DD 00:00:00");
                let end = moment().format("YYYY-MM-DD 23:59:59.999");
                where =  `Sp_GameRecord.createTimeDate > "${start}"  AND Sp_GameRecord.createTimeDate <= "${end}"`;
            }

            if(managerAgent) {
                if(agent.roleType == 2){
                    const agentList = await PlatformNameAgentListRedisDao.findOne({platformName:agent.platformName});
                    const list =[];
                    agentList.forEach(x=>{
                        list.push(`"${x}"`)
                    });
                    if(where){
                        where = where + ` AND Sp_GameRecord.groupRemark IN (${list})`;
                    }else{
                        where =`Sp_GameRecord.groupRemark IN (${list}) `;
                    }
                }else{
                    if(where){
                        where = where + ` AND Sp_GameRecord.groupRemark = "${agent.platformName}" `;
                    }else{
                        where =`Sp_GameRecord.groupRemark = "${agent.platformName}" `;
                    }
                }

            }
            if (gameOrder) {
                if(where){
                    where = where + ` AND Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }else{
                    where = `Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }
            }else if(roundId){
                if(where){
                    where = where + ` AND Sp_GameRecord.round_id = "${roundId}"`;
                }else{
                    where = `Sp_GameRecord.round_id = "${roundId}"`;
                }
            }


            if(thirdUid) {
                if(where){
                    where = where + ` AND Sp_GameRecord.thirdUid = "${thirdUid}"`;
                }else{
                    where = `Sp_GameRecord.thirdUid = "${thirdUid}"`;
                }
            }

            if (nid) {
                if(where){
                    where = where + ` AND Sp_GameRecord.game_id = "${nid}"`;
                }else{
                    where = `Sp_GameRecord.game_id = "${nid}"`;
                }

            }


            if (where){
                const { list, count } = await GameRecordMysqlDao.findListToLimitForWhereForMoreTable(platformUid, table1 ,table2  , where , page, pageSize );
                const res = list.map((info) => {
                    info.groupRemark = this.agentForChangeName(info.groupRemark);
                    let sceneName = null;
                    const games =   game_scenes.find(x=>x.nid == info.nid);
                    if(games){
                        let scene = games.scenes.find(x=>x.scene == info.sceneId);
                        if(scene){
                            sceneName = scene.name;
                        }else{
                            sceneName = info.sceneId;
                        }
                    }
                    return { sceneName, ...info };
                });
                return { gameRecords: res, allLength: count };
            }else{
                return { gameRecords: [], allLength: 0 };
            }

        } catch (error) {
            ManagerErrorLogger.error(` 第三方 API 的相关功能， 获取游戏记录 :${error.stack || error}`);
            return { code: 500, error: error };
        }
    }




    /**
     * 代理玩家列表
     * @param agentNum
     * @param gold
     * uid,managerUid,rootAgent, managerAgent, thirdUid, page ,pageSize
     */
    async queryPlayer(uid: string, managerUid: string, rootAgent: string, managerAgent: string, thirdUid: string, page: number , pageSize : number ,ip : string): Promise<any> {
        try {
            if (!uid && !thirdUid && !ip) {
                return Promise.reject("请输入id");
            }
            let resultList = [];
            if (uid) {
                // @ts-ignore
                let player : Player  =  await PlayerManagerDao.findOne({ uid }, false);
                if (!player) {
                    return Promise.reject("玩家不存在");
                }
                if(rootAgent == managerAgent){
                    if(player.group_id != managerUid){
                        return Promise.reject("该玩家不属于该平台");
                    }
                }else if(rootAgent !== managerAgent){
                    if(player.groupRemark != managerAgent){
                        return Promise.reject("该玩家不属于该代理");
                    }
                }
                const info = {
                    uid: player.uid,
                    thirdUid: player.thirdUid,
                    groupRemark: player.groupRemark,
                    gold: player.gold,
                    ip: player.ip ? player.ip : '',
                    loginTime: player.loginTime,
                    createTime: player.createTime,
                    walletGold: player.walletGold,
                    cellPhone: player ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '',
                    superior: player ? player.superior : '',
                    addRmb: player.addRmb,
                    addTixian: player.addTixian ? player.addTixian : 0,
                    closeTime: player.closeTime,
                    flowCount: player.flowCount,
                    dailyFlow: player.dailyFlow,
                    rom_type: player.rom_type,
                    instantNetProfit: player.instantNetProfit,
                };
                resultList.push(info);
            } else{
                let playerList = [];
                if(thirdUid){
                    // @ts-ignore
                    playerList  =  await PlayerManagerDao.findList({ thirdUid });
                } else if(ip){
                    playerList  =  await PlayerManagerDao.findList({ ip });
                }
                if(playerList.length == 0){
                    return Promise.reject("玩家不存在");
                }
                let player1 =  playerList[0];
                if(rootAgent == managerAgent){
                    if(player1.group_id != managerUid){
                        return Promise.reject("该玩家不属于该平台");
                    }
                }else if(rootAgent !== managerAgent){
                    if(player1.groupRemark != managerAgent){
                        return Promise.reject("该玩家不属于该代理");
                    }
                }
                for(let player of playerList){
                    const info = {
                        uid: player.uid,
                        thirdUid: player.thirdUid,
                        groupRemark: player.groupRemark,
                        gold: player.gold,
                        ip: player.ip ? player.ip : '',
                        loginTime: player.loginTime,
                        createTime: player.createTime,
                        walletGold: player.walletGold,
                        cellPhone: player ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '',
                        superior: player ? player.superior : '',
                        addRmb: player.addRmb,
                        addTixian: player.addTixian ? player.addTixian : 0,
                        closeTime: player.closeTime,
                        flowCount: player.flowCount,
                        dailyFlow: player.dailyFlow,
                        rom_type: player.rom_type,
                        instantNetProfit: player.instantNetProfit,
                    };
                    resultList.push(info);
                }
            }
            return { code: 200, data: { resultList, allPlayersLength: 1 } };
        } catch (e) {
            ManagerErrorLogger.error(`玩家每日上下分的记录 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * 代理玩家列表
     * @param agentNum
     * @param gold
     * uid,managerUid,rootAgent, managerAgent, thirdUid, page ,pageSize
     */
    async getAgentPlayers(uid: string, managerUid: string, rootAgent: string, managerAgent: string, thirdUid: string, page: number , pageSize : number,ip : string): Promise<any> {
        try {
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.thirdUid", "Player.gold", "Player.loginTime", "Player.ip", "Player.closeTime","Player.instantNetProfit",
                "Player.rom_type", "Player.createTime", "Player.walletGold", "Player.addTixian", "Player.addRmb", "Player.flowCount", "Player.dailyFlow"];
            let where = null;
            if(managerAgent == rootAgent){
                where = `Player.group_id = "${managerUid}"`;
                const { list ,count } = await PlayerManagerDao.findListForManager(where, page, pageSize, selectFile);
                if(list && list.length !== 0){
                    if(rootAgent == '459pt'){
                        const playerList = list.map((info)=>{
                            info.groupRemark = this.agentForChangeName(info.groupRemark);
                            return info;
                        });
                        return { code: 200, data: { resultList : playerList, allPlayersLength : count } };
                    };
                }
                return { code: 200, data: { resultList : list, allPlayersLength : count } };
            }else if(managerAgent != rootAgent){
                where = `Player.groupRemark = "${managerAgent}"`;
                const { list ,count } = await PlayerManagerDao.findListForManager(where, page, pageSize, selectFile);
               if(list && list.length !== 0){
                   if(rootAgent == '459pt'){
                       const playerList = list.map((info)=>{
                           info.groupRemark = this.agentForChangeName(info.groupRemark);
                           return info;
                       });
                       return { code: 200, data: { resultList : playerList, allPlayersLength : count } };
                   };
               }
                return { code: 200, data: { resultList : list, allPlayersLength : count } };
            }else{
                return { code: 200, data: { resultList : [], allPlayersLength : 0 }  };
            }
        } catch (e) {
            ManagerErrorLogger.error(`玩家每日上下分的记录 exception : ${e.stack | e}`);
            return { code: 500, data: { resultList : [], allPlayersLength : 0 }  };;
        }
    };





    /**
     * 获取第三方上下分警告设置
     * @param agentNum
     * @param gold
     */
    async getWarnGoldCfg(): Promise<any> {
        try {
            const data = await ThirdApiWarnGoldRedisDao.findWarnGoldCfg();
            return data;
        } catch (e) {
            ManagerErrorLogger.error(`获取第三方上下分警告设置 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * 设置第三方上下分警告设置
     * @param agentNum
     * @param gold
     */
    async setWarnGoldCfg(warnGoldCfg: any): Promise<any> {
        try {
            await ThirdApiWarnGoldRedisDao.updateWarnGoldCfg(warnGoldCfg);
            return true;
        } catch (e) {
            ManagerErrorLogger.error(`获取第三方上下分警告设置 exception : ${e.stack | e}`);
            return {};
        }
    };

    /**
     * 查看平台和给平台添加金币的记录
     * @param agentNum
     * @param gold
     */
    async getThirdGoldRecord(page: number, uid: string, pageSize: number, startTime: string, endTime: string): Promise<any> {
        try {
            if (uid) {
                const { list, count } = await ThirdGoldRecordMysqlDao.findListForUid(uid, page, pageSize);
                return { record: list, allLength: count };
            }
            const { list, count } = await ThirdGoldRecordMysqlDao.findListToLimitNoTime(startTime, endTime, page, pageSize);
            return { record: list, allLength: count };
        } catch (e) {
            ManagerErrorLogger.error(`查看平台和给平台添加金币的记录 exception : ${e.stack | e}`);
            return {};
        }
    };

    /**
     * 设置是否通过平台下分操作
     * @param agentNum
     * @param gold
     */
    async setPlayerWarnGold(orderId, uid, remark): Promise<any> {
        try {
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, true);
            let updateGold = player.earlyWarningGold;
            const updateAttr = [];
            switch (remark) {
                // 手动退回
                case 1:
                    player.gold += updateGold;
                    await PlayerManagerDao.updateOne({ uid: player.uid }, { gold: player.gold, earlyWarningGold: 0, earlyWarningFlag: true, entryGold: 0 });
                    await ThirdGoldRecordMysqlDao.updateOne({ orderId }, { status: 4, remark: "手动通过" });
                    //减少redis存的预警数量
                    await ThirdGoldRecordRedisDao.delLength({length:1});
                    ManagerErrorLogger.warn(`预警下分 | 通过操作 | 玩家: ${uid} | 订单: ${orderId} | 暂扣金币 ${updateGold} | 通过后金币 ${player.gold}`)
                    return true;
                // 手动封号
                case 2:
                    const gameRecord = {
                        uid: player.uid,				// 玩家 uid
                        nickname: player.nickname,  			                // 玩家昵称
                        nid: 't2',				// 游戏ID
                        gname: "平台下分",    			// 游戏名称
                        superior: player.superior ? player.superior : '',
                        groupRemark: player.groupRemark,
                        group_id: player.group_id ? player.group_id : null,
                        thirdUid: player.thirdUid,
                        createTime: new Date(),  		// 操作时间
                        input: player.earlyWarningGold,    			// 押注金额
                        win: player.entryGold,				// 中奖金额
                        bet_commission: 0,		// 押注抽水
                        win_commission: 0,		// 赢取抽水
                        settle_commission: 0,	// 结算抽水
                        profit: player.entryGold - player.earlyWarningGold,     		// 利润
                        gold: player.entryGold,				// 当前金币
                        playStatus: 1,			// 记录状态
                        sceneId: -1,
                        roomId: '-1',
                        addRmb: player.addRmb,				// 总充值
                        addTixian: player.addTixian,			// 总提现
                        gameOrder: orderId,			// 订单编号
                        playerCreateTime: player.createTime,	// 注册时间
                    }

                    await Promise.all([
                        PlayerManagerDao.updateOne({ uid: player.uid }, { gold: player.entryGold, earlyWarningGold: 0, entryGold: 0 }),
                        ThirdGoldRecordMysqlDao.updateOne({ orderId }, { status: 2, remark: "拒绝" })
                    ]);

                    // 仿游戏记录
                    const nidList = ["81", "19", "42", "8"];
                    const gameNameList = ["红包扫雷", "红黑大战", "龙虎斗", "百家乐"];

                    const idx = random(0, 4);
                    const nid = nidList[idx];
                    const gameName = gameNameList[idx];

                    const reproduceGameRecord = Object.assign({}, gameRecord);
                    reproduceGameRecord.nid = nid;
                    reproduceGameRecord.gname = gameName;

                    await GameRecordDateTableMysqlDao.insertOne(reproduceGameRecord);
                    //减少redis存的预警数量
                    await ThirdGoldRecordRedisDao.delLength({length:1});
                    return true;
                default:
                    return true;
            }
        } catch (e) {
            ManagerErrorLogger.error(`查看平台和给平台添加金币的记录 exception : ${e.stack | e}`);
            return {};
        }
    };







    /**
     * 获取当天在线人数
     */
    async onlinePlayers(page: number, pageSize: number): Promise<any> {
        try {
            let onlineList = await OnlinePlayerRedisDao.findList();
            let uidList = onlineList.sort((a, b) => a.entryGameTime < b.entryGameTime ? 1 : -1);
            // 分页
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            /** Step 2: Redis 批量操作 */
            let selectFile = ["Player.uid", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"]
            const resultList = await PlayerManagerDao.findListToLimitInUids(selectFile, uids);
            /** 游戏信息列表 */
            let gameList = await GameManager.findList({});
            let games = [];
            gameList.forEach(game => {
                if (game.opened) {
                    games.push({
                        name: game.zname,
                        nid: game.nid,
                    })
                }
            });
            /** Step 3: 清洗数据 */
            const playerList = resultList
                .reduce((res, player) => {
                    /** 玩家信息 */
                    if (!player) {
                        return res;
                    }
                    let info = {
                        uid: '',
                        nid: '',
                        sceneId: -1,
                        addDayRmb: 0,
                        addDayTixian: 0,
                        loginTime: '',
                        addRmb: 0,
                        dailyFlow: 0,
                        createTime: 0,
                        profit: 0,
                        gold: 0,
                        allProfit: 0,
                    };
                    const online = onlineList.find(x => x.uid == player.uid);
                    if (!online) {
                        return res;
                    }
                    info.uid = player.uid;
                    info.nid = online.nid;
                    info.sceneId = online.sceneId;
                    info.addDayRmb = player.addDayRmb;
                    info.addDayTixian = player.addDayTixian;
                    info.loginTime = player.loginTime;
                    info.gold = player.gold;
                    info.addRmb = player.addRmb;
                    info.dailyFlow = player.dailyFlow;
                    info.allProfit = player.instantNetProfit;
                    info.profit = player.addDayTixian + player.gold - player.addDayRmb;

                    res.push(info);

                    return res;
                }, []);
            return { games, playerList, length };
        } catch (e) {
            ManagerErrorLogger.error(`获取当天在线人数 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * api 登陆玩家信息
     */
    async loginPlayers(page: number, pageSize: number): Promise<any> {
        try {
            let loginList = await DayLoginPlayerRedisDao.findList({});
            let uidList = loginList.sort((a, b) => a.loginTime < b.loginTime ? 1 : -1);
            // 分页
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            /** Step 2: Redis 批量操作 */
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"]
            const resultList = await PlayerManagerDao.findListToLimitInUids(selectFile, uids);
            /** Step 3: 清洗数据 */
            const playerList = resultList
                .reduce((res, player) => {
                    /** 玩家信息 */
                    if (!player) {
                        return res;
                    }
                    let info = {
                        uid: '',
                        addDayRmb: 0,
                        addDayTixian: 0,
                        groupRemark: '',
                        loginTime: '',
                        addRmb: 0,
                        dailyFlow: 0,
                        createTime: 0,
                        profit: 0,
                        gold: 0,
                        allProfit: 0,
                    };
                    info.uid = player.uid;
                    info.addDayRmb = player.addDayRmb;
                    info.groupRemark = player.groupRemark;
                    info.addDayTixian = player.addDayTixian;
                    info.loginTime = player.loginTime;
                    info.gold = player.gold;
                    info.addRmb = player.addRmb;
                    info.dailyFlow = player.dailyFlow;
                    info.allProfit = player.instantNetProfit;
                    info.profit = player.addDayTixian + player.gold - player.addDayRmb;
                    res.push(info);
                    return res;
                }, []);
            return { playerList, length };
        } catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * api 新增用户人数
     */
    async createPlayers(page: number, pageSize: number): Promise<any> {
        try {
            let loginList = await DayCreatePlayerRedisDao.findList({});
            let uidList = loginList.sort((a, b) => a.createTime < b.createTime ? 1 : -1);
            // 分页
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            /** Step 2: Redis 批量操作 */
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"]
            const resultList = await PlayerManagerDao.findListToLimitInUids(selectFile, uids);
            /** Step 3: 清洗数据 */
            const playerList = resultList
                .reduce((res, player) => {
                    /** 玩家信息 */
                    if (!player) {
                        return res;
                    }
                    let info = {
                        uid: '',
                        addDayRmb: 0,
                        addDayTixian: 0,
                        groupRemark: '',
                        loginTime: '',
                        addRmb: 0,
                        dailyFlow: 0,
                        createTime: 0,
                        profit: 0,
                        gold: 0,
                        allProfit: 0,
                    };
                    info.uid = player.uid;
                    info.addDayRmb = player.addDayRmb;
                    info.groupRemark = player.groupRemark;
                    info.addDayTixian = player.addDayTixian;
                    info.loginTime = player.loginTime;
                    info.gold = player.gold;
                    info.addRmb = player.addRmb;
                    info.dailyFlow = player.dailyFlow;
                    info.allProfit = player.instantNetProfit;
                    info.profit = player.addDayTixian + player.gold - player.addDayRmb;
                    res.push(info);
                    return res;
                }, []);
            return { playerList, length };
        } catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * 玩家输赢监控
     */
    async agentPlayerGameRecord(managerAgent : string, rootAgent : string, startTime : number, endTime : number ,thirdUid : string , nid :string): Promise<any> {
        try {
            const startTable = moment(startTime).format("YYYYMM");
            if(Number(startTable)< 202106){
                return Promise.reject("请输入正确的时间范围");
            }

            const endTable = moment(endTime).format("YYYYMM");
            const nowTable = moment().format("YYYYMM");
            if(Number(endTable) > Number(nowTable)){
                return Promise.reject("请输入正确的时间范围");
            }
            const startTimeDate = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
            const endTimeData = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
            let table1 = null;
            let table2 = null;
            let platformUid = await PlatformNameAgentListRedisDao.findPlatformUid({platformName: rootAgent});
            if(startTable == endTable){
                table1 = startTable;
            }else{
                table1 = startTable;
                table2 = endTable;

            }
            let where =  `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND  gr.game_id not in ('t1','t2')`;

            if(thirdUid){
                where = `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND gr.thirdUid = "${thirdUid}"
                            AND  gr.game_id not in ('t1','t2')`;
            }

            if(nid){
                where =  `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND  gr.game_id = "${nid}" `;
            }

            if(nid && thirdUid){
                where =  `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND gr.thirdUid = "${thirdUid}"
                            AND  gr.game_id = "${nid}" `;
            }
            const total = await GameRecordMysqlDao.getTenantGameData(platformUid,where,table1,table2)
            return total;
        } catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    };


    /**
     * 平台分代的表映射
     */
    agentForChangeName(agent : string ){
        const agentName = agent_name.find(x=>x.old == agent);
        if(agentName){
            return agentName.new;
        }else{
            return agent;
        }
    }

}