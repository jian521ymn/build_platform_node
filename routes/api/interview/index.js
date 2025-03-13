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
        name: "INTERVIEW",
        params: {
            isDelete: "0",
            type:`%${type}%`,
            title:`%${title}%`,
            operatingTime: startTime && endTime ? `${startTime}' AND '${endTime}` : `%%`
        },
        page:page({page_size,page_num}),
        sort:{
           id:'DESC' 
        },
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
                        answer: item.answer ? hexToString(item.answer) : '',
                        operating_time: dayjs(item.operating_time).format('YYYY-MM-DD HH:mm:ss')
                    })),
                    page_num,
                    page_size,
                    total,
                }
            }));
        })
});
//=> 查询所有类型
route.get('/list/type', (req, res) => {
   
    mysqlConnection({
            res,
            querySql: 'SELECT type FROM `INTERVIEW` ORDER BY `id` DESC',
            // isSearchList:true,
        })
        .then(({
            result,total
        }) => {
            const ress =result?.reduce((prev,next)=>{
                next.type= next.type?.replace(/，/g,',')
                const types = next.type?.split(',')
                if(types?.length === 1){
                    prev[next.type]= next.type
                    return prev
                }
                for (let i = 0; i < types.length; i++) {
                    const element = types[i];
                    prev[element]=element
                }
                prev[next.type]= next.type
                return prev
            },{})
            res.send(success(true, {
                data: Object.values(ress)
            }));
        })
});
//=> 项目新增
route.post('/add', (req, res) => {
    const {userNames='测试'} = req.query
    const {
        title,
        content,
        answer,
        type,
        level
    } = req.body;
    const loginQuerySql = addMyspl({
        name: "INTERVIEW",
        params: {
            isDelete: "0",
            title,
            level,
            content:stringToHex(content),
            answer: answer ? stringToHex(answer) : '',
            type,
            createor:userNames,
            operatingor:userNames,
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
        name: "INTERVIEW",
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
        name: "INTERVIEW",
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
                    answer:result[0]?.answer ? hexToString(result[0]?.answer) : '',
                    content:hexToString(result[0]?.content)
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
        answer,
        level,
        type,
    } = req.body;
    const loginQuerySql = updateMyspl({
        name: "INTERVIEW",
        params: {
            isDelete: "0",
            title,
            level,
            content:stringToHex(content),
            answer:answer ? stringToHex(answer) : '',
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