//require('@popperjs/core')

import { Collapse, Popover, Toast } from 'bootstrap'

import { clearLastResult, setLastResult } from './storage'
import { resendNotification } from './api'

const myDefaultAllowList = Popover.Default.allowList
myDefaultAllowList.table = ['class', 'style']
myDefaultAllowList.tbody = []
myDefaultAllowList.tr = []
myDefaultAllowList.td = ['style']
myDefaultAllowList.i = ['data-pl-channel']

export function readyPanel(options, lastResult) {
	$('#search-input').on('keypress', function (e) {
		if (e.which == 13) {
			$('#search-btn').click()
		}
	})

	if (
		options.user == null ||
		options.token == null ||
		options.language == null
	) {
		$('#search-btn').prop('disabled', true)
		$('#order-input').prop('disabled', true)

		chrome.runtime.openOptionsPage()
	}

	if (lastResult !== null) {
		$('#resultsPanel').html(lastResult)
		enableControls()
	}
}

export function cleanPanel() {
	$('#order-info').remove()
	$('#parcels').remove()
	$('#fail-alert').remove()
	$('.divider').remove()
}

export function startProgress() {
	$('#search-area').after(
		'<div class="d-flex justify-content-center" id="progress"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span><br /></div><br /></div>',
	)
	$('#search-btn').prop('disabled', true)
}

export function stopProgress() {
	$('#progress').remove()
}

export function addOrderHeader(orders, multiOrder: boolean) {
	if (orders.length > 1) {
		$('#resultsPanel').html(
			`
        <div class="container small carousel-item active" id="order-info">
          <div class="row">
            <div class="col order-header">
              <span class="h6">ORDERS</span>
            </div>
            <div class="col-2">
              <button type="button" class="btn-close float-end closePanel" aria-label="Close"></button>
            </div>
          </div>
          <hr class="bg-secondary border-2 border-top border-secondary divider">
        </div>
      `,
		)
	} else {
		let htmlString = ``
		if (multiOrder) {
			htmlString =
				htmlString +
				`
        <div class="border-top border-bottom small bg-info-subtle mb-3">
            <a role="button" data-bs-target="#orderCarousel" data-bs-slide-to="0"><i class="bi bi-chevron-double-left multiorder-control"></i></a> Back to all orders
        </div>
      `
		}

		const orderNo = orders[0].orderNo
		const parcelsCount = orders[0].parcels.length
		htmlString =
			htmlString +
			`
        <div class="container" id="order-info">
            <div class="row">
                <div class="col-5 order-header">
                    ORDER NUMBER:
                </div>
                <div class="col order-header">
                    ${orderNo}
                </div>
                <div class="col-2">
                    <button type="button" class="btn-close float-end closePanel" aria-label="Close"></button>
                </div>
            </div>
            <div class="row">
                <div class="col-5 order-header">
                    RECIPIENT ADDRESS:
                </div>
                <div class="col order-header">
                    ${orders[0].parcels[0].delivery_info.recipient}<br />
                    ${orders[0].parcels[0].delivery_info.street}<br />
                    ${orders[0].parcels[0].delivery_info.city} ${orders[0].parcels[0].delivery_info.zip_code}
                </div>
            </div>
            <div class="row">
              <div class="col order-header" >
                  PACKAGES (${parcelsCount})
              </div>
            </div>
            <div class="row pt-1 text-danger">
              <div class="col register-return-link" id="register-return-order-${orderNo}"></div>
            </div>
        </div>
        <hr class="bg-secondary border-2 border-top border-secondary divider">
        <div class="container" id="parcels-for-${orderNo}"></div>
      `
		if (multiOrder) {
			$('#orderPanel-' + orderNo).html(htmlString)
		} else {
			$('#resultsPanel').html(htmlString)
		}
	}
}

