import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, AfterUpdate} from 'typeorm'
import {IsDate} from "class-validator";
import {PlatformControlType} from "../../../../services/newControl/constants";

/**
 * 单个游戏个人调控表
 */
@Entity('Sp_PlatformControlState')
export class PlatformControlStateEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 记录类型
     */
    @Column('varchar', {
        name: 'state_type',
        length: 3,
    })
    type: PlatformControlType;

    /**
     * 平台id
     */
    @Column('varchar', {
        length: 30,
        default: ''
    })
    platformId: string;

    /**
     * nid 场控 游戏id
     */
    @Column('varchar', {
        length: 3,
    })
    nid: string;

    /**
     * tenantId 租户号
     */
    @Column('varchar', {
        length: 10,
        default: ''
    })
    tenantId: string;


    /**
     * 杀率
     */
    @Column('float', {
        default: 0,
    })
    killRate: number;


    /**
     * 更新时间
     */
    @Column({
        nullable: true
    })
    @IsDate()
    updateTime: Date | null = new Date();

    /**
     * 创建时间
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