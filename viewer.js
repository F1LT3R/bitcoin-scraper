const chart = document.getElementById('chart')
const ctx = chart.getContext('2d')
console.log(ctx)
const dataFile = 'data/bitcoin-history.json'

const width = 600
const height = 400

const setupCanvas = () => {
	ctx.width = width
	ctx.height = height
	chart.setAttribute('width', width)
	chart.setAttribute('height', height)
	chart.style.border = '1px solid black'
}

const findMax = data => {
	let maxUsd = 0
	data.forEach(minute => {
		const usd = minute[7]
		if (usd > maxUsd && usd !== 1.7e+308) {
			maxUsd = usd
		}
	})

	return maxUsd
}

const render = data => new Promise((resolve, reject) => {
	console.log('Rendering graph...')

	setupCanvas()

	const xratio = data.length / width
	const sampleRate = xratio / 60
	console.log(`Time sample rate (x): 1 pixel = ${sampleRate} hours`)

	const maxUsd = findMax(data)
	console.log(`MaxUSD = ${maxUsd}`)
	const yratio = maxUsd / height
	console.log(`USD sample rate (y): 1 pixel = ${yratio} dollars`)

	for (let i = 0; i < 600; i += 1) {
		const rowIndex = i * xratio
		const row = data[Math.floor(rowIndex)]
		const usd = row[7]
		const date = row[0]
		console.log(date, usd)

		const x = i
		const y = Math.floor(height - (height / maxUsd * usd))
		ctx.fillRect(x, y, 1, 1)
	}


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
