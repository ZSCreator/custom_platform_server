"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLittleGameResult = exports.buildRecordResult = void 0;
const constant_1 = require("../constant");
var RecordType;
(function (RecordType) {
    RecordType[RecordType["SPIN"] = 0] = "SPIN";
    RecordType[RecordType["LITTER"] = 1] = "LITTER";
})(RecordType || (RecordType = {}));
function buildRecordResult(gameLevel, winningDetails) {
    let prefix = `${RecordType.SPIN.toString()}|${gameLevel.toString()}|${winningDetails.length.toString()}|`;
    winningDetails.forEach(once => {
        prefix += `${once.type}${once.num}/${once.win}|`;
    });
    return prefix;
}
exports.buildRecordResult = buildRecordResult;
function buildLittleGameResult(gameLevel, awardType) {
    let prefix = `${RecordType.LITTER.toString()}|${gameLevel.toString()}|`;
    switch (awardType) {
        case constant_1.gold:
            prefix += '2';
            break;
        case constant_1.silver:
            prefix += '1';
            break;
        case constant_1.copper:
            prefix += '0';
            break;
        case constant_1.bonus:
            prefix += '3';
            break;
    }
    return prefix;
}
exports.buildLittleGameResult = buildLittleGameResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BoYXJhb2gvbGliL3V0aWwvcmVjb3JkVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwwQ0FBeUQ7QUFPekQsSUFBSyxVQUdKO0FBSEQsV0FBSyxVQUFVO0lBQ1gsMkNBQUksQ0FBQTtJQUNKLCtDQUFNLENBQUE7QUFDVixDQUFDLEVBSEksVUFBVSxLQUFWLFVBQVUsUUFHZDtBQVFELFNBQWdCLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsY0FBK0I7SUFDaEYsSUFBSSxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7SUFFMUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ3JELENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQVJELDhDQVFDO0FBT0QsU0FBZ0IscUJBQXFCLENBQUMsU0FBaUIsRUFBRSxTQUFpQjtJQUN0RSxJQUFJLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7SUFHeEUsUUFBUSxTQUFTLEVBQUU7UUFDZixLQUFLLGVBQUk7WUFBRSxNQUFNLElBQUksR0FBRyxDQUFDO1lBQUMsTUFBTTtRQUNoQyxLQUFLLGlCQUFNO1lBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUFDLE1BQU07UUFDbEMsS0FBSyxpQkFBTTtZQUFFLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFBQyxNQUFNO1FBQ2xDLEtBQUssZ0JBQUs7WUFBRSxNQUFNLElBQUksR0FBRyxDQUFDO1lBQUMsTUFBTTtLQUNwQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFaRCxzREFZQyJ9