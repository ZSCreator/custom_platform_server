'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateFiledObjFromArray = exports.getObjMeetWhere = exports.getNeedStoreBufferData = void 0;
function getNeedStoreBufferData(bufferData, updateObj, updateAttrs) {
    let allUpdateAttrs = Array.isArray(updateAttrs) ? updateAttrs : Array.from(updateAttrs);
    let needAddTask = false;
    let needToStoreData = Object.assign({}, updateObj);
    if (bufferData) {
        !bufferData.updateFields.length && updateAttrs.length && (needAddTask = true);
        if (bufferData.length > 0)
            allUpdateAttrs.push(...bufferData.updateFields);
        allUpdateAttrs = Array.from(new Set(allUpdateAttrs));
        needToStoreData = bufferData.data;
        if (updateAttrs.length) {
            for (let attr of updateAttrs) {
                if (updateObj[attr] === undefined || updateObj[attr] === null) {
                    continue;
                }
                if (attr === 'gold' && updateObj[attr]) {
                    if (typeof updateObj[attr] !== 'number') {
                        continue;
                    }
                    else {
                        updateObj[attr] = Math.floor(updateObj[attr] * 100) / 100;
                        if (updateObj[attr] < 0) {
                            updateObj[attr] = 0;
                        }
                    }
                }
                needToStoreData[attr] = updateObj[attr];
            }
        }
    }
    return { needToStoreData, allUpdateAttrs, needAddTask };
}
exports.getNeedStoreBufferData = getNeedStoreBufferData;
;
function getObjMeetWhere(bufferDataArr, where) {
    const allObj = bufferDataArr.map(bufferData => bufferData.data);
    const searchAttrs = Object.keys(where);
    let foundObj;
    for (let obj of allObj) {
        if (searchAttrs.every(attr => obj[attr] === where[attr])) {
            foundObj = obj;
            break;
        }
    }
    return foundObj;
}
exports.getObjMeetWhere = getObjMeetWhere;
;
function getUpdateFiledObjFromArray(object, updateArr) {
    const updateFiledObj = {};
    updateArr.forEach(attr => {
        updateFiledObj[attr] = object[attr];
    });
    return updateFiledObj;
}
exports.getUpdateFiledObjFromArray = getUpdateFiledObjFromArray;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC91dGlscy9idWZmZXJVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBVWIsU0FBZ0Isc0JBQXNCLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxXQUFXO0lBQ3JFLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV4RixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFeEIsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbkQsSUFBSSxVQUFVLEVBQUU7UUFHWixDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDOUUsSUFBRyxVQUFVLENBQUMsTUFBTSxHQUFDLENBQUM7WUFDbEIsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUdwRCxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGVBQWUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBR2xDLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUNwQixLQUFLLElBQUksSUFBSSxJQUFJLFdBQVcsRUFBRTtnQkFFMUIsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQzNELFNBQVM7aUJBQ1o7Z0JBQ0QsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBSTtvQkFDdEMsSUFBRyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUM7d0JBQ25DLFNBQVM7cUJBQ1o7eUJBQUk7d0JBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzt3QkFDMUQsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDOzRCQUNwQixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFFO3lCQUN4QjtxQkFDSjtpQkFDSjtnQkFDRCxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQzFDO1NBQ0o7S0FDSjtJQUNELE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBQyxDQUFBO0FBQ3pELENBQUM7QUF2Q0Qsd0RBdUNDO0FBQUEsQ0FBQztBQUdGLFNBQWdCLGVBQWUsQ0FBQyxhQUFhLEVBQUUsS0FBSztJQUNoRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsSUFBSSxRQUFRLENBQUM7SUFDYixLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtRQUVwQixJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDdEQsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNmLE1BQU07U0FDVDtLQUNKO0lBQ0QsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQVpELDBDQVlDO0FBQUEsQ0FBQztBQUdGLFNBQWdCLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxTQUFTO0lBQ3hELE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUMxQixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDO0FBTkQsZ0VBTUM7QUFBQSxDQUFDIn0=