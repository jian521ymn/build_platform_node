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
const {page} =require('jian_ymn_node/fs/index')

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
    execPromise(`cd /www/code && git clone ${origin_ssh_url}`)
    .then(res_=>{
        if(res_?.err){
            res.send(success(false,{msg:res_?.err?.err}))
            return new Error(res_?.err)
        }
        return mysqlConnection({res,querySql: loginQuerySql,})
    })
    .then(({
        result
    }) => {
        res.send(success(true, {
            data: result
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

// 定时任务，每隔一分钟更新一次分支列表
setInterval(() => {
    
    // execPromise('cd /www/code && ls')
    // .then((res) => {
    //     const {err,stdout} =res || {};
    //     if(err)return;
    //     let cmdArr=[]
    //     const fileList =stdout.split('\n');
    //     for (let i = 0; i < fileList.length; i++) {
    //         const element = fileList[i];
    //         if(!element)return;
    //         cmdArr.push(`cd /www/code/${element} && git remote update origin --p`)
    //     }
    //     return execPromise(cmdArr.join(" && "))
    // })
    // .then(res=>{
    //     console.log('更新分支，定时任务发布成功！');
    // })
},2*60*1000);

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
const updateStaus=(item_key,params,res)=>{
    const loginQuerySql = updateMyspl({
        name: "BUILD_INFO_LIST",
        primaryKey: {
            key: 'item_key',
            value: item_key,
        },
        params: {
            isDelete: "0",
            ...params,
            operating_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: '纪晓安'
        }
    })
   return mysqlConnection({
            res,
            querySql: loginQuerySql,
    })
}
// 创建或更新部署记录
const createOrUpdateStaus=(createId,params,res)=>{
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
            operator: '纪晓安'
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
    const {name,remark_name,page_num,page_size} = req.query;
    const page_ = page(req.query)
    const params ={name,remark_name}
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

//=> 发布流程
route.post('/build', (req, res) => {
    const {name, origin_ssh_url,branch,item_key, type, remark_name} = req.body;
    let createId =''
    res.send(success(true,{}))
    // 1.git 拉取
    updateStaus(item_key,{status: 1,branch},res)
    .then(res_=>{
       return createOrUpdateStaus(item_key,{status: 1,branch,name,remark_name,item_key},res)
    })
    .then(res_=>{
        createId = res_.result.insertId
        console.error(createId,'createId');
        return execPromise(`cd /www/code/${name}  && git checkout ${branch} && git pull`)
    })
    .then(res_ => {
        console.log(res_,'res_');
        if(res_?.err){
            throw new Error(res_?.err)
        }
        return updateStaus(item_key,{status: 2,branch},res)
    })
    .then(res_=>{
        return createOrUpdateStaus(createId,{status: 2},res)
     })
    .then(res_=>{
        // 2.安装依赖
       return execPromise(`cd /www/code/${name}  && yarn`)
    })
    .then(res_=>{
        if(res_?.err){
            throw new Error(res_?.err)
        }
        return updateStaus(item_key,{status: 3,branch},res)
    })
    .then(res_=>{
        return createOrUpdateStaus(createId,{status: 3},res)
     })
    .then(res_=>{
        // 3.yarn build
        if(type.includes('node')){
            return execPromise(`cd /www/code/${name}`)
        }
        return execPromise(`cd /www/code/${name}  && yarn build`)
    })
    .then(res_=>{
        // 4.更新中
        if(res_?.err){
            throw new Error(res_?.err)
        }
        return updateStaus(item_key,{status: 4,branch},res)
    })
    .then(res_=>{
        return createOrUpdateStaus(createId,{status: 4},res)
     })
     .then(res_=>{
         // node 项目重启项目
         if(type.includes('node')){
            return execPromise(`pm2 restart ${name}`)
         }
     })
    .then(res_=>{
        // 5.成功
        return updateStaus(item_key,{status: 5,branch},res)
    })
    .then(res_=>{
        return createOrUpdateStaus(createId,{status: 5},res)
     })
    .then(res_=>{
        console.log('success');
    }).catch(err=>{
        updateStaus(item_key,{status: 0,branch},res)
        .then(res_=>{
            createOrUpdateStaus(createId,{status: 0},res)
        })
    })
});

module.exports = route;