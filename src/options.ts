// Import our custom CSS
import '../styles/common.scss'

// Import all of Bootstrap's JS
//import * as bootstrap from 'bootstrap'

import { getOptions, setOptions, StorageOptions } from './storage'

const { user, token, language } = getOptions()

if (user !== undefined) {
    $('#user').val(user)
}
if (token !== undefined) {
    $('#token').val(token)
}
if (language !== undefined) {
    $('#language').val(language)
}


$(document).ready(function () {

    $('.fc').on('change', function () {
        if ( $(this).val() == '' ) {
            $(this).addClass('is-invalid')
        } else {
            $(this).removeClass('is-invalid')
        }
    })

    $('#save-btn').on('click', function () {
        let valid = true
        const options:StorageOptions = {user, token, language}
        type ObjectKey = keyof typeof options

        $('.fc').each(function () {
            const val:string = $(this).val() as string

            if (val == '') {
                $(this).addClass('is-invalid')
                valid = false
            } else {
                const myKey = $(this).attr('id') as ObjectKey
                options[myKey] = val
            }   
        })

        if (valid) {
            setOptions(options)
            window.close()
        }
    })
})