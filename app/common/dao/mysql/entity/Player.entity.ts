import { Entity, PrimaryGeneratedColumn, Column, AfterLoad, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";
import { RoleEnum } from "../../../constant/player/RoleEnum";
import { IsInt, Min } from "class-validator";
import { PositionEnum } from "../../../constant/player/PositionEnum";
import { LANGUAGE } from "../../../../consts/hallConst";

@Entity("Sp_Player")
export class Player {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 玩家id
     */
    @PrimaryColumn("varchar", {
        name: "pk_uid",
        length: 8,
        unique: true
    })
    uid: string;

    /**
     * @property 第三方平台玩家id
     */
    @Column("varchar", { length: 50, nullable: true })
    thirdUid: string;

    /**
     * @property 第三方：板球用户id
     */
    @Column("varchar", { length: 50, nullable: true })
    userId: string;

    /**
     * @property 站点名称，作为玩家隔离条件，如果第三方没有传站点，那么就将分代名称存入站点。
     */
    @Column("varchar", { length: 50, nullable: true })
    lineCode: string;

    /**
     * @property 玩家最近玩的10个游戏的nid
     */
    @Column("varchar", { nullable: true })
    myGames: string;

    /**
     * @property 玩家昵称
     */
    @Column("varchar", { length: 15 })
    nickname: string;

    /**
     * @property 玩家头像
     */
    @Column("varchar", { length: 10 })
    headurl: string;

    /**
     * @property 玩家金币
     * @description 单位为分
     */
    @Column({
        default: 0
    })
    @IsInt()
    @Min(0)
    gold: number;

    /**
     * @property 当日充值金额    ==== 今日带入 //单位为分
     */
    @Column({
        type: "double",
        default: 0
    })
    addDayRmb: number;

    /**
    * @property 总共充值  单位为分======gold 最大带入金币
    */
    @Column({
        type: "double",
        default: 0
    })
    addRmb: number;

    /**
     * @property 总提现金额
     */
    @Column({
        type: "double",
        default: 0
    })
    addTixian: number;

    /**
     * @property 当日提现金额 =========== 今日带出金额
     */
    @Column({
        type: "double",
        default: 0
    })
    addDayTixian: number;

    /**
     * @property 每次带出
     * @description 单位为分
     */
    @Column({
        type: "int",
        default: 0
    })
    oneAddRmb: number;

    /**
     * @property 每次带入累计赢取
     * @description 单位为分
     */
    @Column({
        type: "int",
        default: 0
    })
    oneWin: number;

    /**
     * @property 语言
     */
    @Column("varchar", {
        default: LANGUAGE.DEFAULT,
        length: 15
    })
    language: string;

    /**
     * @property 上级uid
     */
    @Column("varchar", {
        nullable: true,
        length: 10
    })
    superior: string;

    /**
     * @property 顶级uid
     */
    @Column("varchar", {
        nullable: true, length: 10
    })
    group_id: string;

    /**
     * @property 分代号
     */
    @Column("varchar", {
        nullable: true, length: 20
    })
    groupRemark: string;

    /**
     * @property 登录时间
     */
    @Column({ nullable: true })
    loginTime: Date;

    /**
     * @property 上次登录离线时间
     */
    @Column({ nullable: true })
    lastLogoutTime: Date;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createTime: Date;

    @UpdateDateColumn({
        comment: "最近修改时间"
    })
    updateTime: Date;

    /**
     * @property 角色身份
     * @description 0为真实玩家 3 为测试玩家 2 为机器人
     */
    @Column("int", {
        default: RoleEnum.REAL_PLAYER
    })
    isRobot: RoleEnum;


    /**
     * @property 玩家IP
     */
    @Column({ nullable: true })
    ip: string;

    /**
     * @property 服务器名字
     */
    @Column({ nullable: true })
    sid: string;

    /**
     * @property 登录次数
     */
    @Column({ default: 0 })
    loginCount: number;

    /**
     * @property 是否已被踢出房间
     */
    @Column({ default: 0 })
    kickedOutRoom: boolean;

    /**
     * @property 是否是异常掉线
     * @description ture 异常;fasle 正常;
     */
    @Column({ default: 0 })
    abnormalOffline: boolean;

    /**
     * @property 玩家所处的位置
     * @property 0 大厅,1 选场list,2 游戏(房间)
     */
    @Column({ default: PositionEnum.HALL })
    position: PositionEnum;


    /**
     * @property 玩家封禁到什么时候
     */
    @Column({ nullable: true })
    closeTime: Date;

    /**
     * @property 玩家封禁原因
     */
    @Column({ nullable: true })
    closeReason: string;

    /**
     * @property 玩家当天最大的中奖
     */
    @Column({ default: 0 })
    dayMaxWin: number;

    /**
     * @property 日流水
     * @description 用于计算利润，会清除
     */
    @Column({ default: 0, type: "double" })
    dailyFlow: number;

    /**
     * @property 总流水
     */
    @Column({ default: 0, type: "double" })
    flowCount: number;

    @Column({
        default: 0,
        type: "double",
        comment: "提现码量:0表示未充值; 大于0表示需要打到的码量; 小于0 表示可提现"
    })
    withdrawalChips: number

    /**
     * @property 即时利润统计，可清除
     */
    @Column("int", {
        default: 0
    })
    instantNetProfit: number;

    /**
     * @property 钱包金币
     */
    @Column({ default: 0 })
    walletGold: number;

    /**
     * @property 登录设备名称
     */
    @Column({ nullable: true })
    rom_type: string;

    /**
     * @property 推广uid
     */
    @Column({ nullable: true })
    shareUid: string;

    /**
     * @property 游客Id
     */
    @Column({ default: "" })
    guestid: string;

    /**
     * @property 手机
     */
    @Column({ default: "" })
    cellPhone: string;

    /**
     * @property 密码
     */
    @Column({ nullable: true })
    passWord: string;


    /**
     * @property 最大单注
     * @description 添加API在线会员的字段
     * @date 2020.7.24
     */
    @Column({ default: 0 })
    maxBetGold: number;

    /**
     * @property 第三方平台下分预警金币字段
     */
    @Column({ default: 0 })
    earlyWarningGold: number;

    /**
     * @property 第三方下分审核通过字段
     */
    @Column({ default: 0 })
    earlyWarningFlag: boolean;

    /**
     * @property 第三方平台下分: 进入前的金额
     */
    @Column({ default: 0 })
    entryGold: number;

    @Column({ default: 0 })
    kickself: boolean;

    @Column({
        default: 0,
        comment: "vip等级"
    })
    level: number;

    /**
     * @property 是否在线
     */
    onLine: boolean;

    /**
     * @property 是否恢复在线(不用存入redis) 默认false,通知游戏要回来到load中间时间 true
     */
    isOnLine: boolean;

    /**
     * @property 新最后一次操作 时间戳 单位秒
     */
    updatetime: number;


    @AfterLoad()
    private afterLoad() {
        this.oneWin = 0;
        this.onLine = false;
        this.isOnLine = false;
    }

    /* @BeforeInsert()
    private init() {
        this.createTime = new Date();
    } */
}
