import *as lotteryUtil from "../../app/servers/RedBlack/lib/util/lotteryUtil";
let red = { "cards": [14, 34, 42], "count": 1 };
let black = { "cards": [18, 46, 47], "count": 1 }
let ret = lotteryUtil.compare(red, black);
console.warn(ret);
