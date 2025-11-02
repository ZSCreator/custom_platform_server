"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInRedis = void 0;
const propExclude = ["uid", "groupRemark", "thirdUid", "lineCode", "myGames", "nickname", "superior", "shareUid", "headurl", "gold", "isRobot", "position", "walletGold", "passWord", "closeTime", "kickself", "updatetime", "maxBetGold", "createTime",
    "loginCount", "addDayRmb", "addDayTixian", "oneAddRmb", "oneWin", "group_id", "language", "guestid", "cellPhone", "ip", "language", "sid", "dayMaxWin", "dailyFlow", "flowCount",
    "instantNetProfit", "kickedOutRoom", "abnormalOffline", "addRmb", "userId", "addTixian", "level", "withdrawalChips"];
class PlayerInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.PlayerInRedis = PlayerInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2VudGl0eS9wbGF5ZXIuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWTtJQUNuUCxZQUFZLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVc7SUFDaEwsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTFILE1BQWEsYUFBYTtJQXlNdEIsWUFBWSxZQUF5QztRQUNqRCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsU0FBUzthQUNaO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNuQjtJQUNMLENBQUM7Q0FDSjtBQWpORCxzQ0FpTkMifQ==