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
const { stringToHex, hexToString } = require('../../../utils/string');
// const {page} =require('jian_ymn_node/fs/index')
const page = ({
    page_num=1,
    page_size=10
}) => {
   return `${page_size*(page_num-1)},${page_size}`
}

//=> 项目列表
route.get('/list', (req, res) => {
    const {
        page_size,
        page_num,
        type='',
        title='',
        startTime,
        endTime,
    } = req.query;
    createNoLikeKey =()=>{
        let obj ={};
        if(startTime && endTime){
            obj.operatingTime='BETWEEN'
        }
        return obj
    }
    const loginQuerySql = queryMyspl({
        name: "KNOWLEDGE",
        params: {
            isDelete: "0",
            type:`%${type}%`,
            title:`%${title}%`,
            operatingTime: startTime && endTime ? `${startTime}' AND '${endTime}` : `%%`
        },
        page:`${page_size*(page_num-1)},${page_size*page_num}`,
        noLikeKey:createNoLikeKey()
    })
    mysqlConnection({
            res,
            querySql: loginQuerySql,
            isSearchList:true,
        })
        .then(({
            result,total
        }) => {
            res.send(success(true, {
                data: {
                    list:result.map(item => ({
                        ...item,
                        content: hexToString(item.content),
                        operating_time: dayjs(item.operating_time).format('YYYY-MM-DD HH:mm:ss')
                    })),
                    page_num,
                    page_size,
                    total,
                }
            }));
        })
});
//=> 项目新增
route.post('/add', (req, res) => {
    const {userNames} = req.query
    const {
        title,
        content,
        type,
    } = req.body;
    const loginQuerySql = addMyspl({
        name: "KNOWLEDGE",
        params: {
            isDelete: "0",
            title,
            content:stringToHex(content),
            type,
            createor:userNames,
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
        id,userNames
    } = req.query;
    
    const loginQuerySql = updateMyspl({
        name: "KNOWLEDGE",
        primaryKey: {
            key: 'id',
            value: id,
            isString:false,
        },
        params: {
            isDelete: "1",
            operatingTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operatingor:userNames,
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
        name: "KNOWLEDGE",
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
                data:{
                    ...result[0],
                    content:hexToString(result[0].content)
                }
            }));
        })
});
//=> 项目更新
route.post('/update', (req, res) => {
    const {userNames} = req.query
    const {
        id,
        title,
        content,
        type,
    } = req.body;
    const loginQuerySql = updateMyspl({
        name: "KNOWLEDGE",
        params: {
            isDelete: "0",
            title,
            content:stringToHex(content),
            type,
            operatingTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operatingor:userNames,
        },
        primaryKey:{
            key:'id',
            value:id
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




module.exports = route;