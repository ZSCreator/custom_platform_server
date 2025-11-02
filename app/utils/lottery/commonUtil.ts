'use strict';

import { createHash } from 'crypto';
import moment = require('moment');
/**
 * 公用的一些 util 方法
 * */
import YowinUtil = require('../../domain/games/util');
import YowinIndex = require('../index');


/**
 * 获取指定长度数字串
 * @param len 
 */
export function getNumStr(len: number) {
    return Math.random().toString().substr(2, len)
};

export function generateID(prefix = '') {
    return (prefix ? prefix : "") + (Date.now() + Math.random().toString().substr(2, 4));
};

/**
 * 根据session获取客户端ip
 * @param session
 */
export function getIPFromSession(session) {
    // 需要Hack node_modules/pinus/dist/lib/connectors/hybrid/wsprocessor.js
    if (session.__session__.__socket__.socket.headers && (session.__session__.__socket__.socket.headers['x-real-ip'] || session.__session__.__socket__.socket.headers['x-forwarded-for'])) {
        return session.__session__.__socket__.socket.headers['x-real-ip'] || session.__session__.__socket__.socket.headers['x-forwarded-for'];
    } else {
        return session.__session__.__socket__.remoteAddress.ip.replace('::ffff:', '');
    }
}




/**
 * 随机一个整数 包括min和max
 * @param min 
 * @param max 
 */
export function randomFromRange(min: number, max: number) {
    let count = Math.max(max - min, 0) + 1;
    return Math.floor(Math.random() * count) + min;
};

function convertForLessThanTen(number) {
    let str = number.toString();
    if (number >= 0 && number <= 9) {
        str = "0" + number;
    }
    return str;
}

/**
 * 获取 年/月/日 小时：分钟 ：秒
 * @param date 
 */
