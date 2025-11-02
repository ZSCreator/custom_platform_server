import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterUpdate } from "typeorm";

@Entity("Sp_VipConfig")
export class VipConfig {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "vip等级"
    })
    level: number;

    @Column('varchar', {
        length: 50,
        comment: '中文说明'
    })
    des: string;

    @Column({
        comment: "达到当前vip等级的充值要求"
    })
    levelScore: number;

    @Column({
        comment: "vip等级奖励"
    })
    bonus: number;

    @Column({
        comment: "当前vip等级每周签到奖励",
    })
    bonusForWeeks: number;

    @Column({
        comment: "当前vip等级每月签到奖励",
    })
    bonusForMonth: number;

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
