// Import our custom CSS
import '../styles/common.scss'

import {
	getOptions,
	StorageOptions,
	getLastResult,
	setLastResult,
} from './storage'
import * as UX from './ux'
import {
	isEmail,
	mergeAndSortAscendingDate,
	filterHiddenEvents,
	sortByColorPriority,
} from './utility'
import {
	getOrderByOrderNumber,
	getNotifications,
	getOrdersFromChatBotAPI
} from './api'

require('bootstrap-icons/font/bootstrap-icons.css')

const options: StorageOptions = getOptions()

export function processBotOrders(response) {
	//this should replace processBotOrder [singular] as it will handle single and multi orders(??)
	UX.stopProgress()
	UX.addOrderHeader(response.orders, true)

	if (response.orders.length > 1) {
		let panelIndex = response.orders.length
		for (const order of response.orders) {
			UX.addOrderCard(order, panelIndex)
			panelIndex--
			for (const parcel of order.parcels) {
				UX.addMultiOrderTracking(parcel, order.orderNo)
			}
			// this is where we want to populate the subcard
			const subOrder = { orders: [order] }
			processBotOrder(subOrder, true)
		}
	}

	UX.enableControls()
}

export function processBotOrder(response, multiOrder: boolean) {
	UX.stopProgress()

	//const parcelsCount = response.orders[0].parcels.length
	const outboundCount = response.orders[0].parcels.filter(
		(p) => p.isReturn === false,
	).length
	const returnCount = response.orders[0].parcels.filter(
		(p) => p.isReturn === true,
	).length

	//initial order information
	UX.addOrderHeader(response.orders, multiOrder)

	let i = 0
	let oIndex = 0
	let rIndex = 0
	let displayIndex = 0
	let displayCount = 0
	let packageText

	const parcels = sortByColorPriority(response.orders[0].parcels)
	const orderNo = response.orders[0].orderNo

	for (const parcel of parcels) {
		const trackingNumber = parcel.tracking_number

		i++
		if (parcel.isReturn === true) {
			rIndex++
			displayIndex = rIndex
			displayCount = returnCount
			packageText = 'Return package'
		} else {
			oIndex++
			displayIndex = oIndex
			displayCount = outboundCount
			packageText = 'Package'
		}

		// add tracking card
		UX.addTrackingCard(
			parcel,
			orderNo,
			i,
			packageText,
			displayIndex,
			displayCount,
		)

		//add subsections
		UX.addSubCards(parcel, orderNo, i)

		// get notifications
		getNotifications(parcel, options, orderNo, i)

		//add product details header
		UX.addProductDetailsHeader(trackingNumber, orderNo)

		//start product loop
		UX.addProductDetails(parcel.delivery_info.articles, orderNo, trackingNumber)
	} //end tracking loop

	UX.enableControls()
	setLastResult($('#resultsPanel').html())
}

