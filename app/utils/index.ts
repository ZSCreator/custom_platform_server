'use strict';
import ramda = require('ramda');
import moment = require('moment');
import * as querystring from 'querystring';
import * as crypto from 'crypto';
import utils = require('../utils');
import * as JsonMgr from '../../config/data/JsonMgr';
import { getLogger } from 'pinus-logger';
import * as HallConst from '../consts/hallConst';
const GlobalErrorLogger = getLogger('server_out', __filename);
import langsrv = require('../services/common/langsrv');


/**
 * 数组删除
 * @param  key 需要比较的键 null 表示没有
 * @param  value 需要比较的值
 * @return removeObj
 */
Object.defineProperty(Array.prototype, 'remove', {
    value: function (key: string, value: any) {
        let i = !!key ? this.findIndex((m: any) => m[key] === value) : this.indexOf(value);
        return i === -1 ? null : this.splice(i, 1)[0];
    },
    enumerable: false
});

export function remove<T>(arr: Array<T>, key: string, value: any) {
    let i = !!key ? arr.findIndex((m: any) => m[key] === value) : arr.indexOf(value);
    let ret = i === -1 ? null : arr.splice(i, 1)[0];
    return ret
}
/**
 * 随机ID
 * @param len 可指定长度
 */
export const randomId = (len) => Math.random().toString().substr(2, len);


/**
 * 根据uid来获取第一位前缀
 * @param len 可指定长度
 */
export const getUidPrefix = function (str) {
    return str.substr(0, 1);
};

/**
 * 保留x位小数
 * @param n 数字
 * @param decimals 保留 x 位小数
 * @return {nubmer}
 */
// @ts-ignore
export const round = (n: number, decimals: number = 0): number => Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);

/**
 * 唯一ID
 * 根据时间戳生产
 */
export const id = () => (Date.now() + randomId(4)).toString();

/**
 * 将数字取整
 */
export const Int = (num) => Math.floor(num);

/**
 * 根据session获取客户端ip
 * @param session
 */
export const ip = session => session.__session__.__socket__.remoteAddress.ip.replace('::ffff:', '');

/**
 * 随机一个整数 包括min和max
 * @param  min [最小值]
 * @param  max [最大值]
 * @param  addOne [是否加一]
 * @return {[Number]}
 */
export function random(min: number, max: number, addOne = 1) {
    let count = Math.max(max - min, 0) + addOne;
    return Math.floor(Math.random() * count) + min;
};

// 时间配置
export const time = { minute: 0, hour: 0, day: 0 };
time.minute = 60 * 1000; // 分
time.hour = time.minute * 60; // 时
time.day = time.hour * 24; // 天

/**
 * 根据时间戳获取当前00点的时间
 * @param  timestamp [时间戳 不填就是当天]
 * @return {[Number]}
 */
