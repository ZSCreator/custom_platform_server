import axios, { AxiosInstance } from "axios";
import { get as getConfiguration, init } from "../../../../../config/data/JsonMgr";
import * as moment from "moment";
import IPLtokenRedisDao from "../../../../common/dao/redis/IPLtoken.redis.dao";
import { ApiResult } from "../../../../common/pojo/ApiResult";

/**
 * IPL 通信工具类
 * @author Andy
 */
class IPLHttpUtill {
    static httpMap: Map<string, AxiosInstance> = new Map();

    /**
     * @name 获取homeHttp业务连接
     * @returns null
     * @description 配置初始化信息和拦截器、业务异常处理
     */
    public getHomeHttp() {
        if (IPLHttpUtill.httpMap.has("home")) {
            return IPLHttpUtill.httpMap.get("home");
        }
        const homeHttp = axios.create({
            baseURL: "https://mtauth.aecricex.xyz"
        });

        homeHttp.interceptors.response.use(function (resp) {
            return resp;
        }, function (err) {
            if (err.response) {
                const { status, data, headers } = err.response
                switch (status) {
                    case 200:
                        return data;
                    case 400:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject();
                    case 403:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject(new ApiResult(86403, null, "The game is being maintained"));
                    default:
                        console.error(`板球 | HomeHttp | 未捕获的业务分支`)
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        return Promise.reject();
                }
            } else if (err.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', err.message);
            }
            console.log(err.config);

            return Promise.reject();
        });

        IPLHttpUtill.httpMap.set("home", homeHttp);
        return homeHttp;
    }

    public getAccountHttp() {
        if (IPLHttpUtill.httpMap.has("account")) {
            return IPLHttpUtill.httpMap.get("account");
        }
        const accountHttp = axios.create({
            baseURL: "https://api.aecricex.xyz/api/"
        });

        accountHttp.interceptors.response.use(function (resp) {
            return resp;
        }, function (err) {
            if (err.response) {
                const { status, data, headers } = err.response
                switch (status) {
                    case 200:
                        return data;
                    // 账号存在
                    case 400:
                        console.error(`板球 | AccountHttp | ${err.config.url} | code : ${status} | 消息体 ${data.error}`);
                        return Promise.reject();
                    // token错误
                    case 401:
                        console.error(`板球 | AccountHttp | ${err.config.url} | code : ${status} | 消息体 ${data.error}`);
                        return Promise.reject(new ApiResult(86401, null, "The game is being maintained"));
                    case 403:
                        console.error(`板球 | HomeHttp | ${err.config.url} | code : ${status} | 消息体 ${data.message}`);
                        return Promise.reject(new ApiResult(86403, null, "The game is being maintained"));
                    default:
                        console.error(`板球 | AccountHttp | 未捕获的业务分支`)
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        return Promise.reject();
                }
            } else if (err.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', err.message);
            }
            console.log(err.config);

            return Promise.reject();
        });

        IPLHttpUtill.httpMap.set("account", accountHttp);

        return IPLHttpUtill.httpMap.get("account");
    }

    /**
     * 
     * @name 获取BearerToken 
     * @description homeHttp
     */
    async getIDToken() {
        const http = this.getHomeHttp();
        // const env = pinus.app.get(RESERVED.ENV) || "development";
        const { apiKey, email, password } = getConfiguration("scenes/IPL")
            .datas["development"];
        try {
            const resp = await http.post(`/GetIDToken?key=${apiKey}`, {
                email,
                password: `${password}`
            });
            const {
                idToken
            } = resp.data;

            return idToken;
        } catch (e) {
            if (!e) {
                return Promise.reject()
            }
            if (e instanceof ApiResult) {
                return Promise.reject(e);
            }
            console.error(`板球 | HomeHttp | getIDToken | 出错: ${e.stack}`)
        }

    }

    /**
     * @name 创建板球账号 
     * @description accountHttp
     */
    async accountMember(uid: string) {
        try {
            const http = this.getAccountHttp();
            const resp = await http.post(`/auth/merchant/create-member/`, {
                player_id: uid
            });

            return resp;
        } catch (e) {
            if (!e) {
                return Promise.reject()
            }

            if (e instanceof ApiResult) {
                return Promise.reject(e);
            }
            console.error(`板球 | AccountHttp | accountMember | 出错: ${e.stack}`)
        }
    }

