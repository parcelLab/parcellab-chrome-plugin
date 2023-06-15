import * as bootstrap from 'bootstrap'
import { clearLastResult, setLastResult } from './storage'

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
    '<div class="d-flex justify-content-center" id="progress"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span><br /></div><br /></div>'
  )
  $('#search-btn').prop('disabled', true)
}

export function stopProgress() {
  $('#progress').remove()
}

export function enableControls() {

  $('.toggle-control').on('click', function () {
    $(this).toggleClass('bi-chevron-compact-down bi-chevron-compact-up')
    setLastResult($('#resultsPanel').html())
  })


  $('#closePanel').on('click', function () {
    $('#resultsPanel').html('')
    clearLastResult()
  })

  const collapseElementList = [].slice.call(
    document.querySelectorAll('.collapse')
  )
  const _collapseList = collapseElementList.map(function (collapseEl) {
    return new bootstrap.Collapse(collapseEl, {
      toggle: false,
    })
  })

  // const tooltipElementList = [].slice.call(
  //   document.querySelectorAll('.pl-tt')
  // )
  // console.log(tooltipElementList)
  // const _tooltipList = tooltipElementList.map(function (tooltipEl) {
  //   const _tooltip = new bootstrap.Tooltip(tooltipEl)
  // })  
}

export function addOrderInformation(orderNo, parcelsCount) {
  $('#resultsPanel').html(
    `
      <div class="container small" id="order-info">
          <div class="row">
              <div class="col-5">
                  ORDER NUMBER:
              </div>
              <div class="col">
                  ${orderNo}
              </div>
              <div class="col-2">
                  <button type="button" class="btn-close float-end" aria-label="Close" id="closePanel"></button>
              </div>
          </div>
          <div class="row">
              <div class="col" >
                  PACKAGES (${parcelsCount})
              </div>
          </div>
      </div>
      <hr class="bg-secondary border-2 border-top border-secondary divider">
      <div class="container" id="parcels"></div>
    `
  )
}

export function addTrackingCard(parcel, i, packageText, displayIndex, displayCount) {
  $('#parcels').append(
		`
    <div class="container bg-light border border-light-subtle rounded-top-3 small">
        <div class="mt-2 d-flex">
            <div class="flex-fill">
                ${parcel.courier.prettyname} ${parcel.tracking_number}
            </div>
            <div class="flex-fill text-end">
                <a data-bs-toggle="collapse" href="#parcel-${i}" role="button" aria-expanded="false" aria-controls="parcel-${i}"><i class="bi toggle-control bi-chevron-compact-down tracking-details"></i></a>
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
	);
}

export function addSubCards(parcel, i) {
  $('#parcels').append(
    `
    <div class="collapse" data-bs-target="parcel-${i}" id="parcel-${i}">

        <div class="container border border-light-subtle small shipment-details-${i}" >
            <div class="mt-2 mb-2">
                <i class="bi bi-box-seam-fill"></i> Shipment details
            </div>
        </div>

        <div class="container border border-light-subtle small product-details-${i}" >
            <div class="row mt-2 mb-2">
                <div class="col">
                    <i class="bi bi-cart-fill"></i> Product details
                </div>
                <div class="col text-end">
                    <a data-bs-toggle="collapse" href="#products-${i}" role="button" aria-expanded="false" aria-controls="products-${i}"><i class="bi toggle-control bi-chevron-compact-down product-details"></i></a>
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
  `
  )
}

export function addProductDetailsHeader(i) {
  $('.product-details-' + i).append(
    `
      <div class="collapse" id="products-${i}">
          <div class="container product-list-${i}">
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
    `
  )
}

export function addProductDetails(articles, i) {
  for (const article of articles) {
    $('.product-list-' + i).append(
      `
        <div class="row mb-2">
          <div class="col" style="font-size: 10px !important;">
              ${article.quantity}x ${article.articleName}
          </div>
          <div class="col" style="font-size: 10px !important;">
              ${article.sku}
          </div>
        </div>
      `
    )
  }
}

export function addCheckpointDetails(date, icon, title, subtitle, i, _cp) {
  $('.shipment-details-' + i).append(
    `
      <div class="row mb-1">
        <div class="col-3" style="font-size: 10px !important;">
              <strong>${date.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
              })}</strong><br />
            ${date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
        </div>
        <div class="col-2" style="font-size: 10px !important;">
            <i class="bi ${icon}"></i>
        </div>
        <div class="col-7" style="font-size: 10px !important;">
            <strong>${title}</strong><br />
            ${subtitle}
        </div>
      </div>
    `
  )

  //  $(`#tt-${i}-${cp}`).tooltip()
}

export function addCheckpointSpacer(i) {
  $('.shipment-details-' + i).append(
    `
      <div class="row mb-1">
        <div class="col-3" style="font-size: 10px !important;"></div>
        <div class="col-2" style="font-size: 10px !important;">
            <i class="bi bi-arrow-up"></i>
        </div>
        <div class="col-7" style="font-size: 10px !important;"></div>
      </div>
    `
  )
}

export function displayAlert(status) {
  let message
  let alertType

  switch (status) {
		case 400:
			message = 'Please enter an order number and try again';
			alertType = 'warning';
			break;
		case 401:
			message = 'Please check your authorization credentials and try again';
			alertType = 'danger';
			break;
		case 403:
			message = 'Please check your authorization credentials and try again';
			alertType = 'danger';
			break;
		case 404:
			message = 'No records found';
			alertType = 'info';
			break;
	}
  $('#search-area').after(
    `<div id="fail-alert" class="alert alert-${alertType}" role="alert">${message}</div>`
  )
}