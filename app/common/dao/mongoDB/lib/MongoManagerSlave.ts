'use strict';

/**
 * 主要用于非实时报表查询, 禁止写入操作
 */
import Mongoose = require('mongoose');
import pluginsDef = require('./plugins/index');
import { getLogger } from 'pinus-logger';

const Logger = getLogger('server_out', __filename);

export const getDao = async (tableName) => {
    if (!tableName) {
        Logger.error(`未传入表名参数: ${tableName}`);
        return null;
    }


    // 已有的模型
    let   conn       = connection;
    const modelNames = conn.modelNames();
    // 如果有这个表的数据模型，直接返回
    if (modelNames.includes(tableName)) {
        return conn.model(tableName);
    }

    // 获取表的结构定义
    let   schemaName = tableName;
    const schemaDef  = require('../../domain/schemasDef/' + schemaName);
    if (!schemaDef) {
        Logger.error(`表结构 Schema 未定义: ${schemaName}`);
        return null;
    }

    // 表的结构 Schema要从默认Mongoose获取
    const tableSchema = schemaDef.schema;
    if (schemaDef.addPlugin) {
        tableSchema.plugin(pluginsDef, {
            index: true
        });
    }
    return conn.model(schemaName, schemaDef.schema, tableName);
}

export let connection:any = null;

export const init = async (mongoConfig) => {
    let uri = "mongodb://" + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    if (mongoConfig.user) {
        uri = 'mongodb://' + mongoConfig.user + ':' + mongoConfig.pwd + '@' + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    }
    await Mongoose.createConnection(uri, {
        poolSize      : 10
    }).then(conn => {
        connection = conn;
    })
}
