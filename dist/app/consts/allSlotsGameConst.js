'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotsAwardRateLimit = exports.awardRate = void 0;
function awardRate(num) {
    switch (num) {
        case 2:
            return 15;
        case 3:
            return 12;
        case 4:
            return 10;
        case 5:
            return 8;
        case 6:
            return 6;
        default:
            return 5;
    }
}
exports.awardRate = awardRate;
;
function slotsAwardRateLimit(nid) {
    switch (nid) {
        default:
            return 40;
    }
}
exports.slotsAwardRateLimit = slotsAwardRateLimit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxsU2xvdHNHYW1lQ29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvY29uc3RzL2FsbFNsb3RzR2FtZUNvbnN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7O0FBSVosU0FBZ0IsU0FBUyxDQUFDLEdBQVc7SUFDakMsUUFBUSxHQUFHLEVBQUU7UUFDVCxLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsQ0FBQztRQUNkLEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1FBQ2QsS0FBSyxDQUFDO1lBQ0YsT0FBTyxFQUFFLENBQUM7UUFDZCxLQUFLLENBQUM7WUFDRixPQUFPLENBQUMsQ0FBQztRQUNiLEtBQUssQ0FBQztZQUNGLE9BQU8sQ0FBQyxDQUFDO1FBQ2I7WUFDSSxPQUFPLENBQUMsQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFmRCw4QkFlQztBQUFBLENBQUM7QUFNRixTQUFnQixtQkFBbUIsQ0FBQyxHQUFZO0lBQzVDLFFBQVEsR0FBRyxFQUFFO1FBQ1Q7WUFDSSxPQUFPLEVBQUUsQ0FBQztLQUNqQjtBQUNMLENBQUM7QUFMRCxrREFLQyJ9