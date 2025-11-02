'use strict';

import commonUtil = require('./commonUtil');

//阶乘
export function factorial(n) {
    return n > 1 ? n * factorial(n - 1) : 1;
};

//排列, Amn(上面是n，下面是m)，m 的阶乘除以 m-n 的阶乘
//公式：m！/ (m - n)!
export function permutation(m, n) {
    return factorial(m) / factorial(m - n)
};

//组合, Amn(上面是n，下面是m)/Ann(上下都是n)，m 的阶乘除以 m-n 的阶乘
//公式：Amn / Ann = m！/ (n! * (m - n)!)
export function combination(m, n) {
    if (m < n) {
        return 0;
    } else if (m === n) {
        return 1;
    }
    return permutation(m, n) / permutation(n, n)
};

/**
 * 获得从m个数中取n的所有组合的下标数组
 * m是数组长度、n是所需要取得数的个数
 *
 思路是开一个数组，其下标表示1到m个数，数组元素的值为1表示其下标代表的数被选中，为0则没选中。
 首先初始化，将数组前n个元素置1，表示第一个组合为前n个数。
 然后从左到右扫描数组元素值的“10”组合，找到第一个“10”组合后将其变为“01”组合；
 同时将其左边的所有“1”全部移动到数组的最左端。
 当第一个“1”移动到数组的m-n的位置，即n个“1”全部移动到最右端时，就得到了最后一个组合。
 */
function getFlagArray(m, n) {
    if (!n || n < 1) {
        return [];
    }
    let resultArrs = [],
        flagArr = [],
        isEnd = false,
        i, j, leftCnt;

    for (i = 0; i < m; i++) {
        flagArr[i] = i < n ? 1 : 0;
    }
    resultArrs.push(flagArr.concat());
    while (!isEnd) {
        leftCnt = 0;
        for (i = 0; i < m - 1; i++) {
            if (flagArr[i] === 1 && flagArr[i + 1] === 0) {
                for (j = 0; j < i; j++) {
                    flagArr[j] = j < leftCnt ? 1 : 0;
                }
                flagArr[i] = 0;
                flagArr[i + 1] = 1;
                let aTmp = flagArr.concat();
                resultArrs.push(aTmp);
                if (aTmp.slice(-n).join("").indexOf('0') === -1) {
                    isEnd = true;
                }
                break;
            }
            flagArr[i] === 1 && leftCnt++;
        }
    }
    return resultArrs;
}

/**
 * 求数组 arr 中 desireNumbers 个数的全组合，结果数组的每个元素数组都已经排过序，升序
 * 如：[[1,2], [1,3], [2,3]]
 * */
export function getFullCombination(arr, desireNumbers) {
    let result = [];
    if (arr.length === desireNumbers) {
        arr.sort((a, b) => { return a - b; });
        result.push(arr);
        return result;
    }

    let allCombineIndex = getFlagArray(arr.length, desireNumbers);
    let chosenArray = [];
    let indexArray = [];
    for (let i = 0; i < allCombineIndex.length; ++i) {
        chosenArray = [];
        indexArray = allCombineIndex[i];
        for (let j = 0; j < indexArray.length; ++j) {
            if (indexArray[j] === 1) {
                chosenArray.push(arr[j]);
            }
        }
        chosenArray.sort((a, b) => { return a - b; });
        result.push(chosenArray)
    }
    return result;
};

//获取指定数组的全排列
export function getFullPermutation(numbers) {
    let result = [];
    if (numbers.length === 1) {
        result.push(numbers);
        return result;
    }
    for (let i = 0; i < numbers.length; i++) {
        let temp = [];
        temp.push(numbers[i]); //取任意一项放到temp的第一项
        let remain = numbers.slice(0);//深复制原数组到remain
        remain.splice(i, 1); //去掉那一项
        let temp2 = getFullPermutation(remain).concat(); //剩下的项全排列,返回[[1,2],[1,3]]这样的数据
        for (let j = 0; j < temp2.length; j++) {
            temp2[j].unshift(temp[0]); // [[5,1,2],[5,1,3]]这样的数据
            result.push(temp2[j]);
        }
    }
    return result;
};

// 获取指定数组 array，任意选 n 个数的全排列
export function getFullPermutationSpecifyNumber(array, n) {
    let result = [];
    let allCombination = getFullCombination(array, n);
    allCombination.forEach(arr => {
        result.push.apply(result, getFullPermutation(arr));
    });
    return result;
};

/**
 * 将某个整数拆分成指定个整数之和
 * sum: 总和
 * count: 期望的个数
 * 注：结果中可能包含 0
 * */
export function divideSumToNumArr(sum: number, count: number) {
    if (!Number.isInteger(sum) || !Number.isInteger(count) || !sum || !count || sum < count) {
        return [];
    }
    const even = sum / count;
    const min = Math.max(even / 2, 1);
    const max = Math.min(even * 2, sum);
    const numberArr: number[] = [];
    let num: number;
    while (sum > 0) {
        num = sum > min ? commonUtil.randomFromRange(min, Math.min(max, sum)) : sum;
        if (num <= sum && num > 0) {
            numberArr.push(num)
        }
        sum -= num;
        if (numberArr.length >= count) break;
    }
    return numberArr;
};