    /**
     * @name 板球登录 
     * @description accountHttp
     */
    async userLogin(language: string, player_id: string) {
        try {
            const http = this.getAccountHttp();
            const resp = await http.post(`/auth/merchant/login/`, {
                language,
                player_id
            });

            return resp;
        } catch (e) {
            if (!e) {
                return Promise.reject()
            }
            console.error(`板球 | AccountHttp | userLogin | 出错: ${e.stack}`)
        }
    }

    /**
     * @name 玩家当前金币 
     * @description accountHttp
     */
    async userfunds(player_ids: string) {
        try {
            const http = this.getAccountHttp();
            const token = await IPLtokenRedisDao.findOne();
            const resp = await http.get(`/auth/merchant/wallet/user-funds/?player_ids=${player_ids}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return resp;
        } catch (e) {
            if (!e) {
                return Promise.reject()
            }
            console.error(`板球 | AccountHttp | userfunds | 出错: ${e.stack}`)
        }
    }

    /**
     * @name 玩家当前金币 
     * @description accountHttp
     */
    async userTransferApi(amount: number, customer_ref: string, player_id: string) {
        try {
            const http = this.getAccountHttp();
            const token = await IPLtokenRedisDao.findOne();
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
        } catch (e) {
            if (!e) {
                return Promise.reject()
            }
            console.error(`板球 | AccountHttp | userTransferApi | 出错: ${e.stack}`)
        }
    }
}

async function test() {

    await init();

    const iplhttp = new IPLHttpUtill()
    const token = await iplhttp.getIDToken();
    // const token = `eyJhbGciOiJSUzI1NiIsImtpZCI6ImVmMzAxNjFhOWMyZGI3ODA5ZjQ1MTNiYjRlZDA4NzNmNDczMmY3MjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXQtbWVpYm90ZWNoLXN1Yi1yMjg0IiwiYXVkIjoibXQtbWVpYm90ZWNoLXN1Yi1yMjg0IiwiYXV0aF90aW1lIjoxNjUxNzM3MzQ1LCJ1c2VyX2lkIjoiZzUxWlFreGltZWR1dzI1dHllekxKU3VpWjMzMiIsInN1YiI6Imc1MVpRa3hpbWVkdXcyNXR5ZXpMSlN1aVozMzIiLCJpYXQiOjE2NTE3MzczNDUsImV4cCI6MTY1MTc0MDk0NSwiZW1haWwiOiJtZWlib3RlY2h0ZXN0QGFlY3JpY2V4Lnh5eiIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtZWlib3RlY2h0ZXN0QGFlY3JpY2V4Lnh5eiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.flvavdrfB1x-jrcd_x1hxa_YDHVAKdny1rdkWT2Fkz6dKZMpcdlFKL9QFwQIu3bcWO34Rk_Dh7ki07uCetqggllVFfmtwb5MIN3Qju_F8TwrPZ9bLJGrlY8ucMX9ylnZof-WVa4VdNdre67IWN8f1nBLy4hYPqP8Ud0dQn2L7hqjaVfwbRkrRMZOl5o4DFd3_YB6FnJip73PgJGEOR_u58x5DLiKPbu3SFzr3sWDcThbJYxRolspV9Z24aGoMQz6WdJltb1XgOqLs9acKx_pkoM7a8562IxJyPbT_zRzOlC01yBUISHHfIssZn_n_ONxphPDPQy0m4zPq3qNqCh2gg`;
    // console.log(token);
    iplhttp.getAccountHttp().defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
        const res = await iplhttp.accountMember("AndyTest10");

        console.warn(res.data.User.player_id)

        const r = await iplhttp.userLogin("en", res.data.User.player_id);

        console.warn(r.data.login_url);
    } catch (e) {
        console.error(e);
    }
    // const accountHttp = iplhttp.getAccountHttp();
}

// test();

export default new IPLHttpUtill();