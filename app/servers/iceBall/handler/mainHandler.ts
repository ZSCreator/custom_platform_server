import {Application, FrontendSession} from 'pinus';
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { isHaveBet, IceBallLotteryResult } from "../lib/util/lotteryUtil";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import {getLogger, Logger} from "pinus-logger";


/**
 * 下注参数
 * @property lineNum 选线数量
 * @property betNum 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    betNum: number,
    lineNum: number,
    room: RoomStandAlone,
    player: Player,
}


export default function (app: Application) {
    return new mainHandler(app);
}

export class mainHandler {
    logger: Logger

    constructor(private app: Application) {
        this.app = app;
        this.logger = getLogger('log', __filename);

    }

    /**
     * 加载游戏
     * @route: iceBall.mainHandler.load
     */
    async load({ player }: { room: RoomStandAlone, player: Player }) {
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId
        };
    }

    /**
     * 开始游戏
     * @route: iceBall.mainHandler.start
     */
    async start({ betNum, lineNum, player, room }: BetParamOption) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 查看下注参数是否
        if (!isHaveBet(betNum, lineNum)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }


        // 如果缺少金币
        if (player.isLackGold(betNum, lineNum)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
        }

        player.changeGameState();

        // try {
            // 初始化玩家
            player.init();

            // 下注
            player.bet(betNum, lineNum);

            // 累积房间内部调控池 盈利池 小游戏奖池
            room.addRunningPool(player.totalBet)
                .addProfitPool(player.totalBet);

            // 开奖
            const result: IceBallLotteryResult = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            player.changeLeisureState();

            return {
                code: 200,
                result,
                gold: player.gold,
                roundId: player.roundId,
            };
        // } catch (error) {
        //     this.logger.error(`iceBall.mainHandler.start: ${error.stack}`);
        //     return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        // } finally {
        //     player.changeLeisureState();
        //     await room.removeOfflinePlayer(player);
        // }
    }

    /**
     * 获取奖池
     * @param room
     * @param player
     * @param session
     * @route iceBall.mainHandler.jackpot
     */
    async jackpot({room, player}: { room: RoomStandAlone, player: Player }, session: FrontendSession) {
        return {
            code: 200,
            runningPool: room.runningPool,
        }
    }
}
