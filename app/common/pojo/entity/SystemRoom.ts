import { pinus, Channel } from 'pinus';
import { pushMessageByUids } from "../../../services/MessageService";
import { PlayerInfo } from './PlayerInfo'
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../constant/game/GameNidEnum';
import { PositionEnum } from '../../constant/player/PositionEnum';
import { decreaseByServerId } from '../../dao/redis/ServerCurrentNumbersPlayersDao';
import { genRoundId } from "../../../utils/utils";
import { RoleEnum } from '../../constant/player/RoleEnum';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import RobotRedisDao from "../../../common/dao/redis/Robot.redis.dao";
import PlayersInRoomDao from "../../../common/dao/redis/PlayersInRoom.redis.dao";
import * as langsrv from "../../../services/common/langsrv";
const logger = getLogger('server_out', __filename);
import { globalEvent } from "../../../common/event/redisEvent";
import { EventEmitter } from "events";
import { BlackJackPlayerRoleEnum } from "../../../servers/BlackJack/lib/enum/BlackJackPlayerRoleEnum";
import { BlackJackRoomChannelEventName } from "../../../servers/BlackJack/lib/enum/BlackJackRoomChannelEventName";
import { RobotMessage } from "../../constant/game/RobotMessage";
import { get_games } from "../../../pojo/JsonConfig";

/**
 * 房间对象定义
 * @property roundId 回合id 针对百人类游戏以及对战类游戏
 * @property realPlayersNumber 真人玩家人数
 */
export class SystemRoom<T extends PlayerInfo> {
    serverId: string;
    nid: GameNidEnum;
    sceneId: number;
    roomId: string;
    createTime: number;
    jackpot: any;
    runningPool: any;
    profitPool: number;
    boomNum: number;
    open: boolean;
    jackpotShow: { otime: number, show: number, rand: number, ctime: number };
    entryCond: number;
    /**真实玩家and机器人 */
    channel: Channel;
    /**该通道只有真实玩家 */
    // channelBet: Channel;
    maxCount: number;
    players: T[] = [];
    /**游戏局号 */
    roundId: string;
    /**更新真实玩家数量 */
    realPlayersNumber: number = 0;
    /**租户分类编号 */
    kind: number;
    /** 可销毁 */
    canBeDestroy: boolean = true;
    event: EventEmitter;
    // robotRunning: boolean = false;
    roomBeInit: boolean = false;
    constructor(opts: any) {
        this.serverId = opts.serverId || null;
        this.channel = opts.channel || null;
        // this.channelBet = opts.channelBet || null;
        this.nid = opts.nid;
        this.sceneId = opts.sceneId !== undefined ? opts.sceneId : -1;                  //房间所属的场ID：-1 表示未分场
        this.roomId = opts.roomId;
        this.createTime = Date.now();
        this.jackpot = opts.jackpot || 0;                                               // 基础奖池
        if (
            [
                GameNidEnum.slots777,
                GameNidEnum.xiyouji,
                GameNidEnum.att,
                GameNidEnum.pharaoh,
                GameNidEnum.BingoMoney
            ].includes(this.nid)
        ) {
            this.runningPool = (opts.runningPool == 0 || opts.runningPool == null) ? -500000 : opts.runningPool;
        } else {
            this.runningPool = opts.runningPool || 0;                                   // 流水池
        }

        // this.profitPool = opts.profitPool || 0;                                         // 盈利池 净利润
        this.boomNum = opts.boomNum || 0;                                                // 房间爆机次数
        this.open = opts.open || true;                                                   //房间是否打开
        this.jackpotShow = opts.jackpotShow || { otime: 0, show: 0, rand: 0, ctime: 0 };   // 奖池显示配置
        this.entryCond = opts.entryCond || 0;                                            // 进入金币要求
        this.kind = opts.kind || 0;
        this.maxCount = get_games(this.nid).roomUserLimit;
    }

    /**
     * 获取当前房间里的玩家
     * @param uid 
     */
    getPlayer(uid: string) {
        return this.players.find(m => m && m.uid == uid);
    }
    /**
     * 
     * @param uid 提出消息通道
     */
    kickOutMessage(uid: string) {
        const member = this.channel.getMember(uid);
        member && this.channel.leave(member.uid, member.sid);
        // this.kickOutMessageBet(uid);
    }

