import {FishPrawnCrabRoomImpl} from './FishPrawnCrabRoomImpl';
import {filterProperty} from "../../../utils";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {AREA} from "./FishPrawnCrabConst";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 鱼虾蟹调控实现
 */
export default class Control extends BaseGameControl {
    room: FishPrawnCrabRoomImpl;

    constructor({room}: { room: FishPrawnCrabRoomImpl }) {
        super({room});
    }

    public async result(): Promise<LotteryResult> {
        // 没真人押注则随机开奖
        if (this.stripPlayers().length === 0) {
            return this.room.randomLotteryResult();
        }

        // 个控
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        // 如果有个控玩家
        if (players.length) {
            // 判断是否必杀
            const killAreas = this.checkKillPlayers(players);

            if (killAreas.size > 0) {
                this.room.setKillAreas(killAreas);
            } else {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    // 标记玩家
                    return this.room.personalControlResult(controlPlayers, state);
                }
            }
        }


        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }

    /**
     * 判断玩家的是否满足必杀条件
     */
    private checkKillPlayers(players: PersonalControlPlayer[]):  Set<string>{
        let statisticalRes = {};
        const controlUidList = [];

        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }

            const player = this.room.getPlayer(controlPlayer.uid);
            const areas = player.checkOverrunBet(controlPlayer.killCondition * 100);


            if (Object.keys(areas).length) {
                controlUidList.push(controlPlayer.uid);
            }


            for (let key in areas) {
                if (!statisticalRes[key]) {
                    statisticalRes[key] = 0;
                }

                statisticalRes[key] += areas[key];
            }
        }

        const keys = Object.keys(statisticalRes);
        const killAreas: Set<string> = new Set();

        const baseElement =  [AREA.HL, AREA.PX, AREA.FISH, AREA.GOLD, AREA.JI, AREA.XIA];
        const containsRes = keys.filter(e => baseElement.includes(e));
        const noContainsRes = keys.filter(e => !baseElement.includes(e) && e !== AREA.ONE);

        // 如果有围骰必杀则优先
        if (keys.includes(AREA.ONE)) {
            killAreas.add(AREA.ONE);

            noContainsRes.forEach(e => {
                const sp = e.split('_');
                sp.forEach(key => statisticalRes[key] += statisticalRes[e]);
            })

            // 如果至少有个必杀元素 则取押注最多的四个元素必杀
            if (containsRes.length >= 5) {
                containsRes.map(e => {
                    return {name: e, num: statisticalRes[e]};
                }).sort((x, y) => y.num - x.num)
                    .slice(0, 4)
                    .map(e => e.name)
                    .forEach(e => killAreas.add(e));
            } else {
                containsRes.forEach(e => killAreas.add(e));
                noContainsRes.forEach(e => killAreas.add(e));
            }
        } else {
            if (containsRes.length > 5) {
                containsRes.map(e => {
                    return {name: e, num: statisticalRes[e]};
                }).sort((x, y) => y.num - x.num)
                    .slice(0, 5)
                    .map(e => e.name)
                    .forEach(e => killAreas.add(e));
            } else {
                containsRes.forEach(e => killAreas.add(e));
                noContainsRes.forEach(e => killAreas.add(e));
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return killAreas;
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => (p.isRobot === RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => filterProperty(p));
    }
}