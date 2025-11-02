'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.littleGame = exports.shovelNum = exports.vipRecord = exports.record = exports.windowRecord = void 0;
const pass = ['1', '2', '3'];
const odds = ['0.15', '0.55', '0.95', '1.65', '3.55', '7.55', '10'];
exports.windowRecord = {};
pass.forEach(i => {
    exports.windowRecord[i] = {};
    odds.forEach(j => {
        exports.windowRecord[i][j] = {
            '1': [],
            '2': [],
            '3': [],
        };
    });
});
exports.record = {};
exports.vipRecord = {};
exports.shovelNum = {
    'system': {},
};
exports.littleGame = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGhhcmFvaC9saWIvb2xkL21lbW9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUU3QixNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRXZELFFBQUEsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2hCLG9CQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDaEIsb0JBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztZQUNwQixHQUFHLEVBQUUsRUFBRTtZQUNQLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRyxFQUFFLEVBQUU7U0FDUCxDQUFBO0lBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVRLFFBQUEsTUFBTSxHQUFHLEVBRW5CLENBQUM7QUFFUyxRQUFBLFNBQVMsR0FBRyxFQUl0QixDQUFDO0FBR1MsUUFBQSxTQUFTLEdBQUc7SUFDckIsUUFBUSxFQUFFLEVBRVQ7Q0FJRixDQUFDO0FBRVMsUUFBQSxVQUFVLEdBQUcsRUFBRSxDQUFDIn0=