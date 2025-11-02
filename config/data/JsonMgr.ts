'use strict';

const tables = {};// 所有表
let tablesSwap = {};// 所有表
import fs = require('fs');
import path = require('path');
import watch from 'node-watch';
import { getLogger } from 'pinus-logger';
const globalLogger = getLogger('server_out', __filename);


/**写入内存 */
const wrap = function (files: Array<string>) {
    for (let i = files.length - 1; i >= 0; i--) {
        const file = path.resolve(__dirname, '..', 'data', files[i]);
        const datas = JSON.parse(fs.readFileSync(path.normalize(file), { encoding: '' }));
        const name = files[i].replace('.json', '');
        tables[name] = {
            datas: datas,
            getById(id: any) {
                const language = this.datas.find((m: any) => m.id == id);
                if (!language) {
                    globalLogger.error("语言包没有找到id:", id);
                }
                const currLanguage = language == undefined ? { warning: '语言包错误' } : language;
                return currLanguage;
            },
            get(key: any, value: any) {
                return this.datas.filter((m: any) => m[key] === value);
            }
        };
    }
};

const wrapSwap = function (files: Array<string>) {
    for (let i = files.length - 1; i >= 0; i--) {
        const file = path.resolve(__dirname, '..', 'data', files[i]);
        const datas = JSON.parse(fs.readFileSync(path.normalize(file), { encoding: '' }));
        const name = files[i].replace('.json', '');
        tablesSwap[name] = {
            datas: datas,
            getById(id: any) {
                const language = this.datas.find((m: any) => m.id == id);
                if (!language) {
                    globalLogger.error("语言包没有找到id:", id);
                }
                const currLanguage = language == undefined ? { warning: '语言包错误' } : language;
                return currLanguage;
            },
            get(key: any, value: any) {
                return this.datas.filter((m: any) => m[key] === value);
            }
        };
    }
};

//读取data根目录的所有文件
const getDataFiles = function (filename: string): any {

    return new Promise((resolve, reject) => {
        fs.readdir(filename, function (err, files) {
            if (err) return reject('读取配置表出错');

            let folder = files.filter(m => m.indexOf('.') < 0);//过滤出文件夹
            files = files.filter(m => m.endsWith('.json'));// 过滤掉后缀是json的文件
            return resolve({ folder, files });
        });
    });
}

const readFolder = function (filename1: string, m: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.readdir(filename1, async function (err_, files_) {
            if (err_) return reject('读取配置表出错');

            let folder = files_.filter(m => m.indexOf('.') < 0);//过滤出文件夹

            files_ = files_.filter(k => k.endsWith('.json'));
            files_.forEach((n, j, arr) => {
                arr[j] = `${m}/${n}`;
            });

            //2019.04.10 by xlz
            let temp_files_s = [];
            for (let n of folder) {
                let filename2 = path.resolve(__dirname, '..', 'data', m, n);
                temp_files_s = await readFolder(filename2, m + '/' + n);
                files_.push(...temp_files_s);
            }
            return resolve(files_);
        });
    });
}

/**
 * 初始化 加载配置文件到内存中
 */
export async function init() {
    const filename = path.resolve(__dirname, '..', 'data');
    const { folder, files } = await getDataFiles(filename);

    return new Promise((resolve, reject) => {
        Promise.all(folder.map(async (m: string) => {
            let filename1 = path.resolve(__dirname, '..', 'data', m);
            const files_ = await readFolder(filename1, m);
            // console.log(JSON.stringify(files_));
            wrap(files_);
        })).then(data => {
            wrap(files);
            return resolve('读取配置表成功');
        }).catch(e => {
            console.log(e)
        });
    });
}

export async function initSwap() {
    const filename = path.resolve(__dirname, '..', 'data');
    const { folder, files } = await getDataFiles(filename);

    return new Promise((resolve, reject) => {
        Promise.all(folder.map(async (m: string) => {
            let filename1 = path.resolve(__dirname, '..', 'data', m);
            const files_ = await readFolder(filename1, m);
            // console.log(JSON.stringify(files_));
            wrapSwap(files_);
        })).then(data => {
            wrapSwap(files);
            return resolve('读取配置表成功');
        }).catch(e => {
            console.log(e)
        });
    });
}

/**
 * 获取表
 * @param tableName
 */
export function get(tableName: string = 'chinese') {
    let result = tables[tableName];
    return result
}

export function getAll() {
    return tables;
}

/**
 * 观察配置文件变化
 */
let lockTimestamp: number = 0;
export const watcher = async () => {
    // 监听JSON文件改动
    watch(path.resolve(__dirname, '..', 'data'), { delay: 500, encoding: 'utf-8', filter: (f) => (/\.json$/.test(f)) }, async (event, filename) => {
        if (filename && (event === 'update' || event === 'remove') && new Date().getTime() > lockTimestamp) {
            // 锁定60秒 避免重复初始化
            lockTimestamp = new Date().getTime() + 60 * 1000;

            // 随机0-20秒 避免多服务IO争用
            const delay = Math.floor(Math.random() * 20 * 1000)
            console.log(`配置重载开始: ${event} ${delay} ${filename}`);
            setTimeout(async () => {
                await initSwap();
                if (Object.keys(tablesSwap).length > 1) {
                    Object.assign(tables, tablesSwap);
                    tablesSwap = {};
                }
                console.log(`配置重载完成`);
            }, delay);
        }
    });
}

//测试
async function test() {
    try {
        await watcher();
        await init();
        console.log(getAll());
    } catch (error) {
        console.log(error);
    }
}

// test()
