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
  },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/auth/register': { post: { summary: 'Register', responses: { '201': { description: 'Created' } } } },
    '/auth/login': { post: { summary: 'Login', responses: { '200': { description: 'OK' } } } },
    '/auth/refresh': { post: { summary: 'Refresh tokens', responses: { '200': { description: 'OK' } } } },
    '/auth/logout': { post: { summary: 'Logout', responses: { '200': { description: 'OK' } } } },
    '/auth/me': { get: { summary: 'Current user', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } } },
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
    '/auth/verify-email': { post: { summary: 'Verify email', responses: { '200': { description: 'OK' } } } },
    '/auth/request-password-reset': { post: { summary: 'Request password reset', responses: { '200': { description: 'OK' } } } },
    '/auth/reset-password': { post: { summary: 'Reset password', responses: { '200': { description: 'OK' } } } },

    '/books': {
      get: { summary: 'List books', responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create book', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookCreate' } } } }, responses: { '201': { description: 'Created' } } },
    },
    '/books/{id}': {
      get: { summary: 'Get book', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { summary: 'Update book', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BookUpdate' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { summary: 'Delete book', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },
    '/books/{id}/cover': { post: { summary: 'Upload book cover', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/books/{id}/pdf': { post: { summary: 'Upload book PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

    '/categories': {
      get: { summary: 'List categories', responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } } }, responses: { '201': { description: 'Created' } } },
    },
    '/categories/{id}': {
      get: { summary: 'Get category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { summary: 'Delete category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },

    '/users': {
      get: { summary: 'List users', responses: { '200': { description: 'OK' } } },
    },
    '/users/{id}': {
      get: { summary: 'Get user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
    },
    '/users/profile': {
      get: { summary: 'Get current profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
      put: { summary: 'Update current profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
    },
    '/users/profile/password': { put: { summary: 'Change current password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/users/profile/avatar': { post: { summary: 'Upload avatar', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },

    '/reviews/book/{id}': {
      get: { summary: 'List reviews for a book', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },
    '/reviews/user/{userId}': {
      get: { summary: 'List reviews for a user', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },
    '/reviews': {
      post: { summary: 'Create review', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/reviews/{id}': {
      put: { summary: 'Update review', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      delete: { summary: 'Delete review', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
    },

    '/loans': {
      get: { summary: 'List loans (admin/librarian)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create loan', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/loans/{id}': {
      get: { summary: 'Get loan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
    },
    '/loans/{id}/return': {
      put: { summary: 'Return loan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
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
      get: { summary: 'Get all lists (grouped)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/lists/{listType}': {
      get: { summary: 'List items by type', security: [{ bearerAuth: [] }], parameters: [{ name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } }], responses: { '200': { description: 'OK' } } },
      post: { summary: 'Add item to list', security: [{ bearerAuth: [] }], parameters: [{ name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } }], responses: { '201': { description: 'Created' } } },
    },
    '/lists/{listType}/{bookId}': {
      delete: { summary: 'Remove item from list', security: [{ bearerAuth: [] }], parameters: [
        { name: 'listType', in: 'path', required: true, schema: { type: 'string', enum: ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'] } },
        { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }
      ], responses: { '200': { description: 'OK' } } },
    },
    '/admin/stats': { get: { summary: 'System stats', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/admin/users': { get: { summary: 'List users (admin)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
    '/admin/users/{id}/status': { put: { summary: 'Update user status', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/admin/users/{id}/password': { put: { summary: 'Set user password', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
    '/admin/recent': { get: { summary: 'Recent activity', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } } },
  },
} as const;

export function swaggerHtml(): string {
  const specUrl = '/api/v1/openapi.json';
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digital Library API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
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
