

// 数据库操作
var mysql = require("mysql")
const {
	handleMD5,
	success,
	getDepartInfo,
	getJobInfo,
	getUserInfo,
} = require('../utils/tools');
const { queryMyspl } =require('../utils/operationMysql')
async function mysqlConnection (params) {
    const {querySql,res,isSearchList, checkParams, isCheckSso = true} =params;
    const isProd = !process.argv.includes('--dev')
    // 和本地数库建立连接
    var connection = mysql.createConnection({
      connectionLimit: 500,
      host: isProd ? 'localhost' : '47.94.11.121', //远程MySQL数据库的ip地址
      user: "build_platform",
      password: "AhAtcEyyjSeSijWE",
      database: "build_platform"
    })
    const {code, msg, result} = await new Promise((resolve,reject)=>{
         // 数据库连接成功回调
        connection.connect(function (err) {
            if (err) {
                console.log("连接错误");
                resolve({code:1,msg:"数据库连接错误"+err,result:[]})
                return;
            }
            resolve({code :0, msg:"OK", result:[]})
        })
    })
    // 数据库连接错误时,将错误报出去
    if(code !== 0) {
        res.send(success(false, {msg}))
        return new Promise((resolve,reject)=>resolve({code,msg,result}))
    }
    // sql 为数组时，进行循环操作每个SQL，并将每个sql的结果缓存住
    if ( Array.isArray(querySql)) {
        let promiseAll =querySql.reduce((ary,next,index)=>{
            let promise =new Promise((resolve,reject)=>{
                  connection.query(checkParams[index],(err1,result1)=>{
                      if(err1 || (result1 && result1.length > 0)){
                          resolve({code:1,index});
                          return
                      }
                       connection.query(next,(err,result)=>{
                            if(err){
                                resolve({code:1,index})
                                return    
                            }
                            resolve({code:0})
                    })
                  })
            }).catch(e=>{reject({code:1,msg:e})})
         ary.push(promise)
         return ary
        },[])
        return Promise.all(promiseAll)
    }
    return new Promise((res_,rej_)=>{
            const connectionEnd = () =>{
                //停止链接数据库，必须再查询语句后，要不然一调用这个方法，就直接停止链接，数据操作就会失败
                connection.end(function(err){
                    if(err){
                        console.log('关闭数据库连接失败！');
                        throw err;
                    }
                });
            }
            const resolve = (data) =>{
                res_(data)
                connectionEnd()
            }
            const reject = (data) =>{
                rej_(data)
                connectionEnd()
            }
            connection.query(querySql,(err,result)=>{
                if(err){
                    res.send(success(false, {msg: `SQL error: ${err}!`}));
                    reject()
                    return    
                }
                if(isSearchList){
                    connection.query("SELECT FOUND_ROWS()",(err,resultTotal)=>{
                        if(err){
                            res.send(success(false, {msg: `SQL error: ${err}!`}));
                            reject()
                            return    
                        }
                       const total =(resultTotal[0] || {})['FOUND_ROWS()']
                       resolve({result,total})
                    })  
                    return
                }
                resolve({result})
        
                })
            })
    return
}

module.exports = mysqlConnection
