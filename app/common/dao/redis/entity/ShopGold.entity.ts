
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 短信验证码，验证的记录
 */
const propExclude = ["name", "dese", "price", "language" ,"sort" , "isOpen" , "gold"];

export class ShopGoldInRedis {
    /** 验证码 */
    id: number;
    /** 金币商品名称 */
    name: string;
    /** 商品描述 */
    dese: string;
    /** 商品价格 */
    price: number;
    /** 商品语言 */
    language: string;
    /** 商品顺序 */
    sort: number;
    /** 是否开启 */
    isOpen: boolean;
    /** 得到的金币 */
    gold: number;
    /** 创建时间 */
    createDate: Date;

    constructor(initPropList: initPropList<ShopGoldInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

