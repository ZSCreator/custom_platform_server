import {Application, FrontendSession} from 'pinus';
import {getLogger, Logger} from 'pinus-logger';
import Room from "../lib/room";
import Player from "../lib/player";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import {GameState} from "../lib/attConst";

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
     * @route att.mainHandler.load
     */
    async load({player, room}: { player: Player, room: Room }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
            state: player.gameState,
            cards: player.cards,
            handNum: player.roundCount,
            betNum: player.baseBet,
        };
    }

    /**
     * 发牌
     * @param player
     * @param room
     * @param betNum   下注倍数
     * @param handNum  手数
     * @param session
     * @route att.mainHandler.deal
     */
    async deal({
                   player,
                   room,
                   betNum,
                   handNum
               }: { player: Player, room: Room, betNum: number, handNum: number }, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果押注不合理
        if (typeof betNum !== 'number' || typeof handNum !== 'number' ||
            betNum <= 0 || handNum <= 0 ||
            betNum.toString().includes('.') || handNum.toString().includes('.')) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_4000)};
        }

        // 如果缺少金币
        if (player.isLackGold(betNum, handNum)) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1015)};
        }

        // 已经押注不可重复押注
        if (player.baseBet > 0) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_4000)};
        }

        player.changeGameState();

        player.init();

        // 押注
        player.bet(betNum, handNum);

        try {
            // 设置初始牌
            await room.initPlayerCards(player);

            return {
                code: 200,
                gold: player.gold,
                cards: player.cards,
            }
        } catch (e) {
            player.init();
            this.logger.error(`att.mainHandler.deal error: ${JSON.stringify(e.stack)}`);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        } finally {
            player.changeLeisureState();
        }
    }

    /**
     * 保留
     * @param player
     * @param room
     * @param retains  保留牌 这里是坐标
     * @param session
     * @route att.mainHandler.retain
     */
    async retain({player, room, retains}: { player: Player, room: Room, retains: number[] }, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果没发牌则不允许点击保留
        if (!player.cards.length) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3151)}
        }

        // 如果已经为留牌状态 不可进行二次点击
        if (player.gameState === GameState.Again) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3151)}
        }

        player.changeGameState();

        try {
            player.conversionRetainCards(retains);
            // 设置为留牌状态
            player.setAgainState();

            const result = await room.lottery(player);

            // 结算
            await room.settlement(player, result.totalWin === 0);

            return {
                code: 200,
                gold: player.gold,
                result: {
                    retains,
                    process: result.resultList,
                    sumGain: result.totalWin,
                },
                roundId: player.roundId,
            }
        } catch (e) {
            this.logger.error(`att.mainHandler.retain error: ${JSON.stringify(e.stack)}`);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        } finally {
            player.changeLeisureState();
        }
    }


    /**
     * 领取奖励
     * @param player
     * @param room
     * @param session
     * @route att.mainHandler.take
     */
    async take({player, room}: { player: Player, room: Room }, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果没发牌则不允许点击保留
        if (!player.cards.length) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3151)}
        }

        if (player.profit <= 0) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1006)}
        }

        player.changeGameState();
        try {
            const profit = player.profit

            // 结算
            await room.settlement(player, true);

            return {
                code: 200,
                gold: player.gold,
                gain: profit,
                roundId: player.roundId
            }
        } catch (e) {
            this.logger.error(`att.mainHandler.take error: ${JSON.stringify(e.stack)}`);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        } finally {
            player.changeLeisureState();
        }
    }

    /**
     * 准备博一博
     * @param player
     * @param room
     * @param session
     */
    async atry({player, room}: { player: Player, room: Room }, session: FrontendSession) {
        // 是否有收益
        if (player.profit <= 0) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1007)}
        }

        // 搏一搏结束
        if (player.gambleCount <= 0) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1008)}
        }

        // 设置搏一搏状态
        room.playerReadyBo(player);

        return {
            code: 200,
            cards: player.foldCards,
            canGuessCount: player.gambleCount,
            gain: player.profit
        }
    }

    /**
     * 博一博选牌
     * @param player
     * @param room
     * @param opt 选的花色 或者 颜色
     * @param session
     */
    async atryOpt({player, room, opt}: { player: Player, room: Room, opt: number }, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 判断状态
        if (player.gameState !== GameState.Bo || player.profit <= 0) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1006)}
        }

        // 判断花色是否合理
        if (typeof opt !== 'number') {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3153) }
        }

        // 判断博一博次数
        if (player.gambleCount <= 0) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1008) }
        }

        player.changeGameState();
        try {
            // 博一博操作
            const result = await room.boLottery(player, opt);

            // 次数减一
            player.gambleCountMinusOne();

            // 如果次数完了 或者 失败了 就直接结算
            if (player.gambleCount <= 0 || result.multiple === 0) {
                await room.settlement(player, true);
            }

            return {
                code: 200,
                isNext: player.gameState === GameState.Bo,
                gold: player.gold,
                iswin: result.totalWin > 0,
                card: result.card,
                canGuessCount: player.gambleCount,
                gain: result.totalWin
            }
        } catch (e) {
            this.logger.error(`att.mainHandler.atryOpt error: ${JSON.stringify(e.stack)}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3153) }
        } finally {
            player.changeLeisureState();
        }
    }
}