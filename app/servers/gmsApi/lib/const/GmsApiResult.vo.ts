import { HttpCode } from "../support/code/HttpCode.enum";

export class GmsApiResultVO {
    status: number;

    data: any;

    msg: string;

    constructor(status: number, data: any = null, msg: string = "") {
        this.status = status;
        this.data = data;
        this.msg = msg;
    }

    public static SUCCESS(data: any = null, msg: string = '操作成功') {
        return new GmsApiResultVO(HttpCode.SUCCESS, data, msg);
    }

    public static ERROR(data: any = null, msg: string = '出错') {
        return new GmsApiResultVO(HttpCode.FAIL, data, msg);
    }

}
