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
      let svgClass
      let emailClass
      let infoHtml

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
      svgClass = ' icon-svg-std'
      emailClass = ''
      infoHtml = ''

      switch (cpStatus) {
        case 'Delivered':
          //icon = 'bi-check-circle-fill'
          icon = 
            `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFFFFF" class="bi bi-check-lg" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
              </svg>
            `
              //           icon = `<svg class="svg-snoweb svg-theme-light" height="100" preserveaspectratio="xMidYMid meet" viewbox="0 0 100 100" width="100" x="0" xmlns="http://www.w3.org/2000/svg" y="0">
              //  <path style="fill: #002172;" d="M50,87.4c20.655,0,37.4-16.745,37.4-37.4S70.655,12.6,50,12.6,12.6,29.345,12.6,50h0c-.055,20.6,16.6,37.345,37.2,37.4,.067,0,.134,0,.2,0Zm17.3-43.4c1.85-1.821,1.874-4.796,.053-6.647l-.053-.053c-1.83-1.804-4.77-1.804-6.6,0l-15.4,15.4-6-6c-1.83-1.804-4.77-1.804-6.6,0-1.823,1.69-1.93,4.537-.241,6.359,.077,.083,.157,.163,.241,.241l9.3,9.4c1.83,1.804,4.77,1.804,6.6,0l18.7-18.7Z" fill-rule="evenodd">
              //  </path>
              // </svg>`;
          svgClass = ' icon-svg-blue';
          break
        case 'sms':
          //icon = 'bi-phone'
          icon = 
            `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-phone" viewBox="0 0 16 16">
                <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
                <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
            `
          cpTitle = 'SMS'
          cpSubTitle = checkpoint.message
          break
        case 'email':
          //icon = 'bi-envelope'
          icon = 
            `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            `

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

          if (checkpoint.from_other_tracking) {
            emailClass = ' border p-1 bg-body-tertiary'; 
            infoHtml = `
                <p class="text-max-w from-other-tracking"><span class="bi bi-info-circle-fill"> This notification belongs to another shipment of the same order.</span></p>
              `;
          }
					
          cpTitle = `<a id="tt-${pCounter}-${cp}" class="link-offset-2 link-underline link-underline-opacity-0 pl-tt" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-html="true" data-bs-title="<p>Opened: ${oDate}<br />Clicked: ${cDate}</p>" href="${checkpoint.rescueLink}" target="_blank">Email</a>`;
          cpSubTitle = checkpoint.subject
          break
        case 'webhook':
          //icon = 'bi-cloud-arrow-up'
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cloud-arrow-up" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/>
  <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
</svg>`
          cpTitle = 'Webhook'
          cpSubTitle = checkpoint.message.event
          break
        default:
          //icon = 'bi-truck'
          icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
</svg>`;
      }
      
      console.log(date)
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
        infoHtml
			);

      // if (cp != 0) {
      //   UX.addCheckpointSpacer(orderNo, parcel.tracking_number);
      // }
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
