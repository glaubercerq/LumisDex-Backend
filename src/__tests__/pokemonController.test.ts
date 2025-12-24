import request from 'supertest';
import app from '../app';

describe('Pokemon Controller', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/pokemon', () => {
    it('should return paginated pokemon list', async () => {
      const response = await request(app)
        .get('/api/pokemon')
        .query({ page: 1, limit: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
    }, 30000);

    it('should return error for limit exceeding 100', async () => {
      const response = await request(app)
        .get('/api/pokemon')
        .query({ limit: 150 });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/pokemon/:idOrName', () => {
    it('should return pokemon by id', async () => {
      const response = await request(app).get('/api/pokemon/25');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 25);
      expect(response.body).toHaveProperty('name', 'pikachu');
    }, 15000);

    it('should return pokemon by name', async () => {
      const response = await request(app).get('/api/pokemon/pikachu');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'pikachu');
    }, 15000);

    it('should return 404 for non-existent pokemon', async () => {
      const response = await request(app).get('/api/pokemon/nonexistentpokemon');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    }, 15000);
  });

  describe('GET /api/pokemon/search', () => {
    it('should search pokemon by name', async () => {
      const response = await request(app)
        .get('/api/pokemon/search')
        .query({ q: 'pikachu' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeGreaterThan(0);
    }, 15000);

    it('should return error for empty search query', async () => {
      const response = await request(app)
        .get('/api/pokemon/search')
        .query({ q: '' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

