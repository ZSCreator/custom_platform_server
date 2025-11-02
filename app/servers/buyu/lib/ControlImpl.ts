import Player from "./Player";
import {cancelJob, scheduleJob} from "pinus-scheduler";
import Room from "./Room";
import {filterProperty} from "../../../utils";
import {SlotGameControl} from "../../../domain/CommonControl/slotGameControl";
import {LimitConfigManager} from "./limitConfigManager";
import {ControlPlayer, ControlResult} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";

/**
 *捕鱼调控实现
 */
export default class ControlImpl extends SlotGameControl<LimitConfigManager> {
    limitManager: LimitConfigManager = LimitConfigManager.getInstance();
    scheduleJobId: number = null;
    room: Room;
    controlResult: ControlResult;

    constructor(params: { room: Room }) {
        super({ game: { nid: params.room.nid, sceneId: params.room.sceneId } });
        this.room = params.room;
    }

    /**
     * 运行调控
     * @param currPlayer 玩家
     * @param profit 预获收益
     * @param fishMultiple 鱼的倍率
     */
    runControl(currPlayer: Player, profit: number, fishMultiple: number) {
        let playerRate = 0, sceneWights = 0;

        if (this.controlResult) {
            const {personalControlPlayers, isPlatformControl, sceneControlState} = this.controlResult;
            const player = personalControlPlayers.find(p => p.uid === currPlayer.uid);
            if (player) playerRate = player.probability;
            sceneWights = this.controlResult.sceneWeights;

            if (isPlatformControl && sceneControlState !== ControlState.NONE) {
                sceneWights = sceneControlState === ControlState.SYSTEM_WIN ? 100 : -80;
            }
        }

        // 计算这次具体收益
        const { isOverrun }: { isOverrun: boolean } =
            this.isEarningsTransfinite({ player: currPlayer, profit });

        let rate_low = 1;

        // 如果超限 根据鱼的倍数计算限制多少
        if (isOverrun) {
            rate_low = calculateLimit(fishMultiple);
            currPlayer.setControlType(ControlKinds.SCENE);
        }

        // 优先个控
        if (playerRate !== 0) {
            currPlayer.setControlType(ControlKinds.PERSONAL);
            return calculateControlPro(playerRate) * rate_low * (1 / fishMultiple);
        }

        if (sceneWights !== 0) {
            currPlayer.setControlType(this.controlResult.isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE);
        }

        // 场控
        return  calculateControlPro(sceneWights) * rate_low * (1 / fishMultiple);
    }

    /**
     * 定时获取调控方案配置
     */
    public controlPlanTimer() {
        // 如果已经开启则不执行
        if (this.scheduleJobId) {
            return;
        }

        /**
         * 这里定时请求是一种取舍
         * 目前降低rpc的请求有两种方案
         * 方案一:
         *      定时请求，也就是目前这种 鉴于调控数据不会在短时间内发生太大的变化，
         *      而每一颗子弹都请求调控数据的并发量实在过高
         *      （自动情况下一秒十发， 一个房间4人， 最坏打算一个房间能同时造成一秒40次的并发量。而550个房间都坐满且自动发送子弹的情况可以形成1s 2000个的并发量）
         *      而定时请求不管在什么时候请求间隔都是固定的,不管什么时间间隔内一个房间只有一个并发
         *      但也是一种缺点 玩家呆在房间，十秒打一颗子弹，每秒一个房间还是有一个请求，50个房间一秒也有50个并发请求，不管玩家玩没有玩都会请求，造成资源浪费
         *      优点： 请求稳定
         *      缺点： 当原始并发量低的情况下有资源浪费的情况
         * 方案二:
         *      发送了N次子弹后再进行一次请求。
         *      eg：（发送10颗子弹后再进行请求调控数据, 一个房间4人，同时1秒钟发射4次，50个房间都坐满且自动发送子弹的情况下，一秒会有200个并发
         *      而在玩家十秒打一颗子弹，一个房间4个玩家 25秒才会有一个请求。
         *      但同时也有一个缺点，调控数据的滞后，后台调控数据已经改变，但玩家发送的子弹还没有满足条件。数据一直没有更新）
         *      优点： 不会有资源浪费
         *      缺点： 数据滞后，并发量高时方案一请求量更少
         */
        this.scheduleJobId = scheduleJob({ period: 2000 }, async () => {
            this.controlResult = await this.getControlResult();
        });
    }

    /**
     * 取消定时器
     */
    public cancelTimer() {
        cancelJob(this.scheduleJobId);
        this.scheduleJobId = null;
    }

    /**
     * 获取调控玩家
     */
    stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => !!p && p.isRobot === 0).map(p => filterProperty(p));
    }
}


/**
 * 根据概率
 * @param fishMultiple 鱼的概率
 */
function calculateLimit(fishMultiple: number) {
    if (fishMultiple <= 10) {
        return 0.5;
    } else if (fishMultiple <= 20) {
        return 0.4;
    } else if (fishMultiple <= 50) {
        return 0.3;
    } else {
        return 0;
    }
}

/**
 * 计算调控值的对中鱼概率的影响
 * @param value 取值范围为 [-100, 100]
 */
function calculateControlPro(value) {
    if (value === 0) {
        return 1;
    }

    if (value > 0) {
        return (100 - value) / 2 / 100
    }

    if (value < 0) {
        return (Math.abs(value) + 100) * 1.5 / 100;
    }

    if (value === 100) {
        return 0;
    }

    if (value === -100) {
        return 200;
    }
}