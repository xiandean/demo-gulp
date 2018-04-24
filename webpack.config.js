const path = require('path')
const webpack = require('webpack')
const config = require('./gulpfile.config.js')

module.exports = {
	entry: config.entry,
	output: {
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [
					path.resolve(__dirname, 'src')
				],
				exclude: /(node_modules|bower_components|lib)/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	devtool: 'source-map'
}