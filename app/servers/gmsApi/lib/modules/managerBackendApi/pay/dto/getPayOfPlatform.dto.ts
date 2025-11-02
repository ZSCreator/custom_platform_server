import { ApiProperty } from "@nestjs/swagger";
import { IsPositive, IsInt } from "class-validator";

export class GetPayOfPlatformDTO {
    @ApiProperty({
        description: "开始时间戳"
    })
    @IsInt({ message: "必须是number" })
    @IsPositive({ message: "必须大于0" })
    startTime: number;

    @ApiProperty({
        description: "结束时间戳"
    })
    @IsInt({ message: "必须是number" })
    @IsPositive({ message: "必须大于0" })
    endTime: number;
}