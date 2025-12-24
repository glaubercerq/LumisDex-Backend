import { httpGet } from '../utils/httpClient';

describe('HTTP Client', () => {
  describe('httpGet', () => {
    it('should fetch data from valid URL', async () => {
      const data = await httpGet<{ name: string }>('https://pokeapi.co/api/v2/pokemon/1');
      
      expect(data).toHaveProperty('name', 'bulbasaur');
    }, 15000);

    it('should throw error for invalid URL', async () => {
      await expect(
        httpGet('https://pokeapi.co/api/v2/pokemon/99999999')
      ).rejects.toThrow();
    }, 15000);
  });
});

