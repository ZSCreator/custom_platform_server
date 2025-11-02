
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterUpdate } from "typeorm";

@Entity("Sp_BonusPool")
export class BonusPool {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    })
    nid: string;

    @Column('varchar', {
        name: 'game_name',
        length: 50,
        comment: '游戏名字'
    })
    gameName: string;

    @Column({
        name: "scene_id",
        comment: "场编号"
    })
    sceneId: number;

    @Column("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    })
    sceneName: string;

    @Column({
        comment: "公共奖池 当前金额",
        default: 0,
    })
    bonus_amount: number;

    @Column({
        comment: "公共奖池 初始金额",
        default: 0,
    })
    bonus_initAmount: number;

    @Column({
        comment: "公共奖池 下限金额",
        default: 0,
    })
    bonus_minAmount: number;

    @Column({
        comment: "公共奖池 金额减少时计算使用的系数",
        default: 0,
    })
    bonus_minParameter: number;

    @Column({
        comment: "公共奖池 上限金额",
        default: 0,
    })
    bonus_maxAmount: number;

    @Column({
        comment: "公共奖池 金额增加时计算使用的系数",
        default: 0,
    })
    bonus_maxParameter: number;

    @Column({
        comment: "公共奖池 修正系数",
        default: 0,
    })
    bonus_poolCorrectedValue: number;

    @Column({
        comment: "最高储存金额",
        default: 0,
    })
    bonus_maxAmountInStore: number;

    @Column({
        comment: "金额达到指定上限( bonus_maxAmountInStore )时,自动/手动 将多的部分转入\"调控池\"",
    })
    bonus_maxAmountInStoreSwitch: boolean;

    @Column({
        comment: "公共奖池修正值 下限",
        default: 0,
    })
    bonus_minBonusPoolCorrectedValue: number;

    @Column({
        comment: "公共奖池修正值 上限",
        default: 0,
    })
    bonus_maxBonusPoolCorrectedValue: number;

    @Column({
        comment: "房间个人基准值",
        default: 0,
    })
    bonus_personalReferenceValue: number;

    @Column({
        comment: "调控池 当前金额",
        default: 0,
    })
    control_amount: number;

    @Column({
        comment: "盈利池 当前金额",
        default: 0,
    })
    profit_amount: number;

    @Column({
        comment: "是否定时自动更新",
    })
    autoUpdate: boolean;

    @Column({
        comment: "奖池是否被锁定 被锁定则奖池修正值则不再变化",
    })
    lockJackpot: boolean;

    @Column({
        comment: "最近更新 id",
    })
    lastUpdateUUID: string;

    @Column({
        comment: "创建时间"
    })
    createDateTime: Date;

    @Column({
        nullable: true,
        comment: "最近更新时间"
    })
    updateDateTime: Date;

    @BeforeInsert()
    private firstInsert() {
        this.createDateTime = new Date();
    }

    @AfterUpdate()
    private everyUpdate() {
        this.updateDateTime = new Date();
    }
}
