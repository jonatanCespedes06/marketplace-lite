import { describe, expect, it } from 'vitest';
import api from '../src/api/client';

describe('api client', () => {
  it('points at the local backend by default', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3001');
  });
});
