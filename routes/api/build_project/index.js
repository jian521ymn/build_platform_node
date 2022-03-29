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

//=> 项目列表
route.get('/list', (req, res) => {
    const {
        page_size,
        page_num
    } = req.query;
    const loginQuerySql = queryMyspl({
        name: "BUILD_INFO_LIST",
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
        level,
        name,
        origin_ssh_url,
        release_num,
        type,
        remark_name
    } = req.body;
    const loginQuerySql = addMyspl({
        name: "BUILD_INFO_LIST",
        params: {
            isDelete: "0",
            level,
            name,
            origin_ssh_url,
            release_num,
            type,
            remark_name,
            item_key: createUuid(),
            operator: '纪晓安'
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
                data: result
            }));
        })
});
//=> 项目删除
route.get('/delete', (req, res) => {
    const {
        item_key
    } = req.query;
    const loginQuerySql = updateMyspl({
        name: "BUILD_INFO_LIST",
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
        name: "BUILD_INFO_LIST",
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
    const loginQuerySql = updateMyspl({
        name: "BUILD_INFO_LIST",
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
            operator: '纪晓安'
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
setInterval(() => {
    // 定时任务，每隔一分钟更新一次分支列表
    execPromise('cd /www/code && ls')
    .then((res) => {
        const {err,stdout} =res || {};
        if(err)return;
        let cmdArr=[]
        const fileList =stdout.split('\n');
        for (let i = 0; i < fileList.length; i++) {
            const element = fileList[i];
            cmdArr.push(`cd /www/code/${element} && git remote update origin --p`)
        }
        console.log(cmdArr.join(" && "));
        return execPromise(cmdArr)
    })
    .then(res=>{
        console.log(res,'success');
    })
},1*60*1000)
route.get('/branch', (req, res) => {
    // 先更新分支，再获取所有分支
    execPromise('git branch').then(res_ => {
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
            if (branch && !branch.includes('origin/')) {
                allBranch.push({
                    value:branch,
                    label:branch
                })
            }
        })
        // 得到分支列表
        res.send(success(true, {
            data: allBranch
        }));
    });
});

module.exports = route;