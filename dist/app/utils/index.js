'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairZero = exports.disorganizeArr = exports.getClientIp = exports.exchangeObj = exports.signature = exports.SundayTime = exports.MondayTime = exports.changeMoneyToGold = exports.array_diff = exports.sortProbability_ = exports.RangeRandOne = exports.sortProbability = exports.getYearAndDay = exports.getDateNumber = exports.cDate = exports.randomIndex = exports.simplifyMoney = exports.nextMonthZeroTime = exports.getLastMonthStartAndEnd = exports.getLastMonth = exports.getNextMonth = exports.getMonth = exports.dateKey = exports.moneyToString = exports.sum = exports.findLastIndex = exports.filter = exports.difference = exports.sortWith = exports.values = exports.isVoid = exports.last = exports.init = exports.all = exports.tail = exports.clone = exports.selectEle = exports.selectElement = exports.getHead = exports.pad = exports.zerotime = exports.time = exports.random = exports.ip = exports.Int = exports.id = exports.round = exports.getUidPrefix = exports.randomId = exports.remove = void 0;
exports.checkAlike = exports.delay = exports.isContain = exports.getArrayItems = exports.getArrDifference = exports.Distinct = exports.ArrayRemove = exports.isNeedTimerToYesterDay = exports.array_same_list = exports.getControlResult = exports.filterProperty = exports.isNewPlayer = exports.isWin = void 0;
const ramda = require("ramda");
const moment = require("moment");
const querystring = require("querystring");
const crypto = require("crypto");
const utils = require("../utils");
const pinus_logger_1 = require("pinus-logger");
const GlobalErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const langsrv = require("../services/common/langsrv");
Object.defineProperty(Array.prototype, 'remove', {
    value: function (key, value) {
        let i = !!key ? this.findIndex((m) => m[key] === value) : this.indexOf(value);
        return i === -1 ? null : this.splice(i, 1)[0];
    },
    enumerable: false
});
function remove(arr, key, value) {
    let i = !!key ? arr.findIndex((m) => m[key] === value) : arr.indexOf(value);
    let ret = i === -1 ? null : arr.splice(i, 1)[0];
    return ret;
}
exports.remove = remove;
const randomId = (len) => Math.random().toString().substr(2, len);
exports.randomId = randomId;
const getUidPrefix = function (str) {
    return str.substr(0, 1);
};
exports.getUidPrefix = getUidPrefix;
const round = (n, decimals = 0) => Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);
exports.round = round;
const id = () => (Date.now() + (0, exports.randomId)(4)).toString();
exports.id = id;
const Int = (num) => Math.floor(num);
exports.Int = Int;
const ip = session => session.__session__.__socket__.remoteAddress.ip.replace('::ffff:', '');
exports.ip = ip;
function random(min, max, addOne = 1) {
    let count = Math.max(max - min, 0) + addOne;
    return Math.floor(Math.random() * count) + min;
}
exports.random = random;
;
exports.time = { minute: 0, hour: 0, day: 0 };
exports.time.minute = 60 * 1000;
exports.time.hour = exports.time.minute * 60;
exports.time.day = exports.time.hour * 24;
const zerotime = function (timestamp = null) {
    let date = timestamp ? new Date(timestamp) : new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};
