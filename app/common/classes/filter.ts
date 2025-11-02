import {Application, IHandlerFilter, RouteRecord, FrontendOrBackendSession} from "pinus";
import {HandlerCallback} from "pinus";

/**
 * 本过滤模块负责过滤游戏前端请求
 */
export default class Filter implements IHandlerFilter {
    app: Application;

    public constructor(app: Application) {
        this.app = app;
    }

    /**
     * 前端请求消息前置操作
     * @param routeRecord   消息路由
     * @param msg           发送的数据
     * @param session       前端session
     * @param next          回调函数
     */
    public before(routeRecord: RouteRecord , msg: any, session: FrontendOrBackendSession, next: (err?: any, resp?: any) => void): void {
        next(new Error('wocao'));
    }

    /**
     * 处理响应后的操作
     * @param err 错误消息
     * @param routeRecord 路由信息
     * @param msg 发的消息
     * @param session 前后端session
     * @param resp 响应消息
     * @param next 处理回调
     */
    public after(err: Error, routeRecord: RouteRecord, msg: any, session: FrontendOrBackendSession, resp: any, next: HandlerCallback): void {
        next(err);
    }
 }