const  fs = require('fs');
const exec = require('child_process').exec;
// promise 版watch
// const watchPromise =(filePath,params)=>{
// 	return new Promise((resolve, reject)=>{
// 		// 监听所有文件变化
// 		fs.watch(filePath, params, ((event, filename) => {
// 			resolve({code:0,event, filename})
// 		}))
// 	}).catch(err=>{
// 		resolve({code:1,msg:err||'监听失败'})
// 	})
// }

// // promisre 版exce
// const execPromise =(cmdStr)=>{
// 	return new Promise((resolve,reject) =>{
// 		console.log(223232323);
// 		exec(cmdStr, (err, stdout, stderr) => {
// 			console.log(333334);
// 			if(err){
// 				resolve({code:1,msg:err});
// 				return;
// 			}
// 			resolve({code:0,mag:err,data:stdout})
// 		})
// 	}).catch(err =>{
// 		resolve({code:1,msg:err});
// 	})
// }
// // 首次调用
// execPromise('nodemon server.js').then(res=>{
// 	console.log(333334);
// 	if(res.code !== 0){
// 		console.error(res.msg);
// 		return
// 	}
// 	return watchPromise('./',{recursive: true})
// })
// // .then(res=>{
// // 	if(res.code !==0){
// // 		console.error(res.msg);
// // 		return
// // 	}
// // 	console.warn(new Date(),' 检测到文件变化，正在执行编译命令...');
// // })
exec('nodemon server.js', (err, stdout, stderr) => {
	console.log(3333333234);
})

