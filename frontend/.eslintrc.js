module.exports = {
  extends: [
    '../.eslintrc.js',
    'expo',
    'airbnb',
    'airbnb-typescript',
    'prettier',
    'plugin:react-hooks/recommended',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  plugins: ['prettier'],

  rules: {
    'react/react-in-jsx-scope': 'off',
    'linebreak-style': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/style-prop-object': 'off',
    'object-curly-newline': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/prop-types': 'off',
    'prefer-destructuring': 'off',
    'no-useless-return': 'off',
    'no-console': 'warn',
    'react/function-component-definition': 'off',
  },

  overrides: [
    {
      files: ['**/__mocks__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        'react/prop-types': 'off',
        'react/jsx-filename-extension': 'off',
        'react/jsx-no-useless-fragment': 'off',
        'import/no-import-module-exports': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'arrow-body-style': 'off',
      },
    },
  ],
};
