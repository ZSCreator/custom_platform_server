"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genereteBall = void 0;
function genereteBall() {
    let arr = [];
    for (let idx = 1; idx <= 32; idx++) {
        arr.push(idx);
    }
    arr.sort((a, b) => 0.5 - Math.random());
    return arr;
}
exports.genereteBall = genereteBall;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGxfTG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9obDZ4Yy9saWIvaGxfTG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsU0FBZ0IsWUFBWTtJQUN4QixJQUFJLEdBQUcsR0FBYSxFQUFFLENBQUM7SUFDdkIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNoQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN4QyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFQRCxvQ0FPQyJ9