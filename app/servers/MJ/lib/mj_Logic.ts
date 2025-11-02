/**https://baike.baidu.com/item/%E4%BA%8C%E4%BA%BA%E9%BA%BB%E5%B0%86/1600047?fr=aladdin */
/*
麻将胡牌类型
*/
export enum Mj_Hu_Type {
    /**8.一般高 */
    MHT_1_8 = 0,
    /**7.老少副 */
    MHT_1_7,
    /**6.连六 */
    MHT_1_6,
    /**5.花牌 */
    MHT_1_5,
    /**4.明杠 */
    MHT_1_4,
    /**3.边张 */
    MHT_1_3,
    /**2.嵌张 */
    MHT_1_2,
    /**1.自摸 */
    MHT_1_1,

    /**8.箭刻 */
    MHT_2_8,
    /**7.平胡 */
    MHT_2_7,
    /**6.四归一 */
    MHT_2_6,
    /**5.断幺九 */
    MHT_2_5,
    /**4.双暗刻 */
    MHT_2_4,
    /**3.暗杠 */
    MHT_2_3,
    /**2.门前清 */
    MHT_2_2,
    /**1.报听 */
    MHT_2_1,

    /**4.胡绝张 */
    MHT_4_4,
    /**3.不求人 */
    MHT_4_3,
    /**2.双明杠 */
    MHT_4_2,
    /**1.全带幺 */
    MHT_4_1,

    /**6.全求人 */
    MHT_6_6,
    /**5.混一色 */
    MHT_6_5,
    /**4.双暗杠 */
    MHT_6_4,
    /**3.碰碰胡 */
    MHT_6_3,
    /**2.双箭刻 */
    MHT_6_2,
    /**1.小三风 */
    MHT_6_1,

    /**4.抢杠胡 */
    MHT_8_4,
    /**3.杠上开花 */
    MHT_8_3,
    /**2.海底捞月 */
    MHT_8_2,
    /**1.妙手回春 */
    MHT_8_1,

    /**5.清一色 */
    MHT_16_5,
    /**4.三暗刻 */
    MHT_16_4,
    /**3.全花 */
    MHT_16_3,
    /**2.三步高 */
    MHT_16_2,
    /**1.清龙 */
    MHT_16_1,

    /**5.三同顺 */
    MHT_24_5,
    /**4.三节高 */
    MHT_24_4,
    /**3.四字刻 */
    MHT_24_3,
    /**2.七对 */
    MHT_24_2,
    /**1.大三风 */
    MHT_24_1,

    /**4.天听 */
    MHT_32_4,
    /**3.三杠 */
    MHT_32_3,
    /**2.混幺九 */
    MHT_32_2,
    /**1.四步高 */
    MHT_32_1,

    /**4.四同顺 */
    MHT_48_4,
    /**3.四节高 */
    MHT_48_3,
    /**2.四喜七对 */
    MHT_48_2,
    /**1.三元七对 */
    MHT_48_1,

    /**6.人胡 */
    MHT_64_6,
    /**5.四暗刻 */
    MHT_64_5,
    /**4.字一色 */
    MHT_64_4,
    /**3.双龙会 */
    MHT_64_3,
    /**2.小三元 */
    MHT_64_2,
    /**1.小四喜 */
    MHT_64_1,

    /**10.地胡 */
    MHT_88_10,
    /**9.天胡 */
    MHT_88_9,
    /**8.四杠 */
    MHT_88_8,
    /**7.连七对 */
    MHT_88_7,
    /**6.大七星 */
    MHT_88_6,
    /**5.小于五 */
    MHT_88_5,
    /**4.大于五 */
    MHT_88_4,
    /**3.九莲宝灯 */
    MHT_88_3,
    /**2.大三元 */
    MHT_88_2,
    /**1.大四喜 */
    MHT_88_1,
};

export function getMj_string(mjs: number[]) {
    let cards = {
        // 1: "一万", 2: "二万", 3: "三万", 4: "四万", 5: "五万", 6: "六万", 7: "七万", 8: "八万", 9: "九万",
        1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9",
        49: "东", 50: "南", 51: "西", 52: "北", 53: "中", 54: "发", 55: "白",
        65: "春", 66: "夏", 67: "秋", 68: "冬", 69: "梅", 70: "兰", 71: "竹菊",
    };
    let str = "";
    for (const mj of mjs) {
        str = str + cards[`${mj}`] + ",";
    }
    return str;
}

/**
 * 打乱麻将
 */
export function shuffle_cards() {
    // 1.万子牌：从一万至九万，各4张，共36张。
    let cards = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,//万子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19,//饼子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        // 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29,//条子牌
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,//东南西北中发白（字牌）
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,//东南西北(风)中发白(箭)
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        // 春夏秋冬梅兰竹菊（花牌） 
        0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
        // 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    ];
    cards.sort((a, b) => 0.5 - Math.random());
    return cards;
}

export function is_can_hu(hand_mjs: number[], target: number) {
    // if ((hand_mjs.length - 2) % 3 != 0) {
    //     return false;
    // }
    let majiang_arr = new Array(0x37 + 1).fill(0);
    for (const mj of hand_mjs) {
        majiang_arr[mj] = majiang_arr[mj] + 1;
    }
    if (target != null) {
        majiang_arr[target] = majiang_arr[target] + 1;
    }
    return test_is_hu(majiang_arr);
}

export function test_is_hu(majiang_arr: number[]) {
    if (is_mht_qd(majiang_arr)) {
        return true;
    }
    //普通牌型
    let curr_index = 1;
    while (curr_index < majiang_arr.length) {
        let jiang = majiang_arr[curr_index];
        if (jiang >= 2) //能组成将牌
        {
            let majiang_arr_temp = majiang_arr.map(m => m); //临时手牌
            //去除将牌
            majiang_arr_temp[curr_index] -= 2;
            let sum = fuc_sum(majiang_arr_temp);
            if (sum == 0) {
                //单调胡牌
                return true;
            }
            if (test_common_hu(majiang_arr_temp) == false) {
                curr_index++;
                continue;
            }
            return true;
        }
        curr_index++;
    }
    return false;
}

/**majiang_arr_temp去除将牌测试是否普通胡 */
function test_common_hu(arr: number[]) {
    let len = fuc_sum(arr);
    for (let idx = 1; idx < arr.length; idx++) {
        if (arr[idx] == 0) {
            continue;
        }
        if (idx >= 0x31) {
            // if (arr[idx] == 2) {
            //     arr[idx] -= 2;
            // }
            if (arr[idx] == 3) {
                arr[idx] -= 3;
            }
        } else {
            if (arr[idx] == 1 || arr[idx] == 2 || arr[idx] == 4)// 如果这个字出现了1、2、4次
            {
                // if (idx > len - 2)// 如果后面没有牌，则一定不能胡牌
                // {
                //     return false;
                // }
                if (arr[idx + 1] == 0 || arr[idx + 2] == 0) {
                    return false;// 如果后面的两个字，有一个是没牌的，则不能胡牌
                }
                // 后面还有至少2连续的字
                arr[idx]--;
                arr[idx + 1]--;
                arr[idx + 2]--;
                idx--;
            } else if (arr[idx] == 3) {
                arr[idx] -= 3;
            }
        }
    }
    return (fuc_sum(arr) == 0);// 如果没有剩余的牌，则表示可以胡牌
}
/**是否七对 */
function is_mht_qd(majiang_arr: number[]) {
    let dui_num = 0;
    for (let i = 0; i < majiang_arr.length; i++) {
        if (majiang_arr[i] == 4) {
            dui_num += 2;
        }
        else if (majiang_arr[i] == 3) {
            dui_num += 1;
        }
        else if (majiang_arr[i] == 2) {
            dui_num += 1;
        }
    }
    if (dui_num == 7) {
        return true;
    }
    return false;
}
function fuc_sum(arr: number[]) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}





function CheckTing(majiang_arr: number[]) {
    let len = majiang_arr.length;
    let hu_cards: number[] = [];

    for (let i = 1; i < majiang_arr.length; i++) {
        if (i > 0x09 && i < 0x31) {
            continue;
        }
        let majiang_arr_temp = majiang_arr.map(m => m);
        majiang_arr_temp[i] = majiang_arr_temp[i] + 1;
        if (test_is_hu(majiang_arr_temp)) {
            hu_cards.push(i);
        }
    }
    return hu_cards;
}

export function is_jiao(hand_mjs: number[]) {
    let majiang_arr = new Array(0x37 + 1).fill(0);
    for (const mj of hand_mjs) {
        majiang_arr[mj] = majiang_arr[mj] + 1;
    }
    return CheckTing(majiang_arr);
}

