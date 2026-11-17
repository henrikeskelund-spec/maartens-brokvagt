import worker from './worker.mjs';

export default {
  fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path === '/key' && request.method === 'GET' && !request.headers.has('Origin')) {
      const headers = new Headers(request.headers);
      headers.set('Origin', env.APP_ORIGIN);
      return worker.fetch(new Request(request, { headers }), env, ctx);
    }
    if (path.startsWith('/club/')) return worker.fetch(request, env, ctx);
    return new Response('Not found', { status: 404 });
  }
};
