const dayjs = require('dayjs');
const express = require('express');
const route = express.Router();
const md5 =require('js-md5') 
const axios =require("axios")
const {
    success
} = require('jian_ymn_node')
const mysqlConnection = require('../../../mysql/mysql');
const {
    createUuid
} = require('../../../utils/createUuid');
const {
    updateMyspl,
    queryMyspl,
    addMyspl,
} = require('../../../utils/operationMysql');
const {execPromise} = require('jian_ymn_node/fs/index');
// const {page} =require('jian_ymn_node/fs/index')
const page = ({
    page_num=1,
    page_size=10
}) => {
   return `${page_size*(page_num-1)},${page_size}`
}

//=> 项目列表
route.get('/preset/list', (req, res) => {
    const {
        page_size,
        page_num,
        type,
        trade_type
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "CURRENCY",
        params: {
            isDelete: "0",
            type:trade_type,
        }
    })
    mysqlConnection({
            res,
            querySql: loginQuerySql,
        })
        .then(({
            result
        }) => {
            res.send(success(true, {
                data: result.map(item => ({
                    ...item,
                    operating_time: dayjs(item.operating_time).format('YYYY-MM-DD HH:mm:ss')
                }))
            }));
        })
});
//=> 项目新增
route.get('/preset/add', (req, res) => {
    const {
        type,
        trade_type,
        presets_name, 
        amount_menu,
        premium_factor, 
        ApiKey,
        ApiSecret, 
    } = req.query;
    const loginQuerySql = addMyspl({
        name: "CURRENCY",
        params: {
            isDelete: "0",
            type:trade_type,
            presets_name, 
            amount_menu,
            premium_factor, 
            ApiKey,
            ApiSecret,
        }
    })
    mysqlConnection({res,querySql: loginQuerySql,})
    .then(({
        result
    }) => {
        res.send(success(true, {
            data: []
        }));
    })
    .catch(err => {
        res.send(success(false,{msg:err}))
    })
});
//=> 项目删除
route.get('/preset/del', (req, res) => {
    const {
        id,
        trade_type,
        presets_name,
    } = req.query;
    const loginQuerySql = updateMyspl({
        name: "CURRENCY",
        primaryKey: {
            key: 'presets_name',
            value: presets_name,
            isString:false,
        },
        params: {
            isDelete: "1",
        }
    })
    mysqlConnection({
            res,
            querySql: loginQuerySql,
        })
        .then(({
            result
        }) => {
            res.send(success(true, {
                data: null
            }));
        })
});
//=> 项目详情
route.get('/preset/details', (req, res) => {
    const {
        id
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "CURRENCY",
        params: {
            isDelete: "0",
            id
        }
    })
    mysqlConnection({
            res,
            querySql: loginQuerySql,
        })
        .then(({
            result
        }) => {
            res.send(success(true, {
                data: result[0]
            }));
        })
});
//=> 项目更新
route.get('/preset/edit', (req, res) => {
    const {
        id,
        type,
        trade_type,
        presets_name, 
        amount_menu,
        premium_factor, 
        ApiKey,
        ApiSecret,
    } = req.query;
    const { userName='' } = req.query
    const loginQuerySql = updateMyspl({
        name: "CURRENCY",
        primaryKey: {
            key: 'id',
            value: id,
        },
        params: {
            isDelete: "0",
            type:trade_type,
            presets_name, 
            amount_menu,
            premium_factor, 
            ApiKey,
            ApiSecret,
        }
    })
    mysqlConnection({
            res,
            querySql: loginQuerySql,
        })
        .then(({
            result
        }) => {
            res.send(success(true, {
                data: null
            }));
        })
})
//=> 翻译接口
route.get('/preset/translate', (req, res) => {
    const {
        query
    } = req.query;
    const num = Math.random()
    const params={
           q:query,
           from:'auto',
           appid:'20221121001462821',
           to:'auto',
           salt:num,
           sign: md5(`20221121001462821${query}${num}194zV8AXmupUenoT1M1d`)
       }
       console.log(params,'params')
   axios.get('https://fanyi-api.baidu.com/api/trans/vip/translate',{params}).then(res_=>{
       res.send(success(true, {
                data: res_.data
            }));
   }).catch(err=>{
       console.log(err,'err')
       res.send(success(true, {
                data: 'err'
            }));
   })
});





module.exports = route;