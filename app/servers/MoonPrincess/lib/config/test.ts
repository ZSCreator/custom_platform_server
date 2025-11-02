import {detonator, elementType, gameLevelMappingElementsNum, ordinaryElements, moonElements, specialElements} from "../constant";
import {selectEle} from "../../../../utils";
import * as weightsC from "../config/weights";
import * as utils from "../../../../utils";
import {cratePharaohLottery, WinningDetail} from "../util/lotteryUtil";

let dumpMsg = () => {
    console.time("ss")
    // let weights = selectWights();
    // let windows = generateWindow(weights);
    //
    let windows : any = [
        [ 'E', 'E', 'E', 'F', 'H' ],
        [ 'D', 'D', 'D', 'H', 'D' ],
        [ 'D', 'Z', 'Z', 'D', 'D' ],
        [ 'C', 'Z', 'C', 'D', 'A' ],
        [ 'H', 'D', 'D', 'D', 'E' ]
    ];

    let roundWindows: { type: elementType; }[][][] = [];
    roundWindows.push(changeFirstWindow(windows));
    console.warn("windows22222222222",JSON.stringify(roundWindows))
    //
    const {  clearCoordinates } = eliminateWindowElements(windows);
    console.warn("clearCoordinates",JSON.stringify(clearCoordinates))

    const { result: winAward, winningDetails: Tmp } = calculateClearElementProfit(clearCoordinates , windows , 1);


    // const resultList = findWeightInWindows([],[]);
    // console.warn("windows22222222222",resultList)
    console.timeEnd("ss")
    // 创建一个开奖类
    // const lotteryUtil = cratePharaohLottery(true, 100000);
    // lotteryUtil.result();

    // //计算公主的充能
    // const result = moon_recharge(['E','E','E','E']);
    // console.warn("result........",result)

    console.timeEnd("ss")
};


dumpMsg();



/**
 * 改变第一个窗口元素 老写 法
 */
function changeFirstWindow(windows ) {
    return  windows.map(line => {
        return line.map(e => {
            return { type: e }
        })
    });
}


 /**
 * 生成初始窗口
 */
function generateWindow(weights) {
    // 计算关卡
    // this.gameLevel = calculateGameLevel(this.detonatorCount);

    const window: elementType[][] = [];
    // 行数以及列数
    const num = 5;
    // 开奖矩阵 长高等款
    for (let i = 0; i < num; i++) {
        let line = [];

        while (line.length !== num) {
            // 随机一个元素
            const element = selectEle(weights);
            // if (this.freeSpin && element == detonator) {
            //     continue;
            // }
            // 如果为特殊元素
            // if (specialElements.includes(element)) {
            //     // 如果已经存在特殊元素或者处于杀控状态 则跳过
            //     if (this.specialElement || this.controlState === 2) {
            //         continue;
            //     }
            //
            //     // 如果是雷管
            //     if (element === detonator) {
            //         this.roundDetonatorCount++;
            //     }
            //
            //     this.specialElement = element;
            // }

            line.push(element);
        }

        window.push(line);
    }

    console.warn("window.........",window)
    return window;
}


/**
 * 选择权重
 */
function selectWights() {
    let weights = (Object.keys(weightsC.weights) as elementType[]).map((element) => {
        // 如果是特殊元素
        if (specialElements.includes(element)) {

            let V = weightsC.weights[element].weight;
            return { [element]: V };
        }

        return { [element]: weightsC.weights[element].weight };
    });

    return weights;
    console.warn("weights",weights)
}


// 单个窗口 一个矩阵
type Window = elementType[][];


function eliminateWindowElements(window: Window): { clearCoordinates: { [key: string]: any[] },  } {
    // 根据元素类型归类坐标
    let typePoints: { [x: string]: number[][] } = {};
    window.forEach((elements, index) => {
        elements.forEach((element, i) => {
            if (!typePoints[element]) {
                typePoints[element] = [];
            }

            typePoints[element].push([index, i]);
        });
    });

    console.warn(`元素数组坐标typePoints: ${JSON.stringify(typePoints)}`);

    // 需要被消除的元素
    let conversionPoints: { [x: string]: number[][][] } = {};






    //所有元素进行一次
    for (let type in typePoints) {
        // 如果是普通元素则原样保存 否则返回需要消除元素坐标的集合
        conversionPoints[type] =  isLine(typePoints[type])
    }

    let list : any = [];
    // 不同公主元素的混搭
    for (let type in typePoints) {
        if(moonElements.includes(type)){
            list = list.concat(typePoints[type])
        }
    }

    //不同公主元素得混搭
    conversionPoints[weightsC.moon_dif] =  isLine(list);

    //对所有元素+ 百搭元素进行一次筛选
    let moon_wild_list = typePoints[weightsC.moon_wild];
    for (let type in typePoints) {
        if(ordinaryElements.includes(type)) {
            // 如果是普通元素则原样保存 否则返回需要消除元素坐标的集合
            let list_ = [];
            list_ = moon_wild_list.concat(typePoints[type]);
            conversionPoints[type] = isLine(list_)
        }
    }


    console.warn(`需要被消除的元素conversionPoints: ${JSON.stringify(conversionPoints)}`)
    // 过滤掉为空数组的值 保留存在的元素
    const clearCoordinates: { [key: string]: any[] } = utils.filter((coordinates: any) => coordinates.length > 0)(conversionPoints);


    console.warn(`过滤掉的空数组保留空元素clearCoordinates: ${JSON.stringify(clearCoordinates)}`)

    for (let i in clearCoordinates) {
        // 如果要消除得为普通元素 把坐标转换为正常坐标
        if (ordinaryElements.includes(i) ) {
            clearCoordinates[i] = clearCoordinates[i].map(e => Array.from(e).map((k: any) => k.split('-')));
        }
    }

    // 转换前端坐标
    for (let i in clearCoordinates) {
        for (let j in clearCoordinates[i]) {
            clearCoordinates[i][j] = utils.sortWith([
                (r1, r2) => r2[1] - r1[1],
                (r1, r2) => r1[0] - r2[0]
            ])(clearCoordinates[i][j])
        }
        clearCoordinates[i] = utils.sortWith([
            (r1, r2) => r2[0][1] - r1[0][1],
            (r1, r2) => r1[0][0] - r2[0][0],
        ])(clearCoordinates[i])
    }
    console.warn(`过滤掉的空数组保留空元素clearCoordinates2222222222: ${JSON.stringify(clearCoordinates)}`)
    return { clearCoordinates };
}



/**
 * 消除同类元素
 * @param similarElementPoints 同类
 * @param gameLevel 关卡等级
 */
function clearSimilarElements(similarElementPoints: number[][]) {

    console.warn(`similarElementPoints:${JSON.stringify(similarElementPoints)}`)


    let mid: { [x: string]: Set<string> } = {};
    for (let i in similarElementPoints) {
        for (let j in similarElementPoints) {
            // 如果两个坐标相邻 则把相临坐标加入集合
            if (isAdjacent(similarElementPoints[i], similarElementPoints[j])) {
                const key = similarElementPoints[i].toString();
                if (!mid[key]) {
                    mid[key] = new Set();
                }

                mid[key].add(similarElementPoints[j].join('-'));
            }
        }
    }

    console.warn("mid11",mid)

    for (let i in mid) {
        mid[i].forEach((value) => {
            mid[value.split('-').toString()].forEach((v) => {
                mid[i].add(v);
            })
        })
    }
    // 获取所有相邻坐标
    const coordinatesList: any[] = utils.values(mid);
    const len = coordinatesList.length;
    coordinatesList.forEach((coordinates, index) => {
        if (!coordinates) {
            return;
        }

        for (let i = index + 1; i < len; i++) {
            if (!coordinatesList[i]) continue;

            // 如果两个集合相等 则消除
            if (isEqualSet(coordinates, coordinatesList[i])) {
                coordinatesList[i] = null;
            }
        }
    });
    // 对应得关卡 应该有多少元素被消除
    const num = 3;

    console.warn("222" , coordinatesList.filter(e => e !== null && e.size >= num))

    return coordinatesList.filter(e => e !== null && e.size >= num);

}



/**
 * 检查两个坐标是否相等
 * @param pointOne 坐标一
 * @param pointTwo 坐标二
 */
function isAdjacent(pointOne: number[], pointTwo: number[]): boolean {
    return Math.sqrt(Math.pow(pointOne[0] - pointTwo[0], 2) + Math.pow(pointOne[1] - pointTwo[1], 2)) === 1;
}

/**
 * 判断两个集合数据结构是否相等
 * @param setOne 集合一
 * @param setTwo 集合二
 */
function isEqualSet(setOne: Set<string>, setTwo: Set<string>) {
    return new Set([...setOne].filter(x => !setTwo.has(x))).size == 0 &&
        new Set([...setTwo].filter(x => !setOne.has(x))).size == 0
}


/**
 * 判断两个集合数据结构是否相等
 * @param setOne 集合一
 * @param setTwo 集合二
 */
function isLine( similarElementPoints: number[][]) {
    let list_x = [];
    let list_y = [];

    for(let m of similarElementPoints){
        list_x.push(m[0]);
        list_y.push(m[1]);
    }

    let list_x_ = statisticalFieldNumber_key(list_x);
    let list_y_ = statisticalFieldNumber_key(list_y);


    list_x_ = list_x_.filter(x=>x.value >= 3);
    list_y_ = list_y_.filter(x=>x.value >= 3);

    let list = [];
    if(list_x_.length > 0){
        for(let x of list_x_){
            let list_xx = [];
            for(let m of similarElementPoints){
                if(m[0] == x.key){
                    list_xx.push(m);
                }
            }
            if(list_xx.length >= 3){
                list = list.concat(clearSimilarElements(list_xx));
            }
        }

    }

    if(list_y_.length > 0){
        for(let y of list_y_){
            let list_yy = [];
            for(let m of similarElementPoints){
                if(m[1] == y.key){
                    list_yy.push(m);

                }
            }
            if(list_yy.length >= 3) {
                list = list.concat(clearSimilarElements(list_yy));
            }
        }
    }
    return list;

}



/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{'1':4,'3' :1,}
 * @param arr
 */
function statisticalFieldNumber_key(arr : number []) {
    let list = arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});

    let resultList = [];
    for (let key in list) {
        resultList.push({ key: Number(key), value: list[key] })
    }
    return resultList ;
}



/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{'1':4,'3' :1,}
 * @param arr
 */
function statisticalFieldNumber_string(arr : string []) {
    let list = arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});

    let resultList = [];
    for (let key in list) {
        resultList.push({ key: key, value: list[key] })
    }
    return resultList ;
}


/**
 * 计算消除元素的收益
 * @param clearCoordinates 消除的元素以及坐标
 * @param multiple 第几回合消除
 */
function calculateClearElementProfit(clearCoordinates: { [key: string]: any[]  } ,windows : any [] , multiple : number ) {
    let result = { windowAward: 0, jackpotMoney: null, detonatorCount: 0 };
    let winningDetails: WinningDetail[] = [];
    for (let e in clearCoordinates) {
      if (ordinaryElements.includes(e)) {
            // 如果是普通元素
            result[e] = {};
            // 先获取赔率
            const elementOddsConfig = weightsC.weights[e].clearAward;
            console.warn("elementOddsConfig......",elementOddsConfig)
            for (let i in clearCoordinates[e]) {
                let weights_index = clearCoordinates[e][i];
                const len = weights_index.length;
                let odds: number ;

                // 如果开出了引爆元素且元素是 被随机消除的元素 但消除元素不足的情况 默认 2倍
                // if (e === this.clearAll && len < gameLevelMappingElementsNum[this.gameLevel]) {
                //     odds = 2;
                // } else if (!elementOddsConfig[len - 3 ]) {
                //     odds = elementOddsConfig[elementOddsConfig.length - 1];
                // } else {
                //     odds = elementOddsConfig[len - 3 ];
                // }

                let length = len - 3;
                let num = 0;
                odds = elementOddsConfig[length];
                let weights = [];
                for(let m of weights_index){
                    weights.push(findWeightInWindows(windows , m))
                }

                //判断元素是否是月亮公主
                if(weightsC.moon_weights.includes(e)){
                    //判断是否是一个元素，如果是一个元素就跳过，如果是不同的月亮公主那么就判断
                    if(weights.filter(x=>x == e || x == weightsC.moon_wild).length !== weights.length){
                        odds = weightsC.clearAward_princess[length];
                    }
                    //判断是有几个公主然后可以充能
                    if(weights.length == 3){
                        num = 1;
                    }else if(weights.length == 4){
                        num = 2;
                    }else if(weights.length == 5){
                        num = 3;
                    }
                }

                winningDetails.push({ type: e as elementType, num: num, win: odds * 100 * multiple  , multiple : multiple , weights  })
            }
        }
    }
    // result.jackpotMoney = this.jackpot;
    console.warn("winningDetails....",winningDetails)
    return { result, winningDetails };
}


//根据坐标查找是什么元素
function findWeightInWindows(windows : any , index : string []) {
    // windows  = [
    //     [ 'E', 'E', 'E', 'F', 'H' ],
    //     [ 'D', 'D', 'D', 'H', 'D' ],
    //     [ 'D', 'Z', 'Z', 'D', 'D' ],
    //     [ 'C', 'H', 'C', 'D', 'A' ],
    //     [ 'H', 'D', 'D', 'D', 'E' ]
    // ];
    //
    //  index = ["2","3"];

    let index_x = Number(index[0]);
    let index_y = Number(index[1]);

    return windows[index_x][index_y];
}



//判断公主充能
function moon_recharge( weights : string [] ) {
    let ss = statisticalFieldNumber_string(weights);
    let z = ss.find(x=>x.key == 'Z');
    if(ss.length == 1){
        return 2;
    }else if(z && z.value == 2 && ss.length == 3){
        return 3;
    }else if(ss.length == 2 && !z ){
        if(ss[0].value == 3 || ss[1].value == 3){
            return 3;
        }
    }
    return 2;
}





