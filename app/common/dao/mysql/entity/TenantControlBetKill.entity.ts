import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";

/**
 * 租户押注必杀调控
 */
@Entity("Sp_TenantControlBetKill")
export class TenantControlBetKill {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tenant: string;

    @Column()
    bet: number;

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