export const zerotime = function (timestamp = null) {
    let date = timestamp ? new Date(timestamp) : new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

/*
 * 数字 字符串补0
 * 根据长度补出前面差的0
 */
export const pad = function () {
    let tbl = [];
    return function (num: any, length = 2) {
        let len = length - num.toString().length;
        if (len <= 0)
            return num;
        if (!tbl[len])
            tbl[len] = (new Array(len + 1)).join('0');
        return tbl[len] + num;
    };
}();
/*
 *
 * 随机获取玩家头像信息
 */
export function getHead() {
    let headAll = [
        'head1',
        'head2',
        'head3',
        'head4',
        'head5',
        'head6',
        'head7',
        'head8',
        'head9',
        'head10',
        'head11',
        'head12',
        'head13',
        'head14',
        'head15',
        'head16',
        'head17',
        'head18',
        'head19',
        'head20',
        'head21',
        'head22',
        'head23',
        'head24',
        'head25',
        'head26',
        'head27',
        'head28',
        'head29',
        'head30',
        'head31',
        'head32',
        'head33',
        'head34',
        'head35',
        'head36',
        'head37',
        'head38',
        'head39',
        'head40',
    ];
    let head = random(0, headAll.length - 1);
    return headAll[head];
};

/**
 * [{key,value}]
 * 通过Math.random()随机的数判断选择的元素
 */
export const selectElement = function (proTable) {
    if (Object.prototype.toString.call(proTable) != '[object Array]') {
        throw new Error('传入参数必须为数组');
    }
    const weightSum = proTable.reduce((num, table) => {
        return num + table.value
    }, 0);
    const proDist = {};
    proTable.forEach((table, i) => {
        proDist[table.key] = proTable.slice(0, i + 1).reduce((num, table) => {
            return num + table.value
        }, 0);
    });
    const random = Math.random() * weightSum;
    let resultEle;
    Object.keys(proDist).map(dis => {
        return {
            key: dis,
            value: proDist[dis]
        }
    }).reduce((value, ele) => {
        if (resultEle) {
            return 0;
        }
        if (value > ele.value) {
            return value
        } else {
            resultEle = ele.key;
        }
    }, random);
    return resultEle;
};

/**
 * [{key: value}]
 * 通过Math.random()随机的数判断选择的元素
 */
export const selectEle = (proTable) => {
    if (Object.prototype.toString.call(proTable) != '[object Array]') {
        throw new Error('传入参数必须为数组');
    }
    const weightSum = proTable.reduce((num, table) => {
        return num + ramda.values(table)[0];
    }, 0);
    const proDist = [];
    proTable.forEach((table, i) => {
        const e = {
            [Object.keys(table)[0]]: proTable.slice(0, i + 1).reduce((num, table) => {
                return num + table[Object.keys(table)[0]]
            }, 0)
        };
        proDist.push(e);
    });
    const random = Math.random() * weightSum;
    let resultEle;
    proDist.reduce((value, ele) => {

        if (resultEle) {
            return 0;
        }
        if (value > ramda.values(ele)[0]) {
            return value
        } else {
            resultEle = Object.keys(ele)[0];
        }
    }, random);
    console.warn("resultEle.......",resultEle)
    return resultEle;
};

/**
 * 深拷贝
 */
export const clone = ramda.clone;

/**
 * 返回第一个成员以外的所有成员组成的新数组
 */
export const tail = ramda.tail;

/**
 * 所有成员都满足指定函数时，返回true，否则返回false
 */
export const all = ramda.all;

/**
 * 返回最后一个成员以外的所有成员组成的新数组
 */
export const init = ramda.init;

/**
 * 返回列表或字符串的最后一个元素
 */
export const last = ramda.last;

/**
 *  判断是否为空,包括 null,undefined,{},'',[],
 */
export const isVoid = (value) => ramda.isEmpty(value) ? true : ramda.isNil(value) ? true : false;

/**
 * 返回对象自身的属性的属性值组成的数组。
 */
export const values = ramda.values;
/**
 *  按照给定的一组函数，进行多重排序
 */
export const sortWith = ramda.sortWith;

export const difference = ramda.difference;

export const filter = ramda.filter;

export const findLastIndex = ramda.findLastIndex;

export const sum = (values: any, toInt = false) => {
    const type = Object.prototype.toString.call(values);
    if (type == '[object Array]') {
        return toInt ? Math.floor(ramda.sum(values)) : ramda.sum(values);
    } else if (type == '[object Object]') {
        return toInt ? Math.floor(ramda.sum(ramda.values(values))) : ramda.sum(ramda.values(values));
    } else if (type == '[object Number]') {
        return toInt ? Math.floor(values) : values;
    }
};



/**
 *将数字转换为String （上万加‘W’）
 */
export const moneyToString = function (money) {
    let value = Math.abs(money);
    if (value >= 100000000) {
        return (money / 100000000).toFixed(2) + '亿';
    }
    if (value >= 10000) {
        return (money / 10000).toFixed(2) + '万';
    }
    return money;
};

/**
 * 根据当前时间生成 年月日时分秒的键
 * eg 2017-8-28-10-03-59  => 20170828
 */
export const dateKey = (timestamp = null) => {
    const now = timestamp ? timestamp : new Date();
    return now.getFullYear().toString() + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2);
};

/**
 * 根据当前月
 *
 */
export const getMonth = () => {
    const now = new Date();
    return now.getFullYear() + '-' + pad(now.getMonth() + 1, 2);
};

