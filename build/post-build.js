const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
const appVersion = require('../package.json').version;
//const appVersion = require('../src/environments/environment.ts').environment.timeStamp;;
//const appVersion = require('../timeStamp.js').timeStamp;
debugger;
// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

console.log('\nRunning post-build tasks');

// our version.json will be in the dist folder
const versionFilePath = path.join(__dirname + '/../dist/nutriencms/version.json');

let mainHash = '';
let mainBundleFile = '';
debugger;
// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main-es5.?([a-z0-9]*)?(\.main-es2015)?.js$/;
debugger;
// read the dist folder files and find the one we're looking for
readDir(path.join(__dirname, '../dist/nutriencms/'))
  .then((files) => {
    debugger;
    mainBundleFile = files.find((f) => mainBundleRegexp.test(f));

    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);

      // if it has a hash in it's name, mark it down
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }

    console.log(`Writing version and hash to ${versionFilePath}`);

    // write current version and hash into the version.json file
    const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
    return writeFile(versionFilePath, src);
  })
  .then(() => {
    debugger;
    // main bundle file not found, dev build?
    if (!mainBundleFile) {
      return;
    }

    console.log(`Replacing hash in the ${mainBundleFile}`);

    // replace hash placeholder in our main.js file so the code knows it's current hash
    const mainFilepath = path.join(__dirname, '../dist/nutriencms/', mainBundleFile);
    return readFile(mainFilepath, 'utf8').then((mainFileData) => {
      const replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
      return writeFile(mainFilepath, replacedFile);
    });
  })
  .catch((err) => {
    debugger;
    console.log('Error with post build:', err);
  });
