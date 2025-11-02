"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryList = void 0;
const constants_1 = require("../constants");
function summaryList(data) {
    const result = data.reduce((base, value) => {
        base.betGoldAmount += value.betGoldAmount;
        base.profit += value.profit;
        value.betPlayersSet.forEach(uid => base.betPlayersSet.add(uid));
        base.betRoundCount += value.betRoundCount;
        base.serviceCharge += value.serviceCharge;
        base.controlStateStatistical = {
            [constants_1.ControlTypes.platformControlWin]: base.controlStateStatistical[constants_1.ControlTypes.platformControlWin] + value.controlStateStatistical[constants_1.ControlTypes.platformControlWin],
            [constants_1.ControlTypes.platformControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.platformControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.platformControlLoss],
            [constants_1.ControlTypes.sceneControlWin]: base.controlStateStatistical[constants_1.ControlTypes.sceneControlWin] + value.controlStateStatistical[constants_1.ControlTypes.sceneControlWin],
            [constants_1.ControlTypes.sceneControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.sceneControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.sceneControlLoss],
            [constants_1.ControlTypes.personalControlWin]: base.controlStateStatistical[constants_1.ControlTypes.personalControlWin] + value.controlStateStatistical[constants_1.ControlTypes.personalControlWin],
            [constants_1.ControlTypes.personalControlLoss]: base.controlStateStatistical[constants_1.ControlTypes.personalControlLoss] + value.controlStateStatistical[constants_1.ControlTypes.personalControlLoss],
            [constants_1.ControlTypes.none]: base.controlStateStatistical[constants_1.ControlTypes.none] + value.controlStateStatistical[constants_1.ControlTypes.none],
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
            [constants_1.ControlTypes.platformControlWin]: 0,
            [constants_1.ControlTypes.platformControlLoss]: 0,
            [constants_1.ControlTypes.sceneControlWin]: 0,
            [constants_1.ControlTypes.sceneControlLoss]: 0,
            [constants_1.ControlTypes.personalControlWin]: 0,
            [constants_1.ControlTypes.personalControlLoss]: 0,
            [constants_1.ControlTypes.none]: 0
        },
        controlLossCount: 0,
        controlWinCount: 0,
        controlEquality: 0,
        killRate: 0,
        systemWinRate: 0,
        playerWinCount: 0,
        systemWinCount: 0,
        equalityCount: 0
    });
    result.betPlayersSet = [...result.betPlayersSet.values()];
    return result;
}
exports.summaryList = summaryList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9saWIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNENBQTBDO0FBTTFDLFNBQWdCLFdBQVcsQ0FBQyxJQUFxQjtJQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFHLEtBQUssRUFBRSxFQUFFO1FBQ3hDLElBQUksQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsS0FBSyxDQUFDLGFBQStCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUUsSUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDMUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQzFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRztZQUMzQixDQUFDLHdCQUFZLENBQUMsa0JBQWtCLENBQUMsRUFDakMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHdCQUFZLENBQUMsa0JBQWtCLENBQUMsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsd0JBQVksQ0FBQyxrQkFBa0IsQ0FBQztZQUM5SCxDQUFDLHdCQUFZLENBQUMsbUJBQW1CLENBQUMsRUFDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHdCQUFZLENBQUMsbUJBQW1CLENBQUMsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsd0JBQVksQ0FBQyxtQkFBbUIsQ0FBQztZQUNoSSxDQUFDLHdCQUFZLENBQUMsZUFBZSxDQUFDLEVBQzlCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyx3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