/**
 * 根据下个月
 *
 */
export const getNextMonth = () => {
    const now = new Date();
    let month = now.getMonth() + 2;
    let year = now.getFullYear();
    if (month === 13) {
        year += 1;
        month = 1;
    }
    return year + '-' + pad(month, 2);
};

/**
 * 根据上个月
 *
 */
export const getLastMonth = () => {
    const now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();
    if (month == 0) {
        year -= 1;
        month = 12;
    }
    return year + '-' + pad(month, 2);
};


/**
 * 获取上个月1号和最后一天的日期
 *
 */
export const getLastMonthStartAndEnd = () => {
    let nowdays = new Date();
    let year = nowdays.getFullYear();
    let month = nowdays.getMonth();
    if (month == 0) {
        month = 12;
        year = year - 1;

    }
    if (month < 10) {
        month = month;
    }

    let myDate = new Date(year, month, 0);

    let startDate = year + '-' + month + '-01 00:00:00'; //上个月第一天
    let endDate = year + '-' + month + '-' + myDate.getDate() + ' 23:59:59';//上个月最后一天
    return { startDate, endDate }
};

/**
 * 获取下个月1号0点的时间戳
 */
export const nextMonthZeroTime = (timestamp = null) => {
    const now = timestamp ? new Date(timestamp) : new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
};

/**金币转换 */
export function simplifyMoney(money: number, players, num = 10000) {
    const value = Math.abs(money);
    if (value >= 100000000 && value >= num) {
        return utils.changeMoneyToGold(parseFloat((money / 1000000).toFixed(2))) + langsrv.getlanguage(players.language, langsrv.Net_Message.id_1085);
    } else if (value >= 1000) {
        return utils.changeMoneyToGold(parseFloat((money / 1000).toFixed(2))) + langsrv.getlanguage(players.language, langsrv.Net_Message.id_1086);
    } else {
        return utils.changeMoneyToGold(money);
    }
    return money;
};

/**
 * 随机一个下标出来
 * @param  {[number]} len    [数组长度]
 * @param  {[number]} count  [需要随机的个数](可不填)
 * @param  {[Number]} ignore [需要忽略的下标](可不填)
 * @return {[number|Array]}  [如果count大于1 则返回count长度的数组下标 不重复]
 */
export function randomIndex(len: number, count: number, ignore = null) {
    if (len === 0) {
        return -1;
    }
    let indexs: number[] = [],
        _count = count;
    ignore = Array.isArray(ignore) ? ignore : [ignore];
    _count = _count || 1;
    _count = _count > len ? len : _count;
    for (let i = 0; i < len; i++) {
        if (ignore.indexOf(i) !== -1)
            continue;
        indexs.push(i);
    }
    let ret: any[] = [];
    for (let i = 0; i < _count; i++) {
        let idx = random(0, indexs.length - 1);
        ret.push(indexs.splice(idx, 1)[0]);
    }
    if (ret.length === 0)
        return -1;
    return count === 1 ? ret[0] : ret;
};

