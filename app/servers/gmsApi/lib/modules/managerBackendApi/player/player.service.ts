import { Injectable, } from '@nestjs/common';
import Utils = require("../../../../../../utils/index");
import PlayerEnum = require("../../../const/playerEnum");
import { getLogger } from "pinus-logger";
import * as RedisManager from "../../../../../../common/dao/redis/lib/redisManager";
import { pinus } from "pinus";
import { PositionEnum } from "../../../../../../common/constant/player/PositionEnum";
import PlayerManagerDao from "../../../../../../common/dao/daoManager/Player.manager";
import PlayerInRedisDao from "../../../../../../common/dao/redis/Player.redis.dao";
import GameRecordDateTableMysqlDao from "../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import OnlinePlayerRedisDao from "../../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import platfomMonthKillRate from "../../../../../../common/dao/redis/platfomMonthKillRate.redis.dao";
import { Player } from "../../../../../../common/dao/mysql/entity/Player.entity";
import { BackendControlService } from "../../../../../../services/newControl/backendControlService";
import GameRecordMysqlDao from "../../../../../../common/dao/mysql/GameRecord.mysql.dao";
const game_scenes = require('../../../../../../../config/data/game_scenes.json');
const ManagerErrorLogger = getLogger('http', __filename);



/**
 * 玩家列表服务器缓存
 * {key:'' , time:'',list:[]}
 */
let CacheData: any = {
    getPlayers: { time: 0, dataKey: 0, result: { allPage: 0, playerList: [] } },

};


