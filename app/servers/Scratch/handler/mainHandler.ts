import { Application, BackendSession } from 'pinus';
import * as langsrv from '../../../services/common/langsrv';
import { getLogger } from 'pinus-logger';
import Player from "../lib/scratchPlayer";
import RoomStandAlone from "../lib/scratchRoom";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
const log_logger = getLogger('server_out', __filename);

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    constructor(private app: Application) {
    }

    /**
     * 加载
     * @param player
     * @param room
     * @param session
     * @route Scratch.mainHandler.load
     */
    async load({ player, room }: {bet: number, player: Player, room: RoomStandAlone}, session: BackendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            roundId: player.roundId,
        };
    }

    /**
     *  开始游戏
     * @param bet 押注倍数
     * @param session 押注倍数
     * @param player 房间玩家
     * @param room 房间
     * @return { rebate, totalWin, result, gold } 倍率 中奖金额 图片数组 player金币
     * @route Scratch.mainHandler.start
     */
    async start({ bet, player, room }: {bet: number, player: Player, room: RoomStandAlone}, session: BackendSession) {

        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        if (bet === null) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }

        const jackpotId: boolean | number = (bet == 100 && 7) || (bet == 200 && 8) || (bet == 500 && 9) || (bet == 1000 && 10) || (bet == 10000 && 11);
        if (!jackpotId) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }

        if (bet <= 0) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1214) };
        }

        if (player.gold < bet) {
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1015) };
        }

        log_logger.debug(`玩家: ${player.uid} Scratch.mainHandler.start bet: ${bet}`);

        player.changeGameState();

        player.setBetAndJackpotId(bet, jackpotId);

        try {
            const result = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            return {
                code: 200,
                rebate: result.card.rebate,
                totalWin: result.totalWin,
                result: result.card.result,
                total_gold: player.gold,
                roundId: player.roundId,
            };
        } catch (error) {
            log_logger.warn(`${JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1055) };
        } finally {
            player.changeLeisureState();
        }
    };
}