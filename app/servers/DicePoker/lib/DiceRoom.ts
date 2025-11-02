import { pinus } from 'pinus';
import DicePlayer from './DicePlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds } from "../../../services/newControl/constants";
import roomManager from './DiceRoomMgr';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import Dice_logic = require("./Dice_logic");
import Control from "./control";

/**等待准备时间 */
const WAIT_TIME = 3000;
/**发话时间 */
const AUTO_TIME = 90;
const CC_DEBUG = true;
/**
 * 游戏房间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class landRoom extends SystemRoom<DicePlayer> {
    entryCond: number;
    /**底注 */
    lowBet: number;
    /**最大回合次数 */
    maxRound = 14;
    /**已经多少轮游戏了 */
    roundTimes: number = 1;
    /** 开局摇骰子 游戏中*/
    status: 'NONE' | 'INWAIT' | 'startNextHand' | 'INGAME' = 'INWAIT';
    /**记录开始等待时候的时间 */
    lastWaitTime: number = 0;
    /**记录开始发话时候的时间 */
    lastFahuaTime: number = 0;
    /**自动操作倒计时 */
    auto_delay = AUTO_TIME;
    /**一局的历史记录 */
    record_history = { banker_uid: "", oper: [], info: [] };

    waitTimeout: NodeJS.Timer = null;

    /**玩家列表 */
    players: DicePlayer[] = new Array(2).fill(null);

    /**开始一局游戏的时间 */
    startGameTime: number = 0;
    endTime: number;
    zipResult: string = '';
    countdown: number;
    Oper_timeout: NodeJS.Timeout;
    banker: DicePlayer = null;
    /**开局骰子 */
    setSice: number[];
    /**当前骰子 */
    curr_DiceList: number[] = [];
    /**当前保存骰子 */
    save_DiceList: number[] = [];
    curr_doing_seat: number;
    /** 调控值 */
    controlNum: number = 0;
    control: Control;

    constructor(opts: any) {
        super(opts);
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 50; // 底注
        this.Initialization();
        this.control = new Control({ room: this });
    }

    Initialization() {
        this.roundTimes = 1;
        this.lastFahuaTime = 0;
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.startGameTime = 0;
        this.setSice = [];
        this.banker = null;
        this.battle_kickNoOnline();
        this.status = "INWAIT"; // 等待玩家准备
        this.controlNum = 0;
        this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
    }
    /**添加玩家 */
    addPlayerInRoom(dbplayer) {
        const playerInfo = this.getPlayer(dbplayer.uid);
        // 如果玩家在房间中说明是掉线
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }

        // 如果房间已满
        if (this.isFull())
            return false;

        // 给玩家选一个空座位 空位置压入数组
        const indexArr: number[] = [];
        this.players.forEach((m, i) => !m && indexArr.push(i));

        // 数组中随机一个位置
        const i = indexArr[utils.random(0, indexArr.length - 1)];
        this.players[i] = new DicePlayer(i, dbplayer);
        // 添加到消息通道
        // this.addMessage(dbplayer);
        this.channelIsPlayer("Dice.addpl", this.players[i].strip());
        return true;
    }

    /**断线恢复 */
    async offLineRecover(playerInfo: DicePlayer) {
        // 把玩家状态设置为在线 托管状态设置为取消托管
        playerInfo.onLine = true;

        // 添加到消息通道
        this.addMessage(playerInfo);
    }

    /**
     * 有玩家离开 isOffLine代表是否断线 断线则不删除玩家
     * @param player 
     * @param isOffLine true是离线
     */
    leave(playerInfo: DicePlayer, isOffLine: boolean) {
        /**先踢出玩家通道 */
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        const opts = { uid: playerInfo.uid, seat: playerInfo.seat };
        this.channelIsPlayer('Dice.onExit', opts);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**获取等待状态的时间 */
    getWaitTime() {
        return this.countdown;
    }

    /**等待玩家准备 */
    wait(playerInfo?: DicePlayer) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('Dice.onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备 5s内就不重复通知玩家
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`Dice.onWait`, { waitTime }, member);
            }
            return;
        }

        this.channelIsPlayer('Dice.onWait', { waitTime: WAIT_TIME });

        // 最后一次通知玩家准备的时间
        this.lastWaitTime = Date.now();

        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => !!pl);
            if (list.length == 2) {
                this.handler_start();
            } else {
                this.channelIsPlayer('Dice.onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }

    /**通知开始游戏 */
    handler_start() {
        this.startGameTime = Date.now();
        // this.updateRoundId();
        this.status = "startNextHand"; // 开始新的一轮游戏
        console.warn(this.nid, this.roomId, this.roundId, this.status);
        this.lastFahuaTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.players.forEach(pl => pl && (pl.initGame()));
        this.banker = null;
        this.setSice = Dice_logic.GetTwoDice();
        if (this.setSice[0] > this.setSice[1]) {
            this.banker = this.players[0];
        } else {
            this.banker = this.players[1];
        }

        let opts = {
            plys: this.players.map(pl => pl && pl.strip()),
            roundTimes: this.roundTimes,
            roundId: this.roundId,
            setSice: this.setSice,
            banker: this.banker.uid,
        };

        this.channelIsPlayer("Dice.startNextHand", opts);
        this.countdown = 6;
        let Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                this.status = "INGAME";
                CC_DEBUG && console.warn(this.roundId, this.roomId, "startNextHand", utils.cDate());
                clearInterval(Oper_timeout);
                this.Oper_timeout = null;
                this.set_next_doing_seat(this.banker.seat);
            }
        }, 1000);
    }
    /**通知所有玩家 正在说话的玩家 且重置定时器*/
    set_next_doing_seat(doing: number) {
        const playerInfo = this.players[doing];
        playerInfo.state = "PS_OPER";
        this.curr_doing_seat = doing;
        playerInfo.Number_draws = 3;
        this.curr_DiceList = [0, 0, 0, 0, 0];
        this.save_DiceList = [0, 0, 0, 0, 0];
        // 记录发话时候的时间
        this.lastFahuaTime = Date.now();
        let opts = {
            curr_doing_seat: doing,
            uid: playerInfo.uid,
            auto_time: this.auto_delay
        }
        this.channelIsPlayer("Dice.onFahua", opts);
        /**记录轮数 每轮bet重置 */
        if (this.banker.seat != playerInfo.seat) {
            this.roundTimes++;
        }
        // 时间到了 视为弃牌 下一位继续发话
        this.handler_pass();
    }
    /**重置发话时间 如果时间到了 就直接跳到下一个发话 */
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        this.countdown = this.auto_delay;
        this.Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                this.players[this.curr_doing_seat].status = "FOLD";
                this.checkHasNextPlayer();
            }
        }, 1000);
        // return ms;
    }

    /**结算 */
    async handler_complete() {
        console.warn(this.nid, this.roomId, "handler_complete");
        this.curr_doing_seat = -1;
        clearTimeout(this.Oper_timeout);
        this.countdown = 10;
        // CC_DEBUG && console.warn(this.roundId, this.roomId, this.status, utils.cDate());
        if (this.players.some(c => c.status == "FOLD")) {
            for (const pl of this.players) {
                if (pl.status == "FOLD") {
                    pl.profit = -this.lowBet;
                } else {
                    pl.profit = this.lowBet;
                }
            }
        } else {
            if (this.players[0].totalPoint > this.players[1].totalPoint) {
                this.players[0].profit = this.lowBet;
                this.players[1].profit = -this.lowBet;
            } else {
                this.players[1].profit = this.lowBet;
                this.players[0].profit = -this.lowBet;
            }
        }

        for (const pl of this.players) {
            pl && await pl.updateGold(this);
        }
        this.record_history.banker_uid = this.banker.uid;
        this.record_history.info = this.players.map(c => {
            if (c) {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    profit: c.profit,
                    // HoleCard: c.HoleCard,
                    // bet_mul: c.bet_mul,
                    // Grab_num: c.Grab_num
                }
            }
        });
        for (const pl of this.players) {
            pl && await pl.only_update_game(this);
        }
        const opts = {
            players: this.players.map(pl => {
                if (pl)
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        totalPoint: pl.totalPoint,
                        // bet_mul: pl.bet_mul,
                        profit: pl.profit,
                        gold: pl.gold
                    }
            }),
        };
        this.channelIsPlayer("Dice.sendResult", opts);
        this.Initialization();
    }
    /**检查 是不是还剩最后一个人了 就直接获胜 */
    checkHasNextPlayer() {
        let doing = this.nextFahuaIdx();
        if (this.roundTimes >= this.maxRound || this.players.some(c => c.status == "FOLD")) {
            return this.handler_complete();
        } else {
            this.set_next_doing_seat(doing);
        }
    }
    /**
     * 下一个玩家 找不到玩家返回-1
     */
    nextFahuaIdx() {
        if (this.curr_doing_seat == 0) {
            return 1;
        }
        return 0;
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: DicePlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            // this.leave(pl, false);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }

    /**
     * 个人调控
     * @param controlPlayers
     */
    personalControl(controlPlayers: PersonalControlPlayer[]) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        this.controlNum = controlPlayers[0].probability;
    }

    /**
     * 总控
     * @param sceneWeights 调控权重
     * @param isPlatformControl 是否是平台调控
     */
    sceneControl(sceneWeights: number, isPlatformControl: boolean) {
        const realPlayer = this.players.find(p => p.isRobot === RoleEnum.REAL_PLAYER);
        const controlType = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        realPlayer.setControlType(controlType);
        this.controlNum = sceneWeights;
    }
}

