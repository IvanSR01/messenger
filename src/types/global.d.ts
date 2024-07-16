declare type JWTTokenPayload = {
	exp?: any
	username: string
	sub: number
	secreteKeyJwtHash: string
}

declare type SocketPayload = { content: string; chatId: number; userId: number }
