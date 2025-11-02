export interface IMallDailyGoldOrder {
    payMethodId: number,
    payMethodName: string,          // 支付方式名称
    payTypeId: number,              // 支付通道编号
    payTypeName: string,            // 支付通道名称
    prePayOrder: number,            // 预支付订单数
    payedOrder: number,             // 已支付订单数
    allGoldItem: [],                // 该支付各商品细类统计
    paySuccessPercentage: number,   // 支付成功百分比 表示 100% => 100
    date: string,                   // 日期 YYYY-MM-DD
    createTime: number              // 创建时间 时间戳
}