export function enableControls() {

  // open/close collapsible containers
	$('.toggle-control').on('click', function () {
		$(this).toggleClass('bi-chevron-compact-down bi-chevron-compact-up')
		setLastResult($('#resultsPanel').html())
	})

	$('.multiorder-control').on('click', function () {
		setLastResult($('#resultsPanel').html())
	})

	$('.closePanel').on('click', function () {
		$('#resultsPanel').html('')
		clearLastResult()
	})

  // get all collapse containers and loop through
	const collapseElementList = [].slice.call(
		document.querySelectorAll('.collapse'),
	)
	const _collapseList = collapseElementList.map(function (collapseEl) {
		// enable popovers when opening a container
    collapseEl.addEventListener('shown.bs.collapse', () => {
			const tn = collapseEl.getAttribute('data-pl-tracking')
      enablePopovers(tn)	
		})

		return new Collapse(collapseEl, {
			toggle: false,
		})
	})

  //Enable popovers when re-loading previous state
  const shownElementList = [].slice.call(
		document.querySelectorAll('.collapsing'),
	)
  const _shownList = shownElementList.map(function (shownEl) {
			try {
        const tn = shownEl.getAttribute('data-pl-tracking')
			  enablePopovers(tn)
      } catch { console.log } 
	})
}

function enablePopovers(trackingNumber) { 
  const popoverTriggerList = document.querySelectorAll(`.po-${trackingNumber}`)
	const _popoverList = [...popoverTriggerList].map(
		(popoverTriggerEl) => {
      const aPopover = new Popover(popoverTriggerEl)
      const trackingToggle = document.getElementById(`toggle-${trackingNumber}`)
      //console.log(trackingToggle)
      trackingToggle.addEventListener('click', function () {
				aPopover.hide()
			})
      popoverTriggerEl.addEventListener('shown.bs.popover', () => {
        $('.resend').on('click', function () {
					resendNotification(this)
				})
      })
    },
	)
}

export function addOrderCard(order, i) {
	$('#order-info').append(
		`
      <div id="${order.orderNo}">
        <div class="d-flex gap-3 pt-1" id="${order.orderNo}">
          <div class="flex-grow-1 fw-medium">
            ${order.orderNo} <a role="button" data-bs-target="#orderCarousel" data-bs-slide-to="${i}"><i class="bi bi-box-arrow-in-up-right multiorder-control fs-6"></i></a>
          </div>
          <div class="flex-shrink-1 fw-bolder fs-6""> 
          </div>
        </div>
      </div>
      <div class="text-success">
        <hr>
      </div>
    `,
	)
}

export function addMultiOrderTracking(parcel, orderNo) {
	const lastCP = parcel.checkpoints.length - 1
	const date = new Date(parcel.checkpoints[lastCP].timestamp)

	$('#' + orderNo).append(
		`
      <div class="container bg-light border border-light-subtle rounded small mt-2">
        <div class="d-flex gap-3 pt-2">
          <div class="flex-grow-1 fw-light small">
            ${parcel.tracking_number}
          </div>
          <div class="flex-shrink-1 fw-light small">
            ${date.toLocaleString('en-US', {
							month: 'long',
							day: 'numeric',
						})}, ${date.toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})}
          </div>
        </div>
        <div class="d-flex gap-3 pt-1 pb-2">
          <div class="flex-grow-1 fw-light small">
            <span class="badge text-bg-light text-wrap" style="background-color: ${
							parcel.actionBox.color
						} !important;">${parcel.actionBox.servicePluginLabel}</span>
          </div>
        </div>
      </div>
    `,
	)


  if ( !$('#orderPanel-' + orderNo).length ) {
    $('#order-info').after(
			`
     <div class="carousel-item" id="orderPanel-${orderNo}">
     </div>
    `,
		)
  }
}

export function addTrackingCard(
	parcel,
	orderNo,
	i,
	packageText,
	displayIndex,
	displayCount,
) {
	$('#parcels-for-' + orderNo).append(
		`
    <div class="container bg-light border border-light-subtle rounded-top-3 small">
      <div class="d-flex gap-3 pt-1">
        <div class="flex-grow-1">
          <span class="badge" style="color: ${parcel.courier.destination_courier.colorScheme.primary}; background-color: ${parcel.courier.destination_courier.colorScheme.secondary};">${parcel.courier.prettyname}</span> ${parcel.tracking_number}
        </div>
        <div class="flex-shrink-1">
          <a data-bs-toggle="collapse" href="#order-${orderNo}-parcel-${parcel.tracking_number}" role="button" aria-expanded="false" aria-controls="order-${orderNo}-parcel-${parcel.tracking_number}"><i id="toggle-${parcel.tracking_number}" class="bi toggle-control bi-chevron-compact-down tracking-details"></i></a>
        </div>
      </div>
      
      <div class="row">
          <div class="col">
              ${packageText} ${displayIndex}/${displayCount}
          </div>
      </div>
      <div class="row mt-2 mb-2">
          <div class="col">
              <span class="badge text-bg-light text-wrap" style="background-color: ${parcel.actionBox.color} !important;">${parcel.actionBox.servicePluginLabel}</span>
          </div>
      </div>
    </div>
  `,
	)
}

