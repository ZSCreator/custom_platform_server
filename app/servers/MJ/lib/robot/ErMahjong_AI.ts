import mj_Logic = require("../mj_Logic");
//https://blog.csdn.net/ywloveb/article/details/88171832?utm_medium=distribute.pc_relevant_download.none-task-blog-baidujs-1.nonecase&depth_1-utm_source=distribute.pc_relevant_download.none-task-blog-baidujs-1.nonecase
//分析牌型工具，首先找出所有的顺子，然后再讲所有刻子找到，然后找出可以形成顺子的牌（比如 23 ，13之类的），
//然后剩余的牌，就是可以打出的牌
//一种牌型(里面的都是索引)
interface TileType {
    /**顺子切片，只记录第一个 */
    Array_S: number[],
    /**刻子切片，只记录第一个 */
    Array_k: number[],
    /**可以做将牌的牌，只记录第一个 */
    Array_j: number[],
    /**单牌 */
    Array_d: number[],
    /**间隔相差1张牌的牌，记录第一个 */
    Array_1_3: number[],
    /**左右相差一张牌的牌，记录第一个 */
    Array_34: number[],
    /**所有牌索引 */
    Array_tile_index: number[],
    /**什么动作之后的分析牌型。比如，普通出牌时的摸牌操作，或吃碰杠等 */
    mask?: number,
    /**动作牌值 */
    tile?: number,
}

export default class ErMahjong_AI {
    /**是否听牌 */
    private isTing: boolean = false;
    private majiang_arr: number[] = [];
    private TileType: TileType;
    private tilesTing: { [key: string]: { mj: number, num: number }[] };
    private hand_mjs: number[] = [];
    /**出牌数组 */
    private table_mjs: number[] = [];
    constructor(hand_mjs?: number[]) {
    }
    //分析牌型
    private AnaTileType(tileIndexs: number[], mask: number, tile: number) {
        let tt: TileType = { Array_S: [], Array_k: [], Array_j: [], Array_d: [], Array_1_3: [], Array_34: [], Array_tile_index: [] };
        tt.mask = mask;
        tt.tile = tile;
        tt.Array_tile_index.push(...tileIndexs);
        let ti = tt.Array_tile_index;
        //提取顺子123 23  13
        for (let i = 1; i <= 9; i++) {
            let v = ti[i];
            if (v != 0 && ti[i + 1] != 0 && ti[i + 2] != 0) { //顺子
                tt.Array_S.push(i);
                ti[i]--;
                ti[i + 1]--;
                ti[i + 2]--;
            }
        }
        //提取将 刻子
        for (let i = 1; i <= 0x37; i++) {
            let v = ti[i];
            if (v == 2) {
                tt.Array_j.push(i);
                ti[i] = 0;
                continue;
            }
            if (v == 3) {
                tt.Array_k.push(i);
                ti[i] = 0;
            }
        }
        //提取 类似 34 的顺子模型
        for (let i = 1; i <= 9; i++) {
            if (ti[i] != 0 && ti[i + 1] != 0 && ti[i + 2] == 0) {
                tt.Array_34.push(i);
                ti[i]--;
                ti[i + 1]--;
            }
        }
        //提取类似 13 的顺子模型
        for (let i = 1; i <= 9; i++) {
            if (ti[i] != 0 && ti[i + 1] == 0 && ti[i + 2] != 0) {
                tt.Array_1_3.push(i);
                ti[i]--;
                ti[i + 2]--;
            }
        }
        //提取单牌
        for (let i = 1; i <= 0x37; i++) {
            let v = ti[i];
            if (v == 1) {
                tt.Array_d.push(i);
            }
        }
        // console.debug("---牌型:%s", JSON.stringify(tt));
        return tt
    }

    //根据TileType选择出牌，返回出牌索引
    private PlayByTileType(tilesIndexs: number[], tt: TileType) {
        // console.warn(`顺子:${tt.Array_S.toString()}，将:${tt.Array_j.toString()}，刻子:${tt.Array_k.toString()}，34:${tt.Array_34.toString()}，13:${tt.Array_1_3.toString()}，单牌:${tt.Array_d.toString()}`);
        //判断单牌是否存在
        if (tt.Array_d.length > 0) {
            return tt.Array_d[tt.Array_d.length - 1];
        }
        //如果单牌打完，可以打出 13 类型牌
        if (tt.Array_1_3.length > 0) {
            return tt.Array_1_3[tt.Array_1_3.length - 1];
        }
        //如果13牌打完,可以打出23
        if (tt.Array_34.length > 0) {
            return tt.Array_34[tt.Array_34.length - 1];
        }
        //如果23打完,可以打将牌
        if (tt.Array_j.length > 0) {
            return tt.Array_j[tt.Array_j.length - 1];
        }
        //如果上述牌都打完，则可以选择最大的牌打
        let i = tilesIndexs.length - 1;
        for (; i >= 0; i--) {
            if (tilesIndexs[i] != 0) {
                break;
            }
        }
        return i;
    }


