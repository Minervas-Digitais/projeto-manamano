// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'prettier',
    'airbnb',
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'linebreak-style': 'off',
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    'react/style-prop-object': 'off',
    'object-curly-newline': 'off'
  }, 
  plugins: ['prettier'],
}

