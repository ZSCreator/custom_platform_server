import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  游戏的预警事件
 */
@Entity("Sp_MailRecord")
export class MailRecord {

    @PrimaryGeneratedColumn()
    id: number;

    /** uid */
    @Column()
    uid: string;

    /** 邮件发送者 */
    @Column()
    sender: string;

    /** 邮件类型 */
    @Column({ default: 0 })
    type: number;

    /**  邮件昵称 */
    @Column()
    name: string;

    /**  邮件的内容 */
    @Column()
    content: string;

    /** 邮件携带金币  */
    @Column({ default: 0 })
    gold: number;

    /**  是否已读 */
    @Column({ default: false })
    isRead: boolean;

    /**  是否删除 */
    @Column({ default: false })
    isDelete: boolean;

    /** 创建时间 */
    @Column()
    @IsDate()
    createDate: Date;

    /** 更新时间 */
    @Column({ nullable: true })
    @IsDate()
    updatedDate: Date | null;

    @BeforeInsert()
    private initCreateDate() {
        // this.createDate = moment().format("YYYY年MM月DD日 HH:mm:ss");
        this.createDate = new Date();
    }

    @BeforeUpdate()
    private updateDate() {
        this.updatedDate = new Date();
    }

}
