'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLogs = exports.readFile = exports.writeFile = void 0;
const fs = require("fs");
const path = require("path");
const pinus_logger_1 = require("pinus-logger");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('global_error_filter', __filename);
const writeFile = async (address, list) => {
    try {
        const file = path.resolve(__dirname, '../../../', 'config/', address);
        const result = JSON.stringify(list);
        return new Promise((resolve, reject) => {
            fs.writeFile(file, result, (error) => {
                if (error) {
                    return reject(error);
                }
                return resolve('写入完成');
            });
        });
    }
    catch (error) {
        ManagerErrorLogger.info(`写入文件${path},error:${error}`);
        return;
    }
};
exports.writeFile = writeFile;
const readFile = async (path) => {
    try {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (error, data) => {
                if (error) {
                    reject(error);
                }
                if (!data) {
                    reject(error);
                }
                const person = data.toString();
                const configJson = JSON.parse(person);
                return resolve(configJson);
            });
        });
    }
    catch (error) {
        ManagerErrorLogger.info(`读取文件${path},error:${error}`);
        return;
    }
};
exports.readFile = readFile;
const readLogs = async (path) => {
    try {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (error, data) => {
                if (error) {
                    return resolve(null);
                }
                if (!data) {
                    return resolve(null);
                }
                const person = data.toString();
                return resolve(person);
            });
        });
    }
    catch (error) {
        ManagerErrorLogger.info(`读取文件${path},error:${error}`);
        return;
    }
};
exports.readLogs = readLogs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3V0aWxzL2ZpbGVEYXRhL2ZpbGVVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLHlCQUEwQjtBQUMxQiw2QkFBOEI7QUFDOUIsK0NBQXlDO0FBQ3pDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBT2pFLE1BQU8sU0FBUyxHQUFJLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDL0MsSUFBSTtRQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUcsT0FBTyxDQUFDLENBQUM7UUFFdkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNqQyxJQUFJLEtBQUssRUFBRTtvQkFDUCxPQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFUCxDQUFDLENBQUMsQ0FBQztLQUNOO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBUSxJQUFLLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN4RCxPQUFRO0tBQ1g7QUFDTCxDQUFDLENBQUM7QUFsQlksUUFBQSxTQUFTLGFBa0JyQjtBQU9LLE1BQU8sUUFBUSxHQUFJLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUNyQyxJQUFJO1FBQ0EsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUVuQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRyxDQUFDLEtBQUssRUFBRyxJQUFJLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxLQUFLLEVBQUU7b0JBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqQjtnQkFDRCxJQUFHLENBQUMsSUFBSSxFQUFDO29CQUNMLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakI7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztRQUVQLENBQUMsQ0FBQyxDQUFDO0tBRU47SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE9BQVE7S0FDWDtBQUNMLENBQUMsQ0FBQztBQXRCWSxRQUFBLFFBQVEsWUFzQnBCO0FBU0ssTUFBTyxRQUFRLEdBQUksS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3JDLElBQUk7UUFDQSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBRW5DLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFHLENBQUMsS0FBSyxFQUFHLElBQUksRUFBRSxFQUFFO2dCQUNoQyxJQUFJLEtBQUssRUFBRTtvQkFDUCxPQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsSUFBRyxDQUFDLElBQUksRUFBQztvQkFDTCxPQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUVQLENBQUMsQ0FBQyxDQUFDO0tBRU47SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE9BQVE7S0FDWDtBQUNMLENBQUMsQ0FBQztBQXJCWSxRQUFBLFFBQVEsWUFxQnBCIn0=