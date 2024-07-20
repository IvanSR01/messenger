import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginUserDto {
	@IsEmail()
	email: string

	@IsString()
	@MinLength(6)
	password: string
}

export class TokenUserDto {
	@IsString()
	userId: string
}

export class CloseSessionDto {
	accessToken: string
	isAllSessions: boolean
}


export class CreateGoogleDto {
	id: string;
	@IsEmail()
  email: string;
	@IsString()
  firstName: string;
  lastName: string;
  picture: string;
}