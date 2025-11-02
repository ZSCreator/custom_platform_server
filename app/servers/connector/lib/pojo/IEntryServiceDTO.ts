export interface ICheckTokenReuslt {
    status: boolean;
    result: null | {
        code: number;
        error: string;
    }
}