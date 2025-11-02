export interface IResults {
    lottery: number[],
    properties: string,
    oddEven: string,
    baozi: number
}

export interface Ibssd {
    big: number,
    small: number,
    single: number,
    double: number,
    baozi: number
}

export interface IResult {
    results: IResults[];
    bssd: Ibssd;
}