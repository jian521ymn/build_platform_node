const express = require('express');
const route = express.Router()

//=>增加用户信息
route.get('/start', (req, res) => {
    res.send({msg: '2'});
    // const params =userParams({...req.body,operatingor:req.query.userNames})
	// const userAddSql = addMyspl({name:'USER',params})
    // mysqlConnection({querySql:userAddSql,res}).then(({result})=>{
    //     res.send(success(true, {msg: 'Ok'}));
    // })
});
module.exports = route;