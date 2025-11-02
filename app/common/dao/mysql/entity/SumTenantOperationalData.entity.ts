import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, Index, BeforeInsert } from "typeorm";

/**
 * @name 租户运营数据汇总表
 */
@Entity("Sum_TenantOperationalData")
export class  SumTenantOperationalData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        length: 8,
        comment: "player_agent 表 uid"
    })
    fk_uid: string;

    @Column("varchar", {
        length: 50,
        comment: "租客的备注信息"
    })
    groupRemark: string;

    @Column({
        type: "int",
        comment: "注单量"
    })
    recordCount: number;

    @Column({
        type: "int",
        comment: "有效投注额"
    })
    validBetTotal: number;

    @Column({
        type: "int",
        comment: "赢单额"
    })
    winCount: number;

    @Column({
        type: "int",
        comment: "赢单量"
    })
    winTotal: number;

    @Column({
        type: "int",
        comment: "输单量"
    })
    loseTotal: number;

    @Column({
        type: "int",
        comment: "游戏输赢"
    })
    profitTotal: number;

    @Column({
        type: "int",
        comment: "下注"
    })
    bet_commissionTotal: number;

    @Column({
        type: "int",
        comment: "赢取"
    })
    win_commissionTotal: number;

    @Column({
        type: "int",
        comment: "结算"
    })
    settle_commissionTotal: number;

    @Column({
        comment: "汇总日期"
    })
    sumDate: Date;

    @Column({
        comment: "上级uid "
    })
    parentUid: string;

    @Column({
        comment: "nid"
    })
    nid: string;

    @Column({
        comment: "游戏名称"
    })
    gameName: string;

    @Column({
        comment: "创建时间"
    })
    createDateTime: Date;

    @BeforeInsert()
    private init() {
        this.createDateTime = new Date();
    }
}
