const webpackConfig = require('../webpack/webpack.test.babel');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const pkg = require(path.resolve(process.cwd(), 'package.json'));

module.exports = (config) => {
  const dllPlugin = pkg.dllPlugin;

  const staticFiles = [{
    pattern: './test-bundler.js',
    watched: false,
    served: true,
    included: true,
  }];

  if (dllPlugin) {
    const dllNames = typeof dllPlugin.dlls === 'object'
      ? Object.keys(dllPlugin.dlls)
      : ['reactBoilerplateDeps'];

    dllNames.reverse()
    .forEach(dllName => (
      staticFiles.unshift({
        pattern: `../../node_modules/react-boilerplate-dlls/${dllName}.dll.js`,
        watched: false,
        served: true,
        included: true,
      })
    ));
  }

  config.set({
    frameworks: ['mocha'],
    reporters: ['coverage', 'mocha'],
    browsers: process.env.TRAVIS // eslint-disable-line no-nested-ternary
      ? ['ChromeTravis']
      : process.env.APPVEYOR
        ? ['IE'] : ['Chrome'],

    autoWatch: false,
    singleRun: true,

    client: {
      mocha: {
        grep: argv.grep,
      },
    },

    files: staticFiles,

    preprocessors: {
      ['./test-bundler.js']: ['webpack', 'sourcemap'], // eslint-disable-line no-useless-computed-key
    },

    webpack: webpackConfig,

    // make Webpack bundle generation quiet
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },

    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },

    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage'),
      reporters: [
        { type: 'lcov', subdir: 'lcov' },
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
      ],
    },

  });
};
