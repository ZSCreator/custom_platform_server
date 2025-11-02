import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  充值商品
 */
@Entity("Sp_ShopGold")
export class ShopGold {

    @PrimaryGeneratedColumn()
    id: number;
    /** 
     * @property 金币商品名称
     */
    @Column()
    name: string;

    /** 商品描述 */
    @Column()
    dese: string;

    /** 商品价格 */
    @Column("int",{ default: 0 })
    price: number;

    /** 商品语言 */
    @Column()
    language: string;

    /**  商品顺序 */
    @Column("int",{ default: 0 })
    sort: number;

    /**  是否开启 */
    @Column("boolean",{ default: 1 })
    isOpen: boolean;

    /**  得到的金币 */
    @Column("int",{ default: 0 })
    gold: number;
    /** 创建时间 */
    @Column()
    @IsDate()
    createDate: Date;

    @BeforeInsert()
    private initCreateDate() {
        // this.createDate = moment().format("YYYY年MM月DD日 HH:mm:ss");
        this.createDate = new Date();
    }



}