/**去掉一张牌后 下jiao */
export function is_can_ting(hand_mjs: number[]) {
    let curr_index = 0;
    while (curr_index < hand_mjs.length) {
        let majiang_arr_temp = hand_mjs.map(m => m); //临时手牌
        majiang_arr_temp.splice(curr_index, 1);
        if (is_jiao(majiang_arr_temp).length > 0) {
            // console.warn(curr_index, mj_Logic.is_jiao(majiang_arr_temp))
            return true;
        }
        curr_index++;
    }
    return false;
}

/**清理发出的棋牌 */
export function arr_erase_one(hand_majiang: number[], target: number, erase_num = 1) {
    let del_count = 0;
    for (let i = hand_majiang.length - 1; i > -1; i--) {
        if (hand_majiang[i] == target) {
            hand_majiang.splice(i, 1);
            del_count++;
            if (del_count == erase_num)
                break;
        }
    }
    return hand_majiang;
};

export function is_can_peng(hand_majiang: number[], target: number) {
    let num = 0;
    for (let i = 0; i < hand_majiang.length; i++) {
        const mj = hand_majiang[i];
        if (mj == target) {
            num++;
        }
    }
    if (num >= 2) {
        return true;
    }
    return false;
}

export function is_can_chi(hand_majiang: number[], target: number) {
    //123 234 345 456 567 678 789 
    //{t,0,0}    {0,t,0}     {0,0,t} 
    if (target > 0x9) {
        return false;
    }
    if (hand_majiang.includes(target + 1) && hand_majiang.includes(target + 2)) {
        return true;
    }
    if (hand_majiang.includes(target - 1) && hand_majiang.includes(target + 1)) {
        return true;
    }
    if (hand_majiang.includes(target - 1) && hand_majiang.includes(target - 2)) {
        return true;
    }
    return false;
}

export function is_can_gang(hand_majiang: number[], target: number) {
    let num = 0;
    for (let i = 0; i < hand_majiang.length; i++) {
        const mj = hand_majiang[i];
        if (mj == target) {
            num++;
        }
    }
    if (num >= 3) {
        return true;
    }
    return false;
}

export function find_gang(hand_majiang: number[]) {
    for (let i = 0; i < hand_majiang.length; i++) {
        const mj = hand_majiang[i];
        let temp = hand_majiang.map(c => c);
        temp.splice(i, 1);
        if (is_can_gang(temp, mj)) {
            return mj;
        }
    }
    return null;
}
export function find_ba_gang(tai_majiang: number[], hand_majiang: number[]) {
    for (const mj of hand_majiang) {
        if (is_can_gang(tai_majiang, mj)) {
            return true;
        }
    }
    return false;
}

export class HuPaiSuanFa {
    /**顺子 */
    shunzi_arr: number[][] = [];
    /**刻子 */
    kezi_arr: number[][] = [];
    majiang_arr: number[] = new Array(0x37 + 1).fill(0);

