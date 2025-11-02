import { Logger, MsgPkg, pinus } from "pinus";
import { getLogger } from "pinus-logger";
import { BlackJackRoomImpl } from "../../BlackJackRoomImpl";
import { BlackJackPlayerStatusEnum } from "../../enum/BlackJackPlayerStatusEnum";
import { BlackJackPlayerRoleEnum } from "../../enum/BlackJackPlayerRoleEnum";
import { RoleEnum } from "../../../../../common/constant/player/RoleEnum";
import { buildRecordResult } from "../../util/recordUtil";
import createPlayerRecordService from "../../../../../common/dao/RecordGeneralManager";
import { BlackJackPlayerHistory } from "../../BlackJackPlayerHistory";
import { remove } from "../../../../../utils";

export class BlackJackSettlementAction {

    private logger: Logger;

    private room: BlackJackRoomImpl;

    static roomIdList: string[] = [];

    static instanceMap: object = {};

    static getInstance(room: BlackJackRoomImpl, paramRoomId: string): BlackJackSettlementAction {
        if (this.roomIdList.findIndex(roomId => roomId === paramRoomId) < 0) {
            this.roomIdList.push(paramRoomId);
            this.instanceMap[paramRoomId] = new BlackJackSettlementAction(room)
        }

        return this.instanceMap[paramRoomId];
    }

    constructor(room: BlackJackRoomImpl) {
        this.room = room;

        this.logger = getLogger('server_out', __filename);
    }

