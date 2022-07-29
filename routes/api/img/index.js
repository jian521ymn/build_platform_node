const express = require('express'),
	route = express.Router(),
    fs = require('fs')
	path = require('path'),
    mysql = require("mysql"),
    mysqlConnection = require('../../../mysql/mysql'),
    dayjs = require("dayjs")
const {
	handleMD5,
	success,
	getDepartInfo,
	getJobInfo,
	getUserInfo,
} = require('../../../utils/tools');
const {
    updateMyspl,
    queryMyspl,
    addMyspl,
} = require('../../../utils/operationMysql')
const {
	writeFile,
	readFile,
} = require('../../../utils/promiseFS');
const { createUuid } = require('../../../utils/createUuid')
const {imgProxyAxios} = require('../../../utils/imgProxyAxios')
const { fileBufferPromise } = require('../../../utils/fileBufferPromise');
const { getCookie } = require('../../../utils/getCookie');



// => 图片新增
route.post('/upload', async (req, res) => {
    const {token, type} = req.query;
    const { buffer, totalLength } = await fileBufferPromise(req) // 获得arrayBuffer，及其长度。
	const getUserInfoSql = queryMyspl({name:"USER", params:{token}}) // 编译转换为SQL指令
    const bufferConcat = Buffer.concat([...buffer], totalLength); // 拼接完整buffer，发给服务器
    const fileName = `/www/file/cc/${createUuid()}.${type}`
    fs.writeFile(fileName,bufferConcat,(err)=>{
        if(err){
            res.send(success(false,{msg:err}))
        }else{
            res.send(success(true,{data:`${fileName.replace('/www/file/','http://114.215.183.5:88/')}`}))
        }
    })
});

module.exports = route;