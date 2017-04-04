const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String, required: true},
	created: {type: Date, default: Date.now},
	author: {
		firstName: String,
		lastName: String
	}
});

blogSchema.virtual('authorName').get(function(){
	return `${this.author.firstName} ${this.author.lastName}`
});

blogSchema.methods.apiRep = function(){
	return {				
		title: this.title,
		content: this.content,
		author: this.authorName,
		created: this.created
	};
}

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};
