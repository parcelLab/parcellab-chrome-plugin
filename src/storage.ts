export interface StorageOptions {
	user: string
	token: string
	language: string
	staging: boolean
}

export function getOptions(): StorageOptions {
	return {
		user: localStorage.getItem('user'),
		token: localStorage.getItem('token'),
		language: localStorage.getItem('language'),
		staging: JSON.parse(localStorage.getItem('staging'))
	}
}

export function getLastResult(): string {
	return localStorage.getItem('lastResult')
}

export function setOptions(options: StorageOptions) {
	localStorage.setItem('user', options.user)
	localStorage.setItem('token', options.token)
	localStorage.setItem('language', options.language)
}

export function setLastResult(lastResult: string) {
	localStorage.setItem('lastResult', lastResult)
}

export function clearLastResult() {
	localStorage.removeItem('lastResult')
}