    /**
     * 检查听啤
     * @param tileIndexs 电脑手牌索引，已经将摸得牌放入其中的
     * @returns 返回可以胡牌的牌值
     */
    private CheckTing(tileIndexs: number[]) {
        //key-打出去的牌索引，value：可以听得牌切片
        let tingM: { [key: string]: { mj: number, num: number }[] } = {}

        for (let i = 0; i < tileIndexs.length; i++) {
            let v = tileIndexs[i];
            if (v != 0) {
                tileIndexs[i]--;
                let ts: { mj: number, num: number }[] = [];
                //share.LOG.Debug("------checkTing--i:%d",i)
                //fmt.Println("i:",i)
                //遍历所有牌型（将每一个牌型加入到手牌中，然后判断是否胡牌）
                for (let j = 0; j < 34; j++) {
                    if (i == j) { //过滤掉刚打出去的牌
                        continue;
                    }
                    tileIndexs[j]++;
                    //share.LOG.Debug("------*(*(**(**&**(**(**:%d",j)
                    //fmt.Println("j:",j)

                    let isHu = mj_Logic.test_is_hu(tileIndexs); //判断是否胡牌
                    if (isHu) { //如果胡牌，将当前牌值，添加到听啤切片中
                        ts.push({ mj: j, num: Math.max(0, 4 - this.table_mjs.filter(c => c == j).length) });
                    }
                    tileIndexs[j]--;
                }
                if (ts.length > 0) { //如果听啤切片长度不为0，即有听啤，将听牌切片添加到map中，
                    tingM[i] = (ts);
                }
                tileIndexs[i]++;
            }
        }
        return tingM;
    }

    /**
     * 根据是否听牌，返回出牌id
     * 如果没有听牌则需要先检查听牌，然后根据是否听牌分析出牌
     * 如果已经听牌，则直接打出摸牌的那张牌
     * @param ids 摸牌数组
     */
    private PlayByTing(ids: number[]) {
        //检查是否听啤
        let playId = -1;
        let tingSend = false;
        if (this.isTing) {
            playId = ids[0]
        } else { //没有听牌，需要先检查是否听牌
            let tingMap = this.CheckTing(this.majiang_arr);
            // console.warn(JSON.stringify(tingMap));
            let index = -1 //出牌索引
            if (Object.keys(tingMap).length > 0) { //如果有听牌,判断该打哪张牌去听牌，一般默认使用可以听最多的牌
                let maxLen = 0;
                tingSend = true;
                for (const k of Object.keys(tingMap)) {
                    let v = tingMap[k];
                    let num = v.reduce((total, v) => { return total + v.num; }, 0);
                    if (num > maxLen) {
                        index = parseInt(k);
                        maxLen = num;
                    }
                }
                // this.isTing = true
                this.tilesTing = tingMap;
                // console.debug("--------机器人听牌", this.tilesTing)
            } else { //没有听牌，需要分析打出哪张牌最好
                this.TileType = this.AnaTileType(this.majiang_arr, 0, 0)
                //检查应该出哪张牌
                index = this.PlayByTileType(this.majiang_arr, this.TileType)
            }
            let b = index;
            // let va= IndexToValue(b) //将出牌的索引转换成面值
            let flag = false;
            //遍历手牌，找到那个出牌的id
            for (const v of this.hand_mjs) {
                if (v == b) {
                    playId = v;
                    flag = true;
                    break;
                }
            }
            // for id, v := range this.hand.tiles {
            //     if v == va {
            //         playId = id
            //         flag = true
            //         break
            //     }
            // }
            if (!flag) {//如果上述步骤都没有找到出牌，则打出刚摸得牌，或者打出手牌中最大牌值的牌
                if (ids.length == 0) {//如果没有摸排，打出手牌中牌值最大的牌
                    // let maxValue = 0;
                    // let maxId = 0
                    // for (id, v := range this.hand.tiles) {
                    //     if v > maxValue {
                    //         maxId = id
                    //     }
                    // }
                    // playId = maxId;
                } else {
                    playId = ids[0];
                }
            }
        }
        return { playId, tingSend };
    }

    PlayLogic(hand_mjs: number[], ids: number[], table_mjs: number[]) {
        this.table_mjs = table_mjs;
        this.hand_mjs = hand_mjs.map(c => c);
        let majiang_arr = new Array(0x37 + 1).fill(0);
        for (const mj of hand_mjs) {
            majiang_arr[mj] = majiang_arr[mj] + 1;
        }
        this.majiang_arr = majiang_arr;
        return this.PlayByTing(ids);
    }

    print() {
        console.warn(`顺子:${this.TileType.Array_S.toString()}，将:${this.TileType.Array_j.toString()}，刻子:${this.TileType.Array_k.toString()}，34:${this.TileType.Array_34.toString()}，13:${this.TileType.Array_1_3.toString()}，单牌:${this.TileType.Array_d.toString()}`);
        console.warn("--------机器人听牌", JSON.stringify(this.tilesTing))
    }
}


// function test(hand_mjs: number[]) {
//     let obj = new ErMahjong_AI();
//     let res = obj.PlayLogic(hand_mjs, [31]);
//     console.warn(res);
// }

// test([1, 2, 3, 4, 5, 6, 7, 7, 9]);