/**时间戳转换标准时间 */
export function cDate(g_times?) {
    let time = new Date();
    if (g_times == undefined) {
        time = new Date();
    } else {
        time = new Date(Number(g_times));
    }
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * 时间戳转换成yyyyMMddHHmmss
 * 列： 20201201111111
 */

export function getDateNumber(g_times?) {
    let time;
    if (g_times == undefined) {
        time = new Date();
    } else {
        time = new Date(Number(g_times));
    }
    // let year = time.getFullYear();
    // let month = (time.getMonth() + 1) >= 10 ? (time.getMonth() + 1) : ("0" + parseInt(time.getMonth() + 1));
    // let day = time.getDate() >= 10 ? time.getDate() : "0" + parseInt(time.getDate());
    // let hh = time.getHours() >= 10 ? time.getHours() : "0" + time.getHours();
    // let mm = time.getMinutes() >= 10 ? time.getMinutes() : "0" + time.getMinutes();
    // let getSeconds = time.getSeconds() >= 10 ? time.getSeconds() : "0" + parseInt(time.getSeconds());
    // let gettime = year + month + day + hh + mm + getSeconds;
    // return gettime;
    return moment(time).format("YYYYMMDDHHmmss");
}

/**时间戳转换标准时间 */
export function getYearAndDay(g_times?) {
    let time;
    if (g_times == undefined) {
        time = new Date();
    } else {
        time = new Date(Number(g_times));
    }

    let year = time.getFullYear();
    let month = (time.getMonth() + 1) >= 10 ? (time.getMonth() + 1) : ("0" + parseInt(time.getMonth() + 1));
    let day = time.getDate() >= 10 ? time.getDate() : "0" + parseInt(time.getDate());
    let gettime = month + "-" + day;
    return gettime;
}

//根据权重配置随机出其中一个
export function sortProbability(random, _arr) {
    let allweight = 0;
    let section = 0; //区间临时变量
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
}

//数组中随机选取一个元素
export function RangeRandOne(arr: any[]) {
    if (arr.length == 1) {
        return arr[0];
    }
    let rand = random(0, arr.length - 1);
    return arr[rand];
}
/**group权重 */
export function sortProbability_<T>(_arr: { group: T, weight: number }[]) {
    let allweight = 0;
    let section = 0; //区间临时变量
    let arr = _arr.map(m => {
        const obj: { group?: T, weight?: number, section?: number[] } = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    //console.log("obj=", arr);
    //排序
    arr.sort((a, b) => {
        return a.weight - b.weight;
    });
    //计算总权重
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].weight);
    }

    //获取概率区间
    for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
            let right = (arr[i].weight / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        } else {
            let right = (arr[i].weight / allweight) + section;
            arr[i]['section'] = [section, right];
            section = right;
        }
    }
    const random = Math.random();
    for (let i = 0; i < arr.length; i++) {
        if (random >= arr[i].section[0] && random < arr[i].section[1]) {
            return arr[i].group;
        }
    }
}







/**
 * 对a 数组  与 b数组进行对比,如果a数组在b数组里面有重复的那么就删掉
 *
 */
export function array_diff(a: number[], b: number[]) {
    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < a.length; j++) {
            if (a[j] == b[i]) {
                a.splice(j, 1);
                j = j - 1;
            }
        }
    }
    return a;
}

/**
 * 改变金币的换算结构
 *
 */
export function changeMoneyToGold(gold: number) {
    let lastGold = (gold / 100).toFixed(2);
    return Number(lastGold);
}


/**
 * 获取本周周一的时间错
 *
 */
export function MondayTime(timestamp = null) {
    let date = timestamp ? new Date(timestamp) : new Date();
    date.setHours(0, 0, 0, 0);
    let nowTime = date.getTime();
    let day = date.getDay();
    let oneDayLong = 24 * 60 * 60 * 1000;
    if (day == 0) {
        day = 7;
    }
    let MondayTime = nowTime - (day - 1) * oneDayLong;
    return MondayTime;
}

/**
 * 获取本周周日的时间错
 *
 */
export const SundayTime = (timestamp = null) => {
    let date = timestamp ? new Date(timestamp) : new Date();
    date.setHours(0, 0, 0, 0);
    let nowTime = date.getTime();
    let day = date.getDay();
    let oneDayLong = 24 * 60 * 60 * 1000;
    if (day == 0) {
        day = 7;
    }
    let SundayTime = nowTime + (7 - day + 1) * oneDayLong;
    return SundayTime;
}





/**
 * 签名MD5
 *
 */

export const signature = function (signSource, isCapital, isStringify) {
    let sign;
    //如果是对象需要序列化
    if (isStringify) {
        sign = querystring.stringify(signSource);
        // sign = urlencode.decode(sign);
    } else {
        sign = signSource;
    }
    let md5 = crypto.createHash('md5');
    md5.update(sign);
    let signs = md5.digest('hex')
    if (isCapital) signs = signs.toUpperCase();
    return signs
}





//对调对象的键值
export const exchangeObj = function (obj) {
    let newObj = {};
    for (let x in obj) {
        newObj[obj[x]] = x;
    }
    return newObj;
}




//获取ip
export const getClientIp = function (req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.headers['X-Forwarded-For'] ||
        req.headers['X-FORWARDED-FOR'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0];
    return ip;
}




