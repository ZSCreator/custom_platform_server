import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, AfterUpdate} from 'typeorm'
import {IsDate} from "class-validator";

/**
 * 个人总控表
 */
@Entity('Sp_TotalPersonalControl')
export class TotalPersonalControl {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 玩家uid
     */
    @Column('varchar', {
        length: 8,
        unique: true
    })
    uid: string;

    /**
     * @property 调控备注
     */
    @Column("varchar", {
        length: 100
    })
    remark: string;

    /**
     * @property 必杀条件
     */
    @Column("float")
    killCondition: number;

    /**
     * @property 添加调控人
     */
    @Column('varchar', {
        length: 15
    })
    managerId: string;

    /**
     * @property 调控概率
     */
    @Column('int')
    probability: number;

    /**
     * @property 更新时间
     */
    @Column({
        nullable: true
    })
    @IsDate()
    updateTime: Date | null = new Date();

    /**
     * @property 创建时间
     */
    @Column()
    @IsDate()
    createTime: Date ;


    @BeforeInsert()
    private firstInsert() {
        this.createTime = new Date();
    }

    @AfterUpdate()
    private everyUpdate() {
        this.updateTime = new Date();
    }

}