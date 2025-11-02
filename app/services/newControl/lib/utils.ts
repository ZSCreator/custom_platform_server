import {IControlScene} from "./controlScene";
import {ControlTypes} from "../constants";

/**
 * 回合
 * @param data
 */
export function summaryList(data: IControlScene[]) {
    const result = data.reduce((base , value) => {
        base.betGoldAmount += value.betGoldAmount;
        base.profit += value.profit;
        (value.betPlayersSet as Array<string>).forEach(uid => (base as any).betPlayersSet.add(uid));
        base.betRoundCount += value.betRoundCount;
        base.serviceCharge += value.serviceCharge;
        base.controlStateStatistical = {
            [ControlTypes.platformControlWin]:
            base.controlStateStatistical[ControlTypes.platformControlWin] + value.controlStateStatistical[ControlTypes.platformControlWin],
            [ControlTypes.platformControlLoss]:
            base.controlStateStatistical[ControlTypes.platformControlLoss] + value.controlStateStatistical[ControlTypes.platformControlLoss],
            [ControlTypes.sceneControlWin]:
            base.controlStateStatistical[ControlTypes.sceneControlWin] + value.controlStateStatistical[ControlTypes.sceneControlWin],
            [ControlTypes.sceneControlLoss]:
            base.controlStateStatistical[ControlTypes.sceneControlLoss] + value.controlStateStatistical[ControlTypes.sceneControlLoss],
            [ControlTypes.personalControlWin]:
            base.controlStateStatistical[ControlTypes.personalControlWin] + value.controlStateStatistical[ControlTypes.personalControlWin],
            [ControlTypes.personalControlLoss]:
            base.controlStateStatistical[ControlTypes.personalControlLoss] + value.controlStateStatistical[ControlTypes.personalControlLoss],
            [ControlTypes.none]:
            base.controlStateStatistical[ControlTypes.none] + value.controlStateStatistical[ControlTypes.none],
        };
        base.controlLossCount += value.controlLossCount;
        base.controlWinCount += value.controlWinCount;
        base.controlEquality += value.controlEquality;
        base.systemWinCount += value.systemWinCount;
        base.playerWinCount += value.playerWinCount;
        base.equalityCount += value.equalityCount;

        if (base.betGoldAmount !== 0) {
            base.killRate = base.profit / base.betGoldAmount;
        }

        if (base.betRoundCount !== 0) {
            base.systemWinRate = base.systemWinCount / base.betRoundCount;
        }

        return base;
    }, {
        betGoldAmount: 0,
        profit: 0,
        betPlayersSet: new Set(),
        betRoundCount: 0,
        serviceCharge: 0,
        controlStateStatistical: {
            [ControlTypes.platformControlWin]: 0,
            [ControlTypes.platformControlLoss]: 0,
            [ControlTypes.sceneControlWin]: 0,
            [ControlTypes.sceneControlLoss]: 0,
            [ControlTypes.personalControlWin]: 0,
            [ControlTypes.personalControlLoss]: 0,
            [ControlTypes.none]: 0
        },
        controlLossCount: 0,
        controlWinCount: 0,
        controlEquality: 0,
        killRate: 0,
        systemWinRate: 0,
        playerWinCount: 0,
        systemWinCount: 0,
        equalityCount: 0
    })

    result.betPlayersSet = [...(result.betPlayersSet as Set<string>).values()];

    return result;
}