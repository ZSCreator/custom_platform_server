import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert,CreateDateColumn } from "typeorm";

/**
 * @name API 历史数据报表
 */
@Entity("Sp_DayApiData")
export class DayApiData {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0,
        comment: "登陆玩家人数"
    })
    loginLength: number;

    @Column({
        default: 0,
        comment: "新增玩家人数"
    })
    createLength: number;

    @Column({
        default: 0,
        comment: "码量"
    })
    betNum: number;

    @Column({
        default: 0,
        comment: "返奖率"
    })
    backRate: number;

    @Column({
        default: 0,
        comment: "带入带出差额"
    })
    entryAndLeave: number;
    @Column({
        default: 0,
        comment: "持有金币"
    })
    selfGold: number;
    @Column({
        default: 0,
        comment: "带入金币"
    })
    entryGold: number;
    @Column({
        default: 0,
        comment: "带出金币"
    })
    leaveGold: number;
    @Column({
        default: 0,
        comment: "最大在线人数"
    })
    maxOnline: number;

    @Column({
        comment:"创建时间"
    })
    createDate: Date;
}
