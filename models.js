const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
	author: {
		firstName: String,
		lastName: String
	},
	title: {type: String, required: true},
	content: {type: String},
	created: {type: Date, default: Date.now}	
});

blogSchema.virtual('authorName').get(function(){
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.apiRep = function(){
	return {	
		id: this._id,
	    author: this.authorName,
	    content: this.content,
	    title: this.title,
	    created: this.created
	};
}

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};
