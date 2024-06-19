var replace = require('replace-in-file');
var dateObj = new Date();    
    var year = (dateObj.getFullYear()).toString().substr(2);
    var month = dateObj.getMonth()+1; 
    var date = dateObj.getDate();
    var HH = dateObj.getHours();
var timeStamp = year+'.'+month+'.'+date+'.'+HH;
const options = {
files: [
'src/environments/environment.ts',
'src/environments/environment.prod.ts',
],
from: /timeStamp: '(.*)'/g,
to: "timeStamp: '" + timeStamp + "'",
allowEmptyPaths: false,
};
try {
let changedFiles = replace.sync(options);
if (changedFiles == 0) {
throw "Please make sure that the file '" + options.files + "' has \"timeStamp: ''\"";
}
console.log('Build timestamp is set to: ' + timeStamp);
} catch (error) {
console.error('Error occurred:', error);
throw error
}