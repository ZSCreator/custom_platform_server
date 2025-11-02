"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomDice = exports.random = void 0;
const qzpj_logic = require("../../app/servers/qzpj/lib/qzpj_logic");
function random(min, max) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count) + min;
}
exports.random = random;
function getRandomDice(num = 5) {
    let poker = [];
    for (let i = 0; i < num; i++) {
        poker.push(random(1, 6));
    }
    return poker;
}
exports.getRandomDice = getRandomDice;
;
console.warn(getRandomDice());
let ret = qzpj_logic.getCardType([13, 13]);
console.warn(ret);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esb0VBQW1FO0FBRW5FLFNBQWdCLE1BQU0sQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbkQsQ0FBQztBQUhELHdCQUdDO0FBS0QsU0FBZ0IsYUFBYSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ2pDLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQU5ELHNDQU1DO0FBQUEsQ0FBQztBQUVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUM5QixJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyJ9