import {filterProperty} from "../../../utils";
import {BaiRenPlayerImpl as Player} from "./BaiRenPlayerImpl";
import {BaiRenRoomImpl as Room} from "./BaiRenRoomImpl";
import {CommonControlState} from "../../../domain/CommonControl/config/commonConst";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, ControlResult, PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";

/**
 * 百人牛牛调控
 */
export default class ControlImpl extends BaseGameControl {
    room: Room;
    constructor(params: { room: Room }) {
        super(params);
    }

    async runControl(): Promise<any> {
        // 如果没有真人玩家押注随机发牌
        if (this.stripPlayers().length === 0) {
            return this.room.randomDeal();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();

        // 真人玩家当庄
        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }

    /**
     * 系统当庄
     */
    private systemBanker({personalControlPlayers: players, sceneControlState, isPlatformControl}: ControlResult) {
        if ( players.length > 0) {
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
                    const {state, controlPlayers} = this.chooseControlPlayerAndControlState(needControlPlayers);

                    // 标记玩家
                    this.room.setPlayersState({ players: controlPlayers, state});
                    return this.room.personalDealCards(state);
                }
            }
        }

        // 进入场控
        return this.room.controlDealCards(sceneControlState, isPlatformControl);
    }

    /**
     * 玩家当庄
     */
    private playerBanker({personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl}: ControlResult) {
        // 玩家是否是个控玩家
        if (players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            const bankerControlInfo: PersonalControlPlayer | undefined = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);


            // 说明庄是调控玩家
            if (bankerControlInfo) {
                // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
                const state = bankerControlInfo.probability > 0 ? ControlState.SYSTEM_WIN : ControlState.PLAYER_WIN;
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.PERSONAL);
                return this.room.controlDealCards(state, false);
            }
        }

        // 判断是否庄杀
        if (bankerKill) {
            // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.SCENE);
            return this.room.controlDealCards(ControlState.SYSTEM_WIN, false);
        }

        return this.room.controlDealCards(sceneControlState, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        // 筛选出真实玩家且压过注的玩家 或者等于庄
        return this.room.players.filter(p => (p.isRobot === RoleEnum.REAL_PLAYER) && (p.bet > 0 || p.uid === this.room.zhuangInfo.uid))
            .map(player => filterProperty(player));
    }

    /**
     * 判断玩家的是否满足必杀条件
     */
    private checkKillPlayers(players: PersonalControlPlayer[]): boolean {
        let isKill: boolean = false;
        const controlUidList = [];

        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }

            const player: Player = this.room.getPlayer(controlPlayer.uid);
            const areas: CommonControlState[] = player.checkOverrunBet({ condition: controlPlayer.killCondition });

            // 如果押注超限
            if (areas.some(area => area === CommonControlState.LOSS)) {
                controlUidList.push(controlPlayer.uid);
                isKill = true;
                // 标记必杀区域
                this.room.markKillArea(areas);
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }
}