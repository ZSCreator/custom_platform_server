import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { GetTotalMultiple, isHaveLine, SlotResult } from "../lib/util/lotteryUtil";
import *as utils from '../../../utils';
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import sessionService = require('../../../services/sessionService');
import roomManager, { BingoMoneyRoomManager } from "../lib/roomManager";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { default as config, elementType, prizeType } from "../lib/constant";
/**
 * 下注参数
 * @property lineNum 选线
 * @property bet 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    lineNum: number,
    bet: number,
    room: RoomStandAlone,
    player: Player,
}
function check(sceneId: number, roomId: string, uid: string, language: string) {
    const roomInfo = roomManager.searchRoom(sceneId, roomId);
    if (!roomInfo) {
        return { error: getlanguage(language, Net_Message.id_1004) };
    }
    const playerInfo = roomInfo.getPlayer(uid);
    if (!playerInfo) {
        return { error: getlanguage(language, Net_Message.id_2017) };
    }
    playerInfo.update_time();
    return { roomInfo, playerInfo };
};

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {
    logger: Logger;

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
    }

    /**
     * 加载获取参数
     * @param player 房间内部玩家
     * @param room 房间
     * @param session
     * @route BingoMoney.mainHandler.load
     */
    async load({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        return {
            code: 200,
            gold: playerInfo.gold,
            headurl: playerInfo.headurl,
            roundId: playerInfo.roundId,
            ArchiveGrid: playerInfo.ArchiveGrid,
        };
    }

    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route BingoMoney.mainHandler.start
     */
    async start({ bet }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        // 如果玩家正在游戏则不进行判断
        if (playerInfo.isGameState()) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_3103) }
        }
        let lineNum = config.winLines.length;
        // 如果游戏不开放
        if (!(await roomInfo.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await roomInfo.kickingPlayer(pinus.app.getServerId(), [playerInfo]);
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1055) };
        }

        // 判断传入参数是否合理
        if (isNullOrUndefined(lineNum) || isNullOrUndefined(bet)) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
        }

        // 判断选线是否合理
        if (!isHaveLine(lineNum)) {
            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
        }

        // 改变玩家状态
        playerInfo.changeGameState();

        try {
            // 如果押注不合理
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_4000) };
            }

            // 如果缺少金币
            if (playerInfo.isLackGold(bet, lineNum)) {
                return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1015) };
            }

            // 初始化玩家
            playerInfo.init();

            // 押注
            playerInfo.bet(bet, lineNum);

            // 添加调控池以及盈利池
            roomInfo.addRunningPool(playerInfo.totalBet).addProfitPool(playerInfo.totalBet);

            // 开奖
            const result: SlotResult = await roomInfo.lottery(playerInfo);
            if (result.bigBG >= 4) {
                playerInfo.bigBG = Math.min(result.bigBG, 5);
                playerInfo.Grid = [];
            }

            // 结算
            await roomInfo.settlement(playerInfo, result);

            // 给离线玩家发送邮件且删除玩家
            roomInfo.sendMailAndRemoveOfflinePlayer(playerInfo);

            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: playerInfo.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                isBigWin: playerInfo.isBigWin,
                canOnlineAward: false,
                onlineAward: 0,
                gold: playerInfo.gold,
                bigBG: result.bigBG,
                roundId: playerInfo.roundId
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${playerInfo.uid}的游戏spin出错:BingoMoney-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, msg: getlanguage(playerInfo.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            playerInfo.changeLeisureState();
            await roomInfo.removeOfflinePlayer(playerInfo);
        }
    }

    /**
     * 申请奖池信息
     * @route: BingoMoney.mainHandler.jackpotFund
     */
    async jackpotFund({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);
        if (error) {
            return { code: 500, msg: error }
        }
        return {
            code: 200,
            jackpotFund: roomInfo.jackpot,
            runningPool: roomInfo.runningPool,
            profit: roomInfo.profitPool
        };
    }

    /**
     * 初始化，进入游戏获取玩家的金币
     * @route: BingoMoney.mainHandler.loadGold
     */
    async loadGold({ }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);

        return { code: 200, gold: playerInfo.gold }
    }
    /**
     * 
     * @route: BingoMoney.mainHandler.Grid
     */
    async Grid({ }: BetParamOption, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);

        playerInfo.Refresh();
        return { code: 200, ArchiveGrid: playerInfo.ArchiveGrid }
    }
    /**
     * BingoMoney.mainHandler.BingGuo
     * @param TwoStrategy boolean 
     */
    async BingGuo({ TwoStrategy }, session: FrontendSession) {
        const { roomId, sceneId, uid, language } = sessionService.sessionInfo(session);
        const { roomInfo, playerInfo, error } = check(sceneId, roomId, uid, language);

        try {
            let num = 1;
            if (TwoStrategy) {
                num = playerInfo.bigBG;
            }
            let ArchiveGrid = playerInfo.ArchiveGrid.slice();


            // ArchiveGrid = [];
            // ArchiveGrid.push(...[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14].map(c => playerInfo.ArchiveGrid.slice()[c]));

            // ArchiveGrid = [];
            // ArchiveGrid.push(...[0, 4, 5, 6, 7, 8, 9, 10, 14].map(c => playerInfo.ArchiveGrid.slice()[c]));

            ArchiveGrid.sort((a, b) => 0.5 - Math.random());

            playerInfo.bigBG -= num;
            let nCount: number[] = [];
            for (let idx = 0; idx < num; idx++) {
                nCount.push(utils.random(2, 4));
            }
            while (15 - (utils.sum(nCount) + playerInfo.Grid.length) < playerInfo.bigBG * 2) {
                nCount.sort((a, b) => b - a);
                nCount[0]--;
            }
            let CurrGrid: number[] = [];
            ArchiveGrid.forEach(c => {
                if (CurrGrid.length == utils.sum(nCount)) {
                    return;
                }
                if (!playerInfo.Grid.includes(c)) {
                    playerInfo.Grid.push(c);
                    CurrGrid.push(c);
                }
            });
            let opts = {
                code: 200, Grid: playerInfo.Grid, CurrGrid, bigBG: playerInfo.bigBG, nCount
            }
            if (playerInfo.bigBG == 0) {
                let Multiple = GetTotalMultiple(playerInfo.Grid, playerInfo.ArchiveGrid);
                const result: SlotResult = {
                    window: [],
                    jackpotWin: 0,
                    winLines: [],
                    jackpotType: 'none',
                    totalWin: Multiple * playerInfo.baseBet,
                    multiple: 0,
                    bigBG: 0,
                };
                // 结算
                playerInfo.totalBet = 0;
                await roomInfo.settlement(playerInfo, result);
                opts['gold'] = playerInfo.gold;
                opts['Multiple'] = Multiple;
                opts['totalWin'] = playerInfo.profit;
            }
            return opts;
        } catch (error) {
            console.error(error);
            return { code: 500, msg: "err" };
        }

    }
}
