var escapeXmlAttr = require('./escapeXml').attr;

module.exports = function(name, value, escapeXml) {
    if (value === null || value === true) {
        value = '';
    } else if (value === undefined || value === false || typeof value === 'string' && value.trim() === '') {
        return '';
    } else {
        value = '="' + (escapeXml === false ? value : escapeXmlAttr(value)) + '"';
    }
    return ' ' + name + value;
};