@Injectable()
export class PlayerService {
    /**
     * 获取 玩家列表
     * @param page   页数
     */
    async getPlayers(page: number, pageSize: number): Promise<any> {
        try {
            let  count = PlayerEnum.PLAYER_LIST_COUNT.COUNT;
            /**
             * 先从缓存里面获取相关数据
             */
            // const result = await this.getCacheData(page, 'getPlayers', count);
            // if (result != false) {
            //     console.warn()
            //     return { code: 200, data: result };
            // }
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.thirdUid", "Player.gold", "Player.loginTime", "Player.ip", "Player.closeTime","Player.instantNetProfit",
                "Player.rom_type", "Player.createTime", "Player.walletGold", "Player.addTixian", "Player.addRmb", "Player.flowCount", "Player.dailyFlow","Player.position"];
            const playerResult = await PlayerManagerDao.findListToLimitForManager(page, count, selectFile);
            const playerList = playerResult.list;
            const allPlayersLength = playerResult.count;
            /**
             *  数据加入缓存
             */
            // let dataKey = "dataKey" + Math.floor(((page + 1) / 2));
            // CacheData.getPlayers = { time: Date.now(), dataKey: dataKey, result: { playerList, allPlayersLength } };
            // console.log(" CacheData ", CacheData);
            //从缓存数据中的数组列表中获取20调
            // let resultList;
            // let num = page % 2;
            // if (num == 1) {
            //     resultList = playerList.slice(0, count);
            // } else {
            //     resultList = playerList.slice(-count);
            // }
            return { code: 200, data: { resultList : playerList, allPlayersLength } };
        } catch (error) {
            ManagerErrorLogger.warn(`getAllPlayers ==>error: ${error}`);
            console.info(`getAllPlayers ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 将一个40条数据存入到缓存,以便快速查询，比如：第1页，那么 将第一页和第二页的数据存入到缓存，获取第二页直接在缓存里面取
     * 还有就是5秒以内的重复请求就
     */

    async getCacheData(page: number, key: string, count: number): Promise<any> {
        const data = CacheData[key];
        const queryTime = Date.now();
        if (!data) {
            return false;
        }
        //如果查询时间超过缓存时间10s 就返回fasle,重新搜索
        if (queryTime - data.time > PlayerEnum.GET_CACHE_DATA.TIME) {
            return false;
        }

        let dataKey = "dataKey" + Math.floor(((page + 1) / 2));
        if (data.dataKey != dataKey) {
            return false;
        }
        if (!!data.result) {
            const playerList = data.result.playerList;
            let resultList;
            let num = page % 2;
            if (num == 1) {
                resultList = playerList.slice(0, count);
            } else {
                resultList = playerList.slice(-count);
            }
            return { allPlayersLength: data.result.allPlayersLength, resultList };
        }
        return false;
    }

    /**
     * 搜索单个玩家
     * @param uid
     */
    async queryPlayer(uid: string, thirdUid: string ,ip : string): Promise<any> {
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
                position: player.position,
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
                    position: player.position,
                    instantNetProfit: player.instantNetProfit,
                };
                resultList.push(info);
            }
        }
        return { code: 200, data: { resultList, allPlayersLength: 1 } };
    }


    /**
     * 搜索玩家的基础信息
     * @param uid
     */
    async getOnePlayerMessage(uid: string): Promise<any> {
        try {
            if (!uid) {
                return Promise.reject("请输入uid");
            }
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false)
            let info = {
                uid: player.uid,
                thirdUid: player.thirdUid,
                nickname: player.nickname,
                gold: player.gold,
                ip: player.ip,
                loginTime: player.loginTime,
                createTime: player.createTime,
                walletGold: player.walletGold,
                cellPhone: player ? (player.cellPhone ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '') : '',
                superior: player.superior ? player.superior : '',
                profits: 0,
                yuzhiProfits: 0,  //已领取的返佣金币
                closeReason: player.closeReason,
                closeTime: player.closeTime,
                group_id: player.group_id,
            }
            return { code: 200, player: info };
        } catch (error) {
            return Promise.reject("搜索玩家失败")
        }

    }

    /**
     * 修改玩家密码
     * @param uid
     */
    async changePlayerPassWord(uid: string, passWord: string): Promise<any> {
        try {
            if (!uid) {
                return Promise.reject("请输入uid");
            }
            const player = await PlayerManagerDao.findOne({ uid });
            if (!player) {
                return Promise.reject("玩家不存在");
            }
            if (!player.cellPhone) {
                return Promise.reject("玩家没有绑定手机号,不能修改密码");
            }
            passWord = Utils.signature(passWord, false, false);
            await PlayerManagerDao.updateOne({ uid: uid }, { passWord: passWord });
            return { code: 200, msg: "修改成功" };
        } catch (error) {
            return Promise.reject("修改密码失败")
        }

    }


    /**
     * 封禁玩家的分钟数以及封禁原因
     * @param uid
     */
    async closeTimeAndReason(uid: string, closeReason: string, closeTime: number): Promise<any> {
        let lockRef;
        try {
            await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);
            let num = Date.now() + closeTime * 1000 * 60;
            player.closeTime = new Date(num) ;
            player.closeReason = closeReason;

            if (player.gold > player.oneAddRmb) {
                let profit = player.oneAddRmb - player.gold;
                player.gold = player.oneAddRmb;
                /** 添加
                 * game_record
                 */
                const gameRecord = {
                    uid: player.uid,				// 玩家 uid
                    nid: 't2',				// 游戏ID
                    gameName: '冻结异常所得',    			// 游戏名称
                    groupRemark: player.groupRemark ? player.groupRemark  : null,
                    group_id: player.group_id ? player.group_id  : null,
                    thirdUid: player.thirdUid,
                    input: 0,    			// 押注金额
                    validBet: 0,    			// 押注金额
                    bet_commission: 0,		// 押注抽水
                    win_commission: 0,		// 赢取抽水
                    settle_commission: 0,	// 结算抽水
                    profit: - Math.floor(profit),     		// 利润
                    gold: player.gold,				// 当前金币
                    playStatus: 1,			// 记录状态
                    addRmb: player.addRmb,				// 总充值
                    addTixian: player.addTixian,			// 总提现
                    gameOrder: Utils.id(),			// 订单编号
                    sceneId: -1,			// 订单编号
                    way: 0,			// 订单编号
                    roomId: '-1',			// 订单编号
                    isDealer: false,			// 订单编号
                    playersNumber: 0,			// 订单编号
                }
                await GameRecordDateTableMysqlDao.insertOne(gameRecord);
            }
            await PlayerManagerDao.updateOne({ uid }, { gold: player.gold, closeTime: player.closeTime, closeReason: player.closeReason });
            return { code: 200, msg: "封禁成功" };
        } catch (error) {
            lockRef && await RedisManager.unlock(lockRef);
            ManagerErrorLogger.warn(`closeTimeAndReason ==>error: ${error}`);
            console.info(`closeTimeAndReason ==>error: ${error}`);
            return Promise.reject(error);
        }

    }


    /**
     * 查找银行卡号
     * @param uid
     */
    // async getPlayersBankMessage(uid: string, page: number, bankCardNo: string, bankCardName: string): Promise<any> {
    //     try {
    //         let start = 0, count = 20;
    //         if (page) {
    //             start = count * (page - 1);
    //         }
    //         let match: any = {};
    //         if (uid) {
    //             match.uid = uid;
    //         } else if (bankCardNo) {
    //             match.bankCardNo = bankCardNo;
    //         } else if (bankCardName) {
    //             match.bankName = bankCardName;   //因为错误引起的
    //         } else {
    //             match.isRobot = RoleEnum.REAL_PLAYER;
    //         }
    //         const playerBanks = await PlayerInfo.find(match, 'uid createTime nickname').sort('-createTime').skip(start).limit(count);
    //         let list = [];
    //         const uidList = playerBanks.map(x => x.uid);
    //         for (let m of playerBanks) {
    //             const info = {
    //                 nickname: m.nickname,
    //                 uid: m.uid,
    //                 createTime: m.createTime,
    //             }
    //             list.push(info);
    //         }
    //         const allLength = await UserInfo.countDocuments({ isRobot: RoleEnum.REAL_PLAYER, bankCardNo: { $exists: true } });
    //         return { code: 200, data: { allLength, list } };
    //     } catch (error) {
    //         ManagerErrorLogger.warn(`getPlayersBankMessage ==>error: ${error}`);
    //         console.info(`getPlayersBankMessage ==>error: ${error}`);
    //         return Promise.reject(error);
    //     }
    //
    // }



    /**
     * 修改银行卡号
     * @param uid
     */
    // async changePlayerBank(uid: string, bankCardNo: string, bankCardName: string, bankName: string, bankAddress: string): Promise<any> {
    //     try {
    //         return { code: 200, msg: "修改成功" }
    //     } catch (error) {
    //         ManagerErrorLogger.warn(`changePlayerBank ==>error: ${error}`);
    //         console.info(`changePlayerBank ==>error: ${error}`);
    //         return Promise.reject(error);
    //     }
    //
    // }

    /**
     * 如果玩家不在线了，将玩家身上的 position 的位置进行修正
     * @param uid
     */
    async changePlayerPosition(uid: string): Promise<any> {
        try {
            await PlayerManagerDao.updateOne({ uid }, { position: PositionEnum.HALL })
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`changePlayerPosition ==>error: ${error}`);
            console.info(`changePlayerPosition ==>error: ${error}`);
            return Promise.reject(error);
        }

    }

    /**
     * 删除玩家不在线，
     * @param uid
     */
    async deleteOnlinePlayer(uid: string): Promise<any> {
        try {
            await Promise.all([
                OnlinePlayerRedisDao.deleteOne({uid}),
                PlayerManagerDao.updateOne({ uid }, { position: PositionEnum.HALL })
            ])
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`deleteOnlinePlayer ==>error: ${error}`);
            console.info(`deleteOnlinePlayer ==>error: ${error}`);
            return Promise.reject(error);
        }

    }


    /**
     *  在在线列表获取玩家的游戏记录
     * @param uid
     */
    async getPlayerGameRecordForUidAndGroupId(uid: string , group_id : string , page : number ): Promise<any> {
        try {
            const { list  , count } = await GameRecordMysqlDao.findForUidAndGroupId(uid , group_id , page );
            if (list.length !== 0) {
                const res = list.map((info) => {
                    let sceneName = null;
                    const games = game_scenes.find(x => x.nid == info.nid);
                    if (games) {
                        let scene = games.scenes.find(x => x.scene == info.sceneId);
                        if (scene) {
                            sceneName = scene.name;
                        } else {
                            sceneName = info.sceneId;
                        }
                    }
                    return { sceneName, ...info };
                });
                return { list: res, count: count };
            } else {
                return { list: [], count: 0 };
            }
        } catch (error) {
            ManagerErrorLogger.warn(`getPlayerGameRecordForUidAndGroupId ==>error: ${error}`);
            console.info(`getPlayerGameRecordForUidAndGroupId ==>error: ${error}`);
            return Promise.reject(error);
        }

    }



    /**
     * 踢掉单个玩家
     * @param uid
     */
    async kickOnePlayer(uid: string): Promise<any> {
        try {
            const OnlinePlayer = await OnlinePlayerRedisDao.findOne({uid});
            if(OnlinePlayer){
                let frontendServerId = OnlinePlayer.frontendServerId;
                await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
            }else{
                await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
            }
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`kickOnePlayer ==>error: ${error}`);
            console.info(`kickOnePlayer ==>error: ${error}`);
            return Promise.reject(error);
        }

    }

    /**
     * 踢掉某单个游戏里面的玩家
     * @param uid
     */
    async kickOneGamePlayers(nid: string): Promise<any> {
        try {
            const OnlinePlayers = await OnlinePlayerRedisDao.findList();
            const players = OnlinePlayers.filter(x=>x.nid == nid);
            if(players.length > 0){
                for(let player of players){
                    let frontendServerId = player.frontendServerId;
                    let uid = player.uid;
                    await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                }
            }
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`kickOneGamePlayers ==>error: ${error}`);
            console.info(`kickOneGamePlayers ==>error: ${error}`);
            return Promise.reject(error);
        }

    }


    /**
     *  管理后台 在线会员 === 搜索单人
     * @param agentNum
     * @param gold
     */
    async managerFentkongForSinglePlayer(uid: string , thirdUid : string): Promise<any> {
        try {

            if(thirdUid && !uid){
                const player = await PlayerManagerDao.findOne({ thirdUid }, true);
                if(!player){
                    return { playerList :[] , length : 0}
                }
                uid = player.uid;
            }
            const online = await OnlinePlayerRedisDao.findOne({ uid });

            if (!online) {
                return { playerList :[] , length : 0}
            }
            // 查询基础信息: 玩家、游戏信息列表
            // @ts-ignore
            const player: Player = await PlayerManagerDao.findOne({ uid }, false);
            if(!player){
                return { playerList :[] , length : 0}
            }
            // const gameRecord = await GameManager.findList({});
            // 游戏信息
            // const gameList = gameRecord.map(({ nid, zname }) => ({ nid, zname }));
            // 玩家基础信息
            const {
                nid,
                sceneId,
                roomId
            } = online;
            // const game = gameRecord.find(key=>key.nid == nid);
            //查找场中文名
            // const scene = await SceneManager.findOne({nid , sceneId});
            let sceneName = null;
            let gameName = null;
            const games =  game_scenes.find(x=>x.nid == nid);
            if(games){
                 gameName = games.name;
                let scene = games.scenes.find(x=>x.scene == sceneId);
                if(scene){
                    sceneName = scene.name;
                }else{
                    sceneName = "选场";
                }
            }
            //查看是否被调控
            const control = await BackendControlService.getTotalControlPlayer(player.uid);
            /** Step 3: 获取所有代理本月至前一天的杀率 */
            const  agentKillRateList = await platfomMonthKillRate.findOne({});
            //查询代理的杀率
            let agentRate = 0;
            if(agentKillRateList && agentKillRateList.length != 0 ) {
                if (player.groupRemark) {
                    let item = agentKillRateList.find(x => x.groupRemark == player.groupRemark);
                    agentRate = item ? item.winRate : 0;
                }
            }
            const {
                addDayRmb,
                addDayTixian,
                loginCount,
                ip,
                gold,
                createTime,
                addRmb,
                dailyFlow,
                maxBetGold,
                flowCount,
                instantNetProfit,
            } = player;

            const profit = player.addDayTixian + player.gold - player.addDayRmb;
            return {
                playerList: [{
                    uid,
                    superior: player.groupRemark + "_" + player.lineCode,
                    addDayRmb,
                    addDayTixian,
                    loginCount,
                    agentRate: agentRate,
                    ip,
                    gold,
                    createTime,
                    addRmb,
                    dailyFlow,
                    flowCount,
                    maxBetGold,
                    nid,
                    gameName: gameName ? gameName :'大厅' + online.nid,
                    sceneId : sceneId ? sceneId : -1,
                    sceneName :sceneName ,
                    profit,
                    instantNetProfit: instantNetProfit,
                    control : control ? control.probability : 0,
                    roomId : roomId ? roomId : '无'
                }],
                length : 1
            };
        } catch (e) {
            ManagerErrorLogger.error(`查询在线玩家的相关信息,单个玩家uid exception : ${e.stack | e}`);
            return {};
        }
    };



    /**
     * 查询在线玩家的相关信息
     * @param agentNum
     * @param gold
     */
    async managerPlayerFengkongForPlayerList(platformUid , nidList: Array<string>, queryIp: string, dayProfit, maxBetGold, addRmb, page, pageSize: number): Promise<any> {
        try {

            page = page ?  page : 1 ;
            pageSize = pageSize ?  pageSize : 20 ;
            /** Step 2: Redis 批量操作 */
            // const pipeline = conn.pipeline();
            //
            // // Redis批处理: 查询游戏信息列表
            // pipeline.hgetall("hall:system_games");
            //
            // // Redis批处理: 查询在线玩家
            // uidList.forEach(({ uid }) => {
            //     pipeline.get(`real_player_info:${uid}`);
            // });
            //
            // // Redis批处理: 获取查询结果
            // const resultList = await pipeline.exec();


            /** Step 1: 查询在线玩家信息列表 */
            let onlineList = await OnlinePlayerRedisDao.findList();
            let uidList;
            if (nidList.length !== 0) {
                let nid = nidList[0];
                // 全游戏查询 or 指定游戏的玩家信息
                uidList = onlineList.filter(m =>m.nid == nid);
            }else{
                uidList = onlineList;
            }

            if(uidList.length == 0){
                return { playerList : [] , length : 0 }
            }
            let length = uidList.length ;
            //进行分页处理，按照玩家进入游戏时间倒序
             uidList = uidList.sort( function (a, b) {
                 return a.time < b.time ? 1 : -1;
             });
            uidList = uidList.splice((page - 1) * pageSize , pageSize)
            const uids = uidList.map(x => x.uid);
            const resultList = await PlayerInRedisDao.findListInUids(uids);
            /** 游戏信息列表 */
            let playerList = [];
            /** Step 2: 获取所有总控玩家 */
            const  controlUidList = await BackendControlService.getControlPlayers();
            /** Step 3: 获取所有代理本月至前一天的杀率 */
            const  agentKillRateList = await platfomMonthKillRate.findOne({});
            /** Step 4: 清洗数据 */
            for( let uid of uids){
                let player = resultList.find(pl=>pl.uid == uid);
                //如果redis没有就从数据库里面找该玩家信息,redis 都不存在说明肯定玩家不在线
                // if(!player){
                //     player = await PlayerManagerDao.findOne({uid},false);
                // }
                /** 玩家信息 */
                if (!player) {
                    continue;
                }

                if(platformUid && player.group_id !== platformUid){
                    continue;
                }

                /** 过滤不满足条件的玩家信息 */
                // ip
                if (queryIp && queryIp != player.ip) {
                    continue;
                }


                const online = uidList.find(x => x.uid == player.uid);

                if (!online) {
                    continue;
                }

                let control = 0;
                const isControl = await controlUidList.find(x=>x.uid == player.uid);
                if(isControl){
                    control = isControl.probability;
                }

                //查找场中文名
                // const scene = await SceneManager.findOne({nid : online.nid , sceneId : online.sceneId});
                let sceneName = null;
                let gameName = null;
                const games =  game_scenes.find(x=>x.nid == online.nid);
                if(games){
                    gameName = games.name;
                    let scene = games.scenes.find(x=>x.scene == online.sceneId);
                    if(scene){
                        sceneName = scene.name;
                    }else{
                        sceneName = "选场";
                    }
                }
                //查询代理的杀率
                let agentRate = 0;
                if(agentKillRateList && agentKillRateList.length != 0 ){
                    if(player.groupRemark){
                        let item = agentKillRateList.find(x=>x.groupRemark == player.groupRemark);
                        agentRate = item ? item.winRate : 0;
                    }
                }

                let info = {
                    uid: player.uid,
                    superior: player.groupRemark + "_" + player.lineCode,
                    nid: online.nid,
                    gameName: gameName ? gameName :'大厅' + online.nid,
                    sceneId:  online.sceneId ? online.sceneId : -1 ,
                    sceneName: sceneName  ,
                    addDayRmb: player.addDayRmb,
                    addDayTixian: player.addDayTixian,
                    loginCount: player.loginCount,
                    ip: player.ip,
                    addRmb: player.addRmb,
                    dailyFlow: player.dailyFlow,
                    maxBetGold: player.maxBetGold,
                    createTime: player.createTime,
                    profit: player.addDayTixian + player.gold - player.addDayRmb,
                    gold: player.gold,
                    group_id: player.group_id,
                    instantNetProfit: player.instantNetProfit,
                    flowCount: player.flowCount,
                    control: control,
                    agentRate: agentRate,
                    roomId : online.roomId ? online.roomId : '-1'
                };
                playerList.push(info);
            }
            // 排序
            playerList.sort((a, b) => b.dailyFlow - a.dailyFlow );
            return { playerList, length }
        } catch (e) {
            ManagerErrorLogger.error(`查询在线玩家的相关信息 exception : ${e.stack | e}`);
            return {};
        }
    };




}


