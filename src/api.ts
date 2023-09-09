import {
	processBotOrder,
	processJourneyCheckpoints,
	processBotOrders,
} from './popup'
import { subtractDays } from './utility'
import { stopProgress, displayAlert, displayToast, enableReturnLink } from './ux'
//import { getOptions, StorageOptions } from './storage'

const baseURL = 'https://api.parcellab.com'
//const options: StorageOptions = getOptions()

export function getOrdersFromChatBotAPI(searchTerm, searchType, language, account) {
	// this method should replace getOrderByOrderNumber when a order number is passed in

	const settings = {
		url: `${baseURL}/orders/bot?showReturns=true&${searchType}=${searchTerm}&lang=${language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(account.user + ':' + account.token),
		},
	}

	$.ajax(settings)
		.done(function (response) {
			processBotOrders(response)
			$('#search-btn').prop('disabled', false)
		})
		.fail(function (response) {
			if (response.status == 401) {
				stopProgress()
				displayAlert(401)
				$('#search-btn').prop('disabled', false)
			} else if (response.status == 403) {
				stopProgress()
				displayAlert(403)
				$('#search-btn').prop('disabled', false)
			} else if (response.status == 404) {
				stopProgress()
				displayAlert(404)
				$('#search-btn').prop('disabled', false)
			}
		})
}

export function getOrderByOrderNumber(searchTerm, language, account) {
	const settings = {
		url: `${baseURL}/orders/bot?showReturns=true&orderNo=${searchTerm}&lang=${language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(account.user + ':' + account.token),
		},
	}

	$.ajax(settings)
		.done(function (response) {
			processBotOrder(response, false)
			$('#search-btn').prop('disabled', false)
			// StorageService.saveLastResult() //- bring me back
		})
		.fail(function (response) {
			if (response.status == 401) {
				stopProgress()
				displayAlert(401)
				$('#search-btn').prop('disabled', false)
			} else if (response.status == 403) {
				stopProgress()
				displayAlert(403)
				$('#search-btn').prop('disabled', false)
			} else {
				getOrderNumberByTrackingNumber(searchTerm, language, account)
			}
		})
}

function getOrderNumberByTrackingNumber(searchTerm, language, account) {
	const date = new Date()
	const fromDate = subtractDays(date, 120)
	const fromDateFormatted = fromDate.toJSON().slice(0, 10)

	const settings = {
		url: `${baseURL}/v2/search/?s=${searchTerm}&from=${fromDateFormatted}&lang=${language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(account.user + ':' + account.token),
		},
	}

	$.ajax(settings).done(function (response) {
		if (response.meta.hits == 0) {
			stopProgress()
			displayAlert(404)
			$('#search-btn').prop('disabled', false)
		} else {
			const orderNumber = response.results[0].inf.orn
			getOrderByOrderNumber(orderNumber, language, account)
		}
	})
}

export function getNotifications(parcel, language, account, orderNo, pCounter) {
	const settings = {
		url: `${baseURL}/v2/notifications?tid=${parcel.id}&lang=${language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(account.user + ':' + account.token),
		},
	}

	$.ajax(settings).always(function (response) {
		processJourneyCheckpoints(response, parcel, orderNo, pCounter)
	})
}

export function resendNotification(notification, account) {
	const notificationId = notification.getAttribute('id')
	const channel = notification.getAttribute('data-pl-channel')

	const settings = {
		url: `${baseURL}/v2/re-trigger-message/`,
		method: 'POST',
		timeout: 0,
		headers: {
			'content-type': 'application/json',
			user: account.user,
			token: account.token,
		},
		data: JSON.stringify({
			channel: channel,
			id: notificationId,
		}),
	}

	const message = `Sending Notification`
	const color = '#0d6dfd'
	displayToast(`ns-${notificationId}`, color, message)


	$.ajax(settings)
		.done(function () {
			const message = `Notification was resent`
			const color = '#198754'
			displayToast(`nd-${notificationId}`, color, message)
		})
		.fail(function (response) {
			const message = `An error has occured: ${response.status}`
			const color = '#dc3546'
			displayToast(`nf-${notificationId}`, color, message)
		})
}

export function isReturnsEnabled(account, order) {
	console.log('in returns enabled function')
	console.log(account)
	console.log(order)
	const settings = {
		url: 'https://returns-api.parcellab.com/prod/userConfig?lang=en&country=us',
		method: 'GET',
		timeout: 0,
		headers: {
			user: account.user,
		},
	}

	$.ajax(settings)
		.done(function () {
			enableReturnLink(order.orderNo, order.parcels[0].delivery_info.email)
		})
}