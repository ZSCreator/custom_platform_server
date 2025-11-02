"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuPaiSuanFa = exports.find_ba_gang = exports.find_gang = exports.is_can_gang = exports.is_can_chi = exports.is_can_peng = exports.arr_erase_one = exports.is_can_ting = exports.is_jiao = exports.test_is_hu = exports.is_can_hu = exports.shuffle_cards = exports.getMj_string = exports.Mj_Hu_Type = void 0;
var Mj_Hu_Type;
(function (Mj_Hu_Type) {
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_8"] = 0] = "MHT_1_8";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_7"] = 1] = "MHT_1_7";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_6"] = 2] = "MHT_1_6";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_5"] = 3] = "MHT_1_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_4"] = 4] = "MHT_1_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_3"] = 5] = "MHT_1_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_2"] = 6] = "MHT_1_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_1_1"] = 7] = "MHT_1_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_8"] = 8] = "MHT_2_8";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_7"] = 9] = "MHT_2_7";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_6"] = 10] = "MHT_2_6";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_5"] = 11] = "MHT_2_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_4"] = 12] = "MHT_2_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_3"] = 13] = "MHT_2_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_2"] = 14] = "MHT_2_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_2_1"] = 15] = "MHT_2_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_4_4"] = 16] = "MHT_4_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_4_3"] = 17] = "MHT_4_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_4_2"] = 18] = "MHT_4_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_4_1"] = 19] = "MHT_4_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_6"] = 20] = "MHT_6_6";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_5"] = 21] = "MHT_6_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_4"] = 22] = "MHT_6_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_3"] = 23] = "MHT_6_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_2"] = 24] = "MHT_6_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_6_1"] = 25] = "MHT_6_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_8_4"] = 26] = "MHT_8_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_8_3"] = 27] = "MHT_8_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_8_2"] = 28] = "MHT_8_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_8_1"] = 29] = "MHT_8_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_16_5"] = 30] = "MHT_16_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_16_4"] = 31] = "MHT_16_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_16_3"] = 32] = "MHT_16_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_16_2"] = 33] = "MHT_16_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_16_1"] = 34] = "MHT_16_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_24_5"] = 35] = "MHT_24_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_24_4"] = 36] = "MHT_24_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_24_3"] = 37] = "MHT_24_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_24_2"] = 38] = "MHT_24_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_24_1"] = 39] = "MHT_24_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_32_4"] = 40] = "MHT_32_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_32_3"] = 41] = "MHT_32_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_32_2"] = 42] = "MHT_32_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_32_1"] = 43] = "MHT_32_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_48_4"] = 44] = "MHT_48_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_48_3"] = 45] = "MHT_48_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_48_2"] = 46] = "MHT_48_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_48_1"] = 47] = "MHT_48_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_6"] = 48] = "MHT_64_6";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_5"] = 49] = "MHT_64_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_4"] = 50] = "MHT_64_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_3"] = 51] = "MHT_64_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_2"] = 52] = "MHT_64_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_64_1"] = 53] = "MHT_64_1";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_10"] = 54] = "MHT_88_10";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_9"] = 55] = "MHT_88_9";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_8"] = 56] = "MHT_88_8";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_7"] = 57] = "MHT_88_7";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_6"] = 58] = "MHT_88_6";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_5"] = 59] = "MHT_88_5";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_4"] = 60] = "MHT_88_4";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_3"] = 61] = "MHT_88_3";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_2"] = 62] = "MHT_88_2";
    Mj_Hu_Type[Mj_Hu_Type["MHT_88_1"] = 63] = "MHT_88_1";
})(Mj_Hu_Type = exports.Mj_Hu_Type || (exports.Mj_Hu_Type = {}));
;
function getMj_string(mjs) {
    let cards = {
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
exports.getMj_string = getMj_string;
function shuffle_cards() {
    let cards = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
        0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    ];
    cards.sort((a, b) => 0.5 - Math.random());
    return cards;
}
exports.shuffle_cards = shuffle_cards;
function is_can_hu(hand_mjs, target) {
    let majiang_arr = new Array(0x37 + 1).fill(0);
    for (const mj of hand_mjs) {
        majiang_arr[mj] = majiang_arr[mj] + 1;
    }
    if (target != null) {
        majiang_arr[target] = majiang_arr[target] + 1;
    }
    return test_is_hu(majiang_arr);
}
exports.is_can_hu = is_can_hu;
function test_is_hu(majiang_arr) {
    if (is_mht_qd(majiang_arr)) {
        return true;
    }
    let curr_index = 1;
    while (curr_index < majiang_arr.length) {
        let jiang = majiang_arr[curr_index];
        if (jiang >= 2) {
            let majiang_arr_temp = majiang_arr.map(m => m);
            majiang_arr_temp[curr_index] -= 2;
            let sum = fuc_sum(majiang_arr_temp);
            if (sum == 0) {
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
exports.test_is_hu = test_is_hu;
function test_common_hu(arr) {
    let len = fuc_sum(arr);
    for (let idx = 1; idx < arr.length; idx++) {
        if (arr[idx] == 0) {
            continue;
        }
        if (idx >= 0x31) {
            if (arr[idx] == 3) {
                arr[idx] -= 3;
            }
        }
        else {
            if (arr[idx] == 1 || arr[idx] == 2 || arr[idx] == 4) {
                if (arr[idx + 1] == 0 || arr[idx + 2] == 0) {
                    return false;
                }
                arr[idx]--;
                arr[idx + 1]--;
                arr[idx + 2]--;
                idx--;
            }
            else if (arr[idx] == 3) {
                arr[idx] -= 3;
            }
        }
    }
    return (fuc_sum(arr) == 0);
}
function is_mht_qd(majiang_arr) {
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
function fuc_sum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
function CheckTing(majiang_arr) {
    let len = majiang_arr.length;
    let hu_cards = [];
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
function is_jiao(hand_mjs) {
    let majiang_arr = new Array(0x37 + 1).fill(0);
    for (const mj of hand_mjs) {
        majiang_arr[mj] = majiang_arr[mj] + 1;
    }
    return CheckTing(majiang_arr);
}
exports.is_jiao = is_jiao;
function is_can_ting(hand_mjs) {
    let curr_index = 0;
    while (curr_index < hand_mjs.length) {
        let majiang_arr_temp = hand_mjs.map(m => m);
        majiang_arr_temp.splice(curr_index, 1);
        if (is_jiao(majiang_arr_temp).length > 0) {
            return true;
        }
        curr_index++;
    }
    return false;
}
exports.is_can_ting = is_can_ting;
function arr_erase_one(hand_majiang, target, erase_num = 1) {
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
}
exports.arr_erase_one = arr_erase_one;
;
function is_can_peng(hand_majiang, target) {
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
exports.is_can_peng = is_can_peng;
function is_can_chi(hand_majiang, target) {
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
exports.is_can_chi = is_can_chi;
function is_can_gang(hand_majiang, target) {
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
exports.is_can_gang = is_can_gang;
function find_gang(hand_majiang) {
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
exports.find_gang = find_gang;
function find_ba_gang(tai_majiang, hand_majiang) {
    for (const mj of hand_majiang) {
        if (is_can_gang(tai_majiang, mj)) {
            return true;
        }
    }
    return false;
}
exports.find_ba_gang = find_ba_gang;
class HuPaiSuanFa {
    constructor() {
        this.shunzi_arr = [];
        this.kezi_arr = [];
        this.majiang_arr = new Array(0x37 + 1).fill(0);
        this.jiang = 0;
        this.jiang_pai = 0;
    }
    AnaTileType(hand_mjs, target) {
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
            if (this.jiang == 2) {
                let majiang_arr_temp = this.majiang_arr.map(m => m);
                majiang_arr_temp[curr_index] -= 2;
                let sum = fuc_sum(majiang_arr_temp);
                if (sum == 0) {
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
                if (this.jiang > 2) {
                    let majiang_arr_temp = this.majiang_arr.map(m => m);
                    majiang_arr_temp[curr_index] -= 2;
                    let sum = fuc_sum(majiang_arr_temp);
                    if (sum == 0) {
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
    handler_ZhuanHuan_Arr(hand_mjs, target) {
        if (this.AnaTileType(hand_mjs, target) && this.shunzi_arr.length == 4) {
            return true;
        }
        return false;
    }
    handler_yibangao(hand_mjs, target) {
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
    handler_qian_bian_zhang(hand_mjs, target) {
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
    quandaiyao(hand_mjs) {
        this.AnaTileType(hand_mjs, null);
        const ret1 = this.shunzi_arr.every(c => c[0] == 0x1 || c[2] == 0x9);
        const ret2 = this.kezi_arr.every(c => c[0] == 0x1 || c[2] == 0x9);
        return (this.shunzi_arr.length > 0 || this.kezi_arr.length > 0) && ret1 && ret2;
    }
    common_hu(arr) {
        for (let idx = 1; idx < arr.length; idx++) {
            if (arr[idx] == 0) {
                continue;
            }
            if (idx <= 0x9) {
                if (arr[idx] >= 1 && arr[idx + 1] >= 1 && arr[idx + 2] >= 1) {
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
            }
            else {
                if (arr[idx] == 3) {
                    arr[idx] -= 3;
                    this.kezi_arr.push([idx, idx, idx]);
                }
            }
        }
        return (fuc_sum(arr) == 0);
    }
    is_mht_qd() {
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
    fuc_sum(arr) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}
exports.HuPaiSuanFa = HuPaiSuanFa;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWpfTG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9NSi9saWIvbWpfTG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsSUFBWSxVQTJJWDtBQTNJRCxXQUFZLFVBQVU7SUFFbEIsaURBQVcsQ0FBQTtJQUVYLGlEQUFPLENBQUE7SUFFUCxpREFBTyxDQUFBO0lBRVAsaURBQU8sQ0FBQTtJQUVQLGlEQUFPLENBQUE7SUFFUCxpREFBTyxDQUFBO0lBRVAsaURBQU8sQ0FBQTtJQUVQLGlEQUFPLENBQUE7SUFHUCxpREFBTyxDQUFBO0lBRVAsaURBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFFUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFFUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUdQLGtEQUFPLENBQUE7SUFFUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFHUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFFUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFHUCxrREFBTyxDQUFBO0lBRVAsa0RBQU8sQ0FBQTtJQUVQLGtEQUFPLENBQUE7SUFFUCxrREFBTyxDQUFBO0lBR1Asb0RBQVEsQ0FBQTtJQUVSLG9EQUFRLENBQUE7SUFFUixvREFBUSxDQUFBO0lBRVIsb0RBQVEsQ0FBQTtJQUVSLG9EQUFRLENBQUE7SUFHUixvREFBUSxDQUFBO0lBRVIsb0RBQVEsQ0FBQTtJQUVSLG9EQUFRLENBQUE7SUFFUixvREFBUSxDQUFBO0lBRVIsb0RBQVEsQ0FBQTtJQUdSLG9EQUFRLENBQUE7SUFFUixvREFBUSxDQUFBO0lBRVIsb0RBQVEsQ0FBQTtJQUVSLG9EQUFRLENBQUE7SUFHUixvREFBUSxDQUFBO0lBRVIsb0RBQVEs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