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
import { getOrderByOrderNumber, getNotifications } from './api'

require('bootstrap-icons/font/bootstrap-icons.css')

const options:StorageOptions = getOptions()

export function processBotOrder(response) {
  UX.stopProgress()

  const parcelsCount = response.orders[0].parcels.length
  const outboundCount = response.orders[0].parcels.filter(p => p.isReturn === false).length
  const returnCount = response.orders[0].parcels.filter(p => p.isReturn === true).length

  //initial order information
  UX.addOrderInformation(response.orders[0].orderNo, parcelsCount)

  let i = 0
  let oIndex = 0;
  let rIndex = 0;
  let displayIndex = 0
  let displayCount = 0
  let packageText

  const parcels = sortByColorPriority(response.orders[0].parcels)

  for (const parcel of parcels) {
    i++
    if (parcel.isReturn === true) {
      rIndex++
      displayIndex = rIndex
      displayCount = returnCount
      packageText = 'Return package'
    } else {
      oIndex++
      displayIndex = oIndex;
      displayCount = outboundCount
      packageText = 'Package'
    }

    // add tracking card
    UX.addTrackingCard(parcel, i, packageText, displayIndex, displayCount);

    //add subsections
    UX.addSubCards(parcel, i)

    // get notifications
    getNotifications(parcel, options, i)

    //add product details header
    UX.addProductDetailsHeader(i)

    //start product loop
    UX.addProductDetails(parcel.delivery_info.articles, i)
  } //end tracking loop

  UX.enableControls()
  setLastResult($('#resultsPanel').html())
}

export function processJourneyCheckpoints(response, parcel, pCounter) {
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

      UX.addCheckpointDetails(date, icon, cpTitle, cpSubTitle, pCounter, cp)

      if (cp != 0) {
        UX.addCheckpointSpacer(pCounter)
      }
    }
  }
}

$(document).ready(function () {
  const lastResult = getLastResult
  UX.readyPanel(options, lastResult)
  $('#search-btn').on('click', function () {
    const searchTerm = $('#search-input').val()
    if (searchTerm == '') {
      UX.displayAlert(400)
      $('#search-btn').prop('disabled', false)
    } else if (isEmail(searchTerm)) {
      //implment searchbyemail here
    } else {
      UX.cleanPanel()
      UX.startProgress()

      getOrderByOrderNumber(searchTerm, options)
    }
  })
})
