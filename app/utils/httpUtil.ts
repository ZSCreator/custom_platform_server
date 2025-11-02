'use strict';

// http 请求
import HallConst = require('../consts/hallConst');


// http或者https 的 get 请求
export function httpOrHttpsGet(requestUrl, isHttps = false): Promise<any> {
    return new Promise((resolve, reject) => {
        const getReqestObj = isHttps ? require('https') : require('http');
        const request = getReqestObj.get(requestUrl, reqData => {
            combineRequest(reqData, data => {
                request.end();
                clearTimeout(timeOutEventId);
                // 注意返回的值可能是错误返回的值
                return resolve(data);
            });
        });
        const timeOutEventId = setTimeout(function () {
            request.emit('timeout', `请求已超过 ${HallConst.HTTP_REQUEST_TIMEOUT}ms 未返回结果`);
        }, HallConst.HTTP_REQUEST_TIMEOUT);
        onError(timeOutEventId, request, reject);
        onTimeOut(timeOutEventId, request, reject);
    });
};

// 错误处理
function onError(timeOutEventId, request, reject) {
    request.on('error', error => {
        request.end();
        clearTimeout(timeOutEventId);
        return reject(error);
    });
}

// 超时处理
function onTimeOut(timeOutEventId, request, reject) {
    request.on('timeout', error => {
        request.end();
        clearTimeout(timeOutEventId);
        return reject(error);
    });
}

//组合请求的参数、转换为 json 对象
export function combineRequest(request, callback?): Promise<any> {
    return new Promise(resolve => {
        let data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });
        request.on('end', () => {
            try {
                data = JSON.parse(data);
                callback && callback(data);
                return resolve(data);
            } catch (error) {
                callback && callback(data);
                return resolve(data);
            }
        });
    });
};

