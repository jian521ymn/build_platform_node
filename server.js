const CONFIG = require('./config'),
	session = require('express-session'),
	cookieParser=require("cookie-parser"),
	bodyParser = require('body-parser'),
    fs = require('fs');
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
app.use(cookieParser('jianymn'))
app.use(session(CONFIG.SESSION));
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({
	extended: false
}));

// app.use(async (req, res, next) => {
// 	req.$customerDATA = filterInvalid(JSON.parse(await readFile('./json/customer.json')));
// 	req.$departmentDATA = filterInvalid(JSON.parse(await readFile('./json/department.json')));
// 	req.$jobDATA = filterInvalid(JSON.parse(await readFile('./json/job.json')));
// 	req.$userDATA = filterInvalid(JSON.parse(await readFile('./json/user.json')));
// 	req.$visitDATA = filterInvalid(JSON.parse(await readFile('./json/visit.json')));
// 	next();
// });

/*-ROUTE-*/
app.use('/api/build_project', require('./routes/api/build_project/index.js'));

app.use((req, res) => {
	res.status(404);
	res.send('NOT FOUND!');
});

console.log('启动API自动生成命令成功...');


