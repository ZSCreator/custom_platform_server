import {filterProperty} from "../../../utils";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {Room} from './room';
import {LotteryUtil} from "./util/lotteryUtil";
import {BetAreasName} from "./config/betAreas";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 猜AB调控实现
 */
export default class AndarBaharControl extends BaseGameControl {
    room: Room;
    constructor(params: { room: Room }) {
        super(params);
    }

    public async runControl(lotteryUtil: LotteryUtil): Promise<LotteryUtil> {
        // 如果真人玩家押注等于零直接随机
        if (this.room.getRealPlayersTotalBet() === 0) {
            return this.room.randomLottery(lotteryUtil);
        }

        // 获取调控结果
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        if (players.length > 0) {
            // 获取满足必杀条件的区域
            const killAreas = this.getKillAreas(players);

            // 没有则尝试走个控逻辑
            if (killAreas.length === 0) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    // 个控玩家开奖
                    return this.room.personalControl(lotteryUtil, controlPlayers, state);
                }
            } else {
                lotteryUtil.setKillAreas(killAreas);
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControl(lotteryUtil, sceneControlState, isPlatformControl);
    }

    /**
     * 是否必杀玩家
     * @param players 调控玩家
     */
    private getKillAreas(players: PersonalControlPlayer[]): BetAreasName[] {
        // 是否必杀
        let overrunBetAreas: Set<BetAreasName> = new Set();
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
            const areas: BetAreasName[] = player.getOverrunBetAreas(killCondition);

            if (areas.length) controlUidList.push(controlPlayer.uid);

            areas.forEach(area => overrunBetAreas.add(area));
        }

        if (overrunBetAreas.size === 0) {
            return [];
        }

        // 如果超限区域同时包含andar或者bahar 则 选取其中调控玩家押注大的杀 相同则随机杀一个
        if (overrunBetAreas.has(BetAreasName.ANDAR) && overrunBetAreas.has(BetAreasName.BAHAR)) {
            let andarTotalBet = 0, baharTotalBet = 0;

            for (let controlPlayer of players) {
                const bets = this.room.getPlayer(controlPlayer.uid).getBetsDetail();
                andarTotalBet += bets[BetAreasName.ANDAR];
                baharTotalBet += bets[BetAreasName.BAHAR];
            }

            if (andarTotalBet === baharTotalBet) {
                Math.random() > 0.5 ? overrunBetAreas.delete(BetAreasName.ANDAR) : overrunBetAreas.delete(BetAreasName.BAHAR);
            } else {
                andarTotalBet > baharTotalBet ? overrunBetAreas.delete(BetAreasName.BAHAR) : overrunBetAreas.delete(BetAreasName.ANDAR);
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return [...overrunBetAreas];
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.getRealPlayersAndBetPlayers().map(p => filterProperty(p));
    }
}