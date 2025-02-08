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
const multiparty = require( "multiparty" )
const load = require('audio-loader')



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
            res.send(success(true,{data:`${fileName.replace('/www/file/','http://47.94.11.121:88/')}`}))
        }
    })
});
// MP3语音新增
route.post('/voice', (req, res)=>{
    const token =req.query?.token || getCookie(req)?.token || req?.cookies.token || ''
    let from = new multiparty.Form({
        uploadDir: '/www/file/voice' // 指定文件存储目录
    });
    from.parse(req,(err, fields, files)=>{
        try {
            let inputFile  = files.files[0];
            let uploadedPath = inputFile.path;
            //同步重命名文件名 fs.renameSync(oldPath, newPath)
            // fs.renameSync(inputFile.path, newPath);
            load(uploadedPath).then(function (res_) {
                var duration = res_.duration.toFixed(1)
                console.log(duration,'duration')
                fs.renameSync(uploadedPath, uploadedPath.replace('.mp3',`-dur${duration}.mp3`));
                console.log(uploadedPath.replace('.mp3',`-dur${duration}.mp3`).replace('/www/file/','http://47.94.11.121:88/'),'777')
                //获取音频时长
                res.send(uploadedPath.replace('.mp3',`-dur${duration}.mp3`).replace('/www/file/','http://47.94.11.121:88/'));
            });
          } catch (err) {
            console.log(err);
            res.send({ err: "上传失败！" });
          };
    })
})
module.exports = route;