export function processJourneyCheckpoints(response, parcel, orderNo, pCounter) {
	if (typeof response.status !== undefined) {
		//merge notifications with checkpoints for full journey
		let cpNotificationsSorted = mergeAndSortAscendingDate(
			parcel.checkpoints,
			response,
		)

		//filter out hidden events
		cpNotificationsSorted = filterHiddenEvents(cpNotificationsSorted)

		//populate shipment details
		for (let cp = cpNotificationsSorted.length - 1; cp >= 0; cp--) {
			const checkpoint = cpNotificationsSorted[cp]

			let cpStatus
			let cpTitle
			let cpSubTitle
			let icon
			let oDate
			let cDate
			let svgClass
			let emailClass
			let infoTop
			let infoBottom
			let emailPopover
			let attachmentsCode
			let attachmentsLinks

			if (Object.prototype.hasOwnProperty.call(checkpoint, 'type')) {
				// is a notification
				cpStatus = checkpoint.type
			} else {
				// is a checkpoint
				cpStatus = checkpoint.status_text
				cpTitle = checkpoint.status_text
				cpSubTitle = checkpoint.status_details
			}

			const date = new Date(checkpoint.timestamp)
			svgClass = ' icon-svg-std'
			emailClass = ''
			infoTop = ''
			infoBottom = ''

			if (typeof checkpoint.opened === 'string') {
				oDate = new Date(checkpoint.opened).toLocaleString('en-US', {
					month: 'long',
					day: 'numeric',
				})
			} else {
				//oDate = '--'
				oDate = '<i class="bi bi-x"></i>'
			}

			if (typeof checkpoint.clicked === 'string') {
				cDate = new Date(checkpoint.clicked).toLocaleString('en-US', {
					month: 'long',
					day: 'numeric',
				})
			} else {
				//cDate = '--'
				cDate = '<i class="bi bi-x"></i>'
			}

			switch (cpStatus) {
				case 'Delivered':
					icon = `<img src="/img/check-circle.svg" alt="checkmark in circle" srcset="/img/check-circle.svg" />`
					svgClass = ' icon-svg-blue'
					break
				case 'sms':
					icon = `<img src="/img/phone.svg" alt="phone" srcset="/img/phone.svg" />`
					cpTitle = 'SMS'
					cpSubTitle = checkpoint.message
					break
				case 'email':
					
					attachmentsCode = ''
					attachmentsLinks = ''

					if (checkpoint.attachments.length != 0) {
						for (const attach of checkpoint.attachments) {
							attachmentsLinks = attachmentsLinks =
								attachmentsLinks +
								`<a href="${attach.url}">${attach.filename}</a><br />`
						}
					} else {
						attachmentsLinks = '<i class="bi bi-x"></i>'
					}
					attachmentsCode = `
						<tr>
							<td>Attachments:</td>
      						<td>${attachmentsLinks}</td>
						</tr>
					`
					

					emailPopover = `
						<table class="table table-borderless" style="margin-top: 0.5rem; margin-bottom: 0.5rem">
  							<tbody>
								<tr>
									<td style="padding-top: 0; padding-bottom: 0;">Opened:</td>
      								<td style="padding-top: 0; padding-bottom: 0;">${oDate}</td>
								</tr>
								<tr>
									<td style="padding-top: 0; padding-bottom: 0;">Clicked:</td>
      								<td style="padding-top: 0; padding-bottom: 0;">${cDate}</td>
								</tr>
								${attachmentsCode}
								<tr>
									<td style="padding-top: 0; padding-bottom: 0;"><br />Resend <a href="#"><i id="${checkpoint.id}" data-pl-channel="Mail" class="bi bi-send resend"></i></a></td>
								</tr>
							</tbody>
						</table>
					`

					if (checkpoint.clicked !== null) {
						icon = `<img src="/img/click.svg" alt="envelope" srcset="/img/click.svg" class="svg-link po-${parcel.tracking_number}" data-bs-toggle="popover" data-bs-custom-class="custom-popover" data-bs-html="true" data-bs-content='${emailPopover}'/>`
					} else if (checkpoint.opened !== null) {
						icon = `<img src="/img/open.svg" alt="envelope" srcset="/img/open.svg" class="svg-link po-${parcel.tracking_number}" data-bs-toggle="popover" data-bs-custom-class="custom-popover" data-bs-html="true" data-bs-content='${emailPopover}'/>`
					} else if (checkpoint.bounced === null) {
						icon = `<img src="/img/envelope.svg" alt="envelope" srcset="/img/envelope.svg" class="svg-link po-${parcel.tracking_number}" data-bs-toggle="popover" data-bs-custom-class="custom-popover" data-bs-html="true" data-bs-content='${emailPopover}'/>`
					} else {
						icon = `<img src="/img/bounce.svg" alt="envelope" srcset="/img/bounce.svg" class="svg-link po-${parcel.tracking_number}" data-bs-toggle="popover" data-bs-custom-class="custom-popover" data-bs-html="true" data-bs-content='${emailPopover}'/>`
					} 

					if (checkpoint.messageType.startsWith('Resend-')) {
						emailClass = ' border p-1 border-primary-subtle bg-body-tertiary'
						infoTop = `
							<p class="text-max-w from-other-tracking p-1"><span class="bi bi-send-exclamation"> This notification is a manual resend.</span></p>
						`
					}
					if (checkpoint.from_other_tracking) {
						emailClass = ' border p-1 border-success-subtle bg-body-tertiary'
						infoBottom = `
							<p class="text-max-w from-other-tracking"><span class="bi bi-info-circle-fill"> This notification belongs to another shipment of the same order.</span></p>
						`
					}

					cpTitle = `<a id="tt-${pCounter}-${cp}" class="link-offset-2 link-underline link-underline-opacity-0" href="${checkpoint.rescueLink}" target="_blank" data-bs-toggle="tooltip" data-bs-title="The last tip!">Email</a>`
					cpSubTitle = checkpoint.subject
					break
				case 'webhook':
					icon = `<img src="/img/webhook.svg" alt="webook" srcset="/img/webhook.svg" />`
					cpTitle = 'Webhook'
					cpSubTitle = checkpoint.messageType
					break
				default:
					icon = `<img src="/img/truck.svg" alt="truck" srcset="/img/truck.svg" />`
			}

			//console.log(date)
			let lineCode = ''
			if (cp != 0) {
				lineCode = '<div class="line"></div>'
			}

			UX.addCheckpointDetails(
				orderNo,
				parcel.tracking_number,
				date,
				icon,
				cpTitle,
				cpSubTitle,
				cp,
				lineCode,
				svgClass,
				emailClass,
				infoTop,
				infoBottom
			)
		}
	}
}

$(document).ready(function () {
	const lastResult = getLastResult
	UX.readyPanel(options, lastResult)

	$('#search-btn').on('click', function () {
		UX.cleanPanel()
		UX.startProgress()
		const searchTerm = ($('#search-input').val() as string).trim()

		if (searchTerm == '') {
			UX.displayAlert(400)
			$('#search-btn').prop('disabled', false)
		} else if (isEmail(searchTerm)) {
			getOrdersFromChatBotAPI(searchTerm, 'customerEmail', options)
		} else {
			getOrderByOrderNumber(searchTerm, options)
		}
	})
})
