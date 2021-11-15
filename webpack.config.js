const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const isProd = process.env.NODE_ENV === "production";

/*https://www.skcript.com/svr/using-webpack-with-react-typescript/*/

const config = {
  mode: isProd ? "production" : "development",
  entry: {
    index: "./src/index.tsx",
  },
  output: {
    path: resolve(__dirname, "docs"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  
  module: {
    rules: [
        {test: /\.tsx?$/, use: "babel-loader", exclude: /node_modules/},
        
        {
            test: /\.css$/i,
            use: [
                "style-loader",
                "@teamsupercell/typings-for-css-modules-loader",
                {
                loader: "css-loader",
                options: { modules: true }
                }
            ]
        },
        {
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'file-loader',
                options: {}
            }]
        }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
    }),
  ],
};

if (isProd) {
  config.optimization = {
    minimizer: [new TerserWebpackPlugin()],
  };
} else {
  config.devServer = {
    port: 9000,
    open: true,
    hot: true,
    compress: true,
    stats: "errors-only",
    overlay: true,
  };
}

module.exports = config;