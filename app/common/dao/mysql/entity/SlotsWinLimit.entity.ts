import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  充值商品
 */
@Entity("Sp_SlotsWinLimit")
export class SlotsWinLimit {

    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @property 游戏id
     */
    @Column()
    nid: string;

    /** 具体配置 */
    @Column('json', {
        comment: '具体配置'
    })
    winLimitConfig: object;

    /**
     * @property 更新时间
     */
    @Column({ nullable: true })
    @IsDate()
    updateTime: Date | null = new Date();

    @BeforeUpdate()
    private everyUpdate() {
        this.updateTime = new Date();
    }

    /** 创建时间 */
    @Column()
    @IsDate()
    createTime: Date;

    @BeforeInsert()
    private initCreateDate() {
        // this.createTime = moment().format("YYYY年MM月DD日 HH:mm:ss");
        this.createTime = new Date();
    }



}
