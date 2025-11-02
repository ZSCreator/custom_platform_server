'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.connection = exports.getDao = void 0;
const Mongoose = require("mongoose");
const pluginsDef = require("./plugins/index");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const getDao = async (tableName) => {
    if (!tableName) {
        Logger.error(`未传入表名参数: ${tableName}`);
        return null;
    }
    let conn = exports.connection;
    const modelNames = conn.modelNames();
    if (modelNames.includes(tableName)) {
        return conn.model(tableName);
    }
    let schemaName = tableName;
    const schemaDef = require('../../domain/schemasDef/' + schemaName);
    if (!schemaDef) {
        Logger.error(`表结构 Schema 未定义: ${schemaName}`);
        return null;
    }
    const tableSchema = schemaDef.schema;
    if (schemaDef.addPlugin) {
        tableSchema.plugin(pluginsDef, {
            index: true
        });
    }
    return conn.model(schemaName, schemaDef.schema, tableName);
};
exports.getDao = getDao;
exports.connection = null;
const init = async (mongoConfig) => {
    let uri = "mongodb://" + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    if (mongoConfig.user) {
        uri = 'mongodb://' + mongoConfig.user + ':' + mongoConfig.pwd + '@' + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    }
    await Mongoose.createConnection(uri, {
        poolSize: 10
    }).then(conn => {
        exports.connection = conn;
    });
};
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZ29NYW5hZ2VyU2xhdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9Nb25nb01hbmFnZXJTbGF2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHFDQUFzQztBQUN0Qyw4Q0FBK0M7QUFDL0MsK0NBQXlDO0FBRXpDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFO0lBQ3RDLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLElBQUksQ0FBQztLQUNmO0lBSUQsSUFBTSxJQUFJLEdBQVMsa0JBQVUsQ0FBQztJQUM5QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFckMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNoQztJQUdELElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM3QixNQUFNLFNBQVMsR0FBSSxPQUFPLENBQUMsMEJBQTBCLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDcEUsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUdELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFO1FBQ3JCLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQzNCLEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO0tBQ047SUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFBO0FBL0JZLFFBQUEsTUFBTSxVQStCbEI7QUFFVSxRQUFBLFVBQVUsR0FBTyxJQUFJLENBQUM7QUFFMUIsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFO0lBQ3RDLElBQUksR0FBRyxHQUFHLFlBQVksR0FBRyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBQzVGLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtRQUNsQixHQUFHLEdBQUcsWUFBWSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7S0FDNUk7SUFDRCxNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7UUFDakMsUUFBUSxFQUFRLEVBQUU7S0FDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNYLGtCQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBO0FBVlksUUFBQSxJQUFJLFFBVWhCIn0=