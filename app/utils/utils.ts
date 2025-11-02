import {createHash} from "crypto";

let isPrintFlag = false;

/**
 * Check and invoke callback function
 */
export const invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * clone an object
 */
export const clone = function (origin) {
    if (!origin) {
        return;
    }

    let obj = {};
    for (let f in origin) {
        if (origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

export const size = function (obj) {
    if (!obj) {
        return 0;
    }

    let size = 0;
    for (let f in obj) {
        if (obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

// print the file name and the line number ~ begin
function getStack() {
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    let err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    let stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack) {
    return stack[1].getLineNumber();
}

export const myPrint = function () {
    if (isPrintFlag) {
        let len = arguments.length;
        if (len <= 0) {
            return;
        }
        let stack = getStack();
        let aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
        for (let i = 0; i < len; ++i) {
            aimStr += arguments[i] + ' ';
        }
    }
};


/**
 * 生成房间id
 * @param nid 游戏id
 * @param roomId 房间id
 * @param uid 玩家id 给随时要生成局号的玩家准备
 * @return 回合id 组合规则 前缀（8位） + 游戏nid（三位） + 房间id（三位） + 后缀（两位）
 */
export function genRoundId(nid: string, roomId: string, uid?: string): string {
    if (nid.length >= 3 || nid.length <= 0) {
        throw new Error(`生成 roundId 的nid错误`);
    }

    // 随机一个hash
    const randomStr = createHash('md5').update(Date.now().toString()).digest('hex');
    // 前缀
    const prefix = randomStr.slice(0, 8);

    let nidStr = nid.length === 1 ? `${nid}00` : `${nid}0`;

    // 后缀 如果有玩家uid 则取最后的两位 否则取hash的8-10位
    const suffix = !!uid ? uid.slice(0, 2) : randomStr.slice(8, 10);

    return `${prefix}${nidStr}${roomId}${suffix}`;
}

/**
 * 获取这个月开始的时间戳
 */
export function getStartTimeOfTheMonth(month?: number) {
    const date = new Date();

    if (month) {
        date.setMonth(month);
    }

    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    return date.getTime();
}

/**
 * 获取今天开始的时间戳
 */
export function getStartTimeOfTheDay() {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    return date.getTime();
}

/**
 * 获取这个月的结束时间
 */
export function getEndTimeOfTheMonth(month?: number) {
    const date = new Date();
    const _month = month || date.getMonth();

    if (_month === 12) {
        date.setFullYear(date.getFullYear() + 1);
        date.setMonth(1);
    } else {
        date.setMonth(_month + 1);
    }

    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    return date.getTime();
}

/**
 * 是数字
 * @param value
 */
export function isNumberObject(value: any) {
    return Object.prototype.toString.apply(value) === "[object Number]";
}
