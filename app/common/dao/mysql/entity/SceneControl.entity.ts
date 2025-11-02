import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate} from 'typeorm'
import {IsDate} from "class-validator";

/**
 * 场控表
 */
@Entity('Sp_SceneControl')
export class SceneControl {
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


    @Column("varchar", {
        name: "name_zh",
        length: 12
    })
    gameName: string;


    @Column("varchar", {
        length: 12
    })
    sceneName: string;


    @Column("int")
    baseSystemWinRate: number;


    @Column('int')
    sceneId: number;

    @Column('int')
    bankerKillProbability: number;

    @Column('int')
    weights: number;

    @Column('boolean')
    bankerGame: boolean;

    @Column('boolean')
    lockPool: boolean;

    @Column({ nullable: true })
    @IsDate()
    updateTime: Date | null = new Date();


    @Column()
    @IsDate()
    createTime: Date ;


    @BeforeInsert()
    private firstInsert() {
        this.createTime = new Date();
    }

    @BeforeUpdate()
    private everyUpdate() {
        this.updateTime = new Date();
    }

}