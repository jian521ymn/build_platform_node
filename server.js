const CONFIG = require('./config'),
	session = require('express-session'),
	cookieParser=require("cookie-parser"),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	axios = require('axios')
/*-CREATE SERVER-*/
const express = require('express'),
	app = express();

app.use(cors()) // 解决跨域
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
app.use(cookieParser('jianymn'))
app.use(session(CONFIG.SESSION));
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(async (req, res, next) => {
	axios.get('http://114.215.183.5:3334/user/login')
	.then((response) =>{
		if(response.code === 0){
			// 前置校验
			next()
		}else{
			res.send({code:999,msg:"登录失效"})
		}
	})
	
});

/*-ROUTE-*/
app.use('/api/build_project', require('./routes/api/build_project/index.js'));

app.use((req, res) => {
	res.status(404);
	res.send('NOT FOUND!');
});



