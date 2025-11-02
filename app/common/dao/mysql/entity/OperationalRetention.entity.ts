import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";
/**
 *  生成渠道运营留存表
 */
@Entity("Sp_OperationalRetention")
export class OperationalRetention {

    @PrimaryGeneratedColumn()
    id: number;

    /** 代理的名称 */
    @Column()
    agentName: string;

    /** 活跃会员 存储玩家的uid */
    @Column("json", { nullable: true })
    betPlayer: any;

    /** 新增人数 存储玩家的uid*/
    @Column("json", { nullable: true })
    addPlayer: any;

    /** 充值玩家人数  */
    @Column("json", { nullable: true })
    AddRmbPlayer: any;

    /** 总收入  */
    @Column({default: 0 })
    allAddRmb: number;
    /** 次日留存率  */
    @Column({default: 0 })
    secondNum: number;
    /** 3日抽水  */
    @Column({default: 0 })
    threeNum: number;
    /** 7日抽水  */
    @Column({default: 0 })
    sevenNum: number;
    /** 15日抽水  */
    @Column({default: 0 })
    fifteenNum: number;

    @Column({
        comment: "创建时间"
    })
    createDate: Date;

}
