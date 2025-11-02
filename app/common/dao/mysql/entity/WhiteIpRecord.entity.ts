import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, Index, CreateDateColumn} from "typeorm";
import {IsDate} from "class-validator";
/**
 *  后台白名单
 */
@Entity("Sp_WhiteIpRecord")
export class WhiteIpRecord {
    @PrimaryGeneratedColumn()
    id: number;
    /** 绑定ip */
    @Column({
        comment: "绑定ip"
    })
    ip: string;
    /**  后台管理账号  */
    @Column({
        comment: "后台管理账号"
    })
    account: string;

    /**  描述  */
    @Column({
        nullable: true,
        comment: "后台管理账号"
    })
    message: string;

    /**  创建ip的账号  */
    @Column({
        comment: "创建ip的账号"
    })
    createUser: string;

    /** 创建时间 */
    @CreateDateColumn({
        comment: "创建时间"
    })
    createTime: Date;


}
