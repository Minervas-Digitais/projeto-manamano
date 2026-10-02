const tseslint = require('typescript-eslint');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

const FRONTEND_FILES = 'frontend/**/*.{js,jsx,ts,tsx}';
const FRONTEND_TS_FILES = 'frontend/**/*.{ts,tsx}';
const BACKEND_FILES = 'backend/**/*.ts';

const scopeToFrontend = (config) => {
  const scoped = { ...config };
  if (scoped.files) scoped.files = scoped.files.map((file) => `frontend/${file}`);
  if (scoped.ignores) scoped.ignores = scoped.ignores.map((pattern) => `frontend/${pattern}`);
  if (!scoped.files && !scoped.ignores) scoped.files = [FRONTEND_FILES];
  return scoped;
};

const frontendCommonRules = {
  ...eslintConfigPrettier.rules,
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-eval': ['error'],
  'no-async-promise-executor': ['error'],
  'no-promise-executor-return': ['error'],
  'no-self-compare': ['error'],
  'no-self-assign': ['error', { props: true }],
  'no-return-assign': ['error', 'always'],
  'guard-for-in': ['error'],
  'array-callback-return': [
    'error',
    { allowImplicit: true, checkForEach: false, allowVoid: false },
  ],
  'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
  'no-extend-native': ['error'],
  'no-caller': ['error'],
  'no-script-url': ['error'],
  radix: ['error'],
  'no-var': ['error'],
  'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: true }],
  'import/no-cycle': [
    'error',
    {
      maxDepth: '∞',
      ignoreExternal: false,
      allowUnsafeDynamicCyclicDependency: false,
      disableScc: false,
    },
  ],
  'import/no-self-import': ['error'],
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [
        'test/**',
        'tests/**',
        'spec/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'test.{js,jsx}',
        'test.{ts,tsx}',
        'test-*.{js,jsx}',
        'test-*.{ts,tsx}',
        '**/*{.,_}{test,spec}.{js,jsx}',
        '**/*{.,_}{test,spec}.{ts,tsx}',
        '**/jest.config.js',
        '**/jest.config.ts',
        '**/jest.setup.js',
        '**/jest.setup.ts',
        '**/vue.config.js',
        '**/vue.config.ts',
        '**/webpack.config.js',
        '**/webpack.config.ts',
        '**/webpack.config.*.js',
        '**/webpack.config.*.ts',
        '**/rollup.config.js',
        '**/rollup.config.ts',
        '**/rollup.config.*.js',
        '**/rollup.config.*.ts',
        '**/gulpfile.js',
        '**/gulpfile.ts',
        '**/gulpfile.*.js',
        '**/gulpfile.*.ts',
        '**/Gruntfile{,.js}',
        '**/Gruntfile{,.ts}',
        '**/protractor.conf.js',
        '**/protractor.conf.ts',
        '**/protractor.conf.*.js',
        '**/protractor.conf.*.ts',
        '**/karma.conf.js',
        '**/karma.conf.ts',
        '**/.eslintrc.js',
        '**/.eslintrc.ts',
      ],
      optionalDependencies: false,
    },
  ],
  'import/first': ['error'],
  'import/no-duplicates': ['error'],
  'import/no-named-as-default': 'off',
  'import/no-named-as-default-member': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/display-name': 'off',
  'react-hooks/set-state-in-effect': 'off',
  'react-hooks/immutability': 'off',
  'react-hooks/preserve-manual-memoization': 'off',
  'linebreak-style': 'off',
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
};

const frontendTypeScriptRules = {
  '@typescript-eslint/no-shadow': ['error'],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true, caughtErrors: 'none' },
  ],
  '@typescript-eslint/only-throw-error': ['error'],
  '@typescript-eslint/no-implied-eval': ['error'],
  '@typescript-eslint/no-loop-func': ['error'],
  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
    { selector: 'function', format: ['camelCase', 'PascalCase'] },
    { selector: 'typeLike', format: ['PascalCase'] },
  ],
  '@typescript-eslint/dot-notation': [
    'error',
    {
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
      allowIndexSignaturePropertyAccess: false,
    },
  ],
  '@typescript-eslint/no-use-before-define': 'off',
};

const frontendTestRules = {
  'react/prop-types': 'off',
  'react/jsx-filename-extension': 'off',
  'react/jsx-no-useless-fragment': 'off',
  'import/no-import-module-exports': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'arrow-body-style': 'off',
  'no-console': 'off',
};

const backendRules = {
  ...eslintConfigPrettier.rules,
  'prettier/prettier': 'error',
  'arrow-body-style': 'off',
  'prefer-arrow-callback': 'off',
  'no-console': 'warn',
  '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
};

module.exports = [
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },

  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.expo/**',
      'frontend/android/**',
      'frontend/ios/**',
      'frontend/babel.config.js',
      'frontend/metro.config.js',
      '.husky/**',
      'eslint.config.js',
    ],
  },

  ...expoConfig.map(scopeToFrontend),

  {
    files: [FRONTEND_FILES],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'frontend/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: frontendCommonRules,
  },

  {
    files: [FRONTEND_TS_FILES],
    rules: frontendTypeScriptRules,
  },

  {
    files: ['frontend/**/__mocks__/**/*.{js,jsx,ts,tsx}', 'frontend/**/*.test.{js,jsx,ts,tsx}'],
    rules: frontendTestRules,
  },

  ...tseslint.configs.recommended.map((config) => ({ ...config, files: [BACKEND_FILES] })),

  {
    files: [BACKEND_FILES],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  {
    files: [BACKEND_FILES],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: backendRules,
  },
];
