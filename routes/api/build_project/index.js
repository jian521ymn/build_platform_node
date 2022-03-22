const express = require('express');
const route = express.Router();
const {success} =require('jian_ymn_node')
const mysqlConnection = require('../../../mysql/mysql');
const {
    updateMyspl,
    queryMyspl,
    addMyspl,
} = require('../../../utils/operationMysql');


//=> 项目列表
route.get('/list', (req, res) => {
    const {page_size,page_num} = req.query;
	const loginQuerySql = queryMyspl({
        name:"BUILD_INFO_LIST",
        params:{
            isDelete:"0",
        }
	})
    mysqlConnection({
        res, 
        querySql:loginQuerySql,
    })
    .then(({result})=>{
        console.log(result);
        res.send(success(true,{
            data:result
        }));
    })
});
module.exports = route;