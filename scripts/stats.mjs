#!/usr/bin/env node

import https from 'https';
import url from 'url';
import Chartscii from 'chartscii';
import yargs from 'yargs';

const { article, carousel, preview, ratio } = yargs
  .option('article', {
    alias: 'a',
    type: 'string',
    demand: true
  })
  .option('carousel', {
    alias: 'c',
    type: 'number',
    default: 1
  })
  .option('preview', {
    alias: 'p',
    type: 'boolean',
    default: false
  })
  .option('ratio', {
    alias: 'r',
    type: 'boolean',
    default: true
  }).argv;

const getData = async name =>
  new Promise((resolve, reject) => {
    https
      .get(
        url.format({
          protocol: 'https',
          hostname: 'us-central1-poll-counters.cloudfunctions.net',
          pathname: '/get',
          query: {
            group: `content-carousel_behaviour__${name}`,
            question: `${article}__${carousel}${preview ? '__PREVIEW' : ''}`
          }
        }),
        res => {
          const { statusCode } = res;
          const contentType = res.headers['content-type'];

          let error;

          if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
          } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
          }

          if (error) {
            console.error(error.message);
            res.resume();
          }

          res.setEncoding('utf8');

          let rawData = '';

          res.on('data', chunk => {
            rawData += chunk;
          });

          res.on('end', () => {
            try {
              const parsedData = JSON.parse(rawData);

              if (Array.isArray(parsedData.value)) {
                return resolve(
                  parsedData.value.reduce((obj, val, key) => {
                    if (typeof val === 'number') {
                      obj[key] = val;
                    }

                    return obj;
                  }, {})
                );
              }

              resolve(parsedData.value);
            } catch (e) {
              reject(e.message);
            }
          });
        }
      )
      .on('error', e => {
        reject(`Got error: ${e.message}`);
      });
  });

const getChartsciiData = (dict, formatKey = x => x) =>
  Object.keys(dict).map(key => ({ value: dict[key], label: formatKey(key) }));

const getChartciiChart = (dict, label, formatKey) =>
  new Chartscii(getChartsciiData(dict, formatKey), {
    label,
    theme: 'lush',
    width: 50,
    fill: '░',
    sort: false,
    reverse: true,
    percentage: ratio,
    color: 'pink'
  });

try {
  const [numberSlidesSeen, percentageSlidesSeen, directionalNavivgation, triedToClickHint] = await Promise.all([
    getData('number-slides-seen'),
    getData('percentage-slides-seen'),
    getData('directional-navigation'),
    getData('tried-to-click-hint')
  ]);

  console.log({
    article,
    carousel,
    preview,
    numberSlidesSeen,
    percentageSlidesSeen,
    directionalNavivgation,
    triedToClickHint
  });

  if (numberSlidesSeen) {
    console.log(
      getChartciiChart(
        numberSlidesSeen,
        `Number of slides seen on carousel ${carousel} in article ${article}${preview ? ' (preview)' : ''}`
      ).create()
    );
  }

  if (percentageSlidesSeen) {
    console.log(
      getChartciiChart(
        percentageSlidesSeen,
        `Percentage of slides seen on carousel ${carousel} in article ${article}${preview ? ' (preview)' : ''}`,
        x => `${x}%`
      ).create()
    );
  }

  if (directionalNavivgation) {
    console.log(
      getChartciiChart(
        directionalNavivgation,
        `Directional navigation used on carousel ${carousel} in article ${article}${preview ? ' (preview)' : ''}`
      ).create()
    );
  }

  if (triedToClickHint) {
    console.log(
      getChartciiChart(
        triedToClickHint,
        `Was slide deck icon hint clicked on carousel ${carousel} in article ${article}${preview ? ' (preview)' : ''}?`
      ).create()
    );
  }
} catch (e) {
  console.error(e);
}
