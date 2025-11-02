'use strict';
import fs = require('fs');
import path = require('path');
import { getLogger } from 'pinus-logger';
const ManagerErrorLogger = getLogger('global_error_filter', __filename);
/**
 *  写入json 当中的数据
 * @param path
 * @param list
 */

export const  writeFile  = async (address, list) =>{
    try {
        const file = path.resolve(__dirname, '../../../', 'config/' , address);
        // console.log('file',file);
        const result = JSON.stringify(list);
        return new Promise((resolve, reject) => {
            fs.writeFile(file, result, (error) => {
                if (error) {
                    return  reject(error);
                }
                return resolve('写入完成');
            });

        });
    } catch (error) {
        ManagerErrorLogger.info(`写入文件${ path },error:${error}`);
        return ;
    }
};

/**
 *  读取json 当中的数据
 * @param address
 */

export const  readFile  = async (path) => {
    try {
        return new Promise((resolve, reject) => {

            fs.readFile(path,  (error , data) => {
                if (error) {
                    reject(error);
                }
                if(!data){
                    reject(error);
                }
                const person = data.toString(); // 将二进制的数据转换为字符串
                const configJson = JSON.parse(person); // 将字符串转换为json对象
                return resolve(configJson);
            });

        });

    } catch (error) {
        ManagerErrorLogger.info(`读取文件${path},error:${error}`);
        return ;
    }
};



/**
 *  读取文件log 当中的数据
 * @param address
 */

export const  readLogs  = async (path) => {
    try {
        return new Promise((resolve, reject) => {

            fs.readFile(path,  (error , data) => {
                if (error) {
                    return  resolve(null);
                }
                if(!data){
                    return  resolve(null);
                }
                const person = data.toString(); // 将二进制的数据转换为字符串
                return resolve(person);
            });

        });

    } catch (error) {
        ManagerErrorLogger.info(`读取文件${path},error:${error}`);
        return ;
    }
};