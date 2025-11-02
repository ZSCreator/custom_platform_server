"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betAreaOdds = exports.areas = exports.BetAreasName = void 0;
var BetAreasName;
(function (BetAreasName) {
    BetAreasName["ANDAR"] = "andar";
    BetAreasName["BAHAR"] = "bahar";
})(BetAreasName = exports.BetAreasName || (exports.BetAreasName = {}));
exports.areas = [
    BetAreasName.ANDAR,
    BetAreasName.BAHAR
];
exports.betAreaOdds = {
    [BetAreasName.ANDAR]: { odds: 2, name: 'andar', limit: 1e6 },
    [BetAreasName.BAHAR]: { odds: 2, name: 'bahar', limit: 1e6 },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0QXJlYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2xpYi9jb25maWcvYmV0QXJlYXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3BCLCtCQUFlLENBQUE7SUFDZiwrQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFIVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUd2QjtBQUVZLFFBQUEsS0FBSyxHQUFHO0lBQ2pCLFlBQVksQ0FBQyxLQUFLO0lBQ2xCLFlBQVksQ0FBQyxLQUFLO0NBQ3JCLENBQUM7QUFLVyxRQUFBLFdBQVcsR0FBSTtJQUN4QixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFDO0lBQzFELENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7Q0FDN0QsQ0FBQyJ9