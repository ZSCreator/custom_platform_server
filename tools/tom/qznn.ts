import qznn_logic = require("../..//app/servers/qznn/lib/qznn_logic");



// let ret = qznn_logic.bipai([44, 39, 38, 28, 43], [49, 34, 32, 31, 40]);

// console.warn(ret);
[38, 52, 51, 10, 37].map(m => console.warn(qznn_logic.getCardValue(m)));
let ret = qznn_logic.getCardType([38, 52, 51, 11, 37]);
console.warn(ret);