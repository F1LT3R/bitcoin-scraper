const getJSON = require("get-json");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const figlet = require("figlet");
const mkdirp = require("mkdirp");

const maxStreams = 4;
const dataDir = "data";

mkdirp(path.join(__dirname, "data"));

const market = "bitstampUSD";
const now = new Date();

// Known holes in data
// bitstampUSD-2011-10-16
// bitstampUSD-2011-10-17
// bitstampUSD-2011-10-19
// bitstampUSD-2011-10-20
// bitstampUSD-2011-10-23
// bitstampUSD-2011-10-24
// bitstampUSD-2011-10-28
// bitstampUSD-2011-11-03
// bitstampUSD-2011-11-04
// bitstampUSD-2011-11-08
// bitstampUSD-2011-11-24
// bitstampUSD-2011-11-28
// bitstampUSD-2011-12-05
// bitstampUSD-2011-12-10
// bitstampUSD-2011-12-18
// bitstampUSD-2015-01-07
// bitstampUSD-2015-01-08
// bitstampUSD-2015-01-09

const dates = {
  from: {
    year: 2011,
    month: 10,
    day: 14,
  },

  //    from: {
  // 	  year: 2020,
  // 	  month: 05,
  // 	  day: 19
  //    },

  to: {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getUTCDate(),
  },
};

const baseApiUrl = "http://bitcoincharts.com/charts/chart.json?";

// Full parms: m=bitstampUSD&SubmitButton=Draw&r=60&i=1-min&c=1&s=2011-09-14&e=2011-09-14&Prev=&Next=&t=S&b=&a1=&m1=10&a2=&m2=25&x=0&i1=&i2=&i3=&i4=&v=1&cv=0&ps=0&l=0&p=0&
const formatApiUrl = (market, date) => {
  const apiUrl = `${baseApiUrl}m=${market}&SubmitButton=Draw&r=60&i=1-min&c=1&s=${date}&e=${date}&Prev=&Next=&t=S&b=&a1=&m1=10&a2=&m2=25&x=0&i1=&i2=&i3=&i4=&v=1&cv=0&ps=0&l=0&p=0&`;
  return apiUrl;
};

console.log(
  chalk.green(
    figlet.textSync("Bitcoin Chart Scraper", {
      font: "Pepper",
      kerning: "fitted",
    })
  )
);
console.log(
  chalk.dim(`Running with maxStreams=${chalk.yellow(maxStreams)} \n`)
);

const url = (baseurl, date) => {
  return baseurl + date;
};

Date.prototype.addDays = function (days) {
  const dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
};

const getDates = (startDate, stopDate) => {
  const dateArray = new Array();
  let currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate);
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
};

const start = new Date(dates.from.year, dates.from.month - 1, dates.from.day);
const end = new Date(dates.to.year, dates.to.month - 1, dates.to.day);
const dateStack = getDates(start, end);

const go = () =>
  new Promise((resolve, reject) => {
    if (dateStack.length === 0) {
      return resolve("Done!");
    }

    const pipeline = [];

    for (let i = 0; i < maxStreams; i += 1) {
      const date = dateStack.shift();

      if (!date) {
        continue;
      }

      const prettyDate = date.getFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate();
      const fileDate = date.getFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0");
      const dataPath = formatApiUrl(market, fileDate);
      // console.log({fileDate});
      const fileName = `${market}-${fileDate}.json`;
      const filePath = path.join(dataDir, fileName);

      // Don't re-download if thie file already exists
      if (fs.existsSync(filePath)) {
        console.log(`Passover: ${chalk.magenta(filePath)} (already exists)`);
        continue;
      }

      pipeline.push(
        new Promise((resolve, reject) => {
          console.log(
            `Fetching: ${chalk.yellow(prettyDate)} - ${chalk.yellow.dim(
              dataPath
            )}`
          );

          getJSON(dataPath, (error, response) => {
            let cursoryUsd = null;

            if (response === undefined) {
              console.log(
                chalk.red(
                  `Received "Undefined" data for ${chalk.white(
                    prettyDate
                  )}. Too many streams? (Data for ome dates are not available, eg: '2011-10-1')`
                )
              );
            }

            if (response !== undefined) {
              cursoryUsd = response[0][7];
              console.log(
                `Received: ${chalk.green(prettyDate)} - ${chalk.red(
                  "$" + cursoryUsd
                )}`
              );
            }

            const output = JSON.stringify(response || [], null, 2);

            fs.writeFile(filePath, output, "utf8", (err) => {
              if (err) {
                return reject(err);
                resolve("Ok");
              } else {
                console.log(`Saved to: ${chalk.blue(filePath)}`);
                resolve("Ok");
              }
            });
          });
        })
      );
    }

    Promise.all(pipeline)
      .then(() => {
        resolve(go());
      })
      .catch((err) => {
        reject(err);
      });
  });

go()
  .then(() => {
    console.log(chalk.magenta("DONE!"));
  })
  .catch((err) => {
    console.error(err);
  });
