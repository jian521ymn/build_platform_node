// 数据库操作
var mysql = require("mysql")
const {
    handleMD5,
    success,
    getDepartInfo,
    getJobInfo,
    getUserInfo,
} = require('../utils/tools');
const {
    queryMyspl
} = require('../utils/operationMysql');
const mysqlConfig = require("./mysqlConfig");
const DefaultSqlConfigName = 'build_platform'
/**
 * 
 * @param {*} querySql 执行的sql指令 
 * @param {*} res 响应体，能够注入参数和抛异常
 * @param {*} isSearchList 是否需要分页查询总数 
 * @param {*} checkParams 需要校验的参数列表，定制化（非通用） 
 * @param {*} querySql 执行的sql指令 
 * @returns {result, total?}
 */

async function mysqlConnection(params) {
    const {
        querySql,
        res,
        isSearchList,
        checkParams,
        sqlConfigName
    } = params;
    // 和本地数库建立连接
    var connection = mysql.createConnection(mysqlConfig[sqlConfigName || DefaultSqlConfigName])
    const {
        code,
        msg,
        result
    } = await new Promise((resolve, reject) => {
        // 数据库连接成功回调
        try {
            connection.connect(function (err) {
                if (err) {
                    console.log("连接错误");
                    resolve({
                        code: 1,
                        msg: "数据库连接错误" + err,
                        result: []
                    })
                    return;
                }
                resolve({
                    code: 0,
                    msg: "OK",
                    result: []
                })
            })
        } catch (error) {
            resolve({
                code: 1,
                msg: "数据库连接错误" + error,
                result: []
            })
        }
    })
    // 数据库连接错误时,将错误报出去
    if (code !== 0) {
        res.send(success(false, {
            msg
        }))
        return new Promise((resolve, reject) => resolve({
            code,
            msg,
            result
        }))
    }
    // sql 为数组时，进行循环操作每个SQL，并将每个sql的结果缓存住
    if (Array.isArray(querySql)) {
        let promiseAll = querySql.reduce((ary, next, index) => {
            let promise = new Promise((resolve, reject) => {
                connection.query(checkParams[index], (err1, result1) => {
                    if (err1 || (result1 && result1.length > 0)) {
                        resolve({
                            code: 1,
                            index
                        });
                        return
                    }
                    connection.query(next, (err, result) => {
                        if (err) {
                            resolve({
                                code: 1,
                                index
                            })
                            return
                        }
                        resolve({
                            code: 0
                        })
                    })
                })
            }).catch(e => {
                reject({
                    code: 1,
                    msg: e
                })
            })
            ary.push(promise)
            return ary
        }, [])
        return Promise.all(promiseAll)
    }
    return new Promise((res_, rej_) => {
        const connectionEnd = () => {
            //停止链接数据库，必须再查询语句后，要不然一调用这个方法，就直接停止链接，数据操作就会失败
            connection.end(function (err) {
                if (err) {
                    console.log('关闭数据库连接失败！');
                    throw err;
                }
            });
        }
        const resolve = (data) => {
            res_(data)
            connectionEnd()
        }
        const reject = (data) => {
            rej_(data)
            connectionEnd()
        }
        connection.query(querySql, (err, result) => {
            if (err) {
                res.send(success(false, {
                    msg: `SQL error: ${err}!`
                }));
                reject()
                return
            }
            if (isSearchList) {
                connection.query("SELECT FOUND_ROWS()", (err, resultTotal) => {
                    if (err) {
                        res.send(success(false, {
                            msg: `SQL error: ${err}!`
                        }));
                        reject()
                        return
                    }
                    const total = (resultTotal[0] || {})['FOUND_ROWS()']
                    resolve({
                        result,
                        total
                    })
                })
                return
            }
            resolve({
                result
            })

        })
    })
    return
}

module.exports = mysqlConnection