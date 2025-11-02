import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { SlotResult } from "../lib/util/lotteryUtil";
import *as utils from '../../../utils';
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";

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
     * @route hl6xc.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        try {
            return {
                code: 200,
                gold: player.gold,
                headurl: player.headurl,
                roundId: player.roundId,
                ArchiveGrid1: player.ArchiveGrid1,
                ArchiveGrid2: player.ArchiveGrid2,
                ArchiveGrid3: player.ArchiveGrid3,
                ArchiveGrid4: player.ArchiveGrid4,
            };
        } catch (error) {
            return { code: 200, data: error };
        }
    }

    /**
     * 开始游戏
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route hl6xc.mainHandler.start
     */
    async start({ bet, room, player }: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) }
        }
        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        }
        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果押注不合理
            if (typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
            }

            // 如果缺少金币
            if (player.isLackGold(bet)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }

            // 初始化玩家
            player.init();

            // 押注
            player.bet(bet);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const result: SlotResult = await room.lottery(player);
            player.islucky = result.islucky;
            // 结算
            await room.settlement(player, result);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);
            player.result = result;

            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                islucky: result.islucky,
                result: result.result,
                jackpotWin: result.jackpotWin,
                // multiple: result.multiple,
                // canOnlineAward: false,
                gold: player.gold,
                // bigBG: result.bigBG,
                luckyBall: result.luckyBall,
                roundId: player.roundId
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${player.uid}的游戏spin出错:hl6xc-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
    /**
     * 
     * @route hl6xc.mainHandler.lucky
     */
    async lucky({ room, player }: BetParamOption, session: FrontendSession) {
        if (!player.islucky) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_8401) };
        }
        player.islucky = false;
        try {
            const result = player.result;
            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                islucky: result.islucky,
                result: result.result,
                jackpotWin: result.jackpotWin,
                Multiples: result.Multiples,
                Multiple: result.Multiple,
                gold: player.gold,
                luckyBall: result.luckyBall,
                roundId: player.roundId
            };
        } catch (e) {
            this.logger.error(`玩家${player.uid}的游戏spin出错:hl6xc-lucky: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
        }
        finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            // await room.removeOfflinePlayer(player);
        }
    }
    /**
     * 申请奖池信息
     * @route: hl6xc.mainHandler.jackpotFund
     */
    async jackpotFund({ room }: { room: RoomStandAlone }, session: FrontendSession) {
        return {
            code: 200,
            jackpotFund: room.jackpot,
            runningPool: room.runningPool,
            profit: room.profitPool
        };
    }

    /**
     * 初始化，进入游戏获取玩家的金币
     * @route: hl6xc.mainHandler.loadGold
     */
    async loadGold({ player }: BetParamOption, session: FrontendSession) {
        return { code: 200, gold: player.gold }
    }
    /**
     * 
     * @route: hl6xc.mainHandler.Grid
     */
    async Grid({ player }: BetParamOption, session: FrontendSession) {
        player.Refresh();
        return {
            code: 200,
            ArchiveGrid1: player.ArchiveGrid1,
            ArchiveGrid2: player.ArchiveGrid2,
            ArchiveGrid3: player.ArchiveGrid3,
            ArchiveGrid4: player.ArchiveGrid4,
        }
    }
}
