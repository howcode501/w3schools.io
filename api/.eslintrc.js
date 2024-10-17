module.exports = {
  plugins: ['mocha'],
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    camelcase: 'off',
    'global-require': 'off',
    'no-underscore-dangle': 'off',
  },
};
