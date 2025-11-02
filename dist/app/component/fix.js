"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterFixComponent = void 0;
class RouterFixComponent {
    constructor(app, opts) {
        this.name = '__clear__';
        this.app = app;
    }
    afterStartAll() {
        if (!this.app.components.__dictionary__) {
            console.warn(`${this.app.serverType}服务器未加载路由压缩组件`);
            return;
        }
        console.warn(`-----------------------    开始修复:${this.app.serverType}的路由    -----------------------`);
        this.app.components.__dictionary__.start(() => { });
    }
}
exports.RouterFixComponent = RouterFixComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL2NvbXBvbmVudC9maXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsTUFBYSxrQkFBa0I7SUFJM0IsWUFBWSxHQUFnQixFQUFFLElBQVM7UUFIdkMsU0FBSSxHQUFXLFdBQVcsQ0FBQztRQUl2QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBTUQsYUFBYTtRQUNULElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxjQUFjLENBQUMsQ0FBQztZQUNuRCxPQUFPO1NBQ1Y7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsZ0NBQWdDLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDSjtBQXBCRCxnREFvQkMifQ==