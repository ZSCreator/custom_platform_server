import { BaseRobot } from "../../../common/pojo/baseClass/BaseRobot";
import * as CommonUtil from "../../../utils/lottery/commonUtil";
import * as mathUtil from "../../../utils/lottery/mathUtil";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import { MsgRoute, RoomState } from '../../../servers/fanTan/lib/constants';
import { splitBetGold } from "../../../servers/fanTan/lib/util/robotUtil";
import { get as getConfiguration } from "../../../../config/data/JsonMgr";

/**
 * 请求路由
 */
enum RequestRoute {
    bet = 'fanTan.mainHandler.bet',
    load = 'fanTan.mainHandler.load'
}

/**
 * 番摊机器人
 */
export default class FanTanRobot extends BaseRobot {
    playerGold: number = 0;
    /**当前轮数 */
    playRound: number = 0;
    /**离开轮数 */
    leaveRound: number = CommonUtil.randomFromRange(10, 20);
    betLowLimit: number;
    ChipList: number[];

    constructor(opts) {
        super(opts);
        this.betLowLimit = opts.betLowLimit;                        // 可下注的最少金币
    }

    /**
     * 加载
     */
    async load() {
        const sceneInfo = getConfiguration('scenes/fanTan').datas.find(scene => scene.id === this.sceneId);
        this.ChipList = sceneInfo.ChipList;
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
        this.Emitter.on(MsgRoute.START_SETTLEMENT_STATE, (data) => this.settlement(data));
    }

    /**
     * 下注
     * @param data
     */
    async bet(data: { countdown: number }) {
        // 毫秒
        const countdown = data.countdown;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTime = Date.now() + countdown - 1000;

        // 离开条件
        if (this.playRound > this.leaveRound || this.playerGold < this.betLowLimit) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const { betType, betArr } = splitBetGold(this.playerGold - this.betLowLimit, this.sceneId, this.ChipList);

        if (CommonUtil.isNullOrUndefined(betType) || CommonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return this.destroy();
        }
        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);

        let betCount = 0;

        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (Date.now() + delayTime >= stopBetTime || this.playerGold < this.betLowLimit) {
                break;
            }

            let bets: { [key: string]: number } = {};
            bets[betType] = betArr[i];

            betCount += betArr[i];

            if (this.playerGold < betCount) {
                break;
            }

            try {
                // 下注
                await this.delayRequest(RequestRoute.bet, { bets }, delayTime);
                // 减金币
                this.playerGold -= betArr[i];
            } catch (error) {
                robotlogger.warn(`番摊机器人下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error.message}`, 'info');
                break;
            }
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
