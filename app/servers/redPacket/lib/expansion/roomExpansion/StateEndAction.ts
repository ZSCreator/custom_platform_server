import { getLogger } from "pinus";
import Room from "../../RedPacketRoomImpl";
import { GameStatusEnum } from "../../enum/GameStatusEnum";
import { PlayerGameStatusEnum } from "../../enum/PlayerGameStatusEnum";
import { RedPacketGameStatusEnum } from "../../enum/RedPacketGameStatusEnum";
import { IGraberRedPacket } from "../../interface/IGraberRedPacket";
import IRedPacket from "../../interface/IRedPacket";
import utils = require('../../../../../utils/index');
import { ISettledInfo } from "../../interface/ISettledInfo";
import { buildRecordResult } from "../../util/roomUtil";
import * as mailModule from '../../../../../modules/mailModule';
import { RoleEnum } from "../../../../../common/constant/player/RoleEnum";
import createPlayerRecordService from "../../../../../common/dao/RecordGeneralManager";
import GameRecordDateTableMysqlDao from "../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao";

const logger = getLogger("server_out", __filename);

/**
 * 结算相关
 */
export default class StateEndAction {

    room: Room;

    static roomCodeList: string[] = [];

    static instanceMap: object = {};

    static getInstance(room: Room, paramRoomCode: string): StateEndAction {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateEndAction(room)
        }

        return this.instanceMap[paramRoomCode];
    }

    constructor(room: Room) {
        this.room = room;
    }

    /**
     * 初始化 结算计时器
     */
    initSettleTime() {
        this.room.tmp_countDown = this.room.settleCountDown;
    }

    /**
     * 结算当前对局
     *
     * @tag 新需求
     * @description 发包者可抢自己红包，该情况下，该玩家既会抽利所抢红包金额，结算时该部分也同样会被纳入结算抽利
     * @date 2019年9月9日
     */
    async settedCurrentGame2() {
        let grabberResult: ISettledInfo[] = [];
        let handoutResult: ISettledInfo;
        // 奖池 RPC 调用基础属性
        const poolBaseParams = { nid: this.room.nid, sceneId: this.room.sceneId };

        /** Step 1: 确认红包队列红包状态可结算 */
        const mineOfRedPacketList = this.room.redPackQueue.filter(redPacketInfo => redPacketInfo.status === RedPacketGameStatusEnum.GAME);
        if (mineOfRedPacketList.length === 0) {
            logger.error(`红包扫雷|房间:${this.room.roomId}|场:${this.room.sceneId}|第:${this.room.roundTimes}轮
       结算时出错,在红包队列"redPackQueue"查询不到应结算的红包。
       当前红包队列:${JSON.stringify(this.room.redPackQueue)}；
       参与抢包者信息:${JSON.stringify(this.room.currentGraberQueue)}。
       现初始化"游戏过程属性"等，进行下一轮
       `);
            this.room.currentRedPacketList = [];
            this.room.currentGraberQueue = [];
            this.room.tmp_countDown = -1;
            this.room.changeGameStatues(GameStatusEnum.WAIT);
            return;
        }

        /** Step 2: 获取当前对局游戏状态的玩家: 玩家集合 = 发红包玩家 + 抢红包玩家 */
        const playerListInGameStatus = this.room.players.filter((player) => player.status === PlayerGameStatusEnum.GAME);

        // 构造压缩记录
        this.room.zipResult = buildRecordResult(this.room.currentGraberQueue);

        // 为了数据准确这里再更新一次真实玩家数量
        this.room.updateRealPlayersNumber();

        const playerGameRecordList = new Map<string, number>();

        let tableName: string = null;

        /**
         * Step 3: 根据玩家真实身份：机器人|真实玩家; 判断是否走抽水逻辑，以及奖池金额流入流出
         * @description 发包者:抽水1%(可配置)，即100元的红包玩家最多领走99元，如果该红包没有任何一个人领取，则全额退还100%不抽水。注：实际发包金额=初始发包金额-抽水金额。
         * @description 抢包者:结算时判断实际盈利
         * @description 发包者抢自己的包，虽不会中雷，但所抢红包金额既会走抢包抽利部分，也会纳入结算抽利
         * */
        for await (const { uid, isRobot, headurl, nickname,  controlType , gold } of playerListInGameStatus) {

            // 获取当前红包
            const redPacket: IRedPacket = this.room.redPackQueue[0];

            // 当前红包金额
            let bet: number = redPacket.amount;

            try {
                // 添加游戏记录以及更新玩家金币
                // const playerRecordService = await createPlayerRecordService(this.room.nid, this.room.sceneId);

                /** 发包者(庄) */
                if (uid === mineOfRedPacketList[0].owner_uid) {

                    // Step 3.1.1 获取 已抢红包、中雷、排除自己 的抢包者信息
                    const graberRedPacketStepInMineList: IGraberRedPacket[] = this.room.currentGraberQueue.filter(graber => graber.hasGrabed && graber.isStepInMine && graber.grabUid !== uid);
                    // 获取自己是否抢包信息
                    let grabRedPacketList = this.room.currentGraberQueue.filter(graber => graber.hasGrabed && graber.grabUid === uid);
                    let redPacketAmount = grabRedPacketList.length > 0 ? parseFloat(grabRedPacketList[0].redPacketAmount) : 0;

                    // Step 3.1.2 玩家实际盈利 = 中雷数 * 所发红包金额 - 所发红包金额 * 红包抽利系数 - 中雷数 * 所发红包金额 * 抽利系数
                    const win: number = graberRedPacketStepInMineList.length * bet * this.room.sceneInfo.lossRation;

                    // Step 3.1.4: 获取未抢红包金额,返还给发包者
                    const redPacketAmountWithOutGrab: number = this.room.currentGraberQueue
                        .filter(graber => !graber.hasGrabed)
                        .reduce((totalAmount, nextRedPacket) => {
                            return totalAmount + parseInt(nextRedPacket.redPacketAmount);
                        }, 0);

                    let res = await createPlayerRecordService()
                        .setPlayerBaseInfo(uid, false, isRobot , gold)
                        .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                        .setGameRecordInfo(bet, bet, win + redPacketAmount - bet, true)
                        .redPacketAmountWithOutGrab(redPacketAmountWithOutGrab)
                        .setControlType(controlType)
                        .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, -1)
                        .addResult(this.room.zipResult)
                        // .setGameRecordLivesResult(this.room.currentGraberQueue)
                        .sendToDB(1);

                    ///@ts-ignore
                    if (!tableName) tableName = res.tableName ? res.tableName : null;
                    // 返还金币
                    // await this.returnRestRedPacketAmount(uid, redPacketAmountWithOutGrab);

                    const playerActualProfit = res.playerRealWin;
                    /**
                     * Step 3.1.3 改变奖池金额
                     * @description 若当前玩家是机器人则抽利金额不进盈利池
                     */
                    // 抽利金额
                    const profitAmount: number = playerActualProfit > 0 ? win - playerActualProfit : win - (playerActualProfit + bet);
                    // 非机器人盈利，则抽利流入盈利池
                    if (isRobot !== 2) {
                        // await addProfitPoolAmount(this.room.sceneId, profitAmount);
                        // 不等于 改变奖金池金额
                        // playerActualProfit >= 0 && isRobot !== 2 ? await changeBonusPoolAmount(this.room.sceneId, playerActualProfit, 1)
                        //     : await changeBonusPoolAmount(this.room.sceneId, Math.abs(playerActualProfit), 2);

                        // const { player: p } = await PlayerManager.getPlayer({ uid }, false);

                        if (!this.room.getPlayer(uid).onLine) {
                            mailModule.sendMailFromRedPacket(uid, res.playerRealWin + redPacketAmountWithOutGrab, true);
                        }
                    }

                    let isStepInMine = false;

                    // 封装抢包信息
                    if (redPacketAmount > 0) {
                        const redPacketIdx = this.room.currentGraberQueue.findIndex(({ grabUid }) => grabUid === uid);
                        isStepInMine = this.room.currentGraberQueue[redPacketIdx].isStepInMine;
                        grabberResult.push({
                            uid,
                            grabTime: grabRedPacketList[0].grabTime,
                            redPacketAmount,
                            profitAmount: playerActualProfit + redPacketAmountWithOutGrab,
                            isStepInMine,
                            headurl,
                            nickname,
                            gold: res.gold
                        });
                    }
                    // Step 3.1.5:恢复玩家状态 -> 就绪
                    const playerInRoom = this.room.getPlayer(uid);
                    playerInRoom.changePlayerStatus(PlayerGameStatusEnum.READY);
                    // Step 3.1.6:设置上局盈利
                    playerInRoom.profitAmount = playerActualProfit;
                    // Step 3.1.7:变更累计盈利
                    playerInRoom.gain += playerActualProfit;
                    playerInRoom.gold = res.gold;
                    // 封装返回前端结算信息
                    handoutResult = {
                        uid,
                        grabTime: 2564453858713,
                        redPacketAmount: redPacketAmount || 0,
                        profitAmount: playerActualProfit + redPacketAmountWithOutGrab,
                        isStepInMine,
                        redPacketAmountWithOutGrab,
                        headurl,
                        nickname,
                        gold: res.gold
                    };

                    if (!!(res as { playerRealWin: number; gameRecordId: number; gold: number; tableName: string }).gameRecordId) {
                        playerGameRecordList.set(uid, (res as { playerRealWin: number; gameRecordId: number; gold: number; tableName: string; }).gameRecordId);
                    }

                    continue;
                }

                /** 抢包者(闲) */

                // Step 3.2.1 获取玩家角色身份
                const grabRedPacketIdx = this.room.currentGraberQueue.findIndex(redPacket => redPacket.grabUid === uid);
                // FIXME 为何=-1?
                if (grabRedPacketIdx < 0) continue;
                // Step 3.2.2: 是否中雷
                const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
                bet = graberRedPacket.isStepInMine ? bet * this.room.sceneInfo.lossRation : 0;

                // Step 3.2.3: 玩家实际盈利 = 红包所得 - 抽利
                const redPacketAmount: number = parseFloat(graberRedPacket.redPacketAmount);
                let res = await createPlayerRecordService()
                    .setPlayerBaseInfo(uid, false, isRobot ,gold)
                    .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                    .setGameRecordInfo(bet, bet, redPacketAmount - bet)
                    .setControlType(controlType)
                    .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, -1)
                    .addResult(this.room.zipResult)
                    .isInStepMine(graberRedPacket.isStepInMine)
                    // .setGameRecordLivesResult(this.room.currentGraberQueue)
                    .sendToDB(1);

                const playerActualProfit = res.playerRealWin;

                ///@ts-ignore
                if (!tableName) tableName = res.tableName ? res.tableName : null;

                // 通知前端更新金币
                // if (isRobot !== 2) this.room.channelForPlayerAction.playerGoldWithUpdateToClient(uid, redPacketAmount - bet);

                // Step 3.2.4:改变“奖池”金额。 Ps:若是机器人则抽利金额不进盈利池
                // 抽利金额
                let profitAmount: number = playerActualProfit > 0 ? redPacketAmount - playerActualProfit : redPacketAmount - (playerActualProfit + bet);

                if (isRobot !== 2) {
                    if (!this.room.getPlayer(uid).onLine) {
                        mailModule.sendMailFromRedPacket(uid, res.playerRealWin, false);
                    }
                }
                // Step 3.2.5:恢复玩家状态 -> 就绪
                const currPlayer = this.room.getPlayer(uid);
                currPlayer.changePlayerStatus(PlayerGameStatusEnum.READY);
                // Step 3.2.6:设置上局盈利
                currPlayer.profitAmount = playerActualProfit;
                // Step 3.2.7:变更累计盈利
                currPlayer.gain += playerActualProfit;
                currPlayer.gold = res.gold;

                // 封装返回前端信息
                grabberResult.push({
                    uid,
                    grabTime: graberRedPacket.grabTime,
                    redPacketAmount: utils.round(parseFloat(graberRedPacket.redPacketAmount)),
                    profitAmount: playerActualProfit,
                    headurl,
                    nickname,
                    isStepInMine: graberRedPacket.isStepInMine,
                    gold: res.gold
                });

                if (!!(res as { playerRealWin: number; gameRecordId: number; gold: number; tableName: string }).gameRecordId) {
                    playerGameRecordList.set(uid, (res as { playerRealWin: number; gameRecordId: number; gold: number; tableName: string; }).gameRecordId);
                }

            } catch (e) {
                logger.error(`红包扫雷:${this.room.nid}|场:${this.room.sceneId}|第${this.room.roundTimes}轮|结算出错: ${e.stack || e}`);
            }

        }

        // Step 4: 按抢包顺序排序
        grabberResult.sort((a, b) => a.grabTime - b.grabTime);

        // Step 5: 插入对局详情
        if (playerListInGameStatus.some(p => p.isRobot === RoleEnum.REAL_PLAYER)) {

            const {
                uid,
                redPacketAmount,
                profitAmount,
                redPacketAmountWithOutGrab
            } = handoutResult;

            const dealerPlayer = playerListInGameStatus.find(p => p.uid === uid);

            const dealer = {
                uid,
                redPacketAmount: this.room.redPackQueue[0].amount,
                profitAmount,
                redPacketAmountWithOutGrab,
                isRobot: dealerPlayer.isRobot,
                mineNumber: this.room.redPackQueue[0].mineNumber
            };

            const playerList = grabberResult.map(res => {
                const { uid, redPacketAmount, isStepInMine, profitAmount } = res;

                const curPlayer = playerListInGameStatus.find(p => p.uid === uid);

                if (!!curPlayer) {
                    const { isRobot } = curPlayer;

                    return { uid, redPacketAmount, isStepInMine, isRobot, profitAmount };
                }

                return { uid, redPacketAmount, isStepInMine, profitAmount };
            });

            /* const gameRecordsLiveList = playerListInGameStatus.reduce((recordList, playerInfo) => {

                if (playerInfo.isRobot === RoleEnum.REAL_PLAYER) {


                    recordList.push({
                        nid: "81",
                        uid: playerInfo.uid,
                        gameName: "红包扫雷",
                        createTime: new Date().getTime() / 1000,
                        result: { dealer, playerList }
                    });
                }

                return recordList;
            }, []); */

            const iterator = playerGameRecordList.entries();

            let keyAndVal = iterator.next().value;

            let nextFlag: boolean = !!keyAndVal;

            while (nextFlag) {
                const [uid, gameRecordId] = keyAndVal;

                await GameRecordDateTableMysqlDao.updateOne(tableName, { id: gameRecordId }, { game_Records_live_result: { dealer, playerList } });

                // await GameRecordMysqlDao.updateOne({ id: gameRecordId }, { game_Records_live_result: { dealer, playerList } })

                keyAndVal = iterator.next().value;

                nextFlag = !!keyAndVal;
            }

            // const recordLiveList = await addGameRecordList(gameRecordsLiveList);

            // for await (const { uid, id } of recordLiveList) {
            //     if (playerGameRecordList.has(uid)) {
            //         const _id = playerGameRecordList.get(uid);
            //         await game_record.updateOne({ _id }, { game_record_live_id: id });
            //     }
            // }
        }


        // Step 6: 组合结算数据
        return { grabberResult, handoutResult };

    }

    nextGameRound() {
        this.room.currentGraberQueue = [];
        this.room.currentRedPacketList = [];
        this.room.roundTimes++;
        this.room.tmp_countDown = 8000;
        this.room.process = true;
        this.room.grabPlayerSet = new Set();
    }

}
