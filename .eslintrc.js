module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  globals: {
    $: true,
    wx: true
  },
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 关闭语句强制分号结尾
    'semi': 0,
    // 缩进风格
    'indent': [2, 4],
    // 要求使用 === 和 !==
    'eqeqeq': 1,
    // 禁止出现未使用过的变量
    'no-unused-vars': 1,
    // 禁止在变量定义之前使用它们
    'no-use-before-define': 1,
    //关闭禁止混用tab和空格
    // "no-mixed-spaces-and-tabs": [0],
  }
}
