import { IsNotEmpty, IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class AgentList {

    @ApiProperty({ description: "平台编号" })
    @IsNotEmpty({ message: "平台平台不能为空" })
    platfromUid: string;

    @ApiProperty({ description: "当前页" })
    @IsPositive({ message: "页数应大于 0" })
    currentPage: number;

    @ApiProperty({ description: "每页展示数量" })
    @IsPositive({ message: "每页展示数量应大于 0" })
    pageSize: number;



    rootAgent: string;



}
