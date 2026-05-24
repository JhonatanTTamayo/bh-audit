import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class FiltroReporteCitasDto {
    @ApiProperty({
        description: 'Fecha de inicio del período (YYYY-MM-DD)',
        example: '2026-01-01',
    })
    @IsDateString()
    inicio: string;

    @ApiProperty({
        description: 'Fecha de fin del período (YYYY-MM-DD)',
        example: '2026-12-31',
    })
    @IsDateString()
    fin: string;
}