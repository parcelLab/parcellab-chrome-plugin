export function mergeAndSortAscendingDate(arrA, arrB) {
	return [...arrA, ...arrB].sort(
		(objA, objB) =>
			Number(new Date(objA.timestamp)) - Number(new Date(objB.timestamp)),
	)
}

export function sortByColorPriority(arr) {
	return arr.sort(
		(a, b) => a.actionBox.colorPriority - b.actionBox.colorPriority,
	)
}

export function filterHiddenEvents(arr) {
	return arr.filter(function (obj) {
		//if (obj.hasOwnProperty('type')) {
		if (Object.prototype.hasOwnProperty.call(obj, 'type')) {
			return obj
		} else if (
			Object.prototype.hasOwnProperty.call(obj, 'shown') &&
			obj.shown
		) {
			return obj
		}
	})
}

export function isEmail(input) {
	const validRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

	if (input.match(validRegex)) {
		return true
	} else {
		return false
	}
}

export function subtractDays(date, days) {
	const dateCopy = new Date(date)

	dateCopy.setDate(dateCopy.getDate() - days)

	return dateCopy
}
