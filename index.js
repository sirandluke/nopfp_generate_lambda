require('dotenv').config();
const log = require('simple-node-logger').createSimpleLogger()
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { choosePalette } = require('./choosePalette.js');
const { uploadS3 } = require('./uploadS3.js');
const TEMPLATE_PATH = 'files/template_pfp.svg';
const TMP_DIR = '/tmp/';


function cleanTmpDir() {
  fs.readdir(TMP_DIR, (err, files) => {
    if (err) log.error(`Could not glear /tmp: ${err}`);
    for (const file of files) {
      fs.unlink(path.join(TMP_DIR, file), err => {
        if (err) log.error(`Could not delete file: ${err}`);
      });
    }
  })
}


exports.handler = async function (event, context) {
  return new Promise((resolve, reject)=> {
    log.info('<--BEGIN SESSION-->')
    log.info('Reading template pfp.');
    var data;
    try {
      data = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    } catch (err) {
      log.error(err);
      reject(false)
    }
    choosePalette().then(palette => {
      let a = palette.colorA;
      let b = palette.colorB;

      var pfpName = `${a.name.replace(' ', '_')}&${b.name.replace(' ', '_')}`;
      var fileName = pfpName + '.svg';

      // Modify template with color palette.
      const $ = cheerio.load(data, {xmlMode: true});
      log.info(`Setting pfp title ${pfpName}`);
      $('title').text = pfpName;
      log.info(`Setting #background color: ${a.hex}`);
      $('#background').attr('fill', a.hex);
      log.info(`Setting #head and #body color: ${b.hex}`);
      $('#head').attr('fill', b.hex);
      $('#body').attr('fill', b.hex);

      // Save to file.
      let filePath = path.join(TMP_DIR, fileName)
      try {
        log.info(`Writing to ${filePath}`);
        fs.writeFileSync(filePath, $.html());
      } catch (err) {
        log.error(err);
        reject(false);
      }

      // Upload to S3 bucket
      uploadS3(filePath, fileName).then((_) => {
        log.info('Upload successful');
      }).catch(err => {
        log.error(`Upload to S3 failed: ${err}`);
      }).finally( () => {
        log.info('<--END SESSION-->');
        cleanTmpDir();
        resolve(true);
      });

    }).catch(err => {
      log.error(`Unable to retrieve palette: ${err}`);
      log.info('<--END SESSION-->')
      reject(false)
    })
    });
}
