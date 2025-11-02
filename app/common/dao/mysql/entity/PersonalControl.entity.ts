import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, AfterUpdate} from 'typeorm'
import {IsDate} from "class-validator";

/**
 * 单个游戏个人调控表
 */
@Entity('Sp_PersonalControl')
export class PersonalControl {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property nid 场控 游戏id
     */
    @Column('varchar', {
        name: 'game_id',
        length: 3,
    })
    nid: string;

    /**
     * @property 游戏中文名
     */
    @Column("varchar", {
        name: "name_zh",
        length: 12
    })
    gameName: string;

    /**
     * @property 游戏场中文名
     */
    @Column("varchar", {
        length: 12
    })
    sceneName: string;

    /**
     * @property 调控描述
     */
    @Column("varchar", {
        length: 20,
        default: ''
    })
    conditionDescription: string;


    /**
     * @property 游戏场ID
     */
    @Column('int')
    sceneId: number;

    /**
     * @property 庄杀概率
     */
    @Column('int')
    playersCount: number;

    /**
     * @property 调控玩家
     */
    @Column("json", {
        comment: "调控玩家",
        nullable: true
    })
    controlPlayersMap: any;


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