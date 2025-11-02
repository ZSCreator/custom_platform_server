/**
 * 计算object 大小
 * @param object
 */
export function roughSizeOfObject( object ) {

    let objectList = [];
    let stack = [ object ];
    let bytes = 0;

    while ( stack.length ) {
        let value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
        )
        {
            objectList.push( value );

            for( let i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}