import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, CreateDateColumn} from "typeorm";
import {IsDate} from "class-validator";
/**
 *  后台管理账号表结构
 */
@Entity("Sp_ManagerInfo")
export class ManagerInfo {
    @PrimaryGeneratedColumn()
    id: number;
    /** 用户名 */
    @Column({
        nullable: true,
        comment: "用户名"
    })
    userName: string;
    /** 用户名密码 */
    @Column({
        nullable: true,
        comment: "用户名密码"
    })
    passWord: string;
    /** 后台管理人员编号 */
    @Column({
        nullable: true,
        comment: "后台管理人员编号"
    })
    managerId: string;
    /** 后台备注信息 */
    @Column({
        nullable: true,
        comment: "后台备注信息"
    })
    remark: string;
    /**  存储代理账号*/
    @Column({
        nullable: true,
        comment: "存储代理账号"
    })
    agent: string;

    /**  存储代理账号 uid*/
    @Column({
        nullable: true,
        comment: "存储代理账号uid"
    })
    platformUid: string;

    /**  账号角色  */
    @Column({
        nullable: true,
        comment: "账号角色"
    })
    role: string;

    /**  白名单ip */
    @Column("json",{
        nullable: true,
        comment: "白名单ip"
    })
    ip: any;

    /**  顶部总代账号 */
    @Column({
        nullable: true,
        comment: "顶部总代账号"
    })
    rootAgent: string;

    /**  父级账号 */
    @Column({
        nullable: true,
        comment: "父级账号"
    })
    parentAgent: string;

    /**  token */
    @Column({
        nullable: true,
        comment: "token"
    })
    token: string;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createTime: Date;

}
