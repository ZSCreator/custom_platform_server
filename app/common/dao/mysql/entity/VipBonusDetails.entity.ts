import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterUpdate } from "typeorm";

@Entity("Sp_VipBonusDetails")
export class VipBonusDetails {

    @PrimaryGeneratedColumn()
    id: number;

    /**
      * @property 玩家id
      */
    @Column("varchar", {
        comment: "玩家编号"
    })
    uid: string;

    @Column({
        comment: "vip等级",
        default: 0
    })
    level: number;

    @Column({
        comment: "vip等级奖励",
        default: 0
    })
    bonus: number;

    @Column({
        comment: "是否领取vip等级奖励 0 否 1 是",
        default: 0
    })
    whetherToReceiveLeverBonus: number;

    @Column({
        comment: "周签到奖励",
        default: 0
    })
    bonusForWeeks: number;

    @Column({
        comment: "最近一次周签到奖励时间",
        nullable: true
    })
    bonusForWeeksLastDate: Date;

    @Column({
        comment: "月签到奖励",
        default: 0
    })
    bonusForMonth: number;
    
    @Column({
        comment: "最近一次月签到奖励时间",
        nullable: true
    })
    bonusForMonthLastDate: Date;

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