/**打乱数组顺序 */
export function disorganizeArr(arr: number[]) {
    let k = 0;
    let temp = 0;
    for (let i = 0; i < arr.length; i++) {
        const r = Math.random();
        k = Math.floor(r * arr.length);
        // const r = meisenRandom_();
        // k = Math.floor(r % arr.length);
        temp = arr[i];
        arr[i] = arr[k];
        arr[k] = temp;
    }
}

/**
 * 梅森旋转法 生成随机数
 */
let meisenRandom = (function meisen() {
    let isInit = 0;
    let index;
    let MT = new Array(624); //624 * 32 - 31 = 19937

    /**
     * 设置种子
     * @param {Number} seed
     */
    function srand(seed) {
        index = 0;
        isInit = 1;
        MT[0] = seed;
        //对数组的其它元素进行初始化
        for (let i = 1; i < 624; i++) {
            let t = 1812433253 * (MT[i - 1] ^ (MT[i - 1] >> 30)) + i;
            MT[i] = t & 0xffffffff; //取最后的32位赋给MT[i]
        }
    }

    function generate() {
        for (let i = 0; i < 624; i++) {
            // 2^31 = 0x80000000
            // 2^31-1 = 0x7fffffff
            let y = (MT[i] & 0x80000000) + (MT[(i + 1) % 624] & 0x7fffffff);
            MT[i] = MT[(i + 397) % 624] ^ (y >> 1);
            if (y & 1) {
                MT[i] ^= 2567483615;
            }
        }
    }

    /**
     * 获取随机数
     */
    function rand() {
        //如果没有随机种子，设置新的种子
        if (!isInit) {
            srand(new Date().getTime());
        }
        if (index == 0) {
            generate();
        }
        let y = MT[index];
        y = y ^ (y >> 11); //y右移11个bit
        y = y ^ ((y << 7) & 2636928640); //y左移7个bit与2636928640相与，再与y进行异或
        y = y ^ ((y << 15) & 4022730752); //y左移15个bit与4022730752相与，再与y进行异或
        y = y ^ (y >> 18); //y右移18个bit再与y进行异或
        index = (index + 1) % 624;
        return y;
    }

    return {
        srand: srand,
        rand: rand
    };
})();



/**数字前面补零 */
export const repairZero = function (num1, num) {
    const currNumber = num1 + '';
    if (currNumber.length >= num) {
        return num1;
    }
    let temp = '';
    for (let i = 0; i < num - currNumber.length; i++) {
        temp += '0';
    }
    return temp + num1;
}




/**
 * @param rate
 */
export const isWin = (rate: number): boolean => {
    return Math.random() < rate;
};

/**
 * 判断玩家是否为新手玩家
 * 判断条件为注册时间是否超过3天
 * 玩家是否有充值行为
 * TODO: 后续会加入 玩家在游戏中赢了超过40块
 * @param player
 */
const threeDay = 1000 * 60 * 60 * 24 * 3;
export const isNewPlayer = (player): boolean => {
    if (player.addRmb > 0) {
        return false;
    }

    return Date.now() - player.createTime < threeDay;
};

interface IFilterProperty {
    uid: string;
    blacklist: number;
    isRobot: number;
    isNewPlayer: boolean;
    groupRemark: string;
    platformId: string;
}

/**
 * 过滤
 * @param player
 */
export const filterProperty = (player): IFilterProperty => {
    return {
        uid: player.uid,
        blacklist: Number.isInteger(player.blacklist) ? player.blacklist : 0,
        isRobot: player.isRobot,
        isNewPlayer: isNewPlayer(player),
        groupRemark: player.groupRemark,
        platformId: player.group_id
    };
};

/**
 * 获取调控结果
 * @param systemWinRate  系统胜率
 * @param winMethod      系统必胜结果方法
 * @param lossMethod     系统必输结果方法
 * @param randomMethod   随机结果方法
 * @returns 1 必胜 2 必输 3 随机 其他随机
 */
export function getControlResult(systemWinRate: number) {
    if (systemWinRate === 0) {
        return 3;
    }

    if (systemWinRate > 0 && Math.random() < systemWinRate) {
        return 1;
    }

    if (systemWinRate < 0 && Math.random() < Math.abs(systemWinRate)) {
        return 2;
    }
    return 3;
};


