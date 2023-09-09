// Import our custom CSS
import '../styles/common.scss'

// Import all of Bootstrap's JS
//import * as bootstrap from 'bootstrap'

import {
	Account,
	getOptionsMA,
	setOptionsMA,
	StorageOptionsMA,
	destroySettings,
	getCurrentAccount,
	setCurrentAccount
} from './storage'

import { addAccountPannel } from './ux'

//const { user, token, language, staging } = getOptions()
const { accounts, language, staging } = getOptionsMA()
console.log(accounts)

// if (user !== undefined) {
// 	$('#user').val(user)
// }
// if (token !== undefined) {
// 	$('#token').val(token)
// }
// if (language !== undefined) {
// 	$('#language').val(language)
// }

$(document).ready(function () {

	try {
		for (let i = 0; i < accounts.length; i++) {
			const account = accounts[i]
			addAccountPannel(account.id)
			$('#name-' + account.id).val(account.name)
			$('#user-' + account.id).val(account.user)
			$('#token-' + account.id).val(account.token)
		}
	} catch (error) {
		console.log('accounts list error: ' + String(error))
	}

	$('.fc').on('change', function () {
		if ($(this).val() == '') {
			$(this).addClass('is-invalid')
		} else {
			$(this).removeClass('is-invalid')
		}
	})

	$('#new-account-btn').on('click', function () {
		const index = $('.account').length
		addAccountPannel(index)
		// $('#del-account-btn-' + index).on('click', function () {
		// 	$('#account-' + index).remove()
		// })
		$('.del-account-btn').on('click', function () {
			$(this).parents('.account').remove()
		})
	})

	$('.del-account-btn').on('click', function () {
		// const index = $(this).attr('data-account-id')
		// $('#account-' + index).remove()
		$(this).parents('.account').remove()
	})
	



	$('#save-btn').on('click', function () {
		let valid = true

		//const options: StorageOptions = { user, token, language, staging }
		const optionsMA: StorageOptionsMA = { accounts, language, staging }
		//type ObjectKey = keyof typeof options

		$('.fc').each(function () {
			const val: string = $(this).val() as string

			if (val == '') {
				$(this).addClass('is-invalid')
				valid = false
			} else {
				//const myKey = $(this).attr('id') as ObjectKey
				//options[myKey] = val
				
				//options[$(this).attr('id')] = val

			}
		})


		if (valid) {
			const accountList: Account[] = []
			let i = 0
			$('.account').each(function () {
				// const index: number = +$(this).attr('data-account-id')
				// const name = String($('#name-' + index).val())
				// const user = String($('#user-' + index).val())
				// const token = String($('#token-' + index).val())
				const name = String($(this).find('.name').val()).trim()
				const user = String($(this).find('.user').val()).trim()
				const token = String($(this).find('.token').val()).trim()

				// accountList =
				// 	accountList +
				// 	`{"id":${index},"name":"${name}","user":"${user}","token":"${token}"},`

				const anAccount: Account = {
					// id: index,
					id: i,
					name: name,
					user: user,
					token: token,
				}
				accountList.push(anAccount)
				i++
			})
			//accountList = accountList.slice(0,-1) + ']'
			optionsMA['accounts'] = accountList
			const currentAccount = getCurrentAccount()
			if (currentAccount == null || (typeof currentAccount === 'string' && currentAccount.trim().length === 0)) {
				setCurrentAccount(accountList[0].id)
			}

			//setOptions(options)
			setOptionsMA(optionsMA)
			chrome.runtime.sendMessage(null, 'accountsUpdated')
			window.close()
		}
	})

	$('#unlock-btn').on('click', function () {
		$(this).toggleClass('btn-outline-success btn-outline-danger')
		$('#unlock-icon').toggleClass('bi-lock-fill bi-unlock-fill')
		$('#destroy-btn').toggleClass('btn-success btn-danger disabled')	
	})

	$('#destroy-btn').on('click', function () {
		destroySettings()
		chrome.runtime.sendMessage(null, 'settingsDestroyed')
		window.close()
	})
	
})
