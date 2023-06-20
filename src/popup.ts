// Import our custom CSS
import '../styles/common.scss'

// Import all of Bootstrap's JS
//import * as bootstrap from 'bootstrap'

import { getOptions, StorageOptions, getLastResult, setLastResult } from './storage'
import * as UX from './ux'
import {
	isEmail,
	mergeAndSortAscendingDate,
	filterHiddenEvents,
	sortByColorPriority,
} from './utility';
import {
	getOrderByOrderNumber,
	getNotifications,
	getOrdersFromChatBotAPI,
} from './api';

require('bootstrap-icons/font/bootstrap-icons.css')

const options:StorageOptions = getOptions()

export function processBotOrders(response) {
  //this should replace processBotOrder [singular] as it will handle single and multi orders(??)
  UX.stopProgress()
  UX.addOrderHeader(response.orders, true);

  if (response.orders.length > 1) {
    let panelIndex = response.orders.length
    for (const order of response.orders) {
			UX.addOrderCard(order, panelIndex);
			panelIndex--;
			for (const parcel of order.parcels) {
				UX.addMultiOrderTracking(parcel, order.orderNo)
			}
			// this is where we want to populate the subcard
			const subOrder = { orders: [order] }
      processBotOrder(subOrder, true)
		}
  
  }

  UX.enableControls();
}


export function processBotOrder(response, multiOrder: boolean) {
	

	UX.stopProgress();

	//const parcelsCount = response.orders[0].parcels.length
	const outboundCount = response.orders[0].parcels.filter(
		(p) => p.isReturn === false,
	).length;
	const returnCount = response.orders[0].parcels.filter(
		(p) => p.isReturn === true,
	).length;

	//initial order information
	UX.addOrderHeader(response.orders, multiOrder);

	let i = 0;
	let oIndex = 0;
	let rIndex = 0;
	let displayIndex = 0;
	let displayCount = 0;
	let packageText;

	const parcels = sortByColorPriority(response.orders[0].parcels)
  const orderNo = response.orders[0].orderNo

	for (const parcel of parcels) {
    const trackingNumber = parcel.tracking_number

		i++;
		if (parcel.isReturn === true) {
			rIndex++;
			displayIndex = rIndex;
			displayCount = returnCount;
			packageText = 'Return package';
		} else {
			oIndex++;
			displayIndex = oIndex;
			displayCount = outboundCount;
			packageText = 'Package';
		}

		// add tracking card
		UX.addTrackingCard(parcel, orderNo, i, packageText, displayIndex, displayCount);

		//add subsections
		UX.addSubCards(parcel, orderNo, i);

		// get notifications
		getNotifications(parcel, options, orderNo, i);

		//add product details header
		UX.addProductDetailsHeader(trackingNumber, orderNo);

		//start product loop
		UX.addProductDetails(parcel.delivery_info.articles, orderNo, trackingNumber);
	} //end tracking loop

	UX.enableControls();
	setLastResult($('#resultsPanel').html());
}

export function processJourneyCheckpoints(response, parcel, orderNo, pCounter) {
  if (typeof response.status !== undefined) {
    //merge notifications with checkpoints for full journey
    let cpNotificationsSorted = mergeAndSortAscendingDate(
      parcel.checkpoints,
      response
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

      //if (checkpoint.hasOwnProperty('type')) {
      if ( Object.prototype.hasOwnProperty.call(checkpoint,'type') ){
        // is a notification
        cpStatus = checkpoint.type
      } else {
        // is a checkpoint
        cpStatus = checkpoint.status_text
        cpTitle = checkpoint.status_text
        cpSubTitle = checkpoint.status_details
      }

      const date = new Date(checkpoint.timestamp)

      switch (cpStatus) {
        case 'Delivered':
          icon = 'bi-check-circle-fill'
          break
        case 'sms':
          icon = 'bi-phone'
          cpTitle = 'SMS'
          cpSubTitle = checkpoint.message
          break
        case 'email':
          icon = 'bi-envelope'

          if (typeof checkpoint.opened === 'string') {
            oDate = new Date(checkpoint.opened).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
            })
          } else {
            oDate = '--'
          }

          if (typeof checkpoint.clicked === 'string') {
            cDate = new Date(checkpoint.clicked).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
            })
          } else {
            cDate = '--'
          }

          cpTitle = `<a id="tt-${pCounter}-${cp}" class="link-offset-2 link-underline link-underline-opacity-0 pl-tt" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-html="true" data-bs-title="<p>Opened: ${oDate}<br />Clicked: ${cDate}</p>" href="${checkpoint.rescueLink}" target="_blank">Email</a>`
          cpSubTitle = checkpoint.subject
          break
        case 'webhook':
          icon = 'bi-cloud-arrow-up'
          cpTitle = 'Webhook'
          cpSubTitle = checkpoint.message.event
          break
        default:
          icon = 'bi-truck'
      }

      UX.addCheckpointDetails(
				orderNo,
				parcel.tracking_number,
				date,
				icon,
				cpTitle,
				cpSubTitle,
				cp,
			);

      if (cp != 0) {
        UX.addCheckpointSpacer(orderNo, parcel.tracking_number);
      }
    }
  }
}

$(document).ready(function () {
  const lastResult = getLastResult
  UX.readyPanel(options, lastResult)

  $('#search-btn').on('click', function () {
    const searchTerm = ($('#search-input').val() as string).trim()
   
  

    if (searchTerm == '') {
      UX.displayAlert(400)
      $('#search-btn').prop('disabled', false)

    } else if (isEmail(searchTerm)) {
      UX.cleanPanel()
			UX.startProgress()
      getOrdersFromChatBotAPI(searchTerm, 'customerEmail', options)

    } else {
      UX.cleanPanel()
      UX.startProgress()
      getOrderByOrderNumber(searchTerm, options)
    }
  })
})
