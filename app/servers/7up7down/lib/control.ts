import Room from './up7Room';
import {filterProperty} from "../../../utils";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {BetAreas} from "./up7Const";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 7up7down调控实现
 */
export default class SicBoControl extends BaseGameControl {
    room: Room;

    constructor({ room }: { room: Room }) {
        super({ room });
    }

    public async result() {
        // 没真人押注则随机开奖
        if (this.stripPlayers().length === 0) {
            return this.room.randomLotteryResult();
        }


        // 个控
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        let killAreas = [];

        // 如果有个控玩家
        if (players.length) {
            // 判断是否必杀
            killAreas = this.getKillAreas(players);

            // 如果不不杀 走个控
            if (killAreas.length === 0) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    return this.room.personalControlResult(controlPlayers, state);
                }
            }
        }


        return this.room.sceneControlResult(sceneControlState, killAreas, isPlatformControl);
    }

    /**
     * 是否必杀玩家
     * @param players 调控玩家
     */
    private getKillAreas(players: PersonalControlPlayer[]): string[] {
        // 是否必杀
        let overrunBetAreas: Set<string> = new Set();
        const controlUidList = [];

        for (let controlPlayer of players) {
            // 为0 则跳过
            if (controlPlayer.killCondition === 0) {
                continue;
            }

            // 获取一个玩家
            const player = this.room.getPlayer(controlPlayer.uid);

            // 这里必杀条件表示为100 时表示的是前端100金币 所以要 乘100
            const killCondition = controlPlayer.killCondition * 100;

            // 获取一个押注超限的区域
            const areas: string[] = player.getOverrunBetAreas(killCondition);

            if (areas.length) {
                controlUidList.push(controlPlayer.uid);
                areas.forEach(area => overrunBetAreas.add(area));
            }


        }

        if (overrunBetAreas.size === 0) {
            return [];
        }

        // 如果超限区域同时包含AA或者CC 则 选取其中调控玩家押注大的杀 相同则随机杀一个
        if (overrunBetAreas.has(BetAreas.AA) && overrunBetAreas.has(BetAreas.CC)) {
            let aAreaTotalBet = 0, cAreaTotalBet = 0;

            for (let controlPlayer of players) {
                const bets = this.room.getPlayer(controlPlayer.uid).bets;
                aAreaTotalBet += bets[BetAreas.AA].bet;
                cAreaTotalBet += bets[BetAreas.CC].bet;
            }

            if (aAreaTotalBet === cAreaTotalBet) {
                Math.random() > 0.5 ? overrunBetAreas.delete(BetAreas.AA) : overrunBetAreas.delete(BetAreas.CC);
            } else {
                aAreaTotalBet > cAreaTotalBet ? overrunBetAreas.delete(BetAreas.CC) : overrunBetAreas.delete(BetAreas.AA);
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return [...overrunBetAreas];
    }


    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => (p.isRobot === 0 && p.bet > 0)).map(p => filterProperty(p));
    }
}