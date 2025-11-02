import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";
/**
 *  玩家获得返佣的记录
 */
@Entity("Sp_PlayerRebateRecord")
export class PlayerRebateRecord {

    @PrimaryGeneratedColumn()
    id: number;

    /** 得到返佣的uid  */
    @Column()
    uid: string;

    /** 返佣 */
    @Column({ default: 0 })
    rebate: number;

    /**  谁提供的返佣 */
    @Column()
    rebateUid: string;

    /** 抽水金额 */
    @Column({default: 0 })
    commission: number;

    /** 返佣等级  1为玩家上一级，2为玩家上级的上级 */
    @Column({default: 0 })
    level: number;

    /** 抽佣比列  */
    @Column({
        type: "double",
        default: 0 })
    rebateProportion: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;

}
