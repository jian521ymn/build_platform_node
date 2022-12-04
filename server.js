const CONFIG = require('./config'),
	session = require('express-session'),
	cookieParser=require("cookie-parser"),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	axios = require('axios');
const { getCookie } = require('./utils/getCookie');
/*-CREATE SERVER-*/
const express = require('express'),
	app = express();


app.listen(CONFIG.PORT, () => {
	console.log(`当前服务 起于${CONFIG.PORT}端口`);
});

/*-MIDDLE WARE-*/
app.all('*', (req, res, next) => {
	const {
		ALLOW_ORIGIN,
		CREDENTIALS,
		HEADERS,
		ALLOW_METHODS
	} = CONFIG.CROS;
	let ol = ALLOW_ORIGIN.split(',');
    if (ol.indexOf(req.headers.origin) >= 0) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
    	res.header("Access-Control-Allow-Credentials", CREDENTIALS);
    	res.header("Access-Control-Allow-Headers", HEADERS);
    	res.header("Access-Control-Allow-Methods", ALLOW_METHODS);
    }
	req.method === 'OPTIONS' ? res.send('CURRENT SERVICES SUPPORT CROSS DOMAIN REQUESTS!') : next();
});
app.use(cookieParser())
app.use(session(CONFIG.SESSION));
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(async (req, res, next) => {
    if(req.originalUrl.indexOf('/preset') !== -1 || req.originalUrl.indexOf('/user/config') !== -1){
        next()
        return
    }
	const token =req.query?.token || getCookie(req)?.token || req?.cookies.token || ''
	console.log(token,'token');
	axios.get('http://114.215.183.5:3334/user/login',{params:{token,type:'build_platform',path:req.originalUrl.split('?')[0]}})
	.then((response) =>{
		const { code, msg, userNames:userName } =response.data?.data
		if(code === 0){
			// 前置校验
			res.setHeader('Set-Cookie',`token=${token}`);
			req.query.userName=userName
			res.cookie('token',token,{secure:false})
			next()
		}else{
			res.send({code,msg})
		}
	}).catch((err) =>{
		console.log(err);
		res.send({code:999,msg:"登录失效"})
	})
	
});

/*-ROUTE-*/
app.use('/api/build_project', require('./routes/api/build_project/index.js'));
app.use('/api/product', require('./routes/api/product/index.js'));
app.use('/api/img', require('./routes/api/img/index.js'));
app.use('/api', require('./routes/api/currency/index.js'));
app.use('/api/user/config', require('./routes/api/user_config/index.js'));


app.use((req, res) => {
	res.status(404);
	res.send('NOT FOUND!');
});



