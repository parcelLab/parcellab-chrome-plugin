import {
	processBotOrder,
	processJourneyCheckpoints,
	processBotOrders,
} from './popup'
import { subtractDays } from './utility'
import { stopProgress, displayAlert } from './ux'

const baseURL = 'https://api.parcellab.com'

export function getOrdersFromChatBotAPI(searchTerm, searchType, options) {
	// this method should replace getOrderByOrderNumber when a order number is passed in

	const settings = {
		url: `${baseURL}/orders/bot?showReturns=true&${searchType}=${searchTerm}&lang=${options.language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(options.user + ':' + options.token),
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

export function getOrderByOrderNumber(searchTerm, options) {
	const settings = {
		url: `${baseURL}/orders/bot?showReturns=true&orderNo=${searchTerm}&lang=${options.language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(options.user + ':' + options.token),
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
				getOrderNumberByTrackingNumber(searchTerm, options)
			}
		})
}

function getOrderNumberByTrackingNumber(searchTerm, options) {
	const date = new Date()
	const fromDate = subtractDays(date, 120)
	const fromDateFormatted = fromDate.toJSON().slice(0, 10)

	const settings = {
		url: `${baseURL}/v2/search/?s=${searchTerm}&from=${fromDateFormatted}&lang=${options.language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(options.user + ':' + options.token),
		},
	}

	$.ajax(settings).done(function (response) {
		if (response.meta.hits == 0) {
			stopProgress()
			displayAlert(404)
			$('#search-btn').prop('disabled', false)
		} else {
			const orderNumber = response.results[0].inf.orn
			getOrderByOrderNumber(orderNumber, options)
		}
	})
}

export function getNotifications(parcel, options, orderNo, pCounter) {
	const settings = {
		url: `${baseURL}/v2/notifications?tid=${parcel.id}&lang=${options.language}`,
		method: 'GET',
		timeout: 0,
		async: true,
		headers: {
			'content-type': 'application/json',
			Authorization: 'Basic ' + btoa(options.user + ':' + options.token),
		},
	}

	$.ajax(settings).always(function (response) {
		processJourneyCheckpoints(response, parcel, orderNo, pCounter)
	})
}
