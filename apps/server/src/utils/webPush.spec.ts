import { getDevicePlatform, getVapidPublicKey } from './webPush';

describe('WebPush Utilities (Unit Tests)', () => {
  it('should return a non-empty VAPID public key string', () => {
    const key = getVapidPublicKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(20);
  });

  describe('getDevicePlatform', () => {
    it('should detect Chrome/Android endpoints', () => {
      const json = JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/token123',
      });
      expect(getDevicePlatform(json)).toBe('Chrome/Android');
    });

    it('should detect Safari endpoints', () => {
      const json = JSON.stringify({
        endpoint: 'https://web.push.apple.com/send/token123',
      });
      expect(getDevicePlatform(json)).toBe('Safari');
    });

    it('should detect Firefox endpoints', () => {
      const json = JSON.stringify({
        endpoint: 'https://updates.push.services.mozilla.com/wpush/v1/token123',
      });
      expect(getDevicePlatform(json)).toBe('Firefox');
    });

    it('should detect Edge/Windows endpoints', () => {
      const json = JSON.stringify({
        endpoint: 'https://wns2-sn1p.notify.windows.com/w/?token=token123',
      });
      expect(getDevicePlatform(json)).toBe('Edge/Windows');
    });

    it('should fallback to Web Push for unknown endpoints or invalid JSON', () => {
      const json = JSON.stringify({ endpoint: 'https://unknown-push.example.com' });
      expect(getDevicePlatform(json)).toBe('Web Push');
      expect(getDevicePlatform('not-valid-json')).toBe('Web Push');
    });
  });
});