    /**
     * 
     * @param uid 提出消息通道(下注专用通道)
     */
    // kickOutMessageBet(uid: string) {
    //     //把玩家从消息通道删除
    //     if (!this.channelBet) return;
    //     const member = this.channelBet.getMember(uid);
    //     member && this.channelBet.leave(member.uid, member.sid);
    // }

    /**
     * 
     * @param player 加入消息通道
     */
    addMessage(player: T) {
        player.isRobot === RoleEnum.REAL_PLAYER && logger.debug(`${pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 开始`);

        const member = this.channel.getMember(player.uid);

        try {
            // 是否在房间频道
            if (member) {
                logger.info(`${pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 已经在通道里面`);
                return;
            }

            if (!player.sid) {
                logger.warn(`${pinus.app.getServerId()} | ${player.uid}`);
            }

            // 添加进频道
            // if (player.isRobot == RoleEnum.REAL_PLAYER) {
            if (!this.channel.add(player.uid, player.sid)) {
                logger.warn(`${pinus.app.getServerId()} |${player.uid}|${JSON.stringify(player.sid)}`);
            }
            // }

            // player.isRobot !== RoleEnum.ROBOT && this.addMessageBet(player);
        } catch (e) {
            logger.error(`${pinus.app.getServerId()} | ${this.nid} | 加入房间消息通道 | ${this.roomId} | 玩家 uid:${player.uid} | isRobot: ${player.isRobot} | 出错: ${e.stack}`);
        }
    }

    /**
     * 
     * @param player 加入消息通道(下注专用)
     */
    // addMessageBet(player: T) {
    //     if (!this.channelBet) {
    //         return;
    //     }
    //     const member = this.channelBet.getMember(player.uid);

    //     if (!member && player.sid) {
    //         if (!this.channelBet.add(player.uid, player.sid)) {
    //             logger.error(`${pinus.app.getServerId()} |${JSON.stringify(player)}`);
    //         }
    //     }

    // }

    /**
     * 是否满员
     */
    isFull() {
        return this.players.filter(p => !!p).length >= this.maxCount;
    }

    /**
     * 
     * @param route 
     * @param parameter 
     */
    channelIsPlayer(route: string, parameter) {
        let uids: { uid: string, sid: string }[] = [];
        let RobotUids: string[] = [];

        let startIdx = this.nid === "17" ? 1 : 0;

        for (const pl of this.players.slice(startIdx)) {
            if (pl) {
                if (pl.sid == "robot") {
                    RobotUids.push(pl.uid);
                } else {
                    uids.push({ uid: pl.uid, sid: pl.sid });
                }
            }
        }
        //推送广播
        // uids = uids.filter(m => !!m);
        if (uids.length !== 0) {
            pinus.app.channelService.pushMessageByUids(route, parameter, uids, (err, fails) => {
                if (!!err) {
                    console.error('Push Message error! %j', err.stack);
                }
            });
        }

        // this.channel.getMembers()
        // if (this[channel_].getMembers().length > 0) {
        //     this[channel_].pushMessage(route, parameter);
        // }

        // //如果是机器人就采用emit的方法
        for (const uid of RobotUids) {
            globalEvent.emit("doForward", uid, route, parameter);
        }

    }
    /**
     * 
     * @param player 断线恢复
     */
    offLineRecover(player: T) {
        logger.info(this.sceneId, this.nid, this.roomId, '恢复断线重连', player.uid);
        player.onLine = true;
        player.isOnLine = false;
        // 添加到消息通道
        this.addMessage(player);
    }

    // abstract addPlayerInRoom(dbplayer);
    addPlayerInRoom(dbplayer) { return false }
    wait() { };

    /**
     * 有的游戏有自己的 清理玩家逻辑 只实现清理功能
     * 删除 对应 game scene room里面uid 
     * 清理 玩家状态,在线集合
    */
    async kickingPlayer(backendServerId: string, players: PlayerInfo[]) {
        if (!players.length) return Promise.resolve();
        for (const pl of players) {
            try {
                //玩家退出房间, 把玩家从房间的 users 里面删除掉，通知有人离开房间了
                await PlayersInRoomDao.delete(backendServerId, this.roomId, pl.uid, pl.isRobot);

                if (pl.isRobot === RoleEnum.REAL_PLAYER) {
                    await PlayerManagerDao.updateOne({ uid: pl.uid }, { position: PositionEnum.BEFORE_ENTER_Game, kickedOutRoom: true, abnormalOffline: false });
                } 

            } catch (err) {
                logger.warn(`${backendServerId} | 游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 检测玩家状态 ${pl.uid} 并踢出 | 出错:${err.stack}`);
            } finally {
                // 减少在线玩家数量
                await decreaseByServerId(backendServerId);
            }
        }
        return Promise.resolve();
    };

    /**
     * 将玩家踢出消息通道
     * @param {string} uid 玩家编号
     */
    public kickOutPlayerFromMessageChannel(uid: string) {
        const member = this.channel.getMember(uid);
        member && this.channel.leave(member.uid, member.sid);

        // if (!this.channelBet) return;
        // const memberInfo = this.channelBet.getMember(uid);
        // memberInfo && this.channelBet.leave(memberInfo.uid, memberInfo.sid);
    }

    /**
     * 更新回合id
     */
    protected updateRoundId() {
        this.roundId = genRoundId(this.nid, this.roomId);
    }

    /**
     * 更新真实玩家数量
     */
    public updateRealPlayersNumber() {
        this.realPlayersNumber = this.players.filter(pl => pl && pl.isRobot === RoleEnum.REAL_PLAYER).length;
    }

    /**
     * 提出离线玩家和警告超时玩家
     * @param players 玩家列表
     * @param exitUpperLimit 退出回合
     * @param warnUpperLimit 警告回合
     * @param onlineProperty 表示离线的字段（因游戏实现而异
     */
    public async kickOfflinePlayerAndWarnTimeoutPlayer(players: PlayerInfo[], exitUpperLimit, warnUpperLimit: number) {
        const { offlinePlayers, warnPlayers } = this.getOfflineAndTimeoutPlayers(players,
            exitUpperLimit, warnUpperLimit);

        // 发送警告消息
        warnPlayers.forEach(p => this.sendTimeoutWarning(p, exitUpperLimit));
        // 发送退出消息
        offlinePlayers.forEach(p => this.sendExitMsg(p));

        // 更新数据（前端需要切换场景）
        await this.kickingPlayer(pinus.app.getServerId(), offlinePlayers);

        return offlinePlayers;
    }

    /**
     * 房间关闭
     */
    public sendRoomCloseMessage() {
        this.channelIsPlayer(RobotMessage.ROOM_CLOSE, {});
    }


    /**
     * 踢出超时玩家
     * @param players
     */
    public async kickTimeoutPlayers(players: PlayerInfo[]) {
        players.forEach(p => this.sendExitMsg(p));

        // 更新数据
        await this.kickingPlayer(pinus.app.getServerId(), players);
    }

    /**
     * 获取离线玩家和超时玩家
     * @param players 玩家列表 可能玩家列表实现不同 这里必须由调用处传入
     * @param exitUpperLimit 退出回合 如果小于等于0 则不解析
     * @param warnUpperLimit 警告回合
     */
    private getOfflineAndTimeoutPlayers(players: PlayerInfo[], exitUpperLimit, warnUpperLimit: number) {
        const offlinePlayers = [], warnPlayers = [];

        players.forEach(p => {
            if (!p) {
                return;
            }

            // 如果不在线
            if (!p.onLine) {
                offlinePlayers.push(p);
                return;
            }

            if (exitUpperLimit <= 0) {
                return;
            }

            if (p.standbyRounds >= warnUpperLimit) {
                p.standbyRounds >= exitUpperLimit ? offlinePlayers.push(p) : warnPlayers.push(p);
            }
        });

        return { offlinePlayers, warnPlayers };
    }


    /**
     * 给单个玩家发送超时警告
     * @param player  玩家
     * @param exitUpperLimit 推出警告
     */
    private sendTimeoutWarning(player: PlayerInfo, exitUpperLimit: number) {
        const warnMessage = {
            msg: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1005,
                exitUpperLimit - player.standbyRounds, exitUpperLimit)
        }
        const member = this.channel.getMember(player.uid);

        member && pushMessageByUids(`${this.nid}_playerTimeOut`, warnMessage, member);
    }

    /**
     * 发送退出消息
     * @param player
     */
    private sendExitMsg(player: PlayerInfo) {
        const member = this.channel.getMember(player.uid);
        member && pushMessageByUids(`${this.nid}_playerExit`, {}, member);
    }

    public destroy() {

    }

    init() { }
}
