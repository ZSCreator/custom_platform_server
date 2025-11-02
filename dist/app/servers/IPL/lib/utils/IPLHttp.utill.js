"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const IPLtoken_redis_dao_1 = require("../../../../common/dao/redis/IPLtoken.redis.dao");
const ApiResult_1 = require("../../../../common/pojo/ApiResult");
class IPLHttpUtill {
    getHomeHttp() {
        if (IPLHttpUtill.httpMap.has("home")) {
            return IPLHttpUtill.httpMap.get("home");
        }
        const homeHttp = axios_1.default.create({
            baseURL: "https://mtauth.aecricex.xyz"
        });
        homeHttp.interceptors.response.use(function (resp) {
            return resp;
        }, function (err) {
            if (err.response) {
                const { status, data, headers } = err.response;
                switch (status) {
                    case 200:
                        return data;
                    case 400:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject();
                    case 403:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject(new ApiResult_1.ApiResult(86403, null, "The game is being maintained"));
                    default:
                        console.error(`板球 | HomeHttp | 未捕获的业务分支`);
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        return Promise.reject();
                }
            }
            else if (err.request) {
                console.log(err.request);
            }
            else {
                console.log('Error', err.message);
            }
            console.log(err.config);
            return Promise.reject();
        });
        IPLHttpUtill.httpMap.set("home", homeHttp);
        return homeHttp;
    }
    getAccountHttp() {
        if (IPLHttpUtill.httpMap.has("account")) {
            return IPLHttpUtill.httpMap.get("account");
        }
        const accountHttp = axios_1.default.create({
            baseURL: "https://api.aecricex.xyz/api/"
        });
        accountHttp.interceptors.response.use(function (resp) {
            return resp;
        }, function (err) {
            if (err.response) {
                const { status, data, headers } = err.response;
                switch (status) {
                    case 200:
                        return data;
                    case 400:
                        console.error(`板球 | AccountHttp | ${err.config.url} | code : ${status} | 消息体 ${data.error}`);
                        return Promise.reject();
                    case 401:
                        console.error(`板球 | AccountHttp | ${err.config.url} | code : ${status} | 消息体 ${data.error}`);
                        return Promise.reject(new ApiResult_1.ApiResult(86401, null, "The game is being maintained"));
                    case 403:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject(new ApiResult_1.ApiResult(86403, null, "The game is being maintained"));
                    default:
                        console.error(`板球 | AccountHttp | 未捕获的业务分支`);
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        return Promise.reject();
                }
            }
            else if (err.request) {
                console.log(err.request);
            }
            else {
                console.log('Error', err.message);
            }
            console.log(err.config);
            return Promise.reject();
        });
        IPLHttpUtill.httpMap.set("account", accountHttp);
        return IPLHttpUtill.httpMap.get("account");
    }
    async getIDToken() {
        const http = this.getHomeHttp();
        const { apiKey, email, password } = (0, JsonMgr_1.get)("scenes/IPL")
            .datas["development"];
        try {
            const resp = await http.post(`/GetIDToken?key=${apiKey}`, {
                email,
                password: `${password}`
            });
            const { idToken } = resp.data;
            return idToken;
        }
        catch (e) {
            if (!e) {
                return Promise.reject();
            }
            if (e instanceof ApiResult_1.ApiResult) {
                return Promise.reject(e);
            }
            console.error(`板球 | HomeHttp | getIDToken | 出错: ${e.stack}`);
        }
    }
    async accountMember(uid) {
        try {
            const http = this.getAccountHttp();
            const resp = await http.post(`/auth/merchant/create-member/`, {
                player_id: uid
            });
            return resp;
        }
        catch (e) {
            if (!e) {
                return Promise.reject();
            }
            if (e instanceof ApiResult_1.ApiResult) {
                return Promise.reject(e);
            }
            console.error(`板球 | AccountHttp | accountMember | 出错: ${e.stack}`);
        }
    }
    async userLogin(language, player_id) {
        try {
            const http = this.getAccountHttp();
            const resp = await http.post(`/auth/merchant/login/`, {
                language,
                player_id
            });
            return resp;
        }
        catch (e) {
            if (!e) {
                return Promise.reject();
            }
            console.error(`板球 | AccountHttp | userLogin | 出错: ${e.stack}`);
        }
    }
    async userfunds(player_ids) {
        try {
            const http = this.getAccountHttp();
            const token = await IPLtoken_redis_dao_1.default.findOne();
            const resp = await http.get(`/auth/merchant/wallet/user-funds/?player_ids=${player_ids}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return resp;
        }
        catch (e) {
            if (!e) {
                return Promise.reject();
            }
            console.error(`板球 | AccountHttp | userfunds | 出错: ${e.stack}`);
        }
    }
    async userTransferApi(amount, customer_ref, player_id) {
        try {
            const http = this.getAccountHttp();
            const token = await IPLtoken_redis_dao_1.default.findOne();
            const resp = await http.post(`/auth/merchant/transfer/`, {
                amount,
                customer_ref,
                player_id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return resp;
        }
        catch (e) {
            if (!e) {
                return Promise.reject();
            }
            console.error(`板球 | AccountHttp | userTransferApi | 出错: ${e.stack}`);
        }
    }
}
IPLHttpUtill.httpMap = new Map();
async function test() {
    await (0, JsonMgr_1.init)();
    const iplhttp = new IPLHttpUtill();
    const token = await iplhttp.getIDToken();
    iplhttp.getAccountHttp().defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
        const res = await iplhttp.accountMember("AndyTest10");
        console.warn(res.data.User.player_id);
        const r = await iplhttp.userLogin("en", res.data.User.player_id);
        console.warn(r.data.login_url);
    }
    catch (e) {
        console.error(e);
    }
}
exports.default = new IPLHttpUtill();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBMSHR0cC51dGlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0lQTC9saWIvdXRpbHMvSVBMSHR0cC51dGlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE2QztBQUM3QyxnRUFBbUY7QUFFbkYsd0ZBQStFO0FBQy9FLGlFQUE4RDtBQU05RCxNQUFNLFlBQVk7SUFRUCxXQUFXO1FBQ2QsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNsQyxPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztZQUMxQixPQUFPLEVBQUUsNkJBQTZCO1NBQ3pDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUk7WUFDN0MsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxFQUFFLFVBQVUsR0FBRztZQUNaLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDZCxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBO2dCQUM5QyxRQUFRLE1BQU0sRUFBRTtvQkFDWixLQUFLLEdBQUc7d0JBQ0osT0FBTyxJQUFJLENBQUM7b0JBQ2hCLEtBQUssR0FBRzt3QkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsYUFBYSxNQUFNLFVBQVUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQzVGLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1QixLQUFLLEdBQUc7d0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FB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