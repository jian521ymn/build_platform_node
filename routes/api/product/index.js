const dayjs = require('dayjs');
const express = require('express');
const route = express.Router();
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
route.get('/list', (req, res) => {
    console.log(res.ccokie,'rescookie');
    const {
        page_size,
        page_num
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "PRODUCT",
        params: {
            isDelete: "0",
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
route.post('/add', (req, res) => {
    const {
        product_name,
        product_desc,
        product_url,
    } = req.body;
    const loginQuerySql = addMyspl({
        name: "PRODUCT",
        params: {
            isDelete: "0",
            product_name,
            product_desc,
            product_url,
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
route.get('/delete', (req, res) => {
    const {
        id
    } = req.query;
    const loginQuerySql = updateMyspl({
        name: "PRODUCT",
        primaryKey: {
            key: 'id',
            value: id,
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
route.get('/details', (req, res) => {
    const {
        id
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "PRODUCT",
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
route.post('/edit', (req, res) => {
    const {
        id,
        product_name,
        product_desc,
        product_url,
    } = req.body;
    const { userName='' } = req.query
    const loginQuerySql = updateMyspl({
        name: "PRODUCT",
        primaryKey: {
            key: 'id',
            value: id,
        },
        params: {
            isDelete: "0",
            product_name,
            product_desc,
            product_url,
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


// 创建部署记录
route.post('/record_create', (req, res) => {
    const params =req.body
    const querySql = addMyspl({
        name: "PRODUCT_RECORD",
        params: {
            ...params,
            operating_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
    })
    mysqlConnection({res,querySql}).then(res_=>{
        res.send(success(true,{data:null}))
    }).catch(err => {
        res.send(success(false,{data:null}))
    })
})
//=> 查询部署记录
route.get('/record', (req, res) => {
    const {date} = req.query;
    const querySql = queryMyspl({
        name: "PRODUCT_RECORD",
        params: {
            date:`%${date}%`
        },
        sort:{operating_time:"DESC"}
    })
    mysqlConnection({res,querySql,isSearchList:true})
    .then(({result,total}) => {
        res.send(success(true, {
            data: {
                list:result.map(item => ({
                    ...item,
                    operating_time: dayjs(item.operating_time).format('YYYY-MM-DD HH:mm:ss')
                }))
            }
        }));
    }).catch(()=>{
        res.send(success(false,{msg:'未知异常'}))
    })
});

module.exports = route;