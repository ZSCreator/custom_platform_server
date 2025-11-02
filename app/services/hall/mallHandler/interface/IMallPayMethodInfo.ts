/**
 * 商城支付方式表结构
 */
export interface IMallPayMethodInfo {
    payMethodId: number,
    payMethodName: string,          // 支付方式名称
    payMethodDescription: string,         // 支付提示说明
    payMethodIcon: string,                // 支付图标
    cornerIcon: string,             // 支付按钮角标
    minAmount: number,              // 支付金额下限
    maxAmount: number,              // 支付金额上限
    isMobile: boolean,              // 是否在手机上显示
    isPC: boolean,                  // 是否在电脑上显示
    isWX: boolean,                  // 是否在电脑上显示
    isQrCode: boolean,              // 是否在电脑上显示
    sort: number,                   // 排序
    isOpenJustShowPay: boolean,     // 是否开启仅显示给充值的玩家
}