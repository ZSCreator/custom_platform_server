//银行卡验证
'use strict';
import axios from "axios";
import payUtil = require('../utils/payUtil');

//验证地址
const domainName = 'ccdcapi.alipay.com';
const path = 'validateAndCacheCardInfo.json';


// 验证银行卡的信息
export const bankVerify = function (bankCode: string) {
    let signSource = {
        _input_charset: 'utf-8',
        cardNo: bankCode,
        cardBinCheck: true
    };
    // axios.post(`${domainName}/${path}`, { parameter: signSource }, {})
    return new Promise((resolve, reject) => {
        payUtil.sendHttpPostHttps({
            parameter: signSource,
            domainName: domainName,
            path: path,
            isJson: false
        }, (error, data) => {
            if (error) {
                return reject(error);
            }
            data = JSON.parse(data);
            if (data.validated !== true) {
                return reject(data.messages);
            }
            return resolve(data);
        });
    });
};
