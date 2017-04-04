const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));

app.get('/posts', (req, res) => {
	Blog
	.find()
	.exec()
	.then(posts => {	
		res.json({
			posts: posts.map((post) => {
					post.apiRep();				
			})
		});
	})
	.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error!'});
	});
});




let server;
function runServer(databaseUrl = DATABASE_URL, port = PORT){
	return new Promise((resolve, reject)=>{
		mongoose.connect(databaseUrl, err => {
			if(err){
				return reject(err)
			}
			server = app.listen(port, ()=>{
				console.log(`App is listening on port ${PORT}`);
				resolve();
			})
			.on('error', err =>{
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer(){
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject)=>{
			console.log('Closing Server');
			server.close(err => {
				if(err){
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if(require.main === module){
	runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};