    private jiang = 0;
    /**将牌 */
    jiang_pai = 0;
    /**分析牌型 */
    public AnaTileType(hand_mjs: number[], target: number) {
        for (const mj of hand_mjs) {
            this.majiang_arr[mj] = this.majiang_arr[mj] + 1;
        }
        if (target != null) {
            this.majiang_arr[target] = this.majiang_arr[target] + 1;
        }
        let curr_index = 1;
        while (curr_index < this.majiang_arr.length) {
            this.jiang = this.majiang_arr[curr_index];
            this.jiang_pai = curr_index;
            this.kezi_arr = [];
            this.shunzi_arr = [];
            if (this.jiang == 2) //能组成将牌
            {
                let majiang_arr_temp = this.majiang_arr.map(m => m); //临时手牌
                //去除将牌
                majiang_arr_temp[curr_index] -= 2;
                let sum = fuc_sum(majiang_arr_temp);
                if (sum == 0) {
                    //单调胡牌
                    return true;
                }
                if (this.common_hu(majiang_arr_temp) == false) {
                    curr_index++;
                    continue;
                }
                return true;
            }
            curr_index++;
        }
        {
            let curr_index = 1;
            while (curr_index < this.majiang_arr.length) {
                this.jiang = this.majiang_arr[curr_index];
                this.jiang_pai = curr_index;
                this.kezi_arr = [];
                this.shunzi_arr = [];
                if (this.jiang > 2) //能组成将牌
                {
                    let majiang_arr_temp = this.majiang_arr.map(m => m); //临时手牌
                    //去除将牌
                    majiang_arr_temp[curr_index] -= 2;
                    let sum = fuc_sum(majiang_arr_temp);
                    if (sum == 0) {
                        //单调胡牌
                        return true;
                    }
                    if (this.common_hu(majiang_arr_temp) == false) {
                        curr_index++;
                        continue;
                    }
                    return true;
                }
                curr_index++;
            }
        }
        return false;
    }
    /**7.平胡：四副顺子加一副序数牌将牌的胡牌牌型。 */
    public handler_ZhuanHuan_Arr(hand_mjs: number[], target: number) {
        if (this.AnaTileType(hand_mjs, target) && this.shunzi_arr.length == 4) {
            return true;
        }
        return false;
    }
    /*一般高 */
    public handler_yibangao(hand_mjs: number[], target: number) {
        this.AnaTileType(hand_mjs, target);
        if (this.shunzi_arr.length >= 2) {
            for (let i = 0; i < this.shunzi_arr.length - 1; i++) {
                const arr1 = this.shunzi_arr[i];
                for (let j = i + 1; j < this.shunzi_arr.length; j++) {
                    const arr2 = this.shunzi_arr[j];
                    if (arr1.toString() == arr2.toString()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    /** 
     * target 0嵌张 1边张 参考腾讯二人麻将帮助文档
    */
    public handler_qian_bian_zhang(hand_mjs: number[], target: number) {
        const hu_mj = hand_mjs[hand_mjs.length - 1];
        this.AnaTileType(hand_mjs, target);
        let total = 0;
        let flag = false;
        for (const arr of this.shunzi_arr) {
            if (arr.includes(hu_mj)) {
                total++;
                if (target == 0 && arr[1] == hu_mj) {
                    flag = true;
                }
                if (target == 1 && (arr[0] == hu_mj || arr[2] == hu_mj)) {

                }
            }
        }
        if (total == 1 && flag) {
            return true;
        }
        return false;
    }

    /**全带幺 */
    public quandaiyao(hand_mjs: number[]) {
        this.AnaTileType(hand_mjs, null);
        const ret1 = this.shunzi_arr.every(c => c[0] == 0x1 || c[2] == 0x9);
        const ret2 = this.kezi_arr.every(c => c[0] == 0x1 || c[2] == 0x9);
        return (this.shunzi_arr.length > 0 || this.kezi_arr.length > 0) && ret1 && ret2;
    }

    /**顺子 只包含顺子 */
    protected common_hu(arr: number[]) {
        for (let idx = 1; idx < arr.length; idx++) {
            if (arr[idx] == 0) {
                continue;
            }
            if (idx <= 0x9) {
                if (arr[idx] >= 1 && arr[idx + 1] >= 1 && arr[idx + 2] >= 1)// 如果这个字出现了1、2、4次
                {
                    // if (arr[idx + 1] == 0 || arr[idx + 2] == 0) {
                    //     return false;// 如果后面的两个字，有一个是没牌的，则不能胡牌
                    // }
                    // 后面还有至少2连续的字
                    this.shunzi_arr.push([idx, idx + 1, idx + 2]);
                    arr[idx]--;
                    arr[idx + 1]--;
                    arr[idx + 2]--;
                    idx--;
                }
                if (arr[idx] == 3) {
                    arr[idx] -= 3;
                    this.kezi_arr.push([idx, idx, idx]);
                }
            } else {
                if (arr[idx] == 3) {
                    arr[idx] -= 3;
                    this.kezi_arr.push([idx, idx, idx]);
                }
            }
        }
        return (fuc_sum(arr) == 0);// 如果没有剩余的牌，则表示可以胡牌
    }
    /**是否七对 */
    public is_mht_qd() {
        let dui_num = 0;
        for (let i = 0; i < this.majiang_arr.length; i++) {
            if (this.majiang_arr[i] == 4) {
                dui_num += 2;
            }
            else if (this.majiang_arr[i] == 3) {
                dui_num += 1;
            }
            else if (this.majiang_arr[i] == 2) {
                dui_num += 1;
            }
        }
        if (dui_num == 7) {
            return true;
        }
        return false;
    }
    protected fuc_sum(arr: number[]) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}
