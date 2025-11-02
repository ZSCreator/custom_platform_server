import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";

/**
 * 租户调控返奖率必杀
 */
@Entity("Sp_TenantControlAwardKill")
export class TenantControlAwardKill {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 租户
     */
    @Column()
    tenant: string;

    /**
     * 返奖率
     */
    @Column()
    returnAwardRate: number;

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
