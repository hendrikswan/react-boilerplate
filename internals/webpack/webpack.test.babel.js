/* eslint-ignore global-require */
/**
 * TEST WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const readFile = require('fs').readFileSync;
const modules = [
  'app',
  'node_modules',
];

const pkg = require(path.resolve(process.cwd(), 'package.json'));

const extraPlugins = () => {
  const dllPlugin = pkg.dllPlugin;

  if (!dllPlugin) { return []; }
  const dllPath = path.resolve(process.cwd(), dllPlugin.path || 'node_modules/react-boilerplate-dlls');
  const manifestPath = path.resolve(dllPath, 'reactBoilerplateDeps.json');

  return [
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: JSON.parse(readFile(manifestPath).toString()),
    }),
  ];
};

module.exports = {
  devtool: 'inline-source-map',
  isparta: {
    babel: {
      presets: ['es2015', 'react', 'stage-0'],
    },
  },
  module: {
    // Some libraries don't like being run through babel.
    // If they gripe, put them here.
    noParse: [
      /node_modules(\\|\/)sinon/,
      /node_modules(\\|\/)acorn/,
    ],
    preLoaders: [
      { test: /\.js$/,
        loader: 'isparta',
        include: path.resolve('app/'),
      },
    ],
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'null-loader' },

      // sinon.js--aliased for enzyme--expects/requires global vars.
      // imports-loader allows for global vars to be injected into the module.
      // See https://github.com/webpack/webpack/issues/304
      { test: /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
        loader: 'imports?define=>false,require=>false',
      },
      { test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/],
      },
      { test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
        loader: 'null-loader',
      },
    ],
  },

  plugins: [
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ].concat(extraPlugins()),

  // Some node_modules pull in Node-specific dependencies.
  // Since we're running in a browser we have to stub them out. See:
  // https://webpack.github.io/docs/configuration.html#node
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  // https://github.com/webpack/jade-loader/issues/8#issuecomment-55568520
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    tls: 'empty',
  },

  // required for enzyme to work properly
  externals: {
    jsdom: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
  },
  resolve: {
    modulesDirectories: modules,
    modules,
    alias: {
      // required for enzyme to work properly
      sinon: 'sinon/pkg/sinon',
    },
  },
};
