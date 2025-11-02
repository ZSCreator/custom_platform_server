/**
 * 商城商品表结构
 */
export interface IMallGoldItemInfo {
    itemId: String,           // id
    itemName: String,         // 金币商品名称
    itemDescription: String,  // 商品描述
    itemPrice: Number,        // 商品价格
    priceToGold: Number,      // 可兑换金币数量
    language: String,         // 语言
    sort: Number,             // 排序
    itemButtonName: String,   // 按钮名称
    iconUrl: String,          // 商城图标地址
    noShowPayMethodList: number[],      // 屏蔽的支付方式
    noShowPayTypeList: number[],        // 屏蔽的支付通道
    isOpen: Boolean,          // 是否开启
}