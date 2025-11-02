import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
/**
 *  玩家银行卡相关信息
 */
@Entity("Sp_PlayerBank")
export class PlayerBank {

    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @property 玩家uid
     */
    @Column({unique: true})
    uid: string;
    /** 
     * @property 银行卡卡号
     */
    @Column({ nullable: true })
    bankCardNo: string;

    /** 开户行 */
    @Column({ nullable: true })
    bankName: string;

    /** IFSC CODE（金融系统码） */
    @Column({ nullable: true })
    ifscCode: string;

    /**  邮件 */
    @Column({ nullable: true })
    email: string;

    /** 银行卡用户名 */
    @Column({ nullable: true })
    bankUserName: string;

    /** UPI用户名 */
    @Column({ nullable: true })
    upiUserName: string;
    /** UPI地址 */
    @Column({ nullable: true })
    upiAddress: string;
    /** UPI手机号 */
    @Column({ nullable: true })
    upiPhone: string;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;


}
