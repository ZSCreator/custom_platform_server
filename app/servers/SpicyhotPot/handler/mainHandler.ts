    import Util = require('../../../utils');
import sessionService = require('../../../services/sessionService');
import roomManager from '../lib/RoomMgr';
import PlayerManagerDao from '../../../common/dao/daoManager/Player.manager';
import { Application, BackendSession } from 'pinus';
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
const LoggerErr = getLogger('server_out', __filename);
const log_logger = getLogger('server_out', __filename);


function process(roomId: string, uid: string, sceneId: number) {
    const roomInfo = roomManager.searchRoom(sceneId, roomId);

    if (!roomInfo) {
        LoggerErr.warn(`error ==> mainHandler==>process函数 | 玩家${uid}: 未找到对应房间${roomId}`);
        return { error: 1 };
    }

    const roomPlayer = roomInfo.getPlayer(uid);
    if (!roomPlayer) {
        LoggerErr.warn(`error ==> mainHandler==>process函数 | 玩家${uid}: 未在房间${roomId}找到对应玩家`);
        return { error: 1 };
    }

    return { roomInfo, roomPlayer };
}

export default function (app: Application) {
    return new MainHandler(app);
}

export class MainHandler {
    constructor(private app: Application) { }


    /**
     * 第一次进入游戏需加载的内容
     * @return {Function} next: 成功代码以及房间信息 || 错误代码以及错误信息
     * @route  SpicyhotPot.mainHandler.loaded
     *  */
    async loaded({ }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { roomInfo, roomPlayer, error } = process(roomId, uid, sceneId);
        const  player  = await PlayerManagerDao.findOne({ uid });

        if (error) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_2004) };
        }


        if (!roomPlayer.isOnline()) {
            roomInfo.addPlayerInRoom(player);
        }

        // roomPlayer.updateRoundId(roomInfo);

        return {
            code: 200,
            player: roomPlayer.strip(),
            betAreas: roomPlayer.betAreas,
            betArea1: roomPlayer.betArea1,
            betArea2: roomPlayer.betArea2,
            betArea3: roomPlayer.betArea3,
            roundId: roomPlayer.roundId,
        };
    }


    /**
     * 玩家下注
     * @param {Object} bets:  下注区域及下注区域金额 {"orange": number}
     * @return {Function} next: 成功代码 || 错误代码以及错误信息
     * @route SpicyhotPot.mainHandler.userBet
     *  */
    async userBet({ bets }, session: BackendSession) {
        const { roomId, uid, sceneId } = sessionService.sessionInfo(session);
        const { roomInfo, roomPlayer, error } = process(roomId, uid, sceneId);

        // 如果玩家正在游戏则不进行判断
        if (roomPlayer.isGameState()) {
            return {code: 500, error: getlanguage(roomPlayer.language, Net_Message.id_3103)}
        }

        const  player  = await PlayerManagerDao.findOne({ uid });

        // const game = await GameManager.getOneGame(GameNidEnum.SpicyhotPot);

        // 如果游戏已经关闭 踢出玩家
        // 只有在玩家点击开始的时候才会被踢出 不然不会 如果要在游戏一关闭的时候就踢出玩家 那玩家的下注就可能丢失
        // if (!game.opened) {
        //     // let offLineArr = [{ nid: roomInfo.nid, sceneId: roomInfo.sceneId, roomId: roomInfo.roomId, uid: player.uid }];
        //     await roomInfo.kickingPlayer(pinus.app.getServerId(), [roomPlayer]);
        //     return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        // }

        if (error) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_2004) };
        }

        roomPlayer.changeGameState();

        try {
            let judge = false;
            let area;
            for (let key in roomPlayer.betAreas) {
                if (bets == roomPlayer.betAreas[key].bet) {
                    judge = true;
                    area = key;
                    break;
                }
            }

            if (judge === false) {
                return {code: 500, error: getlanguage(player.language, Net_Message.id_1015)};
            }
            let betArea = roomPlayer.betAreas[area];


            // 如果押注金币超过拥有金币
            if (Util.sum(bets) > Util.sum(roomPlayer.gold) || bets <= 0) {
                return {code: 500, error: getlanguage(player.language, Net_Message.id_1015)};
            }

            roomPlayer.updateRoundId(roomInfo);

            // 玩家下注 判断是否下注成功
            judge = await roomPlayer.deductGold(bets);
            //
            // if (!judge) {
            //     return { code: 500, error: langsrv.getlanguage(player.language,2004) };
            // }

            const {rest, rebate} = await roomInfo.GetKaiJiangResult(roomPlayer, Util.sum(bets));
            let arr = [null, null, null, null, null, null, null, null, null];
            let len = 0;
            let BZprofit = 0;//麻辣标记中奖
            for (let i = 0; i < arr.length; i++) {
                if (Math.random() < 0.21) {
                    arr[i] = 1;
                    len++;
                }
            }
            // { lv: 1, bet: 100, Area: [100, 200, 300], betArea: [0, 0, 0] },
            roomPlayer.betArea1 += bets * 0.01;
            roomPlayer.betArea2 += bets * 0.015;
            roomPlayer.betArea3 += bets * 0.02;

            // 麻辣奖类型
            let awardType = '0';
            if (len > 3) {
                if (len > 3 && len < 7) {
                    BZprofit = roomPlayer.betArea1 + betArea['Area'][0];
                    awardType = '1';
                    roomPlayer.betArea1 = 0;
                } else if (len > 6 && len < 9) {
                    BZprofit = roomPlayer.betArea2 + betArea['Area'][1];
                    awardType = '2';
                    roomPlayer.betArea2 = 0;
                } else {
                    BZprofit = roomPlayer.betArea3 + betArea['Area'][2];
                    awardType = '3';
                    roomPlayer.betArea3 = 0;
                }
            }

            BZprofit = Math.floor(BZprofit);// 向下取整,丢弃小数部分
            const Spicyhotarr = {arr: arr, len: len, BZprofit: BZprofit};
            let totalWin = 0;

            const details = {};
            for (let key in rebate) {
                totalWin += rebate[key][Object.keys(rebate[key])[0]];
                details[Object.keys(rebate[key])[0]] = Math.floor(rebate[key][Object.keys(rebate[key])[0]] * bets);
            }

            totalWin = Math.floor(totalWin * bets);
            //const betArea = [roomPlayer.betArea1, roomPlayer.betArea2, roomPlayer.betArea3];
            const {
                playerRealWin,
                reBZProfit
            } = await roomPlayer.addGold(totalWin, BZprofit, rest, details, awardType, roomInfo);

            // 适配前端 如果真实收益大于
            // console.warn('3333333333333', totalWin, reTotalWin, roomPlayer.totalBet);
            totalWin = playerRealWin >= 0 ? playerRealWin + roomPlayer.totalBet : roomPlayer.totalBet - Math.abs(playerRealWin);

            Spicyhotarr.BZprofit = Math.floor(reBZProfit);
            player.isRobot !== 2 && log_logger.info(`bet|${GameNidEnum.SpicyhotPot}|${player.uid}|${bets}|${totalWin}|${Spicyhotarr.BZprofit}`);


            return {
                code: 200,
                gold: roomPlayer.gold,
                rest,
                rebate,
                totalWin: totalWin,
                Spicyhotarr: Spicyhotarr,
                betAreas: roomPlayer.betAreas,
                betArea1: roomPlayer.betArea1,
                betArea2: roomPlayer.betArea2,
                betArea3: roomPlayer.betArea3,
                roundId: roomPlayer.roundId,
            };
        } catch (e) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            roomPlayer.changeLeisureState();
        }

    }
}
