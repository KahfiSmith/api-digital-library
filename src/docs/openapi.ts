import swaggerUi from 'swagger-ui-express';

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Digital Library API',
    version: '1.0.0',
    description: 'REST API for the Digital Library',
  },
  servers: [
    { url: '/' },
    { url: '/api/v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'string', nullable: true },
          errors: { nullable: true },
        },
      },
      RecommendationItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          authors: { type: 'array', items: { type: 'string' } },
          coverUrl: { type: 'string', nullable: true },
          rating: { type: 'number' },
          category: {
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' } },
          },
          recommendationScore: { type: 'number' },
          reasons: { type: 'array', items: { type: 'string' } },
        },
      },
      PersonalizedRecommendationsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              recommendations: { type: 'array', items: { $ref: '#/components/schemas/RecommendationItem' } },
              stats: {
                type: 'object',
                properties: {
                  totalRecommendations: { type: 'integer' },
                  byCategory: { type: 'object', additionalProperties: { type: 'integer' } },
                  byReason: { type: 'object', additionalProperties: { type: 'integer' } },
                },
              },
              query: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  limit: { type: 'integer' },
                  excludeRead: { type: 'boolean' },
                  minRating: { type: 'number' },
                },
              },
            },
          },
        },
      },
      ListRecommendationsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              recommendations: { type: 'array', items: { $ref: '#/components/schemas/RecommendationItem' } },
              total: { type: 'integer' },
              bookId: { type: 'string', nullable: true },
              categoryId: { type: 'string', nullable: true },
              period: { type: 'string', nullable: true },
            },
          },
        },
      },
      Book: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          subtitle: { type: 'string', nullable: true },
          authors: { type: 'array', items: { type: 'string' } },
          description: { type: 'string', nullable: true },
          publisher: { type: 'string', nullable: true },
          publishedDate: { type: 'string', format: 'date-time', nullable: true },
          pageCount: { type: 'integer', nullable: true },
          language: { type: 'string' },
          coverUrl: { type: 'string', nullable: true },
          pdfUrl: { type: 'string', nullable: true },
          categoryId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number' },
          totalCopies: { type: 'integer' },
          availableCopies: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BookCreate: {
        type: 'object',
        required: ['title', 'authors', 'categoryId'],
        properties: {
          title: { type: 'string' },
          authors: { type: 'array', items: { type: 'string' } },
          categoryId: { type: 'string' },
          isbn: { type: 'string', nullable: true },
          subtitle: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          publisher: { type: 'string', nullable: true },
          publishedDate: { type: 'string', format: 'date-time', nullable: true },
          pageCount: { type: 'integer', nullable: true },
          language: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      BookUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          authors: { type: 'array', items: { type: 'string' } },
          categoryId: { type: 'string' },
          isbn: { type: 'string', nullable: true },
          subtitle: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          publisher: { type: 'string', nullable: true },
          publishedDate: { type: 'string', format: 'date-time', nullable: true },
          pageCount: { type: 'integer', nullable: true },
          language: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          slug: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      CategoryUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Forbidden: {
        description: 'Forbidden',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: 'Not Found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      ValidationError: {
        description: 'Validation Error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      ServerError: {
        description: 'Server Error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/auth/register': { post: { summary: 'Register', requestBody: { required: true, content: { 'application/json': { examples: { default: { value: { username: 'testuser123', email: 'test123@example.com', password: 'Password123!', firstName: 'Test', lastName: 'User' } } } } } }, responses: { '201': { description: 'Created' }, '400': { $ref: '#/components/responses/ValidationError' }, '500': { $ref: '#/components/responses/ServerError' } } } },
    '/auth/login': { post: { summary: 'Login', requestBody: { required: true, content: { 'application/json': { examples: { byEmail: { value: { identifier: 'test@example.com', password: 'Password123!' } }, byUsername: { value: { identifier: 'testuser', password: 'Password123!' } } } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Login successful', data: { tokens: { accessToken: 'xxx.yyy.zzz', refreshToken: 'rrr.sss.ttt' }, user: { id: 'uid', email: 'test@example.com', role: 'USER' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '500': { $ref: '#/components/responses/ServerError' } } } },
    '/auth/refresh': { post: { summary: 'Refresh tokens', requestBody: { required: false, content: { 'application/json': { examples: { byBody: { value: { refreshToken: 'rrr.sss.ttt' } }, empty: { value: {} } } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Token refreshed', data: { tokens: { accessToken: 'new.xxx', refreshToken: 'new.rrr' } } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '500': { $ref: '#/components/responses/ServerError' } } } },
    '/auth/logout': { post: { summary: 'Logout', requestBody: { required: false, content: { 'application/json': { examples: { byBody: { value: { refreshToken: 'rrr.sss.ttt' } }, empty: { value: {} } } } } }, responses: { '200': { description: 'OK' }, '500': { $ref: '#/components/responses/ServerError' } } } },
    '/auth/me': { get: { summary: 'Current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Current user', data: { user: { id: 'uid', email: 'test@example.com', role: 'USER' } } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '500': { $ref: '#/components/responses/ServerError' } } } },
    '/search/books': { get: { summary: 'Search books', parameters: [
      { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
      { name: 'language', in: 'query', required: false, schema: { type: 'string' } },
      { name: 'categoryId', in: 'query', required: false, schema: { type: 'string' } },
      { name: 'minRating', in: 'query', required: false, schema: { type: 'number', minimum: 0, maximum: 5 } },
      { name: 'maxRating', in: 'query', required: false, schema: { type: 'number', minimum: 0, maximum: 5 } },
      { name: 'start', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
      { name: 'end', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
      { name: 'sortBy', in: 'query', required: false, schema: { type: 'string', enum: ['rating', 'createdAt', 'title'] } },
      { name: 'sortOrder', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'] } },
    ], responses: { '200': { description: 'OK' } } } },
    '/search/categories': {
      get: {
        summary: 'Search categories',
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Categories found', data: [{ id: 'cat1', name: 'Programming' }] } } } } } },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/search/users': {
      get: {
        summary: 'Search users (admin/librarian only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'role', in: 'query', required: false, schema: { type: 'string', enum: ['ADMIN', 'LIBRARIAN', 'USER'] } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Users found', data: [{ id: 'uid1', email: 'john.doe@example.com' }] } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/search/global': {
      get: {
        summary: 'Global search across entities',
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'types', in: 'query', required: false, schema: { type: 'string', example: 'books,categories,users' } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Results', data: { books: [{ id: 'book1' }], categories: [{ id: 'cat1' }] } } } } } } },
          '500': { $ref: '#/components/responses/ServerError' },
        },
      },
    },
    '/auth/verify-email': { post: { summary: 'Verify email', responses: { '200': { description: 'OK' } } } },
    '/auth/request-password-reset': { post: { summary: 'Request password reset', responses: { '200': { description: 'OK' } } } },
    '/auth/reset-password': { post: { summary: 'Reset password', responses: { '200': { description: 'OK' } } } },

    '/books': {
      get: { summary: 'List books', responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Books retrieved', data: [{ id: 'book1', title: 'Clean Code', authors: ['Robert C. Martin'], rating: 4.7, categoryId: 'cat1' }] } } } } } }, '500': { $ref: '#/components/responses/ServerError' } } },
      post: { summary: 'Create book', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '400': { $ref: '#/components/responses/ValidationError' }, '500': { $ref: '#/components/responses/ServerError' } } },
    },
    '/books/{id}': {
      get: { summary: 'Get book', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } }, '404': { $ref: '#/components/responses/NotFound' }, '500': { $ref: '#/components/responses/ServerError' } } },
      put: { summary: 'Update book', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BookUpdate' } } } }, responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '400': { $ref: '#/components/responses/ValidationError' }, '500': { $ref: '#/components/responses/ServerError' } } },
      delete: { summary: 'Delete book', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '500': { $ref: '#/components/responses/ServerError' } } },
    },
    '/books/{id}/cover': { post: { summary: 'Upload book cover', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/books/{id}/pdf': { post: { summary: 'Upload book PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

    '/categories': {
      get: { summary: 'List categories', responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Categories retrieved', data: [{ id: 'cat1', name: 'Programming' }] } } } } } }, '500': { $ref: '#/components/responses/ServerError' } } },
      post: { summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '400': { $ref: '#/components/responses/ValidationError' }, '500': { $ref: '#/components/responses/ServerError' } } },
    },
    '/categories/{id}': {
      get: { summary: 'Get category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } }, '404': { $ref: '#/components/responses/NotFound' }, '500': { $ref: '#/components/responses/ServerError' } } },
      put: { summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } } }, responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '400': { $ref: '#/components/responses/ValidationError' }, '500': { $ref: '#/components/responses/ServerError' } } },
      delete: { summary: 'Delete category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' }, '500': { $ref: '#/components/responses/ServerError' } } },
    },

    '/users': {
      get: { summary: 'List users', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Users retrieved', data: [{ id: 'uid1', email: 'john.doe@example.com', role: 'USER' }] } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } },
    },
    '/users/{id}': {
      get: { summary: 'Get user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'User retrieved', data: { id: 'uid1', email: 'john.doe@example.com', role: 'USER' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '404': { $ref: '#/components/responses/NotFound' } } },
    },
    '/users/profile': {
      get: { summary: 'Get current profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Current user', data: { user: { id: 'uid1', email: 'john.doe@example.com', role: 'USER', firstName: 'John', lastName: 'Doe' } } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
      put: { summary: 'Update current profile', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { update: { value: { firstName: 'John Updated', lastName: 'Doe Updated' } } } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Profile updated', data: { user: { id: 'uid1', firstName: 'John Updated', lastName: 'Doe Updated' } } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '400': { $ref: '#/components/responses/ValidationError' } } },
    },
    '/users/profile/password': { put: { summary: 'Change current password', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { change: { value: { currentPassword: 'Password123!', newPassword: 'NewPassword123!' } } } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Password has been changed' } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '400': { $ref: '#/components/responses/ValidationError' } } } },
    '/users/profile/avatar': { post: { summary: 'Upload avatar', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Avatar uploaded successfully', data: { url: '/public/uploads/avatars/file.png' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } } },

    '/reviews/book/{id}': {
      get: { summary: 'List reviews for a book', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Reviews retrieved', data: [{ id: 'rid1', rating: 5, reviewText: 'Great book!' }] } } } } } }, '404': { $ref: '#/components/responses/NotFound' } } },
    },
    '/reviews/user/{userId}': {
      get: { summary: 'List reviews for a user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Reviews retrieved', data: [{ id: 'rid2', rating: 4 }] } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
    },
    '/reviews': {
      post: { summary: 'Create review', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { create: { value: { bookId: 'book1', rating: 5, reviewText: 'Amazing!' } } } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Review created', data: { id: 'rid3', rating: 5 } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '400': { $ref: '#/components/responses/ValidationError' } } },
    },
    '/reviews/{id}': {
      put: { summary: 'Update review', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { examples: { update: { value: { rating: 4, reviewText: 'Updated comment' } } } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Review updated', data: { id: 'rid3', rating: 4 } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' }, '400': { $ref: '#/components/responses/ValidationError' } } },
      delete: { summary: 'Delete review', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } },
    },

    '/loans': {
      get: { summary: 'List loans (admin/librarian)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Loans retrieved', data: [{ id: 'loan1', userId: 'uid1', bookId: 'book1', status: 'ACTIVE' }] } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } },
      post: { summary: 'Create loan', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { create: { value: { bookId: 'book1' } } } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Loan created', data: { id: 'loanX', status: 'ACTIVE' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '400': { $ref: '#/components/responses/ValidationError' } } },
    },
    '/loans/{id}': {
      get: { summary: 'Get loan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Loan retrieved', data: { id: 'loan1', status: 'ACTIVE' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } },
    },
    '/loans/{id}/return': {
      put: { summary: 'Return loan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Loan returned', data: { id: 'loan1', status: 'RETURNED' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } },
    },
    '/loans/user/{userId}': {
      get: { summary: 'List loans for a user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },
    '/admin/analytics/overview': { get: { summary: 'Analytics overview', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/admin/analytics/timeseries': { get: { summary: 'Analytics timeseries', security: [{ bearerAuth: [] }], parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 365 } }], responses: { '200': { description: 'OK' } } } },
    '/admin/analytics/top-books': { get: { summary: 'Top books', security: [{ bearerAuth: [] }], parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } }], responses: { '200': { description: 'OK' } } } },
    '/admin/analytics/top-categories': { get: { summary: 'Top categories', security: [{ bearerAuth: [] }], parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } }], responses: { '200': { description: 'OK' } } } },

    // User Book Lists
    '/lists': {
      get: { summary: 'Get all lists (grouped)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Lists', data: { FAVORITES: [{ id: 'book1' }], WISHLIST: [] } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
    },
    '/lists/{listType}': {
      get: { summary: 'List items by type', security: [{ bearerAuth: [] }], parameters: [{ name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'List items', data: [{ id: 'book1' }] } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
      post: { summary: 'Add item to list', security: [{ bearerAuth: [] }], parameters: [{ name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } }], requestBody: { required: true, content: { 'application/json': { examples: { body: { value: { bookId: 'book1' } } } } } }, responses: { '201': { description: 'Created', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Added' } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '400': { $ref: '#/components/responses/ValidationError' } } },
    },
    '/lists/{listType}/{bookId}': {
      delete: { summary: 'Remove item from list', security: [{ bearerAuth: [] }], parameters: [
        { name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } },
        { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }
      ], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Removed' } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } },
    },

    // Notifications
    '/notifications': {
      get: { summary: 'List notifications', security: [{ bearerAuth: [] }], parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
        { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } },
      ], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Notifications', data: [{ id: 'n1', type: 'SYSTEM_ANNOUNCEMENT', title: 'Maintenance', isRead: false }] } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
      delete: { summary: 'Delete all notifications', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' } } },
    },
    '/notifications/unread-count': {
      get: { summary: 'Unread notifications count', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Unread count', data: { count: 3 } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' } } },
    },
    '/notifications/{id}/read': { patch: { summary: 'Mark notification as read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } } },
    '/notifications/read-all': { patch: { summary: 'Mark all as read', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' } } } },
    '/notifications/{id}': { delete: { summary: 'Delete notification', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '404': { $ref: '#/components/responses/NotFound' } } } },
    '/notifications/system-announcement': { post: { summary: 'Create system announcement', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { body: { value: { title: 'Maintenance Notice', message: 'System will be down...' } } } } } }, responses: { '201': { description: 'Created' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '400': { $ref: '#/components/responses/ValidationError' } } } },
    '/notifications/custom': { post: { summary: 'Create custom notification', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { examples: { body: { value: { userId: 'uid1', type: 'BOOK_DUE_REMINDER', title: 'Due Soon', message: 'Your book is due.' } } } } } }, responses: { '201': { description: 'Created' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' }, '400': { $ref: '#/components/responses/ValidationError' } } } },

    // Upload
    '/upload/book-cover': { post: { summary: 'Upload book cover (ADMIN/LIBRARIAN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK', content: { 'application/json': { examples: { success: { value: { success: true, message: 'Book cover uploaded successfully', data: { url: '/public/uploads/covers/cover.png' } } } } } } }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } } },
    '/upload/book-pdf': { post: { summary: 'Upload book PDF (ADMIN/LIBRARIAN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } } },
    '/upload/avatar': { post: { summary: 'Upload user avatar', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' } } } },
    '/upload/general': { post: { summary: 'Upload general file (ADMIN/LIBRARIAN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } } },
    '/upload/multiple': { post: { summary: 'Upload multiple files (ADMIN/LIBRARIAN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } } } },
    '/admin/stats': { get: { summary: 'System stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/admin/users': { get: { summary: 'List users (admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/admin/users/{id}/status': { put: { summary: 'Update user status', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/admin/users/{id}/password': { put: { summary: 'Set user password', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/admin/recent': { get: { summary: 'Recent activity', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },

    // Recommendations
    '/recommendations/health': {
      get: {
        summary: 'Recommendations health check',
        responses: { '200': { description: 'OK' }, '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      },
    },
    '/recommendations/trending': {
      get: {
        summary: 'Trending books',
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/similar/{bookId}': {
      get: {
        summary: 'Similar books',
        parameters: [
          { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 20 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/category/{categoryId}': {
      get: {
        summary: 'Recommendations by category',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 30 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/personalized': {
      get: {
        summary: 'Personalized recommendations for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 } },
          { name: 'excludeRead', in: 'query', required: false, schema: { type: 'boolean' } },
          { name: 'minRating', in: 'query', required: false, schema: { type: 'number', minimum: 0, maximum: 5 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PersonalizedRecommendationsResponse' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/analytics': {
      get: {
        summary: 'Recommendation analytics (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK' },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
    // Recommendations
    '/recommendations/health': {
      get: {
        summary: 'Recommendations health check',
        responses: { '200': { description: 'OK' }, '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      },
    },
    '/recommendations/trending': {
      get: {
        summary: 'Trending books',
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/similar/{bookId}': {
      get: {
        summary: 'Similar books',
        parameters: [
          { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 20 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/category/{categoryId}': {
      get: {
        summary: 'Recommendations by category',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 30 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListRecommendationsResponse' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/personalized': {
      get: {
        summary: 'Personalized recommendations for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 } },
          { name: 'excludeRead', in: 'query', required: false, schema: { type: 'boolean' } },
          { name: 'minRating', in: 'query', required: false, schema: { type: 'number', minimum: 0, maximum: 5 } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PersonalizedRecommendationsResponse' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/recommendations/analytics': {
      get: {
        summary: 'Recommendation analytics (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK' },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '500': { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
} as const;

export function swaggerHtml(): string {
  const specUrl = '/api/v1/openapi.json';
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Digital Library API Docs</title>
    <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\" />
  </head>
  <body>
    <div id=\"swagger-ui\"></div>
    <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    </script>
  </body>
  </html>`;
}
