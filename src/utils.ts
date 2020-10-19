export function loadScript(gapiUrl) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + gapiUrl + '"]')) {
      resolve();
      return;
    }

    const el = document.createElement('script');

    el.type = 'text/javascript';
    el.async = true;
    el.src = gapiUrl;

    el.addEventListener('load', resolve);
    el.addEventListener('error', reject);
    el.addEventListener('abort', reject);

    document.head.appendChild(el);
  });
}
