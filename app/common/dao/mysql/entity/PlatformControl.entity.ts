import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, AfterUpdate} from 'typeorm'
import {IsDate} from "class-validator";
import {RecordTypes} from "../../../../services/newControl/constants";

/**
 * 单个游戏个人调控表
 */
@Entity('Sp_PlatformControl')
export class PlatformControlEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 类型
     */
    @Column('varchar', {
        name: 'record_type',
        length: 3,
    })
    type: RecordTypes;

    /**
     * 平台id
     */
    @Column('varchar', {
        length: 30,
        default: ''
    })
    platformId: string;

    /**
     * 租户id
     */
    @Column('varchar', {
        length: 20,
        default: ''
    })
    tenantId: string;

    /**
     * nid 场控 游戏id
     */
    @Column('varchar', {
        length: 3,
        default: null,
    })
    nid: string;

    /**
     * 游戏场ID
     */
    @Column('int', {
        default: null,
    })
    sceneId: number;

    /**
     * 收益 分
     */
    @Column('bigint', {
        default: 0
    })
    profit: number;

    /**
     * 下注金币
     */
    @Column('bigint', {
        default: 0
    })
    betGoldAmount: number;

    /**
     * 玩家总投注次数统计
     */
    @Column('int', {
        default: 0
    })
    betRoundCount: number;

    /**
     * 抽水费
     */
    @Column('bigint', {
        default: 0
    })
    serviceCharge: number;

    /**
     * 被调控系统输的单
     */
    @Column('int', {
        default: 0
    })
    controlLossCount: number;

    /**
     * 被调控系统赢的单
     */
    @Column('int', {
        default: 0
    })
    controlWinCount: number;

    /**
     * 受调控影响不输不赢的单
     */
    @Column('int', {
        default: 0
    })
    controlEquality: number;

    /**
     * 系统杀率 算法为 利润 / 真实押注
     */
    @Column('float', {
        default: 0
    })
    killRate: number;

    /**
     * 系统胜率 赢单量 / 总的押注次数
     */
    @Column('float', {
        default: 0
    })
    systemWinRate: number;


    /** 玩家盈利的次数 */
    @Column('int', {
        default: 0
    })
    playerWinCount: number;

    /** 系统盈利次数 */
    @Column('int', {
        default: 0
    })
    systemWinCount: number;

    /** 系统和玩家平局的情况 */
    @Column('int', {
        default: 0
    })
    equalityCount: number;


    /**
     * 抽水费
     */
    @Column('json', {
        comment: "",
    })
    controlStateStatistical: any;


    /**
     * 下注玩家uid集合
     */
    @Column("json", {
        comment: "下注玩家uid集合",
    })
    betPlayersSet: any;


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