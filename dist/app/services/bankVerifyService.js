'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankVerify = void 0;
const payUtil = require("../utils/payUtil");
const domainName = 'ccdcapi.alipay.com';
const path = 'validateAndCacheCardInfo.json';
const bankVerify = function (bankCode) {
    let signSource = {
        _input_charset: 'utf-8',
        cardNo: bankCode,
        cardBinCheck: true
    };
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
exports.bankVerify = bankVerify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFua1ZlcmlmeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZXMvYmFua1ZlcmlmeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsWUFBWSxDQUFDOzs7QUFFYiw0Q0FBNkM7QUFHN0MsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUM7QUFDeEMsTUFBTSxJQUFJLEdBQUcsK0JBQStCLENBQUM7QUFJdEMsTUFBTSxVQUFVLEdBQUcsVUFBVSxRQUFnQjtJQUNoRCxJQUFJLFVBQVUsR0FBRztRQUNiLGNBQWMsRUFBRSxPQUFPO1FBQ3ZCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFlBQVksRUFBRSxJQUFJO0tBQ3JCLENBQUM7SUFFRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztZQUN0QixTQUFTLEVBQUUsVUFBVTtZQUNyQixVQUFVLEVBQUUsVUFBVTtZQUN0QixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxLQUFLO1NBQ2hCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDZixJQUFJLEtBQUssRUFBRTtnQkFDUCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QjtZQUNELElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNoQztZQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUF4QlcsUUFBQSxVQUFVLGNBd0JyQiJ9