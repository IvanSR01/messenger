import { IsString, IsEmail, MinLength } from 'class-validator'

export class LoginUserDto {
	@IsEmail()
	email: string

	@IsString()
	@MinLength(6)
	password: string
}

export class CreateUserDto extends LoginUserDto {
	@IsString()
	username: string
}