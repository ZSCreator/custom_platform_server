

/**
 *两个数组，一个数组在另外一个数组中存在那么就去掉这个数组相对应的元素
 */
export function array_delete_array(a :number [], b : number[]) {
    for(let key of a){
        const index = b.indexOf(key);
        if(index > -1){
            b.splice(index,1);
        }
    }
    return b;
}

