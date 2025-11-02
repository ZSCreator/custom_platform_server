import fRoom from './fRoom';
import {filterProperty} from "../../../utils";
import {ControlPlayer, ControlResult, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {bigFish, canEatFish, SEAT, smallFish, watchFish} from "./fisheryConst";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 渔场大亨调控实现
 * @property room 渔场房间引用
 */
export default class Control extends BaseGameControl {
    room: fRoom;
    constructor(params: { room: fRoom }) {
        super(params);
    }

    /**
     * 调控结果
     */
    public async result() {

        // 获取调控结果
        const controlResult: ControlResult = await this.getControlResult();
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = controlResult;

        if (players.length > 0) {

            const killAreas = this.checkKillPlayers(players);

            if (killAreas.size === 0) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    // 标记玩家
                    return this.room.personalControlResult(state, controlPlayers);
                }
            } else {
                this.room.setKillAreas(killAreas);
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }

    /**
     * 是否必杀玩家
     * @param players
     */
    checkKillPlayers(players: PersonalControlPlayer[]) {
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

        let keys = Object.keys(statisticalRes);
        const killAreas: Set<string> = new Set();

        // 基础区域
        const baseAreas = [SEAT.A, SEAT.B, SEAT.C];
        // 二级区域
        const secondAreas = ['watch', 'rare', 'shoalSater', 'deepwater'];

        let baseContains = keys.filter(k => baseAreas.includes(k));
        const secondContains = keys.filter(k => secondAreas.includes(k));

        if (baseContains.length > 0) {
            // 如果三个区域必杀, 优先杀灾害区
            if (baseContains.includes(SEAT.B)) {
                killAreas.add(SEAT.B);
                baseContains = baseContains.filter(k => k !== SEAT.B);
            }

            // 如果还必杀两个区域 选一个押注多的杀 有两个必杀时不开灾害区
            if (baseContains.length === 2) {
                const retain = statisticalRes[baseContains[0]] > statisticalRes[baseContains[1]] ? baseContains[0] :
                    baseContains[1];
                baseContains = baseContains.filter(k => k === retain);
            }

            baseContains.forEach(k => {
                k === SEAT.A ? killAreas.add(SEAT.A) : killAreas.add(SEAT.B);
            })
        }

        // 如果必杀包含深水区 则只能开淡水区
        if (killAreas.has(SEAT.A)) {
            let freshContains = secondReuse(secondContains, statisticalRes, ['watch', 'rare']);
            freshKill(freshContains, killAreas, keys, statisticalRes);

            keys = keys.filter(k => !['watch', 'rare'].includes(k));
        } else if (killAreas.has(SEAT.B)) {
            let deepContains = secondReuse(secondContains, statisticalRes, ['shoalSater', 'deepwater']);
            deepKill(deepContains, killAreas, keys, statisticalRes);
            keys = keys.filter(k => !['shoalSater', 'deepwater'].includes(k));
        }

        const summaryAreas = baseAreas.concat(secondAreas);
        const killFishList = keys.filter(k => !summaryAreas.includes(k));

        if (killFishList.length === 12) {
            killFishList.map(k => {
                return {name: k, num: statisticalRes[k]};
            }).sort((x, y) => y.num - x.num)
                .slice(0, 11)
                .forEach(area => killAreas.add(area.name));
        } else {
            killFishList.forEach(k => killAreas.add(k));
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return killAreas;
    }

    /**
     * 包装玩家数据
     * 只有是真实玩家且押注过的人才进行
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => (p.isRobot === RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => filterProperty(p));
    }
}

/**
 * 第二级必杀复用
 * @param secondContains 第二级必杀区域
 * @param statisticalRes 统计押注结果
 * @param partKillAreas 二级区域
 */
function secondReuse(secondContains, statisticalRes, partKillAreas) {
    let secondList = secondContains.filter(area => partKillAreas.includes(area));

    // 如果有两个找一个少的开
    if (secondList.length === 2) {
        const retain = statisticalRes[secondContains[0]] > statisticalRes[secondContains[1]] ? secondContains[0] :
            secondContains[1];
        secondList = secondContains.filter(area => area === retain);
    }

    return secondList;
}

/**
 * 淡水区域必杀
 * @param freshContains
 * @param killAreas
 * @param keys
 * @param statisticalRes
 */
function freshKill(freshContains: string[], killAreas: Set<string>, keys: string[], statisticalRes) {
    freshContains.forEach(area => {
        // 必杀观赏鱼
        if (area === 'watch') {
            killAreas.add('watch');
            reuse(killAreas, keys, watchFish, canEatFish, statisticalRes);
        } else {
            killAreas.add('rare');
            reuse(killAreas, keys, canEatFish, watchFish, statisticalRes);
        }
    });
}

/**
 * 深水区域必杀
 * @param deepContains
 * @param killAreas
 * @param keys
 * @param statisticalRes
 */
function deepKill(deepContains: string[], killAreas: Set<string>, keys: string[], statisticalRes) {
    deepContains.forEach(area => {
        // 必杀
        if (area === 'shoalSater') {
            killAreas.add('shoalSater');
            reuse(killAreas, keys, bigFish, smallFish, statisticalRes);
        } else {
            killAreas.add('deepwater');
            reuse(killAreas, keys, smallFish, bigFish, statisticalRes);
        }
    });
}

/**
 * 复用
 * @param killAreas 必杀区域
 * @param keys 可能杀的区域
 * @param slayAreas 必杀的子区域
 * @param corresponding 对应的必杀区域
 * @param statisticalRes 统计结果
 */
function reuse(killAreas: Set<string>, keys: string[], slayAreas: string[],  corresponding: string[], statisticalRes: any) {
    slayAreas.forEach(area => killAreas.add(area));

    let list = keys.filter(k => corresponding.includes(k));

    // 如果三个则选个必杀最小的开
    if (list.length === 3) {
        list = list.map(k => {
            return {name: k, num: statisticalRes[k]};
        }).sort((x, y) => y.num - x.num)
            .slice(0, 2)
            .map(area => area.name);
    }

    list.forEach(area => killAreas.add(area));
}