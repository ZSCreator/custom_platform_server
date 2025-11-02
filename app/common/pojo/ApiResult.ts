import { HttpCode } from "../../servers/gmsApi/lib/support/code/HttpCode.enum";

/**
 * 接口响应数据结构
 * @author Andy
 */
export class ApiResult {

    code: number;

    data: any;

    msg: string;

    timeStamp: number;

    constructor(code: number, data: any = null, msg: string = '操作成功') {
        this.code = code;
        this.data = data;
        this.msg = msg;
        this.timeStamp = Date.now();
    }

    public static SUCCESS(data: any = null, msg: string = '操作成功') {
        return new ApiResult(HttpCode.SUCCESS, data, msg);
    }

    public static ERROR(data: any = null, msg: string = '出错') {
        return new ApiResult(HttpCode.FAIL, data, msg);
    }

}
