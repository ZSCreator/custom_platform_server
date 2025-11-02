"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRanomByWeight = exports.random = exports.points = exports.BetAreas = void 0;
const mj_Logic = require("../../app/servers/MJ/lib/mj_Logic");
const utils = require("../../app/utils");
class Cname {
    constructor() {
        this.hand_majiang = [];
        this.tai_majiang = [];
        this.an_gang_majiang = [];
        this.an_gang_num = 0;
        this.ming_gang_num = 0;
        this.hua_majiang = [];
        this.chi_majiang = [];
    }
    possible_max_fan() {
        let res_fan_arr = [];
        let majiang_arr = [];
        majiang_arr.push(...this.hand_majiang);
        for (const c of this.tai_majiang) {
            majiang_arr.push(c);
        }
        for (const c of this.an_gang_majiang) {
            majiang_arr.push(c);
        }
        majiang_arr.sort((a, b) => a - b);
        let fengke_num = 0;
        let feng_j_num = 0;
        let zike_num = 0;
        let jianke_num = 0;
        let jian_j_num = 0;
        let is_7dui = false;
        let tongshun_num = 0;
        let tongkezi_num = 0;
        let total_kezi = 0;
        let an_total_kezi = 0;
        let all_TileType = [...this.hand_majiang];
        let AI_all_TileType = new mj_Logic.HuPaiSuanFa();
        AI_all_TileType.AnaTileType(all_TileType, null);
        let temp_chi_majiang = this.chi_majiang.slice();
        let chi_shunzi_arr = [];
        while (temp_chi_majiang.length >= 3) {
            chi_shunzi_arr.push([temp_chi_majiang.shift(), temp_chi_majiang.shift(), temp_chi_majiang.shift()]);
        }
        while (AI_all_TileType.shunzi_arr.length >= 1) {
            chi_shunzi_arr.push(AI_all_TileType.shunzi_arr.shift());
        }
        for (const temp_shunzi of chi_shunzi_arr) {
            let cc = chi_shunzi_arr.filter(c => c.toString() == temp_shunzi.toString()).length;
            if (cc == 3) {
                tongshun_num = 3;
            }
            if (cc == 4) {
                tongshun_num = 4;
            }
        }
        let temp_tai_majiang = this.tai_majiang.slice();
        let peng_kezi_arr = [];
        while (temp_tai_majiang.length >= 3) {
            peng_kezi_arr.push([temp_tai_majiang.shift(), temp_tai_majiang.shift(), temp_tai_majiang.shift()]);
        }
        const temp_jiejiegao = [];
        temp_jiejiegao.push(...AI_all_TileType.kezi_arr);
        temp_jiejiegao.push(...peng_kezi_arr);
        temp_jiejiegao.sort((a, b) => a[0] - b[0]);
        for (let index = 0; index < temp_jiejiegao.length; index++) {
            let data1 = temp_jiejiegao[index][0];
            let tempArr = [data1];
            for (let j = index + 1; j < temp_jiejiegao.length; j++) {
                const data2 = temp_jiejiegao[j][0];
                if (data2 < 0x9 && data1 + 1 == data2) {
                    tempArr.push(data2);
                    data1 = data2;
                }
                else {
                    break;
                }
            }
            let flag = true;
            if (tempArr.length == 3 && flag) {
                tongkezi_num = 3;
            }
            if (tempArr.length == 4 && flag) {
                tongkezi_num = 4;
            }
        }
        for (let i = 0; i < temp_jiejiegao.length; i++) {
            const temp_kezi = temp_jiejiegao[i];
            const temp_mj = temp_kezi[0];
            if (temp_mj >= 0x31 && temp_mj <= 0x34) {
                fengke_num++;
            }
            if (temp_mj >= 0x31 && temp_mj <= 0x37) {
                zike_num++;
            }
            if (temp_mj >= 0x35 && temp_mj <= 0x37) {
                jianke_num++;
            }
            total_kezi++;
        }
        if (AI_all_TileType.jiang_pai >= 0x31 && AI_all_TileType.jiang_pai <= 0x34) {
            feng_j_num++;
        }
        if (AI_all_TileType.jiang_pai >= 0x35 && AI_all_TileType.jiang_pai <= 0x37) {
            jian_j_num++;
        }
        let AI_an_TileType = new mj_Logic.HuPaiSuanFa();
        AI_an_TileType.AnaTileType(this.hand_majiang.slice(), null);
        an_total_kezi = AI_an_TileType.kezi_arr.length;
        let AI_normal_TileType = new mj_Logic.HuPaiSuanFa();
        AI_normal_TileType.AnaTileType(this.hand_majiang, null);
        is_7dui = AI_normal_TileType.is_mht_qd();
        {
            if (utils.isContain(majiang_arr, [0x31, 0x31, 0x31, 0x32, 0x32, 0x32, 0x33, 0x33, 0x33, 0x34, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_1, fan: 88 });
            }
            if (utils.isContain(majiang_arr, [0x35, 0x35, 0x35, 0x36, 0x36, 0x36, 0x37, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_2, fan: 88 });
            }
            if (utils.isContain(majiang_arr, [0x1, 0x1, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0x9, 0x9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_3, fan: 88 });
            }
            if (majiang_arr.every(c => [0x6, 0x7, 0x8, 0x9].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_4, fan: 88 });
            }
            if (majiang_arr.every(c => [0x1, 0x2, 0x3, 0x4].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_5, fan: 88 });
            }
            if (utils.isContain([0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34, 0x35, 0x35, 0x36, 0x36, 0x37, 0x37], majiang_arr)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_6, fan: 88 });
            }
            let ret1 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7].toString();
            let ret2 = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8].toString();
            let ret3 = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9].toString();
            let ret = majiang_arr.toString();
            if (ret1 == ret || ret2 == ret || ret3 == ret) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_7, fan: 88 });
            }
            {
                if (this.an_gang_num + this.ming_gang_num == 4) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_88_8, fan: 88 });
                }
            }
        }
        {
            if (fengke_num == 3 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_1, fan: 64 });
            }
            if (jianke_num == 2 && jian_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_2, fan: 64 });
            }
            {
                let ret1 = [0x1, 0x2, 0x3, 0x1, 0x2, 0x3, 0x5, 0x5, 0x7, 0x8, 0x9, 0x7, 0x8, 0x9];
                if (utils.isContain(majiang_arr, ret1)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_3, fan: 64 });
                }
            }
            if (majiang_arr.every(c => [0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_4, fan: 64 });
            }
            if (this.an_gang_majiang.length / 4 + an_total_kezi == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_64_5, fan: 64 });
            }
        }
        {
            if (is_7dui && utils.isContain(majiang_arr, [0x35, 0x35, 0x36, 0x36, 0x37, 0x37])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_1, fan: 48 });
            }
            if (is_7dui && utils.isContain(majiang_arr, [0x31, 0x31, 0x32, 0x32, 0x33, 0x33, 0x34, 0x34])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_2, fan: 48 });
            }
            {
                let ret1 = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
                let ret2 = [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];
                let ret3 = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
                let ret4 = [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7];
                let ret5 = [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9];
                let ret6 = [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9];
                if (utils.isContain(majiang_arr, ret1) || utils.isContain(majiang_arr, ret2) ||
                    utils.isContain(majiang_arr, ret3) || utils.isContain(majiang_arr, ret4) ||
                    utils.isContain(majiang_arr, ret5) || utils.isContain(majiang_arr, ret6)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_3, fan: 48 });
                }
            }
            {
                let ret1 = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
                let ret2 = [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];
                let ret3 = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
                let ret4 = [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7];
                let ret5 = [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9];
                let ret6 = [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9];
                if (utils.isContain(majiang_arr, ret1) || utils.isContain(majiang_arr, ret2) ||
                    utils.isContain(majiang_arr, ret3) || utils.isContain(majiang_arr, ret4) ||
                    utils.isContain(majiang_arr, ret5) || utils.isContain(majiang_arr, ret6)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_48_3, fan: 48 });
                }
            }
        }
        {
            if (utils.isContain(majiang_arr, [0x1, 0x2, 0x3, 0x3, 0x4, 0x5, 0x5, 0x6, 0x7, 0x7, 0x8, 0x9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_1, fan: 32 });
            }
            if (utils.isContain(majiang_arr, [0x1, 0x1, 0x1, 0x9, 0x9, 0x9]) &&
                majiang_arr.every(c => [0x1, 0x9, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37].includes(c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_2, fan: 32 });
            }
            {
                if ((this.an_gang_num + this.ming_gang_num) == 3) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_3, fan: 32 });
                }
            }
            if (this.sky_ting) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_32_4, fan: 32 });
            }
        }
        {
            if (fengke_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_1, fan: 24 });
            }
            if (is_7dui) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_2, fan: 24 });
            }
            if (zike_num == 4) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_3, fan: 24 });
            }
            if (tongkezi_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_4, fan: 24 });
            }
            if (tongshun_num == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_24_5, fan: 24 });
            }
        }
        {
            if (utils.isContain(majiang_arr, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_1, fan: 16 });
            }
            let res1 = [
                [[1, 2, 3], [3, 4, 5], [5, 6, 7]],
                [[2, 3, 4], [4, 5, 6], [6, 7, 8]],
                [[3, 4, 5], [5, 6, 7], [7, 8, 9]],
            ];
            let flag = true;
            for (const cc of res1) {
                for (const ccc of cc) {
                    if (!AI_all_TileType.shunzi_arr.some(c => c.toString() == ccc.toString())) {
                        flag = false;
                    }
                }
            }
            if (flag) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_2, fan: 16 });
            }
            if (an_total_kezi == 3) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_4, fan: 16 });
            }
            if (majiang_arr.every(c => c >= 0x1 && c <= 0x9)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_16_5, fan: 16 });
            }
        }
        {
        }
        {
            if (fengke_num == 2 && feng_j_num == 1) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_1, fan: 6 });
            }
            if (jianke_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_2, fan: 6 });
            }
            if (total_kezi == 4 && majiang_arr.length == 14) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_3, fan: 6 });
            }
            if (this.an_gang_majiang.length / 4 == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_4, fan: 6 });
            }
            {
                if (majiang_arr.some(c => c <= 0x9) &&
                    majiang_arr.some(c => c >= 0x31 && c <= 0x37) &&
                    majiang_arr.every(c => c <= 0x9 || (c >= 0x31 && c <= 0x37))) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_6_5, fan: 6 });
                }
            }
        }
        {
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.quandaiyao(this.hand_majiang)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_1, fan: 4 });
            }
            if (this.ming_gang_num == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_2, fan: 4 });
            }
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_4_3, fan: 4 });
            }
            {
            }
        }
        {
            if (this.ting_status) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_1, fan: 2 });
            }
            if (this.tai_majiang.length == 0 && this.an_gang_majiang.length == 0 && this.zi_mo_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_2, fan: 2 });
            }
            if (this.an_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_3, fan: 2 });
            }
            if (an_total_kezi == 2) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_4, fan: 2 });
            }
            if (majiang_arr.filter(c => c == 0x1 || c == 0x9).length == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_5, fan: 2 });
            }
            if (this.hand_majiang.some(c => c && this.hand_majiang.filter(t => t == c).length == 4) &&
                this.an_gang_num == 0 && this.ming_gang_num == 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_6, fan: 2 });
            }
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_ZhuanHuan_Arr(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_7, fan: 2 });
            }
            if (jianke_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_2_8, fan: 2 });
            }
        }
        {
            if (this.zi_mo_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_1, fan: 1 });
            }
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 0);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][1] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_2, fan: 1 });
                }
            }
            {
                let hu_mj = this.hand_majiang[this.hand_majiang.length - 1];
                let AI = new mj_Logic.HuPaiSuanFa();
                AI.handler_qian_bian_zhang(this.hand_majiang, 1);
                let arr = AI.shunzi_arr.filter(c => c.includes(hu_mj));
                if (arr.length > 0 && (arr[0][0] == hu_mj || arr[0][2] == hu_mj)) {
                    res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_3, fan: 1 });
                }
            }
            if (this.ming_gang_num > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_4, fan: 1 });
            }
            if (this.hua_majiang.length > 0) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_5, fan: this.hua_majiang.length });
            }
            let res1 = [
                [1, 2, 3, 4, 5, 6],
                [2, 3, 4, 5, 6, 7],
                [3, 4, 5, 6, 7, 8],
                [4, 5, 6, 7, 8, 9],
            ];
            if (res1.some(c => utils.isContain(majiang_arr, c))) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_6, fan: 1 });
            }
            if (utils.isContain(majiang_arr, [1, 2, 3, 7, 8, 9])) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_7, fan: 1 });
            }
            let AI = new mj_Logic.HuPaiSuanFa();
            if (AI.handler_yibangao(this.hand_majiang, null)) {
                res_fan_arr.push({ type: mj_Logic.Mj_Hu_Type.MHT_1_8, fan: 1 });
            }
        }
        {
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_6)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_48_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_64_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_7)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_5);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_88_8)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_32_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_64_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_48_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_16_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_1);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_32_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_6_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_5);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_24_5)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_24_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_1)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_6);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_7);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_16_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_8_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_4_4);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_2)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_8);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_6_4)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_4);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_3);
            }
            if (res_fan_arr.some(c => c.type == mj_Logic.Mj_Hu_Type.MHT_4_3)) {
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_2_2);
                res_fan_arr = res_fan_arr.filter(c => c.type != mj_Logic.Mj_Hu_Type.MHT_1_1);
            }
        }
        return res_fan_arr;
    }
}
var BetAreas;
(function (BetAreas) {
    BetAreas["BMW"] = "BMW";
    BetAreas["Benz"] = "Benz";
    BetAreas["Audi"] = "Audi";
    BetAreas["AlfaRomeo"] = "AlfaRomeo";
    BetAreas["Maserati"] = "Maserati";
    BetAreas["Porsche"] = "Porsche";
    BetAreas["Lamborghini"] = "Lamborghini";
    BetAreas["Ferrari"] = "Ferrari";
})(BetAreas = exports.BetAreas || (exports.BetAreas = {}));
exports.points = [
    { area: BetAreas.BMW, odds: 5, prob: 22 },
    { area: BetAreas.Benz, odds: 5, prob: 22 },
    { area: BetAreas.Audi, odds: 5, prob: 22 },
    { area: BetAreas.AlfaRomeo, odds: 5, prob: 22 },
    { area: BetAreas.Maserati, odds: 10, prob: 11 },
    { area: BetAreas.Porsche, odds: 15, prob: 7.33 },
    { area: BetAreas.Lamborghini, odds: 25, prob: 4.4 },
    { area: BetAreas.Ferrari, odds: 40, prob: 2.75 },
];
function random(min, max) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count * 100) / 100;
}
exports.random = random;
;
function getRanomByWeight() {
    let weights = exports.points;
    let sum = 0;
    for (const c of weights) {
        sum = sum + c.prob;
    }
    let compareWeight = utils.random(1, sum);
    let weightIndex = 0;
    while (sum > 0) {
        sum = sum - weights[weightIndex].prob;
        if (sum < compareWeight) {
            let c = weights[weightIndex];
            return c;
        }
        weightIndex = weightIndex + 1;
    }
    return;
}
exports.getRanomByWeight = getRanomByWeight;
let totalMoney = 0;
for (let index = 0; index < 10; index++) {
    console.warn(random(1, 100));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWouanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vbWoudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQStEO0FBUS9ELHlDQUEwQztBQUkxQyxNQUFNLEtBQUs7SUFXUDtRQVZBLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBQzVCLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBQzNCLG9CQUFlLEdBQWEsRUFBRSxDQUFDO1FBQy9CLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBSTFCLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBQzNCLGdCQUFXLEdBQWEsRUFBRSxDQUFDO0lBRzNCLENBQUM7SUFDRCxnQkFBZ0I7UUFDWixJQUFJLFdBQVcsR0FBaUQsRUFBRSxDQUFDO1FBRW5FLElBQUksV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM5QixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ2xDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkI7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBR2xDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVuQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFFbkIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVuQixJQUFJLFVBQVUsR0FBRyxD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Q3RGLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDakcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUVELElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxRCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUNwSCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakUsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSSxJQUFJ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LEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUMzRixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQ7Z0JBQ0ksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7b0JBQ3hFLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztvQkFDeEUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3JFO2FBQ0o7WUFFRDtnQkFDSSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztvQkFDeEUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDO29CQUN4RSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDMUUsV0FBVyxDQUFDLElBQUksQ0FBQyxF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QVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdFLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2pGO1lBRUQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvRCxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdFLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2hGO1lBRUQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvRCxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FB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RUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUU7SUFDbkQsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7Q0FDbkQsQ0FBQztBQUNGLFNBQWdCLE1BQU0sQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pELENBQUM7QUFIRCx3QkFHQztBQUFBLENBQUM7QUFFRixTQUFnQixnQkFBZ0I7SUFDNUIsSUFBSSxPQUFPLEdBQUcsY0FBTSxDQUFDO0lBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO1FBQ3JCLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUN0QjtJQUVELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNwQixPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDWixHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDckMsSUFBSSxHQUFHLEdBQUcsYUFBYSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7S0FDakM7SUFDRCxPQUFPO0FBQ1gsQ0FBQztBQWxCRCw0Q0FrQkM7QUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDbkIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQU9yQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNoQyJ9