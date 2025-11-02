'use strict';
/**
 * 随机处理工具
 */



/**
 * 从一个map中按加权取得指定数量的map key项
 * @param weightedMap    weightedMap 是一个map 集合，其中key 是返回想的值，value 是权重值
 * @param count         通过权重获取的结果个数
 */
export const getWeightedRandomArray = (weightedMap, count = 1) => {
    if (!weightedMap || (weightedMap && weightedMap.length === 0)) {
        return null;
    }
    if (!(weightedMap instanceof Map)) {
        return null;
    }
    count = Math.max(1, count);
    let result = [];
    let i = 0;
    let tempMap: any = new Map(weightedMap);
    while (i < count || tempMap.length > 0) {
        const item = getWeightedRandomItem(tempMap);
        if (item) {
            tempMap.delete(item);
            result.push(item);
        }
        i++;
    }
    return result;
};
/**
 * 得到一个按加权进行随机的数组索引
 * 如有3个数，权重分别为a、b、c，a+b+c=d，那么有a/d概率得到a，有b/d概率得到b，有c/d概率得到c
 * 即必有一个数字被选中
 * @param weightedMap 随机数的权重数组
 * @return 权重返回对应项，有可能返回NUll
 */
export const getWeightedRandomItem = (weightedMap) => {
    if (!weightedMap || (weightedMap && weightedMap.length === 0)) {
        return null;
    }
    if (!(weightedMap instanceof Map)) {
        return null;
    }
    let totalWeight = 0;
    for (let [item, weight] of weightedMap) {
        totalWeight += weight;
    }
    let randomWeight = getRandomInt(1, totalWeight);
    for (let [item, weight] of weightedMap) {
        randomWeight -= weight;
        if (randomWeight <= 0) {
            return item;
        }
    }
    return null;
};

/**
 * 得到一个[min, max]区间内均匀分布的随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns {*}
 */
export const getRandomInt = function (min, max) {
    let count = Math.max(max - min, 0) + 1;
    return Math.floor(Math.random() * count) + min;
};
