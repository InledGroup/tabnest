module.exports = {
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',
  run: {
    firefox: 'firefox',
    pref: [
      'extensions.experiments.enabled=true',
    ],
  },
  build: {
    overwriteDest: true,
  },
  lint: {
    warningsAsErrors: false,
    selfHosted: false,
  },
};
