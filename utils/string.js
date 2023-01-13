function stringToHex(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    return val;
}
function hexToString(str) {
    let strArray = str.split(',');
    let retStr;
    strArray.forEach(element=>{
        retStr === undefined ? retStr = String.fromCodePoint(`0x${element}`) : retStr += String.fromCodePoint(`0x${element}`);
    })
    return retStr;
}
module.exports={
    stringToHex,
    hexToString,
}