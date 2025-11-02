import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { isHaveLine, SlotResult } from "../lib/util/lotteryUtil";
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import config from "../lib/constant";

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
     * @route FortuneRooster.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
        };
    }

    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route FortuneRooster.mainHandler.start
     */
    async start({ lineNum, bet, room, player }: BetParamOption, session: FrontendSession) {
        lineNum = config.lineNum;
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        }

        // 判断传入参数是否合理
        if (isNullOrUndefined(lineNum) || isNullOrUndefined(bet)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 判断选线是否合理
        if (!isHaveLine(lineNum)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果押注不合理
            if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
            }

            // 如果缺少金币
            if (player.isLackGold(bet, lineNum)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }

            // 初始化玩家
            player.init();

            // 押注
            player.bet(bet, lineNum);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const result: SlotResult = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                jackpotWin: result.jackpotWin,
                isBigWin: player.isBigWin,
                canOnlineAward: false,
                onlineAward: 0,
                gold: player.gold,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId,
                sixthAxis: result.sixthAxis,
                firstWindow: result.firstWindow,
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${player.uid}的游戏spin出错:FortuneRooster-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 申请奖池信息
     * @route: FortuneRooster.mainHandler.jackpot
     */
    async jackpot({ room }: { room: RoomStandAlone }, session: FrontendSession) {
        return {
            code: 200,
            runningPool: room.runningPool,
        };
    }
}