import { Entity, PrimaryGeneratedColumn, Column, } from "typeorm";

@Entity("Sys_SystemConfig")
export class SystemConfig {

    @PrimaryGeneratedColumn()
    id: number;
    /** 提现限制 */
    @Column({
        type: "int",
        default: 0
    })
    tixianBate: number;

    /** 提现手续费按照比列来算*/
    @Column({
        type: "int",
        default: 0
    })
    tixianRabate: number;

    /** 日签随机范围值*/
    @Column("json", { nullable: true })
    signData: any;

    /** 开始的新账号金币 */
    @Column()
    startGold: number;

    /** h5GameUrl */
    @Column()
    h5GameUrl: string;
    /** 客服通道设置 */
    @Column("varchar", { length: 50 , nullable: true })
    customer: string;

    /** H5登陆语言设置(空就是服务器默认语言) */
    @Column("varchar", { length: 50 , nullable: true })
    languageForWeb: string;

    /** 玩家单次下注大于 */
    @Column({
        type: "int",
        default: 0
    })
    inputGoldThan: number;
    /** 玩家当日赢取大于 */
    @Column({
        type: "int",
        default: 0
    })
    winGoldThan: number;
    /** 赢取/带入 倍数 */
    @Column({
        type: "int",
        default: 0
    })
    winAddRmb: number;
    /** 绑定手机赠送金币 */
    @Column({
        type: "int",
        default: 0
    })
    cellPhoneGold: number;
    /** 是否开启访客登陆 */
    @Column({
        default: 0
    })
    isOpenH5: boolean;
    /** API是否关闭，默认关闭 */
    @Column({
        default: 0
    })
    isCloseApi: boolean;

    /** 关闭的子游戏有哪些*/
    @Column("json", { nullable: true })
    closeNid: any;

    /** 获取游戏解析url地址*/
    @Column("varchar", { nullable: true })
    gameResultUrl: string;

    /** 开启隐藏返回按钮得平台有哪些 */
    @Column("json", { nullable: true })
    backButton: any;

    /** 开启隐藏热门游戏按钮得平台有哪些 */
    @Column("json", { nullable: true })

    hotGameButton: any;    /** 银行卡列表 */
    @Column("json", { nullable: true })
    bankList: any;

    /** 测试代理 */
    @Column("varchar", { length: 50 , nullable: true })
    apiTestAgent: string;

    /** 无限代理设置 */
    @Column("json", {nullable: true })
    unlimitedList: any;

    /** 是否开启无线代理 */
    @Column({  default: 0 })
    openUnlimited: boolean;

    /** ipl 佣金返佣比例  */
    @Column({
        type: "int",
        default: 0
    })
    iplRebate: number;

    /** APP版本默认代理  */
    @Column( { length: 50 , nullable: true })
    defaultChannelCode : string;

}
