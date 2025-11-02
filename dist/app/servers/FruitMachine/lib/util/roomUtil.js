"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = exports.fruitMapping = void 0;
const FruitMachineConst_1 = require("../FruitMachineConst");
const goodLuckMapping = {
    [FruitMachineConst_1.GoodLuckType.NONE]: '0',
    [FruitMachineConst_1.GoodLuckType.BIG_TERNARY]: '1',
    [FruitMachineConst_1.GoodLuckType.MIN_TERNARY]: '2',
    [FruitMachineConst_1.GoodLuckType.FOUR_HAPPY]: '3',
    [FruitMachineConst_1.GoodLuckType.TRAIN]: '4'
};
exports.fruitMapping = {
    banana: '1',
    apple: '2',
    durian: '3',
    snakeFruit: '4',
    orange: '5',
    pear: '6',
    star: '7',
    watermelon: '8',
    redBonus: '9',
    blueBonus: 'a',
};
function buildRecordResult(lotteryResult) {
    let prefix = goodLuckMapping[lotteryResult.goodLuck];
    let suffix = '';
    lotteryResult.results.forEach(fruit => {
        if (FruitMachineConst_1.kindSubSet.goodLuck.includes(fruit)) {
            suffix += '00';
            return;
        }
        suffix += FruitMachineConst_1.oddsSubSet.min.includes(fruit) ? '1' : '2';
        for (let fruitType in FruitMachineConst_1.kindSubSet) {
            if (FruitMachineConst_1.kindSubSet[fruitType].includes(fruit)) {
                suffix += exports.fruitMapping[fruitType];
                break;
            }
        }
    });
    if (suffix.length < 10) {
        for (let i = 0, len = 10 - suffix.length; i < len; i++) {
            suffix += '0';
        }
    }
    return prefix + suffix;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GcnVpdE1hY2hpbmUvbGliL3V0aWwvcm9vbVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNERBQTBFO0FBSzFFLE1BQU0sZUFBZSxHQUFHO0lBQ3BCLENBQUMsZ0NBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHO0lBQ3hCLENBQUMsZ0NBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHO0lBQy9CLENBQUMsZ0NBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHO0lBQy9CLENBQUMsZ0NBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHO0lBQzlCLENBQUMsZ0NBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHO0NBQzVCLENBQUM7QUFNVyxRQUFBLFlBQVksR0FBRztJQUN4QixNQUFNLEVBQUUsR0FBRztJQUNYLEtBQUssRUFBRSxHQUFHO0lBQ1YsTUFBTSxFQUFFLEdBQUc7SUFDWCxVQUFVLEVBQUUsR0FBRztJQUNmLE1BQU0sRUFBRSxHQUFHO0lBQ1gsSUFBSSxFQUFFLEdBQUc7SUFDVCxJQUFJLEVBQUUsR0FBRztJQUNULFVBQVUsRUFBRSxHQUFHO0lBQ2YsUUFBUSxFQUFFLEdBQUc7SUFDYixTQUFTLEVBQUUsR0FBRztDQUNqQixDQUFDO0FBU0YsU0FBZ0IsaUJBQWlCLENBQUMsYUFBNEQ7SUFHMUYsSUFBSSxNQUFNLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUdyRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbEMsSUFBSSw4QkFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDckMsTUFBTSxJQUFJLElBQUksQ0FBQztZQUNmLE9BQU87U0FDVjtRQUdELE1BQU0sSUFBSSw4QkFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBR3JELEtBQUssSUFBSSxTQUFTLElBQUksOEJBQVUsRUFBRTtZQUM5QixJQUFJLDhCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLElBQUksb0JBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEMsTUFBTTthQUNUO1NBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7UUFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztTQUNqQjtLQUNKO0lBRUQsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzNCLENBQUM7QUFoQ0QsOENBZ0NDIn0=