import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";

/**
 * 租户调控必杀
 */
@Entity("Sp_TenantControlTotalBetKill")
export class TenantControlTotalBetKill {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 租户
     */
    @Column()
    tenant: string;

    /**
     * y
     */
    @Column()
    totalBet: number;

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
