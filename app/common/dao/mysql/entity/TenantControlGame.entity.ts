import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";

/**
 * 租户调控必杀
 */
@Entity("Sp_TenantControlGame")
export class TenantControlGame {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 租户
     */
    @Column()
    tenant: string;

    /**
     * 场名字
     */
    @Column()
    sceneName: string;

    /**
     * 游戏id
     */
    @Column()
    nid: string;


    /**
     * 场id
     */
    @Column()
    sceneId: number;

    /**
     * 调控概率
     */
    @Column()
    probability: number;

    @Column()
    @IsDate()
    createDate: Date;

    @Column()
    @IsDate()
    updatedDate: Date | null;

    @BeforeInsert()
    private initCreateDate() {
        this.createDate = new Date();
        this.updatedDate = new Date();
    }

    @BeforeUpdate()
    private updateDate() {
        this.updatedDate = new Date();
    }
}
