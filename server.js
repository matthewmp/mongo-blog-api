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
		res.json(posts.map(post => post.apiRep()));				
			})		
	.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal Server Error!'});
	});
});

app.get('/posts/:id', (req, res)=>{
	Blog
	.findById(req.params.id)
	.exec()
	.then(post => res.json(post.apiRep()))	
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Internal Server Error'});
	});
});

app.post('/posts', (req, res)=>{
	const requiredFields = ['title', 'content', 'author'];
	for(let i = 0; i < requiredFields.length; i++){
		const field = requiredFields[i];
		if(!(field in req.body)){
			//console.error(`Missing ${field}`);
			return res.status(400).send(`Missing ${field}`);
		}			
	}

	Blog
	.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	})

	.then(post => res.status(201).json(post.apiRep()))
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something Went Wrong'});
	});	
});

app.delete('/posts/:id', (req, res) => {
	Blog
	.findByIdAndRemove(req.params.id)
	.exec()
	.then(() => res.status(204).json({message: 'Successfully Deleted'}))
	.catch(err => {
		console.error(err);
		res.status(500).json({error: 'Something Went Wrong, Unable to Delete Post'});
	});
});

app.put('/posts/:id', (req, res) =>{
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		res.status(400).json({
			error: 'Request path id and request body id values must match'
		});
	}

	const updated = {};
	const updatedFields = ['title', 'content', 'author'];

	updatedFields.forEach(field => {
		if(field in req.body){
			updated[field] = req.body[field];
		}
	});	

	console.log("UPDATED : " + JSON.stringify(updated))

	Blog
	.findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
	.exec()
	.then(updatedPost => res.status(201).json(updatedPost.apiRep()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Something Went Wrong'});
	})
})


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