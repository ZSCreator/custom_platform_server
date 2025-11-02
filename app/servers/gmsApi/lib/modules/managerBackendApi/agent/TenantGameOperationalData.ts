import { IsNotEmpty, IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class TenantGameOperationalData {

    @ApiProperty({ description: "租户名称" })
    @IsNotEmpty({ message: "租户编号不能为空" })
    groupRemark: string;

    @ApiProperty({ description: "开始时间" })
    startTimestamp: number;

    @ApiProperty({ description: "结束时间" })
    endTimestamp: number;

    @ApiProperty({ description: "当前页" })
    @IsPositive({ message: "页数应大于 0" })
    currentPage: number;

    @ApiProperty({ description: "每页展示数量" })
    @IsPositive({ message: "每页展示数量应大于 0" })
    pageSize: number;


    platformUid : string;
}
