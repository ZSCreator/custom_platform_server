import Room from './ttzRoom';
import {filterProperty} from "../../../utils";
import player from "./ttzPlayer";
import {ControlPlayer, ControlResult, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";

/**
 * 推筒子调控实现
 */
export default class ControlImpl extends BaseGameControl {
    room: Room;
    isControl: boolean = false;

    constructor(params: { room: Room }) {
        super(params);
    }

    init() {
        this.isControl = false;
    }

    public async result() {
        this.init();
        // 如果没有真人玩家下注或者真人玩家当庄不调控
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();

        // 如果是场控必然调控 所以接下来不必判断场控的情况 只用判断其他形式
        if (controlResult.sceneControlState !== ControlState.NONE) {
            this.isControl = true;
        }


        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }


    /**
     * 系统庄
     * @param params
     */
    private systemBanker({ personalControlPlayers: players, sceneControlState, isPlatformControl }: ControlResult) {
        if (players.length > 0) {
            // 是否满足必杀条件
            // 如果并标记必杀区域 标记的区域必杀 然后其余其余走场控
            const isKill = this.checkKillPlayers(players);

            // 如果调控玩家都不满足必杀条件则判断有个控玩家
            if (!isKill) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    this.isControl = true;
                    // 返回个控结果
                    return this.room.personalControlLottery(controlPlayers, state);
                }
            } else {
                this.isControl = true;
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControlLottery(sceneControlState, isPlatformControl);
    }

    /**
     * 玩家庄
     * @param params
     */
    private playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }: ControlResult) {
        // 玩家是否是个控玩家
        if (players.length > 0 && players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            const bankerControlInfo: PersonalControlPlayer | undefined = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);

            // 说明庄是调控玩家
            if (bankerControlInfo) {
                this.isControl = true;
                // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.PERSONAL);
                return this.room.bankerControlLottery(!(bankerControlInfo.probability >= 0));
            }
        }

        // 判断是否庄杀
        if (bankerKill) {
            this.isControl = true;
            // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.SCENE);
            return this.room.bankerControlLottery(false);
        }

        // 场控发牌
        return this.room.sceneControlLottery(sceneControlState, isPlatformControl);
    }

    /**
     * 是否必杀玩家
     * @param players 调控玩家
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        // 是否必杀
        let isKill: boolean = false;
        const controlUidList = [];

        for (let controlPlayer of players) {
            const player: player = this.room.getPlayer(controlPlayer.uid);

            if (controlPlayer.killCondition <= 0) {
                continue;
            }

            const condition = controlPlayer.killCondition * 100;

            // 获取押注超限的区域
            const transfiniteAreas: string[] = player.checkOverrunBet(condition);

            // 如果有押注超限的则标记
            if (transfiniteAreas.length > 0) {
                controlUidList.push(controlPlayer.uid);
                isKill = true;
                // 标记必杀区域
                this.room.markKillArea(transfiniteAreas);
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 包装有押注或者为庄的真实玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => {
            return p.isRobot === RoleEnum.REAL_PLAYER && (p.uid === this.room.zhuangInfo.uid || p.bet > 0);
        }).map(p => filterProperty(p));
    }
}
