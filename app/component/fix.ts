import { Application, IComponent } from "pinus";

/**
 * 路由压缩修复组件 挂载在前端服务器上
 */
export class RouterFixComponent implements IComponent {
    name: string = '__clear__';
    app: Application;

    constructor(app: Application, opts: any) {
        this.app = app;
    }


    /**
     * 所有服务进程启动好后会调用该方法
     */
    afterStartAll() {
        if (!this.app.components.__dictionary__) {
            console.warn(`${this.app.serverType}服务器未加载路由压缩组件`);
            return;
        }
        console.warn(`-----------------------    开始修复:${this.app.serverType}的路由    -----------------------`);
        this.app.components.__dictionary__.start(() => { });
    }
}