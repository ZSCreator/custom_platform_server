import BaiJiaRoomImpl from './BaiJiaRoomImpl';
import {filterProperty} from "../../../utils";
import {mapping} from "./baijiaConst";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlResult, PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";

/**
 * 百家调控实现
 * @property room 百家房间
 * @property isControl 是否调控
 */
export default class ControlImpl extends BaseGameControl {
    room: BaiJiaRoomImpl;
    isControl: boolean = false;

    constructor(params: { room: BaiJiaRoomImpl }) {
        super(params);
    }

    init() {
        this.isControl = false;
    }


    public async runControl() {
        this.init();
        // 没有真人玩家则走随机发牌
        if (this.stripPlayers().length <= 0) {
            return this.room.getNotContainKillAreaResult();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();

        // 如果是场控必然调控 所以接下来不必判断场控的情况 只用判断其他形式
        if (controlResult.sceneControlState !== ControlState.NONE) {
            this.isControl = true;
        }

        // 真人玩家当庄
        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }

    /**
     * 系统庄
     * @param params
     */
    private systemBanker({ personalControlPlayers: players, sceneControlState, isPlatformControl }: ControlResult) {
        // 查看是否有个控玩家
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
                    // 标记玩家
                    this.room.setPlayersState({ players: controlPlayers, state });
                    return this.room.personalDealCards({ state });
                }
            } else {
                this.isControl = true;
            }
        }


        // 场控方案 或者 正常发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }

    /**
     * 玩家庄
     * @param params
     */
    private playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }: ControlResult) {
        // 玩家是否是个控玩家
        if (players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            const bankerControlInfo: PersonalControlPlayer | undefined = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);

            // 说明庄是调控玩家
            if (bankerControlInfo) {
                // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
                this.isControl = true;

                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.PERSONAL);
                return this.room.controlDealCardsBanker({ bankerWin: !(bankerControlInfo.probability >= 0) });
            }
        }

        // 判断是否庄杀
        if (bankerKill) {
            this.isControl = true;
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.SCENE);
            // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
            return this.room.controlDealCardsBanker({ bankerWin: false });
        }

        // 场控发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }


    /**
     * 是否必杀玩家
     * @param players
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        // 是否必杀
        let isKill: boolean = false,
            // 超限区域统计
            transfinite = {};
        const controlUidList = [];

        for (let controlPlayer of players) {
            const player = this.room.getPlayer(controlPlayer.uid);

            // 获取押注超限的区域
            const transfiniteArea: object = player.checkOverrunBet({ condition: controlPlayer.killCondition });

            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }

            for (let area in transfiniteArea) {
                if (!transfinite[area]) transfinite[area] = 0;
                transfinite[area] += transfiniteArea[area];
            }
        }

        // 检查对压的区域 对压大的区域进行标记 相同则不进行标记
        for (let area in transfinite) {
            // 获取对压的区域
            const mappingArea = mapping[area];
            // 如果没有对压区域标记这个区域必杀
            if (!mappingArea) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }

            // 获取映射区的押注额
            const mappingBetNum = transfinite[mappingArea];

            // 如果映射区域没有必杀押注则直接标记
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }

            // 如果映射区域的押注额相等则直接跳过
            if (mappingBetNum === transfinite[area]) {
                delete transfinite[mappingArea];
                continue;
            }

            mappingBetNum > transfinite[area] ? this.room.addKillArea({ area: mappingArea }) :
                this.room.addKillArea({ area });

            isKill = true;
            delete transfinite[mappingArea];
        }

        // 如果必杀不开和
        if (isKill) {
            this.room.addKillArea({ area: 'draw' });
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): any[] {
        return this.room.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER && (p.bet > 0 || p.uid === this.room.zhuangInfo.uid))
            .map(p => filterProperty(p));
    }
}