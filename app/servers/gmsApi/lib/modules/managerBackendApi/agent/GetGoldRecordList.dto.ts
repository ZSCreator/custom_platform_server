import { IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class GetGoldRecordList {

    @ApiProperty({ description: "平台or代理编号" })
    uid: string;

    @ApiProperty({ description: "上级编号" })
    parentUid: string;

    @ApiProperty({ description: "平台名称" })
    platfromUid: string;

    @ApiProperty({ description: "当前页" })
    @IsPositive({ message: "页数应大于 0" })
    currentPage: number;

    @ApiProperty({ description: "每页展示数量" })
    @IsPositive({ message: "每页展示数量应大于 0" })
    pageSize: number;
}
