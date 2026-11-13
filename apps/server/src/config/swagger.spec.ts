import { specs } from './swagger';

describe('Swagger Specs', () => {
  it('should generate swagger openapi specification', () => {
    expect(specs).toBeDefined();
    expect(specs.openapi).toBe('3.0.0');
    expect(specs.info.title).toBe('vibe-message API');
    expect(specs.components?.securitySchemes).toHaveProperty('bearerAuth');
  });
});

