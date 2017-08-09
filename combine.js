const getJSON = require('get-json')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')

const outputFile = process.argv.slice(2)[0]
const dataDir = 'data'

console.log(chalk.green(figlet.textSync('Bitcoin Chart Scraper', {
	font: 'pepper',
	kerning: 'fitted'
})))
console.log(chalk.dim(`Combining data to=${chalk.yellow(outputFile)} \n`))

const files = []

function compare (a, b) {
	if (a.date < b.date) {
		return -1
	}

	if (a.date > b.date) {
		return 1
	}

	return 0
}

fs.readdir(dataDir, (err, list) => {
	list.forEach(file => {
		const date = new Date(file.split('bitstampUSD-')[1].split('.json')[0])
		const time = date.getTime()

		if (!date) {
			return
		}

		files.push({
			file,
			date,
			time
		})
	})

	files.sort(compare)

	let combinedData = []

	process.stdout.write('\n')

	files.forEach(day => {
		const filePath = path.join(dataDir, day.file)
		const contents = require(path.join(__dirname, filePath))
		combinedData = combinedData.concat(contents)
		process.stdout.write('.')
	})

	const outputData = JSON.stringify(combinedData)

	fs.writeFile(outputFile, outputData, 'utf8', err => {
		process.stdout.write('\n')

		if(err) {
			return console.error(chalk.red(err))
		} else {
			console.log(`Saved to: ${chalk.blue(outputFile)}`)
		}
	})
})