export function addSubCards(parcel, orderNo, i) {
	$('#parcels-for-' + orderNo).append(
		`
    <div class="collapse" data-pl-tracking="${parcel.tracking_number}" data-bs-target="order-${orderNo}-parcel-${parcel.tracking_number}" id="order-${orderNo}-parcel-${parcel.tracking_number}">

        <div class="container border border-light-subtle shipment-details-${i}" >
            <div class="mt-2 mb-2">
                <i class="bi bi-box-seam-fill"></i> Shipment details
            </div>
            <ul id="sd-order-${orderNo}-parcel-${parcel.tracking_number}" class="p-0 main-item">
            </ul>
        </div>

        <div id="pd-order-${orderNo}-parcel-${parcel.tracking_number}" class="container border border-light-subtle small product-details-${i}" >
            <div class="row mt-2 mb-2">
                <div class="col">
                    <i class="bi bi-cart-fill"></i> Product details
                </div>
                <div class="col text-end">
                    <a data-bs-toggle="collapse" href="#products-order-${orderNo}-parcel-${parcel.tracking_number}" role="button" aria-expanded="false" aria-controls="products-${i}"><i class="bi toggle-control bi-chevron-compact-down product-details"></i></a>
                </div>
            </div>
        </div>

        <div class="container border border-light-subtle rounded-bottom-3 small" >
            <div class="mt-2">
                <i class="bi bi-info-circle-fill"></i> More details
            </div>
            <div class="mt-2 mb-1">
                <a target="_blank" href="${parcel.courier.trackingurl}">Tracking Page <i class="bi bi-arrow-up-right"></i></a>
            </div>
        </div>

    </div>
    <br />
  `,
	)
}

export function addProductDetailsHeader(trackingNumber, orderNo) {
	$('#pd-order-' + orderNo + '-parcel-' + trackingNumber).append(
		//$('.product-details-' + i).append(
		`
      <div class="collapse" id="products-order-${orderNo}-parcel-${trackingNumber}">
          <div class="container" id="product-list-order-${orderNo}-parcel-${trackingNumber}">
              <div class="row">
                  <div class="col" style="font-size: 10px !important;">
                      <strong>Ordered Items</strong>
                  </div>
                  <div class="col" style="font-size: 10px !important;">
                      <strong>Item Number</strong>
                  </div>
              </div>
          </div>
      </div> 
    `,
	)
}

export function addProductDetails(articles, orderNo, trackingNumber) {
	for (const article of articles) {
		$('#product-list-order-' + orderNo + '-parcel-' + trackingNumber).append(
			//$('.product-list-' + i).append(
			`
        <div class="row mb-2">
          <div class="col" style="font-size: 10px !important;">
              ${article.quantity}x ${article.articleName}
          </div>
          <div class="col" style="font-size: 10px !important;">
              ${article.sku}
          </div>
        </div>
      `,
		)
	}
}

