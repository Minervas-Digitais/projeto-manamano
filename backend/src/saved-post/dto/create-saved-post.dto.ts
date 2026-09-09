import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSavedPostDto {
  @IsString()
  @IsNotEmpty()
  postId: string;
}
