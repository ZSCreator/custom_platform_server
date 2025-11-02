"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotGameControl = void 0;
const baseGameControl_1 = require("./baseGameControl");
const slotsBaseConst_1 = require("./config/slotsBaseConst");
const utils_1 = require("../../utils");
class SlotGameControl extends baseGameControl_1.BaseGameControl {
    constructor(props) {
        super(props);
    }
    isEarningsTransfinite({ player, profit }) {
        const winLimitConfig = this.limitManager.getConfig();
        let result = {
            isOverrun: false,
            excessAmount: 0,
            rate: 1,
            limit: 0,
        };
        let todayAdd = player.addDayRmb - player.addDayTixian;
        if (todayAdd < 0) {
            todayAdd = 0;
        }
        for (let WinLimitConfig of winLimitConfig) {
            if (WinLimitConfig.lowTopUp === 0 && WinLimitConfig.highTopUp === 0 && todayAdd === 0) {
                if (WinLimitConfig.type === slotsBaseConst_1.LIMIT_TYPE_ENUM.B) {
                    return result;
                }
                const money = player.walletGold + (0, utils_1.sum)(player.gold) + player.addTixian;
                const diffValue = money + profit - (WinLimitConfig.minimum * 100);
                result.limit = WinLimitConfig.minimum * 100;
                if (diffValue >= 0) {
                    result.isOverrun = true;
                    result.excessAmount = (WinLimitConfig.minimum * 100) - money;
                }
                break;
            }
            if (WinLimitConfig.lowTopUp * 100 <= todayAdd &&
                WinLimitConfig.highTopUp * 100 >= todayAdd) {
                if (WinLimitConfig.type === slotsBaseConst_1.LIMIT_TYPE_ENUM.B) {
                    return result;
                }
                result.limit = WinLimitConfig.minimum * 100;
                const winLimit = WinLimitConfig.coefficient * todayAdd + WinLimitConfig.minimum * 100;
                const money = player.walletGold + (0, utils_1.sum)(player.gold) + player.addTixian;
                const diffValue = money + profit - winLimit;
                if (diffValue >= 0) {
                    result.isOverrun = true;
                    result.excessAmount = money - winLimit;
                }
                break;
            }
        }
        return result;
    }
}
exports.SlotGameControl = SlotGameControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdEdhbWVDb250cm9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9Db21tb25Db250cm9sL3Nsb3RHYW1lQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBa0Q7QUFFbEQsNERBQXdEO0FBQ3hELHVDQUFnQztBQUloQyxNQUFzQixlQUFrRCxTQUFRLGlDQUFlO0lBRzNGLFlBQXNCLEtBQUs7UUFDdkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFVUyxxQkFBcUIsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQXlDO1FBR3BGLE1BQU0sY0FBYyxHQUFxQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksTUFBTSxHQUE4RTtZQUNwRixTQUFTLEVBQUUsS0FBSztZQUNoQixZQUFZLEVBQUUsQ0FBQztZQUNmLElBQUksRUFBRSxDQUFDO1lBQ1AsS0FBSyxFQUFFLENBQUM7U0FDWCxDQUFDO1FBRUYsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ3RELElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNkLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDaEI7UUFFRCxLQUFLLElBQUksY0FBYyxJQUFJLGNBQWMsRUFBRTtZQUV2QyxJQUFJLGNBQWMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxJQUFJLGNBQWMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7Z0JBQ25GLElBQUksY0FBYyxDQUFDLElBQUksS0FBSyxnQ0FBZSxDQUFDLENBQUMsRUFBRTtvQkFDM0MsT0FBTyxNQUFNLENBQUM7aUJBQ2pCO2dCQUdELE1BQU0sS0FBSyxHQUFXLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBQSxXQUFHLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBRTlFLE1BQU0sU0FBUyxHQUFXLEtBQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUUxRSxNQUFNLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO2dCQUU1QyxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUN4QixNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ2hFO2dCQUNELE1BQU07YUFDVDtZQUdELElBQUksY0FBYyxDQUFDLFFBQVEsR0FBRyxHQUFHLElBQUksUUFBUTtnQkFDekMsY0FBYyxDQUFDLFNBQVMsR0FBRyxHQUFHLElBQUksUUFBUSxFQUFFO2dCQUc1QyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssZ0NBQWUsQ0FBQyxDQUFDLEVBQUU7b0JBQzNDLE9BQU8sTUFBTSxDQUFDO2lCQUNqQjtnQkFFRCxNQUFNLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO2dCQUU1QyxNQUFNLFFBQVEsR0FBVyxjQUFjLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxjQUFjLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztnQkFFOUYsTUFBTSxLQUFLLEdBQVcsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFBLFdBQUcsRUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFFOUUsTUFBTSxTQUFTLEdBQVcsS0FBSyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7Z0JBRXBELElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQ3hCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQztpQkFDMUM7Z0JBQ0QsTUFBTTthQUNUO1NBQ0o7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUEvRUQsMENBK0VDIn0=