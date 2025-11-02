import { BaseRobot } from "../../../common/pojo/baseClass/BaseRobot";
import * as CommonUtil from "../../../utils/lottery/commonUtil";
import {MsgRoute, RoomState} from '../../../servers/andarBahar/lib/constants';
import { splitBetGold } from "../../../servers/andarBahar/lib/util/robotUtil";
import { getLogger } from 'pinus-logger';

const robotlogger = getLogger('robot_out', __filename);
/**
 * 请求路由
 */
enum RequestRoute {
    bet = 'andarBahar.mainHandler.bet',
    skip = 'andarBahar.mainHandler.skip',
    load = 'andarBahar.mainHandler.load'
}

/**
 * 猜AB机器人
 */
export default class AndarBaharRobot extends BaseRobot {
    playerGold: number = 0;
    /**当前轮数 */
    playRound: number = 0;
    /**离开轮数 */
    leaveRound: number = CommonUtil.randomFromRange(10, 20);
    betLowLimit: number;
    betGold: number = 0;

    constructor(opts) {
        super(opts);
        this.betLowLimit = opts.betLowLimit;                        // 可下注的最少金币
    }

    /**
     * 加载
     */
    async load() {
        const data = await this.requestByRoute(RequestRoute.load, {});

        if (data.state === RoomState.BET) {
            this.bet(data);
        }
    }

    /**
     * 离开
     */
    async destroy() {
        await this.leaveGameAndReset();
    }

    /**
     * 注册通知
     */
    registerListener() {
        // 开始下注通知
        this.Emitter.on(MsgRoute.START_BET_STATE, (data) => this.bet(data));
        // 监听再次下注通知
        this.Emitter.on(MsgRoute.START_SECOND_BET_STATE, (data) => this.bet(data, true));
        this.Emitter.on(MsgRoute.GO_OUT, (data) => this.destroy());
        this.Emitter.on(MsgRoute.START_SETTLEMENT_STATE, (data) => this.settlement(data));
    }

    /**
     * 下注
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async bet(data: { countdown: number }, secondBet: boolean = false) {
        // 如果是再次下注 则只有百分之15的概率让他继续操作
        if (secondBet && Math.random() > 0.15) {
            // 如果下注过则跳过
            if (this.betGold > 0) {
                let delayTime = CommonUtil.randomFromRange(1000, 3000);
                // 延迟跳过
                await this.delayRequest(RequestRoute.skip, {}, delayTime);
            }

            return;
        }

        this.betGold = 0;

        // 离开条件
        if ((this.playRound > this.leaveRound || this.playerGold < this.betLowLimit) && !secondBet) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const { betType, betGold } = splitBetGold(this.playerGold - this.betLowLimit, this.sceneId);

        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 3000);

        try {
            // 下注
            await this.delayRequest(RequestRoute.bet, { bets: { [betType]: betGold } }, delayTime);
            // 减金币
            this.playerGold -= betGold;

            this.betGold = betGold;
        } catch (error) {
            robotlogger.info(`猜AB下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`, 'info');
        }

        this.playRound++;
    }

    settlement(data) {
        // 开启结算状态
        const me = data.gamePlayers.find(p => p.uid === this.uid);

        if (me) {
            this.playerGold = me.gold;
        }
    }
}
