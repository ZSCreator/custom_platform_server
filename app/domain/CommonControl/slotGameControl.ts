import {BaseGameControl} from "./baseGameControl";
import {WinLimitConfig} from "./interface/commonInterface";
import {LIMIT_TYPE_ENUM} from "./config/slotsBaseConst";
import {sum} from "../../utils";
import {SlotLimitConfigSubject} from "./slotLimitConfigSubject";
import {PlayerInfo} from "../../common/pojo/entity/PlayerInfo";

export abstract class SlotGameControl<T extends SlotLimitConfigSubject> extends BaseGameControl {
    abstract limitManager: T;

    protected constructor(props) {
        super(props);
    }


    /**
     * 判断收益是否超限
     * 如果充值为0且未绑定手机，不能超过 赢取上限 - 未绑定手机赠送金额
     * @param player
     * @param profit
     * @return
     */
    protected isEarningsTransfinite({player, profit}: { player: PlayerInfo, profit: number }):
        { isOverrun: boolean, excessAmount: number, limit: number } {
        // 获取调控配置
        const winLimitConfig: WinLimitConfig[] = this.limitManager.getConfig();
        let result: { isOverrun: boolean, excessAmount: number, rate: number, limit: number } = {
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
            // 如果是未充值
            if (WinLimitConfig.lowTopUp === 0 && WinLimitConfig.highTopUp === 0 && todayAdd === 0) {
                if (WinLimitConfig.type === LIMIT_TYPE_ENUM.B) {
                    return result;
                }
                
                // 钱包 + 金币 + 提现 （分
                const money: number = player.walletGold + sum(player.gold) + player.addTixian;
                // 判断差值
                const diffValue: number = money + profit - (WinLimitConfig.minimum * 100);

                result.limit = WinLimitConfig.minimum * 100;

                if (diffValue >= 0) {
                    result.isOverrun = true;
                    result.excessAmount = (WinLimitConfig.minimum * 100) - money;
                }
                break;
            }

            // 正常充值
            if (WinLimitConfig.lowTopUp * 100 <= todayAdd &&
                WinLimitConfig.highTopUp * 100 >= todayAdd) {

                // 如果是B类型则不限制
                if (WinLimitConfig.type === LIMIT_TYPE_ENUM.B) {
                    return result;
                }

                result.limit = WinLimitConfig.minimum * 100;
                // 获取最高赢取 系数 * 充值金额 + 兜底值
                const winLimit: number = WinLimitConfig.coefficient * todayAdd + WinLimitConfig.minimum * 100;
                // 钱包 + 金币 + 提现 （分
                const money: number = player.walletGold + sum(player.gold) + player.addTixian;
                // 判断差值
                const diffValue: number = money + profit - winLimit;

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