    async settedCurrentGame() {
        // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 开始`);

        // Step 1: 过滤出对局中的玩家
        const playerList = this.room.players.filter(p =>
            p.status === BlackJackPlayerStatusEnum.Game && p.role === BlackJackPlayerRoleEnum.Player
        );

        // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 共有 ${playerList.length} 闲家 | ${playerList.filter(p => p.isRobot === 0)} 真实玩家`);

        /** Step 2: 庄家的牌型和点数 */
        const {
            countList: dealerCountList,
            pokerList: dealerPokerList
        } = this.room.runtimeData.getDealerPokerListAndCount();

        // 庄家手牌是否 BlackJack
        const dealerIsBlackJack = dealerCountList.some(count => count === 21);

        /** Step 3: 遍历所有闲家 */
        for await (const player of playerList) {
            try {
                const {
                    uid,
                    isRobot
                } = player;
                const isRealPlayer = isRobot === RoleEnum.REAL_PLAYER;
                // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 开始结算`);
                /**
                 * Step 4: 遍历闲家每一副牌
                 * @description
                 */
                let { bet, win, hadSeparate } = player.commonAreaBetList.reduce((result, area, areaIdx) => {
                    const {
                        countList,
                        pokerList
                    } = area.getPokerAndCount();


                    // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 统计下注区域: ${areaIdx}`);


                    if (pokerList.length === 0) {
                        return result;
                    }

                    // 检测玩家是否有分牌
                    if (area.checkHadSeparate()) {
                        result.hadSeparate = true;
                    }

                    // 闲家手牌是否 BlackJack
                    const playerIsBlackJack = countList.some(count => count === 21);

                    /** 不同流程的结算公共部分 */

                    /** | 下注阶段 | 下注金额 */
                    // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 下注 ${area.getCurrentBet()} `);
                    result.bet += area.getCurrentBet();

                    /** | 保险阶段 | 闲家:是否购买保险 */
                    if (player.hadBuyInsurance) {

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 购买保险: ${player.insuranceAreaList[areaIdx].getBet()}`);

                        // 保险⾦额是下注的⼀半且不退
                        result.bet += player.insuranceAreaList[areaIdx].getBet();
                    }

                    /**
                     * 特殊流程: 庄必为 BlackJack
                     *  下注阶段->发牌阶段->保险阶段->结算阶段
                     * @description 开局BlackJack 赔付为额外 0.5 倍
                     */
                    if (this.room.beInsuranceToSettlement) {

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 保险阶段 -> 直接结算`);

                        if (!dealerIsBlackJack) {
                            throw new Error(`${this.room.backendServerId} | ${this.room.sceneId} | ${this.room.roomId} | 保险阶段 -> 结算阶段 | 庄家结算出错: 庄家手牌不为 BlackJack ${JSON.stringify(dealerCountList)}`);
                        }

                        result.bet += (area.getCurrentBet() * 0.5);

                        /** 特殊流程: 庄必为开局BlackJack，变更玩家下注 */
                        area.addMulriple(0.5);

                        /** 若购买过保险，则返还下注阶段下注额 */
                        if (player.hadBuyInsurance) {
                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 保险阶段 -> 直接结算 | 已购买保险,返还当前区域下注额: ${area.getCurrentBet()}`);

                            result.win += area.getCurrentBet();

                            return result;
                        }

                        /** 平局 */
                        if (playerIsBlackJack) {
                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 保险阶段 -> 直接结算 | 平局 | 赢取当前区域下注额的1.5倍: ${area.getSettlementAmount()}`);

                            result.win += area.getSettlementAmount();

                            return result;
                        }

                        /** defalut: 闲家输 */
                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 保险阶段 -> 直接结算 | 闲输 | ${area.getSettlementAmount()} `);

                        return result;
                    }

                    /**
                     * 正常结算:
                     *  下注阶段->发牌阶段->保险阶段->玩家阶段->庄家阶段->结算阶段
                     * @description
                     */
                    const dealerPokerCount = Math.max(...dealerCountList);
                    const playerPokerCount = Math.max(...countList);

                    /** 庄赢 */
                    if (dealerPokerCount <= 21 && playerPokerCount > 21) {

                        if (dealerIsBlackJack && dealerPokerList.length === 2) {
                            result.bet += (area.getCurrentBet() * 0.5);
                        }

                        return result;
                    }

                    /** 闲赢 */
                    if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                        area.addMulriple(1);

                        // 2张牌 且 21点
                        if (playerIsBlackJack && pokerList.length === 2) {
                            area.addMulriple(0.5);
                        }

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲赢 | ${area.getSettlementAmount()} `);

                        result.win += area.getSettlementAmount();

                        return result;
                    }

                    /** 平局: 庄家优势，庄赢 */
                    if (dealerPokerCount > 21 && playerPokerCount > 21) {

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 平局 | ${area.getSettlementAmount()} `);
                        // result.win += area.getSettlementAmount();
                        return result;
                    }

                    /** 庄赢 */
                    if (dealerPokerCount > playerPokerCount) {
                        return result;
                    }

                    /** 闲赢 */
                    if (dealerPokerCount < playerPokerCount) {
                        area.addMulriple(1);

                        if (playerIsBlackJack && pokerList.length === 2) {
                            area.addMulriple(0.5);
                        }

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲赢 | ${area.getSettlementAmount()} `);

                        result.win += area.getSettlementAmount();
                        return result;
                    }

                    /** 平局 */
                    if (dealerPokerCount === playerPokerCount) {

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 平局 | ${area.getSettlementAmount()} `);

                        result.win += area.getSettlementAmount();
                        return result;
                    }

                    // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲输 | ${area.getCurrentBet()} `);

                    return result;
                }, { bet: 0, win: 0, hadSeparate: false });

                if (hadSeparate) {

                    const { bet: sepBet, win: sepWin } = player.separateAreaBetList.reduce((result, area, areaIdx) => {
                        const {
                            countList,
                            pokerList
                        } = area.getPokerAndCount();

                        if (pokerList.length === 0) {
                            return result;
                        }

                        result.bet += area.getCurrentBet();

                        // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 统计下注区域: ${areaIdx}`);

                        // 闲家手牌是否 BlackJack
                        // const playerIsBlackJack = countList.some(count => count === 21);

                        /**
                         * 正常结算:
                         *  下注阶段->发牌阶段->保险阶段->玩家阶段->庄家阶段->结算阶段
                         * @description
                         */
                        const dealerPokerCount = Math.max(...dealerCountList);
                        const playerPokerCount = Math.max(...countList);

                        /** 庄赢 */
                        if (dealerPokerCount <= 21 && playerPokerCount > 21) {

                            return result;
                        }

                        /** 闲赢 */
                        if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                            area.addMulriple(1);

                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲赢 | ${area.getSettlementAmount()} `);

                            result.win += area.getSettlementAmount();
                            return result;
                        }

                        /** 平局: 庄家优势，庄赢 */
                        if (dealerPokerCount > 21 && playerPokerCount > 21) {

                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 平局 | ${area.getSettlementAmount()} `);
                            // result.win += area.getSettlementAmount();
                            return result;
                        }

                        /** 庄赢 */
                        if (dealerPokerCount > playerPokerCount) {
                            return result;
                        }

                        /** 闲赢 */
                        if (dealerPokerCount < playerPokerCount) {
                            area.addMulriple(1);

                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲赢 | ${area.getSettlementAmount()} `);

                            result.win += area.getSettlementAmount();
                            return result;
                        }

                        /** 平局 */
                        if (dealerPokerCount === playerPokerCount) {

                            // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 平局 | ${area.getSettlementAmount()} `);

                            result.win += area.getSettlementAmount();
                            return result;
                        }

                        // isRealPlayer && this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 分牌区域 | 玩家 ${uid} | 庄: ${dealerPokerCount} | 闲: ${playerPokerCount} | 闲输 | ${area.getCurrentBet()} `);

                        return result;
                    }, { bet, win });

                    bet = sepBet;
                    win = sepWin;
                }

                // this.logger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${uid} | 结算统计完成 | bet: ${bet} | win: ${win}`);

                /** Step 5: 结算 */

                let gameRecordLivesResult: BlackJackPlayerHistory | null = null;

                if (player.isRobot === 0) {
                    gameRecordLivesResult = new BlackJackPlayerHistory()
                        .setBetTotal(player.getCurrentTotalBet())
                        .setBetAreaList(player.commonAreaBetList)
                        .setSeparateBetAreaList(player.separateAreaBetList)
                        .setDealerArea(this.room.runtimeData.getDealerPokerListAndCount())
                }

                const { playerRealWin, gold } = await createPlayerRecordService()
                    .setPlayerBaseInfo(player.uid, false, player.isRobot, player.gold)
                    .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                    .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, 0)
                    .setControlType(player.controlType)
                    .addResult(buildRecordResult(this.room.runtimeData.getDealerPokerListAndCount(), player.commonAreaBetList))
                    .setGameRecordInfo(Math.abs(bet), Math.abs(bet), win - bet, false)
                    .setGameRecordLivesResult(gameRecordLivesResult)
                    .sendToDB(1);
                player.profitQueue.push(playerRealWin);

                if (playerRealWin > 0) {
                    player.winRound++;
                }
                const p = this.room.players.find(p => p.uid === player.uid);
                !!p && (p.gold = gold);
            } catch (e) {
                this.logger.error(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 结算阶段 | 玩家 ${player.uid} | 结算统计出错: ${e.stack}`);
            }

        }

        /** Step 4: 结算结束过后如果玩家没有下注则记录玩家未下注次数 */
        this.room.players.map(pl => {
            if (pl.uid && pl.isRobot == 0 && pl.role == BlackJackPlayerRoleEnum.Player && pl.status === BlackJackPlayerStatusEnum.None && pl.totalBet == 0) {
                pl.standbyRounds += 1;
            }
        })

        // 获取参与游戏的玩家
        const pList = this.room.players.filter(p =>
            p.status === BlackJackPlayerStatusEnum.Game &&
            p.role === BlackJackPlayerRoleEnum.Player &&
            p.totalBet > 0
        );

        playerList.filter(p => p.onLine === false).forEach(p => {
            const {
                uid,
                // 平台编号
                group_id: rootUid,
                // 代理编号
                lineCode: parantUid,
            } = p;
            this.room.runtimeData.leaveSeat(uid);

            p.playerHadLeave();

            // remove(this.room.players, "uid", uid);

            this.room.channelForPlayer.playerLeaveToAllPlayer(this.room.players);

            let msg: MsgPkg = {
                args: [
                    rootUid,
                    parantUid,
                    this.room.roomId
                ],
                method: "leaveRoomInIsolationPool",
                namespace: "user",
                service: "mainRemote",
            }
            msg["serverType"] = pinus.app.getServerType();
            pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err: Error | null, ...args: any[]) => {
                // console.warn(err, args);
            });
        })
    }

}
