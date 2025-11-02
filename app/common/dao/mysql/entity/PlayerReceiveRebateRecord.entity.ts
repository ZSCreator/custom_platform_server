import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";
/**
 *  玩家领取返佣的记录
 */
@Entity("Sp_PlayerReceiveRebateRecord")
export class PlayerReceiveRebateRecord {

    @PrimaryGeneratedColumn()
    id: number;

    /** 得到返佣的uid  */
    @Column()
    uid: string;

    /** 获取返佣 */
    @Column({
        type: "int",
        default: 0 })
    rebate: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;

}
