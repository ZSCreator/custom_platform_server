
type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["id","languageForWeb","iplRebate", "tixianBate", "customer", "startGold","gameResultUrl","apiTestAgent", "bankList","tixianRabate","signData","openUnlimited","unlimitedList",
                     "h5GameUrl", "inputGoldThan", "winGoldThan", "winAddRmb" , "cellPhoneGold", "isOpenH5", "isCloseApi", "closeNid", "backButton", "hotGameButton", "defaultChannelCode"];

export class SystemConfigInRedis {
    id: number;
    /** 提现限制 */
    tixianBate: number;
    /** 开始的新账号金币 */
    startGold: number;
    /** h5GameUrl */
    h5GameUrl: string;
    /** 客服通道设置 */
    customer: string;
    /** H5登陆的时候设置语言 */
    languageForWeb: string;
    /** 玩家单次下注大于 */
    inputGoldThan: number;
    /** 玩家当日赢取大于 */
    winGoldThan: number;
    /** 赢取/带入 倍数 */
    winAddRmb: number;
    /** 绑定手机赠送金币 */
    cellPhoneGold: number;
    /** 是否开启访客登陆 */
    isOpenH5: boolean;
    /** API是否关闭，默认关闭 */
    isCloseApi: boolean;
    /** 关闭的子游戏有哪些 */
    closeNid: any;
    /** 获取游戏解析url地址*/
    gameResultUrl: string;
    /** APP版本默认代理  */
    defaultChannelCode: string;
    /** 开启隐藏返回按钮得平台有哪些 */
    backButton: any;
    /** 开启隐藏热门游戏按钮得平台有哪些 */
    hotGameButton: any;
    /** 银行卡列表 */
    bankList: any;
    /** 测试代理 */
    apiTestAgent: string;
    /** vip 等级赠送奖励 */
    signData: any;
    /** 银行卡列表 */
    tixianRabate: number;
    /** ipl 佣金返佣比例  */
    iplRebate: number;
    /** 是否开启无线代理 */
    openUnlimited: boolean;
    /** 无限代理设置 */
    unlimitedList: any;
    constructor(initPropList: initPropList<SystemConfigInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

