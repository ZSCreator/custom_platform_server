import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";
/**
 *  每日统计玩家当日获得返佣
 */
@Entity("Sp_DayPlayerRebateRecord")
export class DayPlayerRebateRecord {

    @PrimaryGeneratedColumn()
    id: number;

    /** 得到返佣的uid  */
    @Column()
    uid: string;

    /** 今日总返佣 */
    @Column({ default: 0 })
    dayRebate: number;

    /**  谁提供的返佣 */
    @Column()
    rebateUid: string;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;

}