exports.zerotime = zerotime;
exports.pad = function () {
    let tbl = [];
    return function (num, length = 2) {
        let len = length - num.toString().length;
        if (len <= 0)
            return num;
        if (!tbl[len])
            tbl[len] = (new Array(len + 1)).join('0');
        return tbl[len] + num;
    };
}();
function getHead() {
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
}
exports.getHead = getHead;
;
const selectElement = function (proTable) {
    if (Object.prototype.toString.call(proTable) != '[object Array]') {
        throw new Error('传入参数必须为数组');
    }
    const weightSum = proTable.reduce((num, table) => {
        return num + table.value;
    }, 0);
    const proDist = {};
    proTable.forEach((table, i) => {
        proDist[table.key] = proTable.slice(0, i + 1).reduce((num, table) => {
            return num + table.value;
        }, 0);
    });
    const random = Math.random() * weightSum;
    let resultEle;
    Object.keys(proDist).map(dis => {
        return {
            key: dis,
            value: proDist[dis]
        };
    }).reduce((value, ele) => {
        if (resultEle) {
            return 0;
        }
        if (value > ele.value) {
            return value;
        }
        else {
            resultEle = ele.key;
        }
    }, random);
    return resultEle;
};
exports.selectElement = selectElement;
const selectEle = (proTable) => {
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
                return num + table[Object.keys(table)[0]];
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
            return value;
        }
        else {
            resultEle = Object.keys(ele)[0];
        }
    }, random);
    console.warn("resultEle.......", resultEle);
    return resultEle;
};
exports.selectEle = selectEle;
exports.clone = ramda.clone;
exports.tail = ramda.tail;
exports.all = ramda.all;
exports.init = ramda.init;
exports.last = ramda.last;
const isVoid = (value) => ramda.isEmpty(value) ? true : ramda.isNil(value) ? true : false;
exports.isVoid = isVoid;
exports.values = ramda.values;
exports.sortWith = ramda.sortWith;
exports.difference = ramda.difference;
exports.filter = ramda.filter;
exports.findLastIndex = ramda.findLastIndex;
const sum = (values, toInt = false) => {
    const type = Object.prototype.toString.call(values);
    if (type == '[object Array]') {
        return toInt ? Math.floor(ramda.sum(values)) : ramda.sum(values);
    }
    else if (type == '[object Object]') {
        return toInt ? Math.floor(ramda.sum(ramda.values(values))) : ramda.sum(ramda.values(values));
    }
    else if (type == '[object Number]') {
        return toInt ? Math.floor(values) : values;
    }
};
exports.sum = sum;
const moneyToString = function (money) {
    let value = Math.abs(money);
    if (value >= 100000000) {
        return (money / 100000000).toFixed(2) + '亿';
    }
    if (value >= 10000) {
        return (money / 10000).toFixed(2) + '万';
    }
    return money;
};
exports.moneyToString = moneyToString;
const dateKey = (timestamp = null) => {
    const now = timestamp ? timestamp : new Date();
    return now.getFullYear().toString() + (0, exports.pad)(now.getMonth() + 1, 2) + (0, exports.pad)(now.getDate(), 2);
};
exports.dateKey = dateKey;
const getMonth = () => {
    const now = new Date();
    return now.getFullYear() + '-' + (0, exports.pad)(now.getMonth() + 1, 2);
};
exports.getMonth = getMonth;
const getNextMonth = () => {
    const now = new Date();
    let month = now.getMonth() + 2;
    let year = now.getFullYear();
    if (month === 13) {
        year += 1;
        month = 1;
    }
    return year + '-' + (0, exports.pad)(month, 2);
};
exports.getNextMonth = getNextMonth;
const getLastMonth = () => {
    const now = new Date();
    let month = now.getMonth();
    let year = now.getFullYear();
    if (month == 0) {
        year -= 1;
        month = 12;
    }
    return year + '-' + (0, exports.pad)(month, 2);
};
exports.getLastMonth = getLastMonth;
const getLastMonthStartAndEnd = () => {
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
    let startDate = year + '-' + month + '-01 00:00:00';
    let endDate = year + '-' + month + '-' + myDate.getDate() + ' 23:59:59';
    return { startDate, endDate };
};
exports.getLastMonthStartAndEnd = getLastMonthStartAndEnd;
const nextMonthZeroTime = (timestamp = null) => {
    const now = timestamp ? new Date(timestamp) : new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
};
exports.nextMonthZeroTime = nextMonthZeroTime;
function simplifyMoney(money, players, num = 10000) {
    const value = Math.abs(money);
    if (value >= 100000000 && value >= num) {
        return utils.changeMoneyToGold(parseFloat((money / 1000000).toFixed(2))) + langsrv.getlanguage(players.language, langsrv.Net_Message.id_1085);
    }
    else if (value >= 1000) {
        return utils.changeMoneyToGold(parseFloat((money / 1000).toFixed(2))) + langsrv.getlanguage(players.language, langsrv.Net_Message.id_1086);
    }
    else {
        return utils.changeMoneyToGold(money);
    }
    return money;
}
exports.simplifyMoney = simplifyMoney;
;
function randomIndex(len, count, ignore = null) {
    if (len === 0) {
        return -1;
    }
    let indexs = [], _count = count;
    ignore = Array.isArray(ignore) ? ignore : [ignore];
    _count = _count || 1;
    _count = _count > len ? len : _count;
    for (let i = 0; i < len; i++) {
        if (ignore.indexOf(i) !== -1)
            continue;
        indexs.push(i);
    }
    let ret = [];
    for (let i = 0; i < _count; i++) {
        let idx = random(0, indexs.length - 1);
        ret.push(indexs.splice(idx, 1)[0]);
    }
    if (ret.length === 0)
        return -1;
    return count === 1 ? ret[0] : ret;
}
exports.randomIndex = randomIndex;
;
function cDate(g_times) {
    let time = new Date();
    if (g_times == undefined) {
        time = new Date();
    }
    else {
        time = new Date(Number(g_times));
    }
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
}
exports.cDate = cDate;
function getDateNumber(g_times) {
    let time;
    if (g_times == undefined) {
        time = new Date();
    }
    else {
        time = new Date(Number(g_times));
    }
    return moment(time).format("YYYYMMDDHHmmss");
}
exports.getDateNumber = getDateNumber;
function getYearAndDay(g_times) {
    let time;
    if (g_times == undefined) {
        time = new Date();
    }
    else {
        time = new Date(Number(g_times));
    }
    let year = time.getFullYear();
    let month = (time.getMonth() + 1) >= 10 ? (time.getMonth() + 1) : ("0" + parseInt(time.getMonth() + 1));
    let day = time.getDate() >= 10 ? time.getDate() : "0" + parseInt(time.getDate());
    let gettime = month + "-" + day;
    return gettime;
}
exports.getYearAndDay = getYearAndDay;
function sortProbability(random, _arr) {
    let allweight = 0;
    let section = 0;
    let arr = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    arr.sort((a, b) => {
        return a.probability - b.probability;
    });
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].probability);
    }
    for (let i = 0; i < arr.length; i++) {
        if (i == 0) {
            let right = (arr[i].probability / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        }
        else {
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
exports.sortProbability = sortProbability;
function RangeRandOne(arr) {
    if (arr.length == 1) {
        return arr[0];
    }
    let rand = random(0, arr.length - 1);
    return arr[rand];
}
exports.RangeRandOne = RangeRandOne;
function sortProbability_(_arr) {
    let allweight = 0;
    let section = 0;
    let arr = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    arr.sort((a, b) => {
        return a.weight - b.weight;
    });
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].weight);
    }
    for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
            let right = (arr[i].weight / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        }
        else {
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
exports.sortProbability_ = sortProbability_;
function array_diff(a, b) {
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
exports.array_diff = array_diff;
function changeMoneyToGold(gold) {
    let lastGold = (gold / 100).toFixed(2);
    return Number(lastGold);
}
exports.changeMoneyToGold = changeMoneyToGold;
function MondayTime(timestamp = null) {
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
exports.MondayTime = MondayTime;
const SundayTime = (timestamp = null) => {
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
};
exports.SundayTime = SundayTime;
const signature = function (signSource, isCapital, isStringify) {
    let sign;
    if (isStringify) {
        sign = querystring.stringify(signSource);
    }
    else {
        sign = signSource;
    }
    let md5 = crypto.createHash('md5');
    md5.update(sign);
    let signs = md5.digest('hex');
    if (isCapital)
        signs = signs.toUpperCase();
    return signs;
};
exports.signature = signature;
const exchangeObj = function (obj) {
    let newObj = {};
    for (let x in obj) {
        newObj[obj[x]] = x;
    }
    return newObj;
};
exports.exchangeObj = exchangeObj;
const getClientIp = function (req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.headers['X-Forwarded-For'] ||
        req.headers['X-FORWARDED-FOR'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0];
    return ip;
};
exports.getClientIp = getClientIp;
function disorganizeArr(arr) {
    let k = 0;
    let temp = 0;
    for (let i = 0; i < arr.length; i++) {
        const r = Math.random();
        k = Math.floor(r * arr.length);
        temp = arr[i];
        arr[i] = arr[k];
        arr[k] = temp;
    }
}
exports.disorganizeArr = disorganizeArr;
let meisenRandom = (function meisen() {
    let isInit = 0;
    let index;
    let MT = new Array(624);
    function srand(seed) {
        index = 0;
        isInit = 1;
        MT[0] = seed;
        for (let i = 1; i < 624; i++) {
            let t = 1812433253 * (MT[i - 1] ^ (MT[i - 1] >> 30)) + i;
            MT[i] = t & 0xffffffff;
        }
    }
    function generate() {
        for (let i = 0; i < 624; i++) {
            let y = (MT[i] & 0x80000000) + (MT[(i + 1) % 624] & 0x7fffffff);
            MT[i] = MT[(i + 397) % 624] ^ (y >> 1);
            if (y & 1) {
                MT[i] ^= 2567483615;
            }
        }
    }
    function rand() {
        if (!isInit) {
            srand(new Date().getTime());
        }
        if (index == 0) {
            generate();
        }
        let y = MT[index];
        y = y ^ (y >> 11);
        y = y ^ ((y << 7) & 2636928640);
        y = y ^ ((y << 15) & 4022730752);
        y = y ^ (y >> 18);
        index = (index + 1) % 624;
        return y;
    }
    return {
        srand: srand,
        rand: rand
    };
})();
const repairZero = function (num1, num) {
    const currNumber = num1 + '';
    if (currNumber.length >= num) {
        return num1;
    }
    let temp = '';
    for (let i = 0; i < num - currNumber.length; i++) {
        temp += '0';
    }
    return temp + num1;
};
exports.repairZero = repairZero;
const isWin = (rate) => {
    return Math.random() < rate;
};
exports.isWin = isWin;
const threeDay = 1000 * 60 * 60 * 24 * 3;
const isNewPlayer = (player) => {
    if (player.addRmb > 0) {
        return false;
    }
    return Date.now() - player.createTime < threeDay;
};
exports.isNewPlayer = isNewPlayer;
const filterProperty = (player) => {
    return {
        uid: player.uid,
        blacklist: Number.isInteger(player.blacklist) ? player.blacklist : 0,
        isRobot: player.isRobot,
        isNewPlayer: (0, exports.isNewPlayer)(player),
        groupRemark: player.groupRemark,
        platformId: player.group_id
    };
};
exports.filterProperty = filterProperty;
function getControlResult(systemWinRate) {
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
}
exports.getControlResult = getControlResult;
;
const array_same_list = (array1, array2) => {
    let tempArray1 = [];
    let tempArray2 = [];
    for (let i = 0; i < array2.length; i++) {
        tempArray1[array2[i]] = true;
    }
    for (let i = 0; i < array1.length; i++) {
        if (tempArray1[array1[i]]) {
            tempArray2.push(array1[i]);
        }
    }
    return tempArray2;
};
exports.array_same_list = array_same_list;
const isNeedTimerToYesterDay = (min) => {
    const startTime = (0, exports.zerotime)();
    const oneMin = 60 * 1000;
    const NowTime = Date.now();
    if ((NowTime - min * oneMin) < startTime) {
        return true;
    }
    else {
        return false;
    }
};
exports.isNeedTimerToYesterDay = isNeedTimerToYesterDay;
function ArrayRemove(Array, value) {
    let index = Array.indexOf(value);
    if (index > -1) {
        Array.splice(index, 1);
    }
    return Array;
}
exports.ArrayRemove = ArrayRemove;
const Distinct = (arr, index) => {
    let result = [];
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i][index]]) {
            result.push(arr[i]);
            obj[arr[i][index]] = true;
        }
    }
    return result;
};
exports.Distinct = Distinct;
const getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
};
exports.getArrDifference = getArrDifference;
const getArrayItems = (arr, num) => {
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
        if (temp_array.length > 0) {
            var arrIndex = Math.floor(Math.random() * temp_array.length);
            return_array[i] = temp_array[arrIndex];
            temp_array.splice(arrIndex, 1);
        }
        else {
            break;
        }
    }
    return return_array;
};
exports.getArrayItems = getArrayItems;
function isContain(arr1, arr2) {
    let result = [];
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
exports.isContain = isContain;
async function delay(ms) {
    await new Promise((resovle) => {
        setTimeout(() => { return resovle({}); }, ms);
    });
}
exports.delay = delay;
function checkAlike(theCards) {
    const arr_1 = [];
    for (let i = 0; i < theCards.length; i++) {
        const card = theCards[i];
        let temp_arr = arr_1.find(c => c.key == card);
        if (temp_arr) {
            temp_arr.count += 1;
            temp_arr.Subscript.push(i);
        }
        else {
            arr_1.push({ key: card, count: 1, Subscript: [i] });
        }
    }
    return arr_1;
}
exports.checkAlike = checkAlike;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7O0FBQ2IsK0JBQWdDO0FBQ2hDLGlDQUFrQztBQUNsQywyQ0FBMkM7QUFDM0MsaUNBQWlDO0FBQ2pDLGtDQUFtQztBQUVuQywrQ0FBeUM7QUFFekMsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzlELHNEQUF1RDtBQVN2RCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFO0lBQzdDLEtBQUssRUFBRSxVQUFVLEdBQVcsRUFBRSxLQUFVO1FBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsVUFBVSxFQUFFLEtBQUs7Q0FDcEIsQ0FBQyxDQUFDO0FBRUgsU0FBZ0IsTUFBTSxDQUFJLEdBQWEsRUFBRSxHQUFXLEVBQUUsS0FBVTtJQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakYsSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sR0FBRyxDQUFBO0FBQ2QsQ0FBQztBQUpELHdCQUlDO0FBS00sTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQTVELFFBQUEsUUFBUSxZQUFvRDtBQU9sRSxNQUFNLFlBQVksR0FBRyxVQUFVLEdBQUc7SUFDckMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUM7QUFGVyxRQUFBLFlBQVksZ0JBRXZCO0FBU0ssTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsV0FBbUIsQ0FBQyxFQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUMsQ0FBQztBQUE5RyxRQUFBLEtBQUssU0FBeUc7QUFNcEgsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFBakQsUUFBQSxFQUFFLE1BQStDO0FBS3ZELE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQS9CLFFBQUEsR0FBRyxPQUE0QjtBQU1yQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUF2RixRQUFBLEVBQUUsTUFBcUY7QUFTcEcsU0FBZ0IsTUFBTSxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsTUFBTSxHQUFHLENBQUM7SUFDdkQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUM1QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNuRCxDQUFDO0FBSEQsd0JBR0M7QUFBQSxDQUFDO0FBR1csUUFBQSxJQUFJLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ25ELFlBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFJLENBQUMsSUFBSSxHQUFHLFlBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQzdCLFlBQUksQ0FBQyxHQUFHLEdBQUcsWUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFPbkIsTUFBTSxRQUFRLEdBQUcsVUFBVSxTQUFTLEdBQUcsSUFBSTtJQUM5QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUIsQ0FBQyxDQUFDO0FBSlcsUUFBQSxRQUFRLFlBSW5CO0FBTVcsUUFBQSxHQUFHLEdBQUc7SUFDZixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixPQUFPLFVBQVUsR0FBUSxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ2pDLElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3pDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDUixPQUFPLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ1QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUMxQixDQUFDLENBQUM7QUFDTixDQUFDLEVBQUUsQ0FBQztBQUtKLFNBQWdCLE9BQU87SUFDbkIsSUFBSSxPQUFPLEdBQUc7UUFDVixPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFFBQVE7UUFDUixRQUFRO0tBQ1gsQ0FBQztJQUNGLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN6QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBN0NELDBCQTZDQztBQUFBLENBQUM7QUFNSyxNQUFNLGFBQWEsR0FBRyxVQUFVLFFBQVE7SUFDM0MsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksZ0JBQWdCLEVBQUU7UUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUNoQztJQUNELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDN0MsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQTtJQUM1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDTixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDaEUsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQTtRQUM1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7SUFDekMsSUFBSSxTQUFTLENBQUM7SUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMzQixPQUFPO1lBQ0gsR0FBRyxFQUFFLEdBQUc7WUFDUixLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQztTQUN0QixDQUFBO0lBQ0wsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3JCLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUNELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUU7WUFDbkIsT0FBTyxLQUFLLENBQUE7U0FDZjthQUFNO1lBQ0gsU0FBUyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7U0FDdkI7SUFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDWCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDLENBQUM7QUEvQlcsUUFBQSxhQUFhLGlCQStCeEI7QUFNSyxNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO0lBQ2xDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGdCQUFnQixFQUFFO1FBQzlELE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDaEM7SUFDRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzdDLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ04sTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDMUIsTUFBTSxDQUFDLEdBQUc7WUFDTixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNwRSxPQUFPLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzdDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDUixDQUFDO1FBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7SUFDekMsSUFBSSxTQUFTLENBQUM7SUFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBRTFCLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUNELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxLQUFLLENBQUE7U0FDZjthQUFNO1lBQ0gsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkM7SUFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzFDLE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUMsQ0FBQztBQS9CVyxRQUFBLFNBQVMsYUErQnBCO0FBS1csUUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUtwQixRQUFBLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBS2xCLFFBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFLaEIsUUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUtsQixRQUFBLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBS3hCLE1BQU0sTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQXBGLFFBQUEsTUFBTSxVQUE4RTtBQUtwRixRQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBSXRCLFFBQUEsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFFMUIsUUFBQSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUU5QixRQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBRXRCLFFBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFFMUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFXLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxFQUFFO0lBQzlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRCxJQUFJLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtRQUMxQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEU7U0FBTSxJQUFJLElBQUksSUFBSSxpQkFBaUIsRUFBRTtRQUNsQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUNoRztTQUFNLElBQUksSUFBSSxJQUFJLGlCQUFpQixFQUFFO1FBQ2xDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDOUM7QUFDTCxDQUFDLENBQUM7QUFUVyxRQUFBLEdBQUcsT0FTZDtBQU9LLE1BQU0sYUFBYSxHQUFHLFVBQVUsS0FBSztJQUN4QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLElBQUksS0FBSyxJQUFJLFNBQVMsRUFBRTtRQUNwQixPQUFPLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7S0FDL0M7SUFDRCxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQzNDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBVFcsUUFBQSxhQUFhLGlCQVN4QjtBQU1LLE1BQU0sT0FBTyxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxFQUFFO0lBQ3hDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQy9DLE9BQU8sR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUEsV0FBRyxFQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBQSxXQUFHLEVBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdGLENBQUMsQ0FBQztBQUhXLFFBQUEsT0FBTyxXQUdsQjtBQU1LLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTtJQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLE9BQU8sR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFBLFdBQUcsRUFBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUMsQ0FBQztBQUhXLFFBQUEsUUFBUSxZQUduQjtBQU1LLE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRTtJQUM3QixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3ZCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdCLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUNkLElBQUksSUFBSSxDQUFDLENBQUM7UUFDVixLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQ2I7SUFDRCxPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBQSxXQUFHLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQVRXLFFBQUEsWUFBWSxnQkFTdkI7QUFNSyxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUU7SUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN2QixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdCLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNaLElBQUksSUFBSSxDQUFDLENBQUM7UUFDVixLQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ2Q7SUFDRCxPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBQSxXQUFHLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQVRXLFFBQUEsWUFBWSxnQkFTdkI7QUFPSyxNQUFNLHVCQUF1QixHQUFHLEdBQUcsRUFBRTtJQUN4QyxJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3pCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNqQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQ1osS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNYLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBRW5CO0lBQ0QsSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFO1FBQ1osS0FBSyxHQUFHLEtBQUssQ0FBQztLQUNqQjtJQUVELElBQUksTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFdEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsY0FBYyxDQUFDO0lBQ3BELElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDO0lBQ3hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUE7QUFDakMsQ0FBQyxDQUFDO0FBbEJXLFFBQUEsdUJBQXVCLDJCQWtCbEM7QUFLSyxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxFQUFFO0lBQ2xELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDekQsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4RSxDQUFDLENBQUM7QUFIVyxRQUFBLGlCQUFpQixxQkFHNUI7QUFHRixTQUFnQixhQUFhLENBQUMsS0FBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsS0FBSztJQUM3RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLElBQUksS0FBSyxJQUFJLFNBQVMsSUFBSSxLQUFLLElBQUksR0FBRyxFQUFFO1FBQ3BDLE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pKO1NBQU0sSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO1FBQ3RCLE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzlJO1NBQU07UUFDSCxPQUFPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFWRCxzQ0FVQztBQUFBLENBQUM7QUFTRixTQUFnQixXQUFXLENBQUMsR0FBVyxFQUFFLEtBQWEsRUFBRSxNQUFNLEdBQUcsSUFBSTtJQUNqRSxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDWCxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ2I7SUFDRCxJQUFJLE1BQU0sR0FBYSxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbkIsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsQ0FBQztJQUNyQixNQUFNLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLFNBQVM7UUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0lBQ0QsSUFBSSxHQUFHLEdBQVUsRUFBRSxDQUFDO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDN0IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QztJQUNELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDZCxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3RDLENBQUM7QUF0QkQsa0NBc0JDO0FBQUEsQ0FBQztBQUdGLFNBQWdCLEtBQUssQ0FBQyxPQUFRO0lBQzFCLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDdEIsSUFBSSxPQUFPLElBQUksU0FBUyxFQUFFO1FBQ3RCLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0tBQ3JCO1NBQU07UUFDSCxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDcEM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBUkQsc0JBUUM7QUFPRCxTQUFnQixhQUFhLENBQUMsT0FBUTtJQUNsQyxJQUFJLElBQUksQ0FBQztJQUNULElBQUksT0FBTyxJQUFJLFNBQVMsRUFBRTtRQUN0QixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztLQUNyQjtTQUFNO1FBQ0gsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3BDO0lBU0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDakQsQ0FBQztBQWhCRCxzQ0FnQkM7QUFHRCxTQUFnQixhQUFhLENBQUMsT0FBUTtJQUNsQyxJQUFJLElBQUksQ0FBQztJQUNULElBQUksT0FBTyxJQUFJLFNBQVMsRUFBRTtRQUN0QixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztLQUNyQjtTQUFNO1FBQ0gsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3BDO0lBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzlCLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakYsSUFBSSxPQUFPLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEMsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQWJELHNDQWFDO0FBR0QsU0FBZ0IsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJO0lBQ3hDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtZQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNkLE9BQU8sQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDakMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDM0M7SUFHRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDUixJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDbkI7YUFBTTtZQUNILElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDdkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDbkI7S0FFSjtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pDLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDSjtBQUNMLENBQUM7QUF0Q0QsMENBc0NDO0FBR0QsU0FBZ0IsWUFBWSxDQUFDLEdBQVU7SUFDbkMsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNqQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUNELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixDQUFDO0FBTkQsb0NBTUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBSSxJQUFvQztJQUNwRSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbkIsTUFBTSxHQUFHLEdBQXVELEVBQUUsQ0FBQztRQUNuRSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtZQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBR0gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNkLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDakMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEM7SUFHRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDVCxJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDeEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9CLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDbkI7YUFBTTtZQUNILElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDbkI7S0FDSjtJQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzNELE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUN2QjtLQUNKO0FBQ0wsQ0FBQztBQXRDRCw0Q0FzQ0M7QUFZRCxTQUFnQixVQUFVLENBQUMsQ0FBVyxFQUFFLENBQVc7SUFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDL0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNkLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNmLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2I7U0FDSjtLQUNKO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBVkQsZ0NBVUM7QUFNRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFZO0lBQzFDLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBSEQsOENBR0M7QUFPRCxTQUFnQixVQUFVLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDdkMsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ3JDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDWDtJQUNELElBQUksVUFBVSxHQUFHLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDbEQsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQztBQVhELGdDQVdDO0FBTU0sTUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLEVBQUU7SUFDM0MsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQ3JDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtRQUNWLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDWDtJQUNELElBQUksVUFBVSxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ3RELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUMsQ0FBQTtBQVhZLFFBQUEsVUFBVSxjQVd0QjtBQVdNLE1BQU0sU0FBUyxHQUFHLFVBQVUsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXO0lBQ2pFLElBQUksSUFBSSxDQUFDO0lBRVQsSUFBSSxXQUFXLEVBQUU7UUFDYixJQUFJLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUU1QztTQUFNO1FBQ0gsSUFBSSxHQUFHLFVBQVUsQ0FBQztLQUNyQjtJQUNELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzdCLElBQUksU0FBUztRQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDM0MsT0FBTyxLQUFLLENBQUE7QUFDaEIsQ0FBQyxDQUFBO0FBZFksUUFBQSxTQUFTLGFBY3JCO0FBT00sTUFBTSxXQUFXLEdBQUcsVUFBVSxHQUFHO0lBQ3BDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtRQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDdEI7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUE7QUFOWSxRQUFBLFdBQVcsZUFNdkI7QUFNTSxNQUFNLFdBQVcsR0FBRyxVQUFVLEdBQUc7SUFDcEMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztRQUNuQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO1FBQzlCLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDOUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhO1FBQzVCLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYTtRQUN4QixHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFFeEMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUE7QUFYWSxRQUFBLFdBQVcsZUFXdkI7QUFNRCxTQUFnQixjQUFjLENBQUMsR0FBYTtJQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUcvQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ2pCO0FBQ0wsQ0FBQztBQVpELHdDQVlDO0FBS0QsSUFBSSxZQUFZLEdBQUcsQ0FBQyxTQUFTLE1BQU07SUFDL0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxLQUFLLENBQUM7SUFDVixJQUFJLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQU14QixTQUFTLEtBQUssQ0FBQyxJQUFJO1FBQ2YsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNWLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRWIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFRCxTQUFTLFFBQVE7UUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBRzFCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2hFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNQLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUM7YUFDdkI7U0FDSjtJQUNMLENBQUM7SUFLRCxTQUFTLElBQUk7UUFFVCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUNELElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtZQUNaLFFBQVEsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEIsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUMxQixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxPQUFPO1FBQ0gsS0FBSyxFQUFFLEtBQUs7UUFDWixJQUFJLEVBQUUsSUFBSTtLQUNiLENBQUM7QUFDTixDQUFDLENBQUMsRUFBRSxDQUFDO0FBS0UsTUFBTSxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsR0FBRztJQUN6QyxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzdCLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUU7UUFDMUIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM5QyxJQUFJLElBQUksR0FBRyxDQUFDO0tBQ2Y7SUFDRCxPQUFPLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsQ0FBQyxDQUFBO0FBVlksUUFBQSxVQUFVLGNBVXRCO0FBUU0sTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFZLEVBQVcsRUFBRTtJQUMzQyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDaEMsQ0FBQyxDQUFDO0FBRlcsUUFBQSxLQUFLLFNBRWhCO0FBU0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsQyxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sRUFBVyxFQUFFO0lBQzNDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbkIsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUNyRCxDQUFDLENBQUM7QUFOVyxRQUFBLFdBQVcsZUFNdEI7QUFlSyxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQU0sRUFBbUIsRUFBRTtJQUN0RCxPQUFPO1FBQ0gsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHO1FBQ2YsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztRQUN2QixXQUFXLEVBQUUsSUFBQSxtQkFBVyxFQUFDLE1BQU0sQ0FBQztRQUNoQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7UUFDL0IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxRQUFRO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUM7QUFUVyxRQUFBLGNBQWMsa0JBU3pCO0FBVUYsU0FBZ0IsZ0JBQWdCLENBQUMsYUFBcUI7SUFDbEQsSUFBSSxhQUFhLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDO0tBQ1o7SUFFRCxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLGFBQWEsRUFBRTtRQUNwRCxPQUFPLENBQUMsQ0FBQztLQUNaO0lBRUQsSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQzlELE9BQU8sQ0FBQyxDQUFDO0tBQ1o7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNiLENBQUM7QUFiRCw0Q0FhQztBQUFBLENBQUM7QUFPSyxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUU5QyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBRXBCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDaEM7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2QixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlCO0tBQ0o7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUV0QixDQUFDLENBQUE7QUFoQlksUUFBQSxlQUFlLG1CQWdCM0I7QUFPTSxNQUFNLHNCQUFzQixHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDMUMsTUFBTSxTQUFTLEdBQUcsSUFBQSxnQkFBUSxHQUFFLENBQUM7SUFDN0IsTUFBTSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUN6QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsU0FBUyxFQUFFO1FBQ3RDLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7U0FBTTtRQUNILE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQyxDQUFBO0FBVFksUUFBQSxzQkFBc0IsMEJBU2xDO0FBS0QsU0FBZ0IsV0FBVyxDQUFJLEtBQVUsRUFBRSxLQUFRO0lBQy9DLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDWixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFORCxrQ0FNQztBQU9NLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUM3QjtLQUNKO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFBO0FBVlksUUFBQSxRQUFRLFlBVXBCO0FBTU0sTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUMzQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHO1FBQy9DLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBO0FBSlksUUFBQSxnQkFBZ0Isb0JBSTVCO0FBT00sTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFFdEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUM3QixLQUFLLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRTtRQUNuQixVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQy9CO0lBRUQsSUFBSSxZQUFZLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBRTFCLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFFdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTdELFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUVILE1BQU07U0FDVDtLQUNKO0lBQ0QsT0FBTyxZQUFZLENBQUM7QUFDeEIsQ0FBQyxDQUFBO0FBdkJZLFFBQUEsYUFBYSxpQkF1QnpCO0FBR0QsU0FBZ0IsU0FBUyxDQUFJLElBQVMsRUFBRSxJQUFTO0lBRTdDLElBQUksTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDZixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDZixTQUFTO2FBQ1o7U0FDSjtLQUNKO0lBQ0QsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNmLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBbkJELDhCQW1CQztBQUVNLEtBQUssVUFBVSxLQUFLLENBQUMsRUFBVTtJQUNsQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDMUIsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUpELHNCQUlDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQWtCO0lBRXpDLE1BQU0sS0FBSyxHQUEwRCxFQUFFLENBQUM7SUFDeEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksUUFBUSxFQUFFO1lBQ1YsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDcEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUI7YUFBTTtZQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZEO0tBQ0o7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBZkQsZ0NBZUM7QUFBQSxDQUFDIn0=