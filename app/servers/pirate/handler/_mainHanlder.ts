import { Application, FrontendSession, pinus } from 'pinus';
import { getLogger, Logger } from 'pinus-logger';
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { baseMultiple } from "../lib/config/baseBetConfig";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import { ScenePointValueMap } from "../../../../config/data/gamesScenePointValue";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";

/**
 * 下注参数
 * @property multiplyType 押注倍数
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    multiplyType: number,
    room: RoomStandAlone,
    player: Player,
}

/**
 * 开宝箱参数
 * @property index 开宝箱的坐标
 * @property room 房间
 * @property player 玩家
 */
interface OpenParams {
    index: number,
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
     * @route pirate._mainHanlder.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // 转换只给玩家展示的宝箱
        const treasureChestList = player.treasureChestList.map(box => {
            // 如果可见
            if (box.visible) {
                return {
                    open: box.open,
                    visible: box.visible,
                    type: box.type,
                    specialAttributes: box.specialAttributes,
                }
            }

            return {
                open: box.open,
                visible: box.visible,
                type: null,
                specialAttributes: 0,
            }
        });

        // player.setRoundId(room.getRoundId(player.uid))
        return {
            code: 200,
            uid: player.uid,
            gold: player.gold,
            roundId: player.roundId,
            treasureChestList,
            gameStatus: player.gameStatus,
            pointValue: ScenePointValueMap[GameNidEnum.pirate].pointValue
        };
    }


    /**
     * 开始游戏
     * @param multiplyType 押注倍数的类型
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route pirate._mainHanlder.start
     */
    async start({ multiplyType, room, player }: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) }
        }

        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid}];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        }

        // 如果不为spin状态
        if (!player.isSpinStatus()) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3200) };
        }

        // 如果没有改押注倍数则返回错误
        if (!Object.keys(baseMultiple).includes(multiplyType.toString())) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 如果缺少金币
        if (player.isLackGold(multiplyType)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
        }



        // 改变玩家状态
        player.changeGameState();

        try {
            // 初始化玩家
            player.init();

            // 押注
            player.bet(multiplyType);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const result = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            // console.warn(`寻宝启航 自己的player gold -  ${player.gold}`)

            // console.warn(`=====================================================`);
            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            return {
                code: 200,
                gold: player.gold,
                winLines: result.winLines,
                goldCount: player.goldCount,
                window: result.window,
                currentGoldCount: result.goldCount,
                gameStatus: player.gameStatus,
                profit: player.profit,
                roundId: player.roundId
            };
        } catch (e) {
            this.logger.warn(`寻宝奇航 pirate._mainHanlder.start 报错:  ${e.stack || e}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }


    /**
     * 免费开奖
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route pirate._mainHanlder.freeSpinStart
     */
    async freeSpinStart({ room, player }: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) }
        }

        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid}];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        }

        // 如果不为spin状态
        // if (!player.isSpinStatus()) {
        //     return {code: 500, error: getlanguage(player.language, Net_Message.id_3200)};
        // }

        // 如果免费开奖次数不足
        if (player.freeSpinCount <= 0) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3201) };
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 初始化玩家
            player.freeSpinInit();

            // 开奖
            const result = await room.lottery(player);

            // 结算
            await room.settlement(player, result, true);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            return {
                code: 200,
                gold: player.gold,
                winLines: result.winLines,
                goldCount: player.goldCount,
                window: result.window,
                currentGoldCount: result.goldCount,
                gameStatus: player.gameStatus,
                profit: player.profit,
                freeSpinCount: player.freeSpinCount,
                roundId: player.roundId
            };
        } catch (e) {
            this.logger.warn(`寻宝奇航 pirate._mainHanlder.freeSpinStart 报错:  ${e.stack || e}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 开宝箱
     * @param index 宝箱下标
     * @param room
     * @param player
     * @param session
     * @route pirate._mainHanlder.openTreasureChest
     */
    async openTreasureChest({ index, room, player }: OpenParams, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) }
        }

        // 如果不为开宝箱状态
        // if (player.isSpinStatus()) {
        //     return {code: 500, error: getlanguage(player.language, Net_Message.id_3202)};
        // }

        // 如果没有宝箱
        if (!player.treasureChestList[index]) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 如果宝箱打开了 则不允许重复打开
        if (player.treasureChestList[index].open) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3203) };
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 开奖
            const profit = await room.boxLottery(player, index);

            // 检查是否改变状态
            player.treasureChestSettlement();

            // 转换只给玩家展示的宝箱
            const treasureChestList = player.treasureChestList.map(box => {
                // 如果可见
                if (box.visible) {
                    return {
                        open: box.open,
                        visible: box.visible,
                        type: box.type,
                        specialAttributes: box.specialAttributes,
                    }
                }

                return {
                    open: box.open,
                    visible: box.visible,
                    type: null,
                    specialAttributes: 0,
                }
            });

            return {
                code: 200,
                gameStatus: player.gameStatus,
                gold: player.gold,
                profit,
                treasureChestList,
                currentTreasureChest: player.treasureChestList[index],
                keyCount: player.keyCount
            }
        } catch (e) {
            this.logger.warn(`寻宝奇航 pirate._mainHanlder.openTreasureChest 报错:  ${e.stack || e}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
}
