'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = exports.getWeightedRandomItem = exports.getWeightedRandomArray = void 0;
const getWeightedRandomArray = (weightedMap, count = 1) => {
    if (!weightedMap || (weightedMap && weightedMap.length === 0)) {
        return null;
    }
    if (!(weightedMap instanceof Map)) {
        return null;
    }
    count = Math.max(1, count);
    let result = [];
    let i = 0;
    let tempMap = new Map(weightedMap);
    while (i < count || tempMap.length > 0) {
        const item = (0, exports.getWeightedRandomItem)(tempMap);
        if (item) {
            tempMap.delete(item);
            result.push(item);
        }
        i++;
    }
    return result;
};
exports.getWeightedRandomArray = getWeightedRandomArray;
const getWeightedRandomItem = (weightedMap) => {
    if (!weightedMap || (weightedMap && weightedMap.length === 0)) {
        return null;
    }
    if (!(weightedMap instanceof Map)) {
        return null;
    }
    let totalWeight = 0;
    for (let [item, weight] of weightedMap) {
        totalWeight += weight;
    }
    let randomWeight = (0, exports.getRandomInt)(1, totalWeight);
    for (let [item, weight] of weightedMap) {
        randomWeight -= weight;
        if (randomWeight <= 0) {
            return item;
        }
    }
    return null;
};
exports.getWeightedRandomItem = getWeightedRandomItem;
const getRandomInt = function (min, max) {
    let count = Math.max(max - min, 0) + 1;
    return Math.floor(Math.random() * count) + min;
};
exports.getRandomInt = getRandomInt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFuZG9tVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC91dGlscy9SYW5kb21VdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBWU4sTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEVBQUU7SUFDN0QsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxJQUFJLENBQUMsQ0FBQyxXQUFXLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDL0IsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxPQUFPLEdBQVEsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEMsT0FBTyxDQUFDLEdBQUcsS0FBSyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLElBQUEsNkJBQXFCLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsSUFBSSxJQUFJLEVBQUU7WUFDTixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7UUFDRCxDQUFDLEVBQUUsQ0FBQztLQUNQO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBcEJXLFFBQUEsc0JBQXNCLDBCQW9CakM7QUFRSyxNQUFNLHFCQUFxQixHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUU7SUFDakQsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxJQUFJLENBQUMsQ0FBQyxXQUFXLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDL0IsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNwQixLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksV0FBVyxFQUFFO1FBQ3BDLFdBQVcsSUFBSSxNQUFNLENBQUM7S0FDekI7SUFDRCxJQUFJLFlBQVksR0FBRyxJQUFBLG9CQUFZLEVBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2hELEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxXQUFXLEVBQUU7UUFDcEMsWUFBWSxJQUFJLE1BQU0sQ0FBQztRQUN2QixJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUM7U0FDZjtLQUNKO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBbkJXLFFBQUEscUJBQXFCLHlCQW1CaEM7QUFRSyxNQUFNLFlBQVksR0FBRyxVQUFVLEdBQUcsRUFBRSxHQUFHO0lBQzFDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbkQsQ0FBQyxDQUFDO0FBSFcsUUFBQSxZQUFZLGdCQUd2QiJ9