export function addCheckpointDetails(
	orderNo,
	trackingNumber,
	date,
	icon,
	title,
	subtitle,
	_cp,
	lineCode,
	svgClass,
	emailClass,
	infoTop,
  infoBottom
) {
	$('#sd-order-' + orderNo + '-parcel-' + trackingNumber).append(
		//$('.shipment-details-' + i).append(
		`
      <li class="item-1 d-flex position-relative">
        ${lineCode}
        <div class="rounded-box">
          <span class="icon-svg position-relative${svgClass}">
            ${icon}
          </span>     
        </div>
        <div class="d-flex ms-3 justify-content-between w-100 position-relative${emailClass}">
          <div class="flex-col text-max-w">
            <p class="mb-0 text-max-w text-decoration-none fw-semibold">${title}</p>
            <p class="mb-0 text-max-w fw-light small">${subtitle}</p>
            ${infoTop}
            ${infoBottom}
          </div>
          <div class="date">
            <p class="mb-0">${date.toLocaleString('en-US', {
							month: 'long',
							day: 'numeric',
						})}<br><span class="time fw-light small">${date.toLocaleString(
			'en-US',
			{
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			},
		)}</span></p>
          </div>
        </div>
      </li>
    `,
	)

	//  $(`#tt-${i}-${cp}`).tooltip()
}

export function addCheckpointSpacer(orderNo, trackingNumber) {
	$('#sd-order-' + orderNo + '-parcel-' + trackingNumber).append(
		`
      <div class="row mb-1">
        <div class="col-3" style="font-size: 10px !important;"></div>
        <div class="col-2" style="font-size: 10px !important;">
            <i class="bi bi-arrow-up"></i>
        </div>
        <div class="col-7" style="font-size: 10px !important;"></div>
      </div>
    `,
	)
}

export function displayAlert(status) {
	let message
	let alertType

	switch (status) {
		case 400:
			message = 'Please enter an order number and try again'
			alertType = 'warning'
			break
		case 401:
			message = 'Please check your authorization credentials and try again'
			alertType = 'danger'
			break
		case 403:
			message = 'Please check your authorization credentials and try again'
			alertType = 'danger'
			break
		case 404:
			message = 'No records found'
			alertType = 'info'
			break
	}
	stopProgress()
	$('#search-area').after(
		`<div id="fail-alert" class="alert alert-${alertType}" role="alert">${message}</div>`,
	)
}

export function displayToast(notificationId, color, message) {
	const toastCode = `
    <div id="resendToast-${notificationId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <svg class="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
              <rect width="100%" height="100%" fill="${color}"></rect>
          </svg>
          <strong class="me-auto">${notificationId}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
  `

	$('#toast-container').prepend(toastCode)
	const resendToast = document.getElementById(`resendToast-${notificationId}`)
	const toastBootstrap = Toast.getOrCreateInstance(resendToast)

	toastBootstrap.show()
}

export function enableReturnLink(orderNo, email) {
  // const icon = `<img src="/img/retain-icon.svg" alt="checkmark in circle" srcset="/img/retain-icon.svg" />`
   
  // $('#register-return-order-' + orderNo).html(
	// 	`<a role="button" onclick="passReturnsParams(${orderNo})" data-pl-order="${orderNo}" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">Register Return <span class="">${icon}</span></a>`,
	// )
  $('#register-return-order-' + orderNo).html(
		`<a role="button" onclick="passReturnsParams(${orderNo})" data-pl-order="${orderNo}" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">Register Return<i class="bi bi-cart-x-fill"></i></a>`,
	)
4

  $('#register-return-order-' + orderNo).on('click', function () {
      //console.log('clicked')
      // const orderInput = <HTMLInputElement>(document.getElementById('txt-signin-ref'))
      // orderInput.value = orderNo
      // orderInput.dispatchEvent(
			// 	new Event('change', { bubbles: true }),
			// )

      // const emailInput = <HTMLInputElement>(document.getElementById('txt-signin-login'))
      // emailInput.value = email
      // emailInput.dispatchEvent(
			// 	new Event('change', { bubbles: true }),
			// )

      // const returnButton = <HTMLButtonElement>(document.querySelectorAll('[data-testid="signin-submit-btn"]')[0])
      // returnButton.click()

      const refField = document.getElementById('txt-signin-ref')
			const loginField = document.getElementById('txt-signin-login')

			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				'value',
			).set
			nativeInputValueSetter.call(refField, orderNo)

			const ev2 = new Event('input', { bubbles: true })
			refField.dispatchEvent(ev2)

			nativeInputValueSetter.call(loginField, email)
			loginField.dispatchEvent(ev2)

      const returnButton = <HTMLButtonElement>(
				document.querySelectorAll('[data-testid="signin-submit-btn"]')[0]
			)
      returnButton.click()

	}) 
 
}