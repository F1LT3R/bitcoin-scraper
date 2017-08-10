const dataFile = 'data/bitcoin-history.json'

const chart = document.getElementById('chart')
const log = document.getElementById('log')
const ctx = chart.getContext('2d')
ctx.imageSmoothingEnabled= false

const width = 600
const height = 400

const setupCanvas = () => {
	ctx.width = width
	ctx.height = height
	chart.setAttribute('width', width)
	chart.setAttribute('height', height)
	chart.style.border = '1px solid black'
}

const __null__ = 1.7e+308

const findMinMax = data => {
	let max = 0
	let min = Infinity

	data.forEach(minute => {
		const usd = minute[7]

		if (usd === __null__) {
			return
		}

		if (usd > max) {
			max = usd
		}

		if (usd < min) {
			min = usd
		}
	})

	return {max, min}
}

const render = data => new Promise((resolve, reject) => {
	console.log('Rendering graph...')

	setupCanvas()

	const xratio = data.length / width
	const sampleRate = xratio / 60
	console.log(`Time sample rate (x): 1 pixel = ${sampleRate} hours`)

	const {max, min} = findMinMax(data)

	console.log(`MaxUSD = ${max}`)
	const yratio = height / max
	console.log(`USD sample rate (y): 1 pixel = ${max / height} dollars`)

	const min_u = Math.log(5) / Math.log(10)
	const max_u = Math.log(max) / Math.log(10)
	const range_u = max_u - min_u

    ctx.strokeStyle = 'black'
	ctx.moveTo(0, height)
	ctx.lineTo(width, 0)
	ctx.stroke()

    ctx.fillStyle = 'red'

	// for (let i = 0; i < 600; i += 1) {
	// 	const rowIndex = i * xratio
	// 	const row = data[Math.floor(rowIndex)]
	// 	const usd = row[7]

	// 	const x = i
	//  const y = height - (Math.log(usd) / Math.log(10) - min_u) / range_u * height

	// 	ctx.fillRect(x, y, 3, 3)
	// }

	const ratioX = width / data.length

	for (let i = 0; i < data.length; i += 10) {
		const row = data[i]
		const usd = row[7]

		// const date = row[0]
		// console.log(new Date(date), usd)

		if (usd === __null__) {
			continue
		}

		const x = i * ratioX
	    const y = height - (Math.log(usd) / Math.log(10) - min_u) / range_u * height
		ctx.fillRect(x, y, 1, 1)
	}

	chart.addEventListener('mousemove', (event) => {
		const x = event.layerX
		const y = event.layerY
		const rowIndex = x * xratio
		const row = data[Math.floor(rowIndex)]
		const usd = row[7]
		if (usd !== __null__) {
			const display = `$${usd}`
			log.innerHTML = display
		}
	})

	resolve('Finished rendering graph!')
})

const loadData = () => new Promise((resolve, reject) => {
	console.log('Fetching data...')
	const ajax = new XMLHttpRequest()

	ajax.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			console.log('Data received.')
			const data = JSON.parse(this.responseText)
			resolve(data)
		}

		if (this.status > 299) {
			reject(this.status)
		}
	}

	ajax.open('GET', dataFile, true)
	ajax.send()
})

loadData(dataFile)
.then(render)
.then(msg => {
	console.log(msg)
})
.catch(err => {
	console.error(err)
	alert('Error: see console')
})
