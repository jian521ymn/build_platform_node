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



// => 头像修改新增
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
    return
    mysqlConnection({querySql:getUserInfoSql,res})
    .then(({result})=>{
        const {uuid:fileName} =dateFilter(result[0]);
        const bufferConcat = Buffer.concat([...buffer], totalLength); // 拼接完整buffer，发给服务器
        console.log(bufferConcat,'buffer')
        return imgProxyAxios({fileName,type,buffer:bufferConcat}) // 链式调用，图片服务器存储并返回路径。
    }).then(resultDate=>{
        const {code,msg,data:{url}} = resultDate.data || {};
        // 图片服务如果挂掉直接抛出异常
        if(code !== 0) {
            res.send(success(false,{msg:msg}))
            return
        }
        // 图片服务完成时，将图片远程地址，写入目标数据库。
        const params = {
            name:'USER',
            params:{imageUrl: url},
            primaryKey:{key:'token',value:token}
        }
    	const updateUserSql = updateMyspl(params)
        mysqlConnection({querySql:updateUserSql,res})
        .then(({result})=>{
            res.send(success(true, {msg: 'Ok',data:{url}}));
        })
    }).catch(e=>res.send(success(false,{msg:'未知异常'})))
});

module.exports = route;