/**
 * 对a 数组  与 b数组进行对比,如果a数组在b数组里面有重复的那么就加入新的数组
 *
 */
export const array_same_list = (array1, array2) => {
    //临时数组存放
    let tempArray1 = [];//临时数组1
    let tempArray2 = [];//临时数组2

    for (let i = 0; i < array2.length; i++) {
        tempArray1[array2[i]] = true;//将数array2 中的元素值作为tempArray1 中的键，值为true；
    }

    for (let i = 0; i < array1.length; i++) {
        if (tempArray1[array1[i]]) {
            tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素；
        }
    }
    return tempArray2;

}

/**
 * 定时器===按分钟来进行定时，比如每10分钟定时。如果23:55分钟定时，那么还有5分钟的数据没有
 * 整合，这个时候就要判断当前时间减去10分钟是小于当前的凌晨,那么前一天的数据还要再整合一次
 *
 */
export const isNeedTimerToYesterDay = (min) => {
    const startTime = zerotime();
    const oneMin = 60 * 1000;
    const NowTime = Date.now();
    if ((NowTime - min * oneMin) < startTime) {
        return true;
    } else {
        return false;
    }
}

/**
 *  数组  ，删除一个元素，然后返回删除元素过后的数组
 */
export function ArrayRemove<T>(Array: T[], value: T) {
    let index = Array.indexOf(value);
    if (index > -1) {
        Array.splice(index, 1);
    }
    return Array;
}

/**
 * 高性能对象数组去重
 * arr为数组
 * index为键值
 */
export const Distinct = (arr, index) => {
    let result = [];
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i][index]]) {
            result.push(arr[i]);
            obj[arr[i][index]] = true;
        }
    }
    return result;
}

/**
 *  取出两个数组的不同元素
 */

export const getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
}

/**
 * 从一个给定的数组arr中,随机返回num个不重复项
 * @param arr
 * @param num
 */
export const getArrayItems = (arr, num) => {
    //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    //取出的数值项,保存在此数组
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
        //判断如果数组还有可以取出的元素,以防下标越界
        if (temp_array.length > 0) {
            //在数组中产生一个随机索引
            var arrIndex = Math.floor(Math.random() * temp_array.length);
            //将此随机索引的对应的数组元素值复制出来
            return_array[i] = temp_array[arrIndex];
            //然后删掉此索引的数组元素,这时候temp_array变为新的数组
            temp_array.splice(arrIndex, 1);
        } else {
            //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
            break;
        }
    }
    return return_array;
}

/**判断一个数组是否包含另一个数组 */
export function isContain<T>(arr1: T[], arr2: T[]) {

    let result: T[] = [];
    let a = arr1.map(c => c);
    let b = arr2.map(c => c);
    for (let i = a.length - 1; i > -1; i--) {
        for (let j = b.length - 1; j > -1; j--) {
            if (a[i] == b[j]) {
                result.push(a[i]);
                a.splice(i, 1);
                b.splice(j, 1);
                continue;
            }
        }
    }
    if (b.length == 0) {
        return true;
    }
    return false;
}
/**延时ms毫秒秒 */
export async function delay(ms: number) {
    await new Promise((resovle) => {
        setTimeout(() => { return resovle({}) }, ms);
    });
}
/**检查相同的number数组返回对应数据 */
export function checkAlike(theCards: number[]) {
    //[1,1,1,2,2] --->[{ key: 1, count: 3, Subscript: [ 0, 1, 2 ] }, { key: 2, count: 2, Subscript: [ 3, 4 ] }]
    const arr_1: { key: number, count: number, Subscript: number[] }[] = [];
    for (let i = 0; i < theCards.length; i++) {
        const card = theCards[i];
        let temp_arr = arr_1.find(c => c.key == card);
        if (temp_arr) {
            temp_arr.count += 1;
            temp_arr.Subscript.push(i);
        } else {
            arr_1.push({ key: card, count: 1, Subscript: [i] });
        }
    }
    // console.warn(arr_1);
    return arr_1;
};