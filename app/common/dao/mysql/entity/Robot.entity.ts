import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterLoad } from "typeorm";
import { RoleEnum } from "../../../constant/player/RoleEnum";
import { IsInt, Min } from "class-validator";
import { LANGUAGE } from "../../../../consts/hallConst";
import { PositionEnum } from "../../../constant/player/PositionEnum";

@Entity("Sp_Robot")
export class Robot {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 玩家id
     */
    @Column("varchar", {
        name: "pk_uid",
        length: 8,
        unique: true
    })
    uid: string;

    /**
     * @property 玩家昵称
     */
    @Column("varchar", { length: 15 })
    nickname: string;

    /**
     * @property 玩家头像
     */
    @Column("varchar", { length: 10 })
    headurl: string;

    /**
     * @property 玩家金币
     * @description 单位为分
     */
    @Column({
        type: "int",
        default: 0
    })
    @IsInt()
    @Min(0)
    gold: number;

    /**
     * @property 语言
     */
    @Column("varchar", {
        default: LANGUAGE.DEFAULT,
        length: 15
    })
    language: string;


    /**
     * @property 创建时间
     */
    @Column()
    createTime: Date;

    /**
     * @property 角色身份
     * @description 0为真实玩家 3 为测试玩家 2 为机器人
     */
    @Column("int", {
        default: RoleEnum.ROBOT
    })
    isRobot: RoleEnum;


    /**
     * @property 服务器名字
     */
    @Column({ nullable: true })
    sid: string;

    /**
     * @property vip积分
     */
    @Column({ default: 0 })
    vipScore: number;

    /**
     * @property 玩家所处的位置
     * @property 0 大厅,1 选场list,2 游戏(房间)
     */
    @Column({ default: PositionEnum.HALL })
    position: PositionEnum;


    /**
     * @property 游客Id
     */
    @Column({ default: "" })
    guestid: string;

    /**
     * @property 机器人是否在线
     */
    @Column({ default: 0 })
    robotOnLine: boolean;

    /**
     * @property 是否在线
     */
    onLine: boolean;

    /**
     * @property 是否恢复在线
     */
    isOnLine: boolean;

    /**
     * @property 新最后一次操作 时间戳 单位秒
     */
    updatetime: number;

    @AfterLoad()
    private afterLoad() {
        this.onLine = false;
        this.isOnLine = false;
    }

    @BeforeInsert()
    private init() {
        this.createTime = new Date();
    }
}
