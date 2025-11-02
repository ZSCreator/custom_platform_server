'use strict';


/**
 * 获取指定长度数字串
 * @param len
 */
export function getNumStr(len: number) {
    return Math.random().toString().substr(2, len)
};

/**
 *  创建游客ID
 * @param prefix
 */
export function generateID(prefix = '') {
    return (prefix ? prefix : "") + (Date.now() + Math.random().toString().substr(2, 4));
};


/**
 *  创建玩家uid
 * @param prefix
 */
export function createPlayerUid(prefix = 1) {
    return prefix +  Math.random().toString().substr(2, 7);
};

/**
 * 随机一个整数 包括min和max
 * @param min
 * @param max
 */
export function randomFromRange(min: number, max: number) {
    let count = Math.max(max - min, 0) + 1;
    return Math.floor(Math.random() * count) + min;
};


/**
 * 从候选列表中随机选取指定个数的对象
 * @param selections
 * @param num
 */
export function randomChoseFromArray(selections, num) {
    if (!selections || !Array.isArray(selections)) {
        return [];
    }
    // 如果候选列表小于等于需要的数量，返回所有的
    if (selections.length <= num) {
        return selections;
    }
    const indexSet: any = new Set();
    while (indexSet.size < num) {
        indexSet.add(randomFromRange(0, selections.length - 1));
    }
    let chosenArray = [];
    for (let index of indexSet) {
        chosenArray.push(selections[index])
    }
    return chosenArray;
};


/**
 * 获取数组元素
 * @param array
 * @param key
 * @param value
 */
export function getArrayMember<T>(array: T[], key, value) {
    let i = -1, element: T;
    if (value === undefined) {
        i = array.indexOf(key);
    } else {
        i = array.findIndex(m => m !== undefined && m !== null && m[key] === value);
    }
    if (i !== -1) {
        element = array[i];
    }
    return element;
};



/**
 * 判断某个数据是否是 null 或者 undefined
 * @param data
 */
export function isNullOrUndefined(data) {
    return data === undefined || data === null;
};




