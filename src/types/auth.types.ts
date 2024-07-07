export type TypeLoginUser = Promise<{
	accessToken: string, refreshToken: string
}>

export type TypeValidateGitHubUser = {
	id: string
	email: string
	username: string
	picture: string
}