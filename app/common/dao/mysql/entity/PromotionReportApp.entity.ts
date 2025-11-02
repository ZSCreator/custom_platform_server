import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";
/**
 *  APP版本的推广报表
 */
@Entity("Sp_PromotionReportApp")
export class PromotionReportApp {

    @PrimaryGeneratedColumn()
    id: number;

    /** 代理的uid  */
    @Column()
    agentUid: string;

    /** 代理的名称 */
    @Column()
    agentName: string;

    /** 平台的名称 */
    @Column()
    platformName: string;

    /** 今日新增人数*/
    @Column({default: 0 })
    todayPlayer: number;

    /** 今日充值  */
    @Column({default: 0 })
    todayAddRmb: number;

    /** 今日提现  */
    @Column({default: 0 })
    todayTixian: number;
    /** 今日码量  */
    @Column({default: 0 })
    todayFlow: number;
    /** 今日抽水  */
    @Column({default: 0 })
    todayCommission: number;

    @Column({
        comment: "创建时间"
    })
    createDate: Date;

}
