const getJSON = require('get-json')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')

const dataDir = 'data'
const maxstreams = 8

console.log(chalk.green(figlet.textSync('Bitcoin Chart Scraper', {
	font: 'pepper',
	kerning: 'fitted'
})))
console.log(chalk.dim(`Running with maxstreams=${chalk.yellow(maxstreams)} \n`))

const fetch = {
  market: 'bitstampUSD',

  from: {
  	year: 2011,
  	month: 9,
  	day: 13
  },

  to: {
  	year: 2017,
  	month: 08,
  	day: 9
  },

  dataSourceURL: 'http://bitcoincharts.com/charts/chart.json?'+'m='+'bitstampUSD'+'&r=1&i=1-min&e'
}

const url = (baseurl, date) => {
  return baseurl + date
}

Date.prototype.addDays = function(days) {
  const dat = new Date(this.valueOf())
  dat.setDate(dat.getDate() + days)
  return dat
}

const getDates = (startDate, stopDate) => {
  const dateArray = new Array()
  let currentDate = startDate
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = currentDate.addDays(1)
  }
  return dateArray
}

const start = new Date(fetch.from.year, fetch.from.month - 1, fetch.from.day)
const end = new Date(fetch.to.year, fetch.to.month - 1, fetch.to.day)
const dates = getDates(start, end)


const go = () => new Promise((resolve, reject) => {
	if (dates.length === 0) {
		return resolve('Done!')
	}

	const pipeline = []

	for (let i = 0; i < maxstreams; i += 1) {
		const date = dates.pop()

		if (!date) {
			continue
		}

		const prettyDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getUTCDate()
		const dataPath = fetch.dataSourceURL + prettyDate
		const fileName = `${fetch.market}-${prettyDate}.json`
		const filePath = path.join(dataDir, fileName)

		// Don't re-download if thie file already exists
		if (fs.existsSync(filePath)) {
			console.log(`Passover: ${chalk.magenta(filePath)} (already exists)`)
			continue
		}

		pipeline.push(new Promise((resolve, reject) => {
			console.log(`Fetching: ${chalk.yellow(prettyDate)}`)

			getJSON(dataPath, (error, response) => {
				console.log(`Recevied: ${chalk.green(prettyDate)}`)

				if (response === undefined) {
					console.log(chalk.red('Received "Undefined" data for ${chalk.white(prettyDate)}. You may do well to lower the streams.'))
					resolve('Zoinks!!')
				}

				const output = JSON.stringify(response)

				fs.writeFile(filePath, output, 'utf8', err => {
					if(err) {
						return reject(err)
					} else {
						console.log(`Saved to: ${chalk.blue(filePath)}`)
						resolve('Ok')
					}
				})
			})
		}))
	}

	Promise.all(pipeline).then(() => {
		resolve(go())
	}).catch(err => {
		reject(err)
	})
})

go().then(() => {
	console.log(chalk.magenta('DONE!'))
}).catch(err => {
	console.error(err)
})