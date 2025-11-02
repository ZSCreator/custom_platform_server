/**
 * @property code 状态码
 * @property msg 信息
 */
export interface Result {
    code: 500 | 200,
    msg: string,
    data?: any;
}

/**
 * @property code 状态码 200 返回成功 500 失败 后续可增加新的状态码 以便debug
 * @property msg 信息
 */
export default class ApiResultDTO {
    code: 500 | 200;
    msg: string;
    data?: any;
    constructor(opt: {code ?: 200 | 500 , msg ?: string, data ?: any}) {
        this.code = opt.code ? opt.code : 500;
        this.msg = opt.msg ? opt.msg: '';

        if (opt.data) {
            this.data = opt.data;
        }
    }

    /**
     * 返回结果
     */
    public result(): Result {
        switch (this.code) {
            case 200: return this._resultTwoHundred();
            case 500: return this._resultFiveHundred();
            default: return {code: 500, msg: '网络异常'};
        }
    }

    /**
     * 状态码为500 返回数据
     */
    private _resultFiveHundred(): Result {
        return {
            code: this.code,
            msg:  this.msg,
        };
    }

    /**
     * 状态码未200 返回数据
     * @private
     */
    private _resultTwoHundred(): Result{
        return {
            code: this.code,
            msg:  this.msg,
            data: this.data
        }
    }
}