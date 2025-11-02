import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index, BeforeInsert } from "typeorm";
import { GameCommissionTargetObjectEnum } from "../../../constant/hall/GameCommissionTargetObjectEnum";
import { GameCommissionWayEnum } from "../../../constant/hall/GameCommissionWayEnum";
import { GameRecordStatusEnum } from "../enum/GameRecordStatus.enum";
/**
 * @name 游戏记录表
 */
@Entity("Sp_GameRecord")
export class GameRecord {

    @PrimaryGeneratedColumn()
    id: number;
    @Index()
    @Column("varchar", {
        length: 10,
        comment: "游戏编号"
    })
    uid: string;

    @Index()
    @Column("varchar", {
        length: 50,
        nullable: true,
        comment: "第三方账号"
    })
    thirdUid: string;

    @Column("varchar", {
        length: 50,
        comment: "游戏名字"
    })
    gameName: string;
    @Index()
    @Column("varchar", {
        length: 50,
        nullable: true,
        comment: "租客的备注信息"
    })
    groupRemark: string;

    @Column("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    })
    nid: string;

    @Column({
        type: "int",
        comment: "场编号"
    })
    sceneId: number;

    @Column("varchar", {
        length: 10,
        comment: "房间编号"
    })
    roomId: string;

    @Column({
        nullable: true,
        comment: "游戏类型:1电玩类,2:百人类,3:对战类"
    })
    gameType: number;

    @Column({
        name: "round_id",
        nullable: true,
        comment: "游戏该局编号"
    })
    roundId: string;

    @Column("boolean", {
        default: 0,
        comment: "是否庄家: 0 关；1 开； 默认关"
    })
    isDealer: boolean;

    @Column("varchar", {
        name: "game_results",
        length: 255,
        nullable: true,
        default: "",
        comment: "对局结果"
    })
    result: string;

    @Column({
        type: "int",
        default: 0,
        comment: "玩家此时金币携带量"
    })
    gold: number;

    @Column({
        type: "int",
        default: 0,
        comment: "下注额"
    })
    input: number;

    @Column({
        type: "int",
        default: 0,
        comment: "有效下注额"
    })
    validBet: number;

    @Column({
        type: "int",
        default: 0,
        comment: "纯利"
    })
    profit: number;



    @Column({
        type: "int",
        default: 0,
        comment: "下注佣金"
    })
    bet_commission: number;

    @Column({
        type: "int",
        default: 0,
        comment: "赢取佣金"
    })
    win_commission: number;

    @Column({
        type: "int",
        default: 0,
        comment: "结算佣金"
    })
    settle_commission: number;

    @Column({
        type: "int",
        default: 0,
        comment: "盈利倍数"
    })
    multiple: number;

    @Column("int", {
        default: GameRecordStatusEnum.None,
        comment: "记录状态: 0 为生效；1 生效"
    })
    status: GameRecordStatusEnum;

    @Index()
    @Column("varchar", {
        nullable: true,
        name: "game_order_id",
        comment: "订单编号"
    })
    gameOrder: string;

    @Index()
    @Column({
        comment: "创建时间"
    })
    createTimeDate: Date;

    @UpdateDateColumn({
        nullable: true,
        comment: "最近修改时间"
    })
    updateTime: Date;

    @Column("json", { nullable: true })
    game_Records_live_result: any;


    @BeforeInsert()
    private init() {
        this.createTimeDate = new Date();
    }

}