export function getYearMonthDayHourMinuteSeconds(date?) {
    date = date ? new Date(date) : new Date();
    // const y = date.getFullYear();
    // const m = convertForLessThanTen(date.getMonth() + 1);
    // const d = convertForLessThanTen(date.getDate());
    // const h = convertForLessThanTen(date.getHours());
    // const f = convertForLessThanTen(date.getMinutes());
    // const s = convertForLessThanTen(date.getSeconds());
    // return y + "-" + m + "-" + d + " " + h + ":" + f + ":" + s;

    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

/**
 * 获取 指定 小时、分钟、秒数的 AddDays 天后的时间戳
 * @param AddDays 
 * @param hours 
 * @param minutes 
 * @param seconds 
 */
export function getDateSpecifHMSAfterDays(AddDays: number, hours = 0, minutes = 0, seconds = 0) {
    const date = new Date();
    // 指定日期
    date.setDate(date.getDate() + AddDays);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return date.getTime();
};

/**
 * 字符位数补齐：把 number 补足成 length 位，前面补0
 * @param number 
 * @param desireLength 
 */
export function alignByLength(number, desireLength = 2) {
    let desireStr = '' + number;
    // 相差的位数
    let diffLength = desireLength - number.toString().length;
    if (diffLength <= 0) {
        return desireStr;
    }
    while (diffLength) {
        desireStr = '0' + desireStr;
        diffLength--;
    }
    return desireStr;
};

/**
 * 获取 年-月-日
 * @param date 
 */
export function getYearMonthDay(date = Date.now()) {
    let tempdata = new Date(date);
    // date = new Date(date);
    let y = tempdata.getFullYear();
    let m = convertForLessThanTen(tempdata.getMonth() + 1);
    let d = convertForLessThanTen(tempdata.getDate());
    return y + "-" + m + "-" + d;
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
 * 获取满足要求的下标
 * @param array 操作的数组
 * @param key 需要匹配的属性名字
 * @param value 匹配值
 * @return: number,返回下标值
 */
export function getMemberIndex(array, key, value) {
    let i = -1;
    if (value === undefined) {
        i = array.indexOf(key);
    } else {
        i = array.findIndex(m => m !== undefined && m[key] === value);
    }
    return i;
};

/**
 * 打乱数组元素顺序
 * @param array 
 */
export function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
};
/**
 * 获取倒计时:
 * @param startTime 
 * @param life  startTime是开始计时的时间点（不是当前时间）；life是总共的计时时长(单位毫秒)
 */
export function getCountDown(startTime, life) {
    const existTime = life;
    const nowTime = Date.now();
    return Math.ceil((startTime + existTime - nowTime) / 1000);
};

/**
 * 数组中是否存在某个元素
 * @param arr 
 * @param ele 
 */
export function contains(arr, ele) {
    let i = arr.length;
    while (i--) {
        if (arr[i] === ele) {
            return true;
        }
    }
    return false;
};

/**
 * 判断一个字符串的实际长度
 */
export function stringLength(str) {
    let b = 0;
    for (let i = 0, l = str.length; i < l; i++) {
        const c = str.charAt(i);
        if (escape(c).length > 4) {
            b += 2;
        } else if (c !== "\r") {
            b++;
        }
    }
    return b;
};

/**
 * 获取到今天的起始和结束时间戳:如获取昨天的起始和结束日期就传入 -1，今天就传0，明天就传1
 * 注：date.setHours的返回值是 number ，但是调用之后 date 本身仍然是一个 date 对象
 * */
export function getDateRange(daysFromNow = 0) {
    const today = new Date();
    const date = new Date(today.setDate(today.getDate() + daysFromNow));
    const dateZero = date.setHours(0, 0, 0, 0);
    const dateLast = date.setHours(23, 59, 59, 999);
    return { begin: dateZero, end: dateLast };
};
/**
 * 获取到今年的起始和结束时间戳:如获取去年天的起始和结束日期就传入 -1，今年就传0，明年就传1
 * @param yearsFromNow  偏移量
 * @returns {{begin: number, end: number}}
 */
export const getYearRange = function (yearsFromNow = 0) {
    const dateBegin = new Date();
    dateBegin.setFullYear(dateBegin.getFullYear() + yearsFromNow);
    dateBegin.setMonth(0);
    dateBegin.setDate(1);
    dateBegin.setHours(0, 0, 0, 0);
    const dateEnd = new Date();
    dateEnd.setFullYear(dateEnd.getFullYear() + yearsFromNow + 1);
    dateEnd.setMonth(0);
    dateEnd.setDate(0);
    dateEnd.setHours(0, 0, 0, -1);
    return { begin: dateBegin.getTime(), end: dateEnd.getTime() };
};
/**
 * 将金币数字转换为String
 */
export function simplifyMoney(money: number, num = 10000) {
    const value = Math.abs(money);
    if (value >= 100000000 && value >= num) {
        return parseFloat((money / 100000000).toFixed(2)) + '亿';
    } else if (value >= 10000 && value >= num) {
        return parseFloat((money / 10000).toFixed(2)) + '万';
    } else if (value >= 1000 && value >= num) {
        return parseFloat((money / 1000).toFixed(2)) + '千';
    }
    return money;
};

/**
 * 判断两个数组是否相等，相同元素的位置也要相等
 * */
export function compareArray(array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }
    //array1 中的每一个元素在 array2 中有且只有一个
    return array1.every((element, index) => {
        return element === array2[index];
    })
};

/**
 * 根据权重配置随机出其中一个
 * @param random 
 * @param _arr 
 */
export function sortProbability(random, _arr) {
    let allweight = 0;
    let section = 0;//区间临时变量
    let arr = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    //排序
    arr.sort((a, b) => {
        return a.probability - b.probability;
    });
    //计算总权重
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].probability);
    }

    //获取概率区间
    for (let i = 0; i < arr.length; i++) {
        if (i == 0) {
            let right = (arr[i].probability / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        } else {
            let right = (arr[i].probability / allweight) + section;
            arr[i]['section'] = [section, right];
            section = right;
        }

    }

    for (let i = 0; i < arr.length; i++) {
        if (random >= arr[i].section[0] && random < arr[i].section[1]) {
            return arr[i];
        }
    }
};
/**
 * 根据长度补充零
 * @param _string 字符串
 * @param strLength  最终字符串长度
 */
export function supplementZero(_string, strLength) {
    let string = _string + '';
    if (string.length > strLength) {
        console.error('传入字符串有误');
        return string;
    }
    let num = strLength - string.length;
    let newStr = '';
    for (let i = 0; i < num; i++) {
        newStr += '0';
    }
    newStr += string;
    return newStr;
};

