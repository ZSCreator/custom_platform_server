import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn } from "typeorm";

/**
 * @name 服务器记录后台操作日志
 */
@Entity("Sp_ManagerLogs")
export class ManagerLogs {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "操作人"
    })
    mangerUserName: string;

    @Column({
        nullable: true,
        comment: "请求IP"
    })
    requestIp: string;

    @Column({
        nullable: true,
        comment: "请求的接口名"
    })
    requestName: string;

    @Column({
        nullable: true,
        comment: "请求参数"
    })
    requestBody: string;

    @CreateDateColumn({
        comment:"创建时间"
    })
    createDate: Date;
}
