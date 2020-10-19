import { JSDOM } from 'jsdom';
import { loadScript } from '../utils';

describe('loadScript', () => {
  test('should return true given loadScript', () => {
    expect(loadScript).toBeDefined();
  });

  test('should add a script tag', () => {
    const scriptElement = document.createElement('script');
    scriptElement.addEventListener = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(() => scriptElement);

    loadScript('https://apis.google.com/js/api.js');

    expect((scriptElement.addEventListener as jest.Mock).mock.calls.length).toBe(3);

    expect(document.head.children.length).toBe(1);

    expect(document.head.children[0]['src']).toBe('https://apis.google.com/js/api.js');
  });

  test('should add a script tag once', () => {
    const el = document.createElement('script');
    el.addEventListener = jest.fn();
    el.type = 'text/javascript';
    el.async = true;
    el.src = 'https://apis.google.com/js/api.js';
    document.head.appendChild(el);

    const scriptElement = document.createElement('script');
    scriptElement.addEventListener = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation(() => scriptElement);

    jest.spyOn(document, 'createElement').mockImplementation(() => scriptElement);

    loadScript('https://apis.google.com/js/api.js');

    expect(document.head.children.length).toBe(1);
  });
});