/**
 * 彩票扣除金币，返回值是一个对象
 * @param: betGolds ==> Number，playerGolds 是对象
 * */
export function lotteryDeductGolds(betGolds: number, playerGolds, next?) {
    const yowinGolds = YowinUtil.deductMoney(betGolds, { gold: playerGolds }, next);
    return yowinGolds.remainder
};


/**
 * 彩票扣除金币，返回值是一个对象 ts
 * @param: betGolds ==> Number，playerGolds 是对象
 * */
export function lotteryDeductGoldsWithTS(betGolds, playerGolds, next?) {
    const yowinGolds = YowinUtil.deductMoney(betGolds, { gold: playerGolds }, next);
    // Array.isArray(yowinGolds)|object

    return yowinGolds;
};

/**
 * 彩票增加金币
 * goldObj 是一个对象
 * addGolds 是number，暂时将增加的金币全都算是普通金币
 * @return: object
 * */
export function lotteryAddGolds(goldObj, addGolds) {
    // addGolds = parseInt(addGolds);
    return YowinUtil.addMoney({ gold: goldObj }, { 1: 0, 2: addGolds });
};

/**
 * 返回总金币，即gold 和 gold 相加
 * @param goldObj 
 */
export const sumGolds = goldObj => {
    return YowinIndex.sum(goldObj);
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
 * 判断某个数据是否是 null 或者 undefined
 * @param data 
 */
export function isNullOrUndefined(data) {
    return data === undefined || data === null;
};

/**
 * 给 number 取 digit 位小数，不四舍五入，默认保留两位小数
 * @param number 
 * @param digit 
 */
export function fixNoRound(number: number, digit = 2) {
    if (!number || isNullOrUndefined(digit) || typeof number !== 'number' || typeof digit !== 'number') {
        return number;
    }
    // 不保留小数
    if (!digit) {
        return Math.floor(number);
    }
    return Math.floor(number * Math.pow(10, digit)) / Math.pow(10, digit);
};

/**
 * 删除掉 player 中不需要的属性
 * @param obj 
 * @param fieldsInArray 
 */
export function chooseObjField(obj, fieldsInArray) {
    for (let attribute in obj) {
        if (fieldsInArray && !fieldsInArray.includes(attribute)) {
            delete obj[attribute];
        }
    }
};

/**
 * 从某个整数的所有可能和的组合中随机选取一个
 * @param number 
 */
export function randomNumberSumComb(number) {
    // 不是整数返回 0
    if (!Number.isInteger(number)) {
        return 0;
    }
    if (number === 0 || number === 1) {
        return number;
    }
    // 选中的组合
    const sumComb = [];
    // 首先从 0-number 之间随机一次
    let randomValue = randomFromRange(0, number);
    sumComb.push(randomValue);
    // 如果随机达到 0 或者 number 本身，直接返回
    if (randomValue === 0 || randomValue === number) {
        return [number]
    }
    number -= randomValue;
    // 每次都随机 1 到 number的剩余值，然后放入组合中，再将 number - randomValue
    while (number > 0) {
        randomValue = randomFromRange(1, number);
        sumComb.push(randomValue);
        number -= randomValue;
    }
    return sumComb;
};

/**
 * 随机将 arr 按照 arr.length 的和的组合 [1, ... ,n]（总和是 arr.length），分成一个二维数组
 * @param arr 
 */
export function randomDivideArr(arr) {
    if (!Array.isArray(arr) || !arr.length) {
        return [];
    }
    if (arr.length === 1) {
        return [arr];
    }
    const lengthSumComb = randomNumberSumComb(arr.length);
    const dividedArr = [];
    let endPosition;
    let startPosition;
    for (let i = 0; i < lengthSumComb.length; i++) {
        endPosition = lengthSumComb.slice(0, i + 1).reduce((pre, curr) => pre + curr, 0);
        startPosition = (i === 0 ? 0 : (endPosition - lengthSumComb[i]))
        dividedArr.push(arr.slice(startPosition, endPosition));
    }
    return dividedArr;
};


