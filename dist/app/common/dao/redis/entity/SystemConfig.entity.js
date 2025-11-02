"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigInRedis = void 0;
const propExclude = ["id", "languageForWeb", "iplRebate", "tixianBate", "customer", "startGold", "gameResultUrl", "apiTestAgent", "bankList", "tixianRabate", "signData", "openUnlimited", "unlimitedList",
    "h5GameUrl", "inputGoldThan", "winGoldThan", "winAddRmb", "cellPhoneGold", "isOpenH5", "isCloseApi", "closeNid", "backButton", "hotGameButton", "defaultChannelCode"];
class SystemConfigInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.SystemConfigInRedis = SystemConfigInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtQ29uZmlnLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2VudGl0eS9TeXN0ZW1Db25maWcuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFDLGdCQUFnQixFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxlQUFlLEVBQUMsY0FBYyxFQUFFLFVBQVUsRUFBQyxjQUFjLEVBQUMsVUFBVSxFQUFDLGVBQWUsRUFBQyxlQUFlO0lBQzdLLFdBQVcsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRyxlQUFlLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBRTVMLE1BQWEsbUJBQW1CO0lBZ0Q1QixZQUFZLFlBQStDO1FBQ3ZELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztDQUNKO0FBeERELGtEQXdEQyJ9