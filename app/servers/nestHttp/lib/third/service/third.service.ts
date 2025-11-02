import { Injectable } from '@nestjs/common';
import PlayerManager from '../../../../../common/dao/daoManager/Player.manager';
import TokenService = require('../../../../../services/hall/tokenService');
import SystemConfigManager from '../../../../../common/dao/daoManager/SystemConfig.manager';
import GameRecordDateTableMysqlDao from '../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao';
import OnlinePlayerRedisDao from '../../../../../common/dao/redis/OnlinePlayer.redis.dao';
import ThirdGoldRecordMysqlDao from '../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao';
import PlayerAgentMysqlDao from '../../../../../common/dao/mysql/PlayerAgent.mysql.dao';
import MiddlewareEnum = require('../../const/middlewareEnum');
import Utils = require("../../../../../utils/index");
import HallConst = require("../../../../../consts/hallConst");
import { PositionEnum } from "../../../../../common/constant/player/PositionEnum";
import DateTime2GameRecordService from "../../../../gmsApi/lib/modules/managerBackendApi/agent/DateTime2GameRecord.service";
import * as ThirdApiAuthTokenDao from '../../../../../common/dao/redis/ThirdApiAuthTokenDao';
import { GoldCoinChangeWarningOrderService } from './goldCoinChangeWarningOrder.service';
import GatePlayerService from "../../../../gate/lib/services/GatePlayerService";
import { Player } from "../../../../../common/dao/mysql/entity/Player.entity";
import { ThirdGoldRecordType } from "../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordType.enum";
import { ThirdGoldRecordStatus } from "../../../../../common/dao/mysql/entity/enum/ThirdGoldRecordStatus.enum";
import changePlayerMoneyRedisDao from '../../../../../common/dao/redis/changePlayerMoney.redis.dao';
import PlayerRedisDao from '../../../../../common/dao/redis/Player.redis.dao';
import * as moment from "moment";
import TenantGameDataDao from "../../../../../common/dao/mysql/TenantGameData.mysql.dao";
import PlatformNameAgentListRedisDao from '../../../../../common/dao/redis/PlatformNameAgentList.redis.dao';
import PlayerAgentRedisDao from '../../../../../common/dao/redis/PlayerAgent.redis.dao';
import { GameRecordStatusEnum } from '../../../../../common/dao/mysql/enum/GameRecordStatus.enum';
import ConnectionManager from "../../../../../common/dao/mysql/lib/connectionManager";
import axios from "axios";
import { sendRedisGoldMessage } from '../../../../../common/event/redisGoldEvent';
import GameManager from "../../../../../common/dao/daoManager/Game.manager";
import {configure, Logger, getLogger} from 'pinus';
import {random} from "../../../../../utils";


@Injectable()
export class ThirdService {
    thirdHttp_call: Logger;
    thirdHttp_game_record_Logger: Logger;
    constructor(
        private readonly warningOrderService: GoldCoinChangeWarningOrderService
    ) {
        this.thirdHttp_call = getLogger('thirdHttp_call');
        this.thirdHttp_game_record_Logger = getLogger('thirdHttp_game_record');
    }

    /**
     * 创建账号
     * @param money   初始化金币
     */
    async login(agent: string, money: number, account: string, KindId: string,  language: string, lineCode:string, loginHall: boolean = false, backHall: boolean = false): Promise<any> {
        try {
            const systemConfig = await SystemConfigManager.findOne({});

            const lineCodeList =  ['line_1','line_2','line_3','line_4','line_5','line_6','line_7','line_8','line_9','line_10','line_11','line_12','line_13','line_14','line_15','line_16','line_17','line_18','line_19','line_20'];

            if(systemConfig){
                if (systemConfig.isCloseApi) {
                     if(!systemConfig.apiTestAgent){
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }else if(systemConfig.apiTestAgent  && agent !== systemConfig.apiTestAgent){
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }
                }
                if (systemConfig.closeNid && systemConfig.closeNid.length !== 0) {
                    if (systemConfig.closeNid.includes(KindId)) {
                        return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
                    }
                }
            }

            if(loginHall == false){
                const game = await GameManager.findOne({ nid : KindId });
                if(!game){
                    return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_NOT_EXIST.status } };
                }

                //查找平台是否关闭了该游戏
                const platformName  = await PlatformNameAgentListRedisDao.findPlatformNameForAgent({agent: agent});
                if(platformName){
                   const closeGameList =  await PlatformNameAgentListRedisDao.getPlatformCloseGame({platformName : platformName});

                   if(closeGameList.includes(KindId)){
                       return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_NOT_EXIST.status } };
                   }

                }

            }

            let searchUser;
            // 如果是通过uuid进来的玩家，还需要验证token
            this.thirdHttp_call.warn(`登陆 :account: ${account},agent:${agent},KindId:${KindId} tag one`);
            if (account) {
                const player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
                this.thirdHttp_call.warn(`登陆查找玩家 : account: ${account} , uid : ${player ? player.uid : null}, agent:${agent}, KindId:${KindId} tag two`);
                if (player) {
                    searchUser = player;
                    let updateData = {};
                    if (player.closeTime > new Date()) {
                        return Promise.reject(MiddlewareEnum.ACCOUNT_CLOSE.status)
                    }
                    if (language && HallConst.LANGUAGE_LIST.includes(language) && player.language != language) {
                        updateData = { language: language };
                    }

                    //判断站点是否和以前站点一样
                    if(lineCode && player.lineCode != lineCode){
                        Object.assign(updateData,{lineCode : lineCode});
                    }else if(player.lineCode && lineCodeList.includes(player.lineCode)){
                        let index = random(0,19);
                        let lineCode_1 = agent + lineCodeList[index] ;
                        Object.assign(updateData,{lineCode : lineCode_1});
                    }
                    //判断是否需要更新
                    if(JSON.stringify(updateData) !== "{}"){
                        await PlayerManager.updateOne({ uid: player.uid }, updateData);
                    }
                }

            }
            // 如果没有找到账户，创建一个新账户
            if (!searchUser) {
                const platformInfo = await PlayerAgentRedisDao.findOne({platformName : agent});
                if (!platformInfo) {
                    return Promise.reject(MiddlewareEnum.AGENT_NOT_EXIST.status)
                }

                if (platformInfo.roleType == 2) {
                    return Promise.reject(MiddlewareEnum.AGENT_ERROR.status)
                }

                let language1 = HallConst.LANGUAGE_LIST.includes(language) ? language : HallConst.LANGUAGE.DEFAULT;
                /** Step 5: 如果老平台没有传站点，那么站点就记录分代的数据作为隔离条件 */
                if(!lineCode){
                    let index = random(0,19);
                    lineCode = agent + lineCodeList[index] ;
                }
                searchUser = await GatePlayerService.createPlayer(null, platformInfo.uid, platformInfo.rootUid, account, agent, language1, lineCode);
                // /** Step 5: 建立代理关系  数据库事务操作 */
                // const newAgentInfo = {
                //     uid: searchUser.uid,
                //     parentUid: platformInfo.uid,
                //     rootUid: platformInfo.rootUid,
                //     inviteCode: '',
                //     platformName: account + searchUser.uid,
                //     platformGold: 0,
                //     deepLevel: platformInfo.deepLevel + 1,
                //     roleType: 1,
                //     status: 1,
                // };
                // PlayerAgentMysqlDao.insertOne(newAgentInfo)
            }
            // 生成token
            const token = TokenService.create(searchUser.uid);

            //检查平台是否需要开启返回按钮和热门游戏按钮
            let  backButtonList = [] ;
            let  hotGameButtonList = [];
            if(systemConfig){
                backButtonList = systemConfig.backButton  ? systemConfig.backButton : [];
                hotGameButtonList = systemConfig.hotGameButton ? systemConfig.hotGameButton : [];
            }
            await ThirdApiAuthTokenDao.insert(token, {
                nid: KindId,
                loginHall: loginHall,
                backHall: backHall,
                language : language ? language : 'chinese_zh',
                uid: searchUser.uid,
                backButton : backButtonList.includes(searchUser.group_id) ? false  : true,
                hotGameButton : hotGameButtonList.includes(searchUser.group_id) ? false  : true,
            }, 180);

            if (!systemConfig.h5GameUrl) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.GAME_CLOSE.status } };
            }
            const h5Url = systemConfig.h5GameUrl;
            const url = h5Url + "?token=" + token + "&language=" + (language ? language : 'chinese_zh');
            return {
                s: 100,
                m: "/login",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    url,
                }
            };
        } catch (error) {
            return Promise.reject(error);
        }

    }

    /**
     * 查询玩家可下分
     * @param account
     */
    async checkPlayerMoney(account: string, agent: string): Promise<any> {
        const player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 101,
                m: "/checkPlayerMoney",
                d: {
                    money: Math.floor(0),
                    isGame: false,
                    code: MiddlewareEnum.SUCCESS.status
                }
            }
        }
        const money = player.gold.toString() ? player.gold : 0;
        let isGame = false;

        return {
            s: 101,
            m: "/checkPlayerMoney",
            d: {
                money: Math.floor(money),
                isGame: isGame,
                code: MiddlewareEnum.SUCCESS.status
            }
        }
    }

    /**
     * 改变玩家上分
     * @param accout
     * @param money
     * @param agent
     * @param orderid
     */
    async addPlayerMoney(account: string, money: number, agent: string, orderid: string, timestamp: number): Promise<any> {

        try {
            // const check: boolean = await this.checkOrderId(orderid, agent, timestamp, account);
            // if (check == false) {
            //     this.thirdHttp_call.warn(`发送第三方给玩家上分 :account${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 上分异常 | 检测异常`);
            //     return { s: 103, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_RULE_ERROR.status } };
            // }

            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag one`);

            // const agentRecord = await PlayerAgentMysqlDao.findOne({ platformName: agent });
            const platformInfo = await PlayerAgentRedisDao.findOne({platformName : agent});
            if (!platformInfo) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 上分异常 | 代理异常`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_NOT_EXIST.status } };
            }

            if (platformInfo.roleType == 2) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 上分异常 | 是平台`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }

            const record = await ThirdGoldRecordMysqlDao.findOne({ orderId: orderid });

            if (record) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_EXIST.msg} | 上分异常 | 记录已存在`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_EXIST.status } };
            }

            let gold = money * MiddlewareEnum.MONEY_BATE.HUNDRED;

            gold = Math.floor(gold);

            if (money > 0 && platformInfo.platformGold < gold) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account:${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_MONEY_NOT_ENOUGH.msg} | 上分异常 | 金币异常 ${money}/${gold}/${platformInfo.platformGold}`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.AGENT_MONEY_NOT_ENOUGH.status } };
            }

            if (money > 10000000) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account:${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.NOT_OVER_MILLION.msg} | 上分异常 | 金币过多`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.NOT_OVER_MILLION.status } };
            }

            // @ts-ignore
            const player: Player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);

            if (!player) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.NOT_OVER_MILLION.msg} | 上分异常 | 未找到玩家`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }

            player.gold += gold;

            player.addDayRmb += gold;

            this.thirdHttp_call.warn(`发送第三方给玩家上分 :thirdUid:${player.thirdUid},uid:${player.uid},时间:${Utils.cDate(Date.now())},代理:${agent} tag two`);
            //减少一次查询
            if (player.oneAddRmb == 0) {
                player.oneAddRmb = Math.floor(gold);
            } else {
                player.oneAddRmb += Math.floor(gold);
            }

            if (player.addRmb < gold) {   //历史最大带入
                player.addRmb = gold;
                player.addRmb = Math.floor(player.addRmb);
            }

            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag three`);

            if (player.oneAddRmb > 1000000000) {
                player.oneAddRmb = 1000000000;
            }

            if (player.gold > 1000000000) {
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.NOT_OVER_MILLION.status } };
            }

            //首先更新金币，如果出现锁的情况需要抛出异常
            await PlayerManager.updateOneForaddPlayerMoney(player.uid, {
                gold: gold,
                oneAddRmb: Math.floor(player.oneAddRmb),
                addRmb: Math.floor(player.addRmb),
                withdrawalChips: 0,
                addDayRmb: Math.floor(player.addDayRmb)
            });

            /**
             * 更新玩家金币同时添加记录
             */
            /** Step 5: 数据库事务操作 */
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag four`);

            PlayerAgentMysqlDao.updateDeleForThirdApi( platformInfo.platformName , {
                gold:  Math.abs(gold),
            });

            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag five`);
            // 5.3 生成上分记录
            const recordInfo = {
                orderId: orderid,
                uid: player.uid,
                type: ThirdGoldRecordType.Player,
                agentRemark: agent,
                goldChangeBefore: Math.floor(player.gold - gold),
                gold,
                goldChangeAfter: Math.floor(player.gold),
                status: ThirdGoldRecordStatus.addMoney,
                remark: "自动通过"
            };
            /**step3 添加玩家上下分记录**/
                // 5.3 生成上分记录
            const gameInfo = {
                    uid: player.uid,				// 玩家 uid
                    nid: MiddlewareEnum.THIRD_ADD_GOLD.ADDNID,				// 游戏ID
                    gameName: MiddlewareEnum.THIRD_ADD_GOLD.ADDNAME,    			// 游戏名称
                    groupRemark: player.groupRemark,
                    thirdUid: player.thirdUid,
                    group_id: player.group_id ? player.group_id : null,
                    sceneId: -1,
                    roomId: '-1',
                    input: 0,    			// 押注金额
                    bet_commission: 0,		// 押注抽水
                    win_commission: 0,		// 赢取抽水
                    settle_commission: 0,	// 结算抽水
                    profit: gold,     		// 利润
                    gold: player.gold,				// 当前金币
                    status: 1,			// 记录状态
                    gameOrder: orderid,			// 订单编号
                };

            // 异步执行
            this.addPlayerRecord(recordInfo, gameInfo);

            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},金币:${Math.floor(player.gold)}`);
            /**
             * 通知前端更新玩家金币
             */
            // if (player.position === PositionEnum.BEFORE_ENTER_Game) {
            this.thirdHttp_call.warn(`http | 金币推送 :account: ${account} | uid ${player.uid}`);
            await sendRedisGoldMessage({ uid: player.uid });
            // }
            await changePlayerMoneyRedisDao.del(agent, account);
            return {
                s: 102,
                m: "/addPlayerMoney",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    account: account,
                    money: Math.floor(player.gold)
                }
            };
        } catch (error) {
            await changePlayerMoneyRedisDao.del(agent, account);
            return Promise.reject(error);
        }

    }


    /**
     * 改变玩家下分
     * @param accout
     * @param money
     * @param agent
     * @param orderid
     */
    async lowerPlayerMoney(account: string, money: number, agent: string, orderid: string, timestamp: number): Promise<any> {
        // 秒
        const requestStartTime = Math.round(Date.now() / 1000);

        const queryRunner = ConnectionManager.getConnection().createQueryRunner();

        try {
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag one`);
            const platformInfo = await PlayerAgentRedisDao.findOne({ platformName: agent });

            if (!platformInfo) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 下分异常 | 没有代理记录`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.AGENT_NOT_EXIST.status } };
            }

            if (platformInfo.roleType == 2) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.AGENT_NOT_EXIST.msg} | 下分异常 | 没有代理记录`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }

            const record = await ThirdGoldRecordMysqlDao.findOne({ orderId: orderid });

            if (record) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_EXIST.msg} | 下分异常 | 已有记录`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ORDERID_EXIST.status } };
            }

            // @ts-ignore
            const player: Player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
            if (!player) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_GET_LOSE.msg} | 下分异常 | 没有玩家`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }

            // await OnlinePlayerRedisDao.insertOne( { uid: player.uid, nid: '1', sceneId : 1, isRobot:0, entryGameTime: new Date(), roomId:'002',frontendServerId: 'connector-server-1', hallServerId: 'slots777-server-1' });

            let gold = 0;
            if (money) {
                gold = - Math.floor(Math.abs(money) * MiddlewareEnum.MONEY_BATE.HUNDRED);
            } else {
                gold = - Math.floor(player.gold);
            }
            if (gold < 0 && player.gold < Math.abs(gold)) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.MONEY_BALANCE.msg} | 下分异常 | 金币不足 ${gold}/${player.gold}`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.MONEY_BALANCE.status } };
            }

            // 判断玩家是否在在线集合里面
            // const onlinePlayerInRedis: OnlinePlayerInRedis = await OnlinePlayerRedisDao.findOne({uid: player.uid});

            //检测玩家在游戏中是否有押注
            let body = {
                uid: player.uid,
                account: account,
            };
            let isCanLower = true;
            await axios.post(`http://127.0.0.1:3324/rpc/lowerPlayerMoney`, body, { timeout: 2000 })
                .then((resp: any) => {
                    if (resp.data && resp.data.code == 500) {
                        isCanLower = false;
                    }
                })
                .catch((error: any) => {
                    console.error(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},检测玩家是否在游戏中请求超时,依然通过下分法则`);
                });
            if (!isCanLower) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 玩家在游戏中`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            }

            // if (player.position == PositionEnum.GAME) {
            //     this.thirdHttp_call.warn(`发送第三方给玩家下分 :account${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 玩家在游戏中`);
            //     await changePlayerMoneyRedisDao.del(agent, account);
            //     return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            // }

            if (player.gold === 0) {
                /** 紧急处理如果玩家下分成功了，那么就把处于在线列表删掉 */
                // await OnlinePlayerRedisDao.deleteOne({uid : player.uid});
                await changePlayerMoneyRedisDao.del(agent, account);
                return {
                    s: 103,
                    m: "/lowerPlayerMoney",
                    d: {
                        code: MiddlewareEnum.SUCCESS.status,
                        account: account,
                        money: 0,
                    }
                };
            }

            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag two`);

            /**
             * 金币预警检测
             * @data 2020/12/2
             * @description
             */
            const beBoolean = await this.warningOrderService.checkLowerMoney(player, money, account, orderid, platformInfo, agent, timestamp);

            if (typeof beBoolean === "object") {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},money:${Math.abs(gold)} | 金币预警`);
                await changePlayerMoneyRedisDao.del(agent, account);
                return beBoolean;
            }
            player.gold += gold;
            if (player.earlyWarningFlag) {
                player.earlyWarningFlag = false;
            }
            player.addDayTixian += Math.abs(gold);
            player.addDayTixian = Math.floor(player.addDayTixian);


            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag three`);


            await queryRunner.connect();
            await queryRunner.startTransaction();
            /**step1 更新玩家的金币**/
            await queryRunner.manager.update(Player, { uid: player.uid }, {
                gold: player.gold,
                position: PositionEnum.HALL,
                earlyWarningFlag: player.earlyWarningFlag,
                oneWin: 0,
                oneAddRmb: 0,
                addDayTixian: Math.floor(player.addDayTixian)
            });

            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag four`);

            // 故意超时
            // await utils.delay(6 * 1000);

            // 回滚
            if (Math.round(Date.now() / 1000) - requestStartTime >= 6) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} | 超时回滚`);
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                await changePlayerMoneyRedisDao.del(agent, account);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.Request_Timeout.status } };
            }

            // 提交事务
            await queryRunner.commitTransaction();
            await queryRunner.release();

            /**step2 更新代理的金币**/
            PlayerAgentMysqlDao.updateAddForThirdApi( platformInfo.platformName , {
                gold: Math.abs(gold),
            });
            // 5.3 生成上分记录
            const recordInfo = {
                orderId: orderid,
                uid: player.uid,
                type: ThirdGoldRecordType.Player,
                agentRemark: agent,
                goldChangeBefore: Math.floor(player.gold - gold),
                gold: gold,
                goldChangeAfter: Math.floor(player.gold),
                status: ThirdGoldRecordStatus.AutoPass,
                remark: "自动通过"
            };

            // 5.3 生成上分记录
            const gameInfo = {
                uid: player.uid,				// 玩家 uid
                nid: MiddlewareEnum.THIRD_ADD_GOLD.LOWERNID,				// 游戏ID
                gameName: MiddlewareEnum.THIRD_ADD_GOLD.LOWERNAME,    			// 游戏名称
                groupRemark: player.groupRemark,
                thirdUid: player.thirdUid,
                group_id: player.group_id ? player.group_id : null,
                sceneId: -1,
                roomId: '-1',
                input: 0,    			// 押注金额
                bet_commission: 0,		// 押注抽水
                win_commission: 0,		// 赢取抽水
                settle_commission: 0,	// 结算抽水
                profit: gold,     		// 利润
                gold: player.gold,				// 当前金币
                status: 1,			// 记录状态
                gameOrder: orderid			// 订单编号
            };

            // 异步插入记录
            this.addPlayerRecord(recordInfo, gameInfo);

            await PlayerRedisDao.updateOne({ uid: player.uid }, {
                gold: player.gold,
                oneWin: 0,
                oneAddRmb: 0,
                addDayTixian: player.addDayTixian
            });


            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},money:${Math.abs(gold)}`);
            await changePlayerMoneyRedisDao.del(agent, account);
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :删除在线uid :${player.uid}`);
            return {
                s: 103,
                m: "/lowerPlayerMoney",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    account: account,
                    money: Math.abs(gold),
                    lastGold: player.gold
                }
            };
        } catch (error) {
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent},异常情况:${error} | 下分异常`);
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            await changePlayerMoneyRedisDao.del(agent, account);
            return Promise.reject(error);
        }

    }

    /**
     * 查询订单
     * @param orderid
     */
    async queryOrderId(orderid: string): Promise<any> {
        const record = await ThirdGoldRecordMysqlDao.findOne({ orderId: orderid });
        if (!record) {
            return {
                s: 104,
                m: "/queryOrderId",
                d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status, status: MiddlewareEnum.THIRD_ORDERID_TYPE.EXIST }
            };
        }
        return {
            s: 104,
            m: "/queryOrderId",
            d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.THIRD_ORDERID_TYPE.SUCCESS }
        };
    }

    /**
     * 检测订单号规则
     * @param orderid
     * @param agent
     * @param timestamp
     * @param account
     */
    async checkOrderId(orderid: string, agent: string, timestamp: number, account: string): Promise<boolean> {
        const checkId = agent + Utils.getDateNumber(timestamp) + account;
        if (checkId != orderid) {
            return false;
        }
        return true;

    }

    /**
     * 检查玩家是否在线
     * @param account   玩家uid
     * @param timestamp 操作时间
     */
    async findPlayerOnline(agent: string, account: string, timestamp: number): Promise<any> {
        // @ts-ignore
        const player: Player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.EXIST }
            };
        }
        if (player.closeTime > new Date()) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
            };
        }
        const online = await OnlinePlayerRedisDao.findOne({ uid: player.uid });
        if (!online) {
            return {
                s: 105,
                m: "/findPlayerOnline",
                d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE }
            };
        }
        return {
            s: 105,
            m: "/findPlayerOnline",
            d: { code: MiddlewareEnum.SUCCESS.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.ONLINE }
        };
    }


    /**
     * 检查玩家总分
     * @param account   玩家uid
     * @param timestamp 操作时间
     */
    async queryPlayerGold(agent: string, account: string, timestamp: number): Promise<any> {
        // @ts-ignore
        const player: Player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
        if (!player) {
            return {
                s: 106,
                m: "/queryPlayerGold",
                d: {
                    code: MiddlewareEnum.SUCCESS.status,
                    status: MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE,
                    totalMoney: Math.floor(0),
                    freeMoney: Math.floor(0),
                    account: account
                }
            };
        }
        if (player.closeTime > new Date()) {
            return {
                s: 106,
                m: "/queryPlayerGold",
                d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
            };
        }
        let status = MiddlewareEnum.PLAYER_ONLIE_TYPE.NOT_ONLINE;
        return {
            s: 106,
            m: "/queryPlayerGold",
            d: {
                code: MiddlewareEnum.SUCCESS.status,
                status: status,
                totalMoney: Math.floor(player.gold),
                freeMoney: Math.floor(player.gold),
                account: account
            }
        };
    }

    /**
     * 踢玩家下线
     * @param account   玩家uid
     * @param timestamp 操作时间
     */
    async kickPlayer(agent: string, account: string, timestamp: number): Promise<any> {
        try {
            // @ts-ignore
            const player: Player = await PlayerManager.findOne({ thirdUid: account, groupRemark: agent }, true);
            if (!player) {
                return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
            }
            if (player.closeTime > new Date()) {
                return {
                    s: 107,
                    m: "/kickPlayer",
                    d: { code: MiddlewareEnum.ACCOUNT_CLOSE.status, status: MiddlewareEnum.PLAYER_ONLIE_TYPE.CLOSE }
                };
            }
            // //判断玩家离线了是否还在游戏当中
            // if (player.position === PositionEnum.GAME) {
            //     return { s: 108, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            // }

            //检测玩家在游戏中是否有押注
            let body = {
                uid: player.uid,
                account: account,
            };

            /**
             * 提玩家在线暂时留着,等后面补充
             */
            let isCanLower = true;
            await axios.post(`http://127.0.0.1:3324/rpc/lowerPlayerMoney`, body, { timeout: 2000 })
                .then((resp: any) => {
                    if (resp.data && resp.data.code == 500) {
                        isCanLower = false;
                    }
                })
                .catch((error: any) => {
                    console.error(`踢玩家下线 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},检测玩家是否在游戏中请求超时,依然踢下线`);
                });

            if (!isCanLower) {
                return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
            }
            return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.SUCCESS.status } };
        } catch (error) {
            return { s: 107, m: "/kickPlayer", d: { code: MiddlewareEnum.ACCOUNT_PLAYING.status } };
        }

    }

    /**
     * 拉取总平台的统计报表
     * @param account   玩家uid
     * @param timestamp 操作时间
     * 这里的订单编号改变了，以前是_id 现在是 gameOrder
     */
    async getPlatformData(agent: string, startTime: number, endTime: number): Promise<any> {
        try {


            /**
             * 先从缓存里面获取相关数据
             */
            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({ agent: agent });
            if (!platformUid) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            const dyadicArray = await DateTime2GameRecordService.newBreakUpDate(startTime, endTime);
            //只查询一个分代理的数据
            let tableName = moment().format("YYYYMM");
            const total = await TenantGameDataDao.getOnePlatformGameData(dyadicArray, agent, tableName, platformUid);
            /**
             * 这里有一个问题求不求和的问题，到时候问需求，先不求和
             */

            let list = [];
            for (let key of total) {
                let item = list.find(x => x.groupRemark == key.groupRemark);
                if (!item) {
                    list.push(key);
                } else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }


            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const winRate2 = validBetTotal > 0 ? (-profitTotal / validBetTotal).toFixed(4) : 0;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = - profitTotal;
                return {
                    winRate2, loseCount: recordCount - winCount, commission,
                    ...info
                };
            });

            let info = {
                recordCount: 0,
                validBetTotal: 0,
                winCount: 0,
                winTotal: 0,
                loseTotal: 0,
                loseCount: 0,
                profitTotal: 0,
                commission: 0,
                winRate2: 0,
                groupRemark: agent,
                startTime: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
                endTime: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
            };

            if (!res || res.length == 0) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.SUCCESS.status, result: info } };
            }
            for (let item of res) {
                if (item) {
                    info.recordCount += Number(item.recordCount);
                    info.validBetTotal += Number(item.validBetTotal);
                    info.winCount += Number(item.winCount);
                    info.winTotal += Number(item.winTotal);
                    info.loseTotal += Number(item.loseTotal);
                    info.loseCount += Number(item.loseCount);
                    info.profitTotal += Number(item.profitTotal);
                    info.commission += Number(item.commission);
                }
            }

            info.winRate2 = Number(info.validBetTotal > 0 ? (-info.profitTotal / info.validBetTotal).toFixed(4) : 0);
            return { s: 109, m: "/getPlatformData", d: { code: MiddlewareEnum.SUCCESS.status, result: info } };
        } catch (error) {
            return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }

    }


    /**
     * 下分注单记录
     * @param thirdRecord
     * @param gameRecord
     * @private
     */
    private async addPlayerRecord(thirdRecord: any, gameRecord: any) {
        await ThirdGoldRecordMysqlDao.insertOne(thirdRecord);
        await GameRecordDateTableMysqlDao.insertOne(gameRecord);
    }
}


function getSql(parameter: { id?: number; group_id?: string, groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string; gameType?: number; roundId?: string;  isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }) {
    const date = moment().format("YYYYMM");
    let tableName = `Sp_GameRecord_${date}`;
    if (parameter.group_id) {
        tableName = `Sp_GameRecord_${parameter.group_id}_${date}`;
    }
    const {
        uid,
        thirdUid,
        nid,
        gameName,
        sceneId,
        roomId,
        roundId,
        gameType,
        input,
        validBet,
        profit,
        bet_commission,
        win_commission,
        settle_commission,
        gameOrder,
        gold,
        status,
        multiple,
        groupRemark,
        isDealer,
        result,
        game_Records_live_result
    } = parameter;
    const gameResult = game_Records_live_result ? `'${JSON.stringify(game_Records_live_result)}'` : null;
    const sql = `
            INSERT INTO ${tableName} 
            ( 
                uid, thirdUid, gameName, groupRemark, game_id, 
                sceneId, roomId,  round_id, gameType,
                isDealer, game_results, gold, input, validBet, 
                profit,  bet_commission, win_commission, 
                settle_commission, multiple, game_order_id, status, createTimeDate,
                game_Records_live_result
            )
            VALUES
            ( 
                "${uid}", ${thirdUid ? `"${thirdUid}"` : null}, "${gameName}", ${groupRemark ? `"${groupRemark}"` : null}, "${nid}", 
                ${sceneId}, "${roomId}", ${roundId ? `"${roundId}"` : null}, ${ gameType ? gameType : null},
                ${isDealer ? isDealer : false}, ${result ? `"${result}"` : null}, ${gold}, ${input}, ${validBet ? validBet : 0}, 
                ${profit},  ${bet_commission ? bet_commission : 0}, ${win_commission ? win_commission : 0}, 
                ${settle_commission ? settle_commission : 0}, ${multiple ? multiple : 0}, "${gameOrder}", ${status ? status : 0}, NOW(), 
                ${gameResult}
            )            `;

    return sql;
}

const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds));