import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-node';
import securityPlugin from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'import': importPlugin,
      'node': nodePlugin,
      'security': securityPlugin
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for development
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Security rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',

      // Import rules
      'import/no-unresolved': 'off', // TypeScript handles this better
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      // Node.js rules
      'node/no-missing-import': 'off', // TypeScript handles this
      'node/no-unsupported-features/es-syntax': 'off', // We use TypeScript
      'node/no-missing-require': 'off', // TypeScript handles this

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-proto': 'error',
      'no-iterator': 'error',
      'no-with': 'error',
      'no-caller': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-invalid-this': 'error',
      'no-multi-spaces': 'error',
      'no-multi-str': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      'strict': ['error', 'never'], // TypeScript handles strict mode
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'arrow-spacing': 'error',
      'generator-star-spacing': 'error',
      'yield-star-spacing': 'error',
      'rest-spread-spacing': 'error',
      'no-duplicate-imports': 'error'
    },
    settings: {
      'import/resolver': {
        'typescript': {
          'alwaysTryTypes': true,
          'project': './tsconfig.json'
        },
        'node': {
          'extensions': ['.js', '.ts']
        }
      }
    }
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'security/detect-object-injection': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.config.js',
      'coverage/**',
      'logs/**',
      'uploads/**',
      // Ignore REST Client / HTTP request files so ESLint doesn't parse them
      '**/*.http',
      '**/*.rest',
      '**/*.har'
    ]
  }
];
