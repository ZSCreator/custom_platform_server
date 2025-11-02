"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roughSizeOfObject = void 0;
function roughSizeOfObject(object) {
    let objectList = [];
    let stack = [object];
    let bytes = 0;
    while (stack.length) {
        let value = stack.pop();
        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if (typeof value === 'object') {
            objectList.push(value);
            for (let i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}
exports.roughSizeOfObject = roughSizeOfObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWxzL21lbW9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxTQUFnQixpQkFBaUIsQ0FBRSxNQUFNO0lBRXJDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNwQixJQUFJLEtBQUssR0FBRyxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3ZCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLE9BQVEsS0FBSyxDQUFDLE1BQU0sRUFBRztRQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFeEIsSUFBSyxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUc7WUFDOUIsS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNkO2FBQ0ksSUFBSyxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUc7WUFDbEMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO2FBQ0ksSUFBSyxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUc7WUFDbEMsS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNkO2FBQ0ksSUFFRCxPQUFPLEtBQUssS0FBSyxRQUFRLEVBRTdCO1lBQ0ksVUFBVSxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQztZQUV6QixLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRztnQkFDbEIsS0FBSyxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQzthQUM1QjtTQUNKO0tBQ0o7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBL0JELDhDQStCQyJ9