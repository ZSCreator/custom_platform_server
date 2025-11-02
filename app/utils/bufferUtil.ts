'use strict';

// 缓存用到的一些工具方法


/**
 * 获取需要设置到缓存中的 值、需要更新的属性数组、是否需要添加更新任务:
 * @param: bufferData，缓存中存储的对象（包括需要更新的属性数组）； updateObj，调用update时传入的 对象；updateAttrs，调用update时传入的需要更新的属性数组。
 * return: needToStoreData, allUpdateAttrs, needAddTask，需要存入缓存中的对象、所有需要更新的属性数组、是否需要添加更新任务
 * */
export function getNeedStoreBufferData(bufferData, updateObj, updateAttrs) {
    let allUpdateAttrs = Array.isArray(updateAttrs) ? updateAttrs : Array.from(updateAttrs);
    // 标志是否需要推送更新任务
    let needAddTask = false;
    // 这样做是为了不会改变传入的参数 updateObj
    let needToStoreData = Object.assign({}, updateObj);
    if (bufferData) {
        // 当缓存里需要更新的字段不为空时，说明之前肯定已经设置过更新任务；
        // 因此只有当 缓存里需要更新的字段为空 且新提交的需要更新字段不为空时才需要推送一个更新任务
        !bufferData.updateFields.length && updateAttrs.length && (needAddTask = true);
        if(bufferData.length>0)
            allUpdateAttrs.push(...bufferData.updateFields);
        // Object.values(bufferData.updateFields).length > 0 ? allUpdateAttrs.push(...bufferData.updateFields) : null;
        // 转换为 set 之后再转换为数组，这样每个属性只会有一个在数组中
        allUpdateAttrs = Array.from(new Set(allUpdateAttrs));
        needToStoreData = bufferData.data;

        // bufferData.data 存在，把 bufferData.data 在 updateAttrs 中标明的属性替换为 updateObj 中对应的属性的值
        if (updateAttrs.length) {
            for (let attr of updateAttrs) {
                // 需要更新的属性不能是 null 或者 undefined
                if (updateObj[attr] === undefined || updateObj[attr] === null) {
                    continue;
                }
                if (attr === 'gold' && updateObj[attr]  ) {        //玩家gold 保留2位小数
                    if(typeof updateObj[attr] !== 'number'){
                        continue;
                    }else{
                        updateObj[attr] = Math.floor(updateObj[attr] * 100) / 100;
                        if( updateObj[attr] < 0){
                            updateObj[attr] = 0 ;
                        }
                    }
                }
                needToStoreData[attr] = updateObj[attr]
            }
        }
    }
    return {needToStoreData, allUpdateAttrs, needAddTask}
};

// 从 bufferDataList 中找出满足查询条件的 where 的对象
export function getObjMeetWhere(bufferDataArr, where) {
    const allObj = bufferDataArr.map(bufferData => bufferData.data);
    const searchAttrs = Object.keys(where);
    let foundObj;
    for (let obj of allObj) {
        // 如果where 里面每个属性都相等，说明找到了
        if (searchAttrs.every(attr => obj[attr] === where[attr])) {
            foundObj = obj;
            break;
        }
    }
    return foundObj;
};

// 根据需要更新的对象 object 和 属性数组 updateArr，获取更新属性的键值对，如：{uid: object.uid, sid: object.sid}
export function getUpdateFiledObjFromArray(object, updateArr) {
    const updateFiledObj = {};
    updateArr.forEach(attr => {
        updateFiledObj[attr] = object[attr];
    });
    return updateFiledObj;
};

