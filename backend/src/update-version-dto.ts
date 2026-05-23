import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateVersionDto {
  @IsNotEmpty()
  @Matches(/^\d+\.\d+\.\d+$/)
  version: string;

  @IsInt()
  @Min(1)
  build: number;

  @IsBoolean()
  mandatory: boolean;

  @IsString()
  @IsNotEmpty()
  easBuildId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];
}
