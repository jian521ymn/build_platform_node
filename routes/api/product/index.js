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
        item_key
    } = req.query;
    const loginQuerySql = updateMyspl({
        name: "PRODUCT",
        primaryKey: {
            key: 'item_key',
            value: item_key
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
        item_key
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "PRODUCT",
        params: {
            isDelete: "0",
            item_key
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
        item_key,
        level,
        name,
        origin_ssh_url,
        release_num,
        type,
        remark_name
    } = req.body;
    const { userName='' } = req.query
    const loginQuerySql = updateMyspl({
        name: "PRODUCT",
        primaryKey: {
            key: 'item_key',
            value: item_key,
        },
        params: {
            isDelete: "0",
            level,
            name,
            origin_ssh_url,
            release_num,
            type,
            remark_name,
            operating_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: userName
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

//=> 分支拉取更新
route.get('/branch', (req, res) => {
    const {name} =req.query
    if(!name){
        res.send(success(false,{msg:"仓库名必填！"}))
    }
    // 先更新分支，再获取所有分支
    execPromise(`cd /www/code/${name}  && git branch -r`).then(res_ => {
        const {err,stdout} =res_ || {};
        if(err){
            res.send(success(false,{msg:err?.err}))
            return
        }
        let allBranch = []
        // 处理git branch 的结果，
        stdout.split('\n').forEach(item => {
            const branch = item.replace(/(\s)/g, '').replace(/\*/g, '');
            // 忽略为空的分支和远程分支
            if (branch && !branch.includes('HEAD')) {
                allBranch.push({
                    value:branch.split('/')[1],
                    label:branch.split('/')[1]
                })
            }
        })
        // 得到分支列表
        res.send(success(true, {
            data: allBranch
        }));
    });
});

//更新发布状态
const updateStaus=(item_key,params,res,req)=>{
    const { userName } = req.query
    const loginQuerySql = updateMyspl({
        name: "PRODUCT",
        primaryKey: {
            key: 'item_key',
            value: item_key,
        },
        params: {
            isDelete: "0",
            ...params,
            operating_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: userName
        }
    })
   return mysqlConnection({
            res,
            querySql: loginQuerySql,
    })
}
// 创建或更新部署记录
const createOrUpdateStaus=(createId,params,res,req)=>{
    const { userName='' } = req.query
    const {page,status} = params;
    let page_ = ''
    if(status === 1 && page){
        page_ = page
        delete params.page
    }
    const createSql = addMyspl({
        name:"BUILD_INFO_RECORD",
        params:{...params },
        page
    })
    const loginQuerySql = updateMyspl({
        name: "BUILD_INFO_RECORD",
        primaryKey: {
            key: 'id',
            value: createId,
        },
        params: {
            ...params,
            operating_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: userName
        }
    })
    const querySql = status === 1 ? createSql : loginQuerySql
   return mysqlConnection({
            res,
            querySql,
    })
}
//=> 查询部署记录
route.get('/record', (req, res) => {
    const {name,remark_name,item_key,page_num,page_size} = req.query;
    const page_ = page(req.query)
    const params ={name,remark_name,item_key}
    let newParams ={};
    Object.keys(params).forEach(item=>{
        if(params[item]){
           newParams[item] = params[item]
        }
    })
    console.log(newParams,'newParams');
    const querySql = queryMyspl({
        name: "BUILD_INFO_RECORD",
        params:newParams || {},
        page:page_,
        sort:{operating_time:"DESC"}
    })
    mysqlConnection({res,querySql,isSearchList:true})
    .then(({result,total}) => {
        res.send(success(true, {
            data: {
                page_num:Number(page_num),
                page_size:Number(page_size),
                total,
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