import { parseJsonBody, parseCookies } from './request.js';
import { setSecurityHeaders, sendJson, sendError } from './response.js';

export class Router {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  addRoute(method, path, ...handlers) {
    // Convert path string like '/api/tests/:id' into regex pattern and param names
    const paramNames = [];
    const patternStr = path
      .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${patternStr}$`);

    this.routes.push({
      method: method.toUpperCase(),
      path,
      regex,
      paramNames,
      handlers
    });
  }

  get(path, ...handlers) {
    this.addRoute('GET', path, ...handlers);
  }

  post(path, ...handlers) {
    this.addRoute('POST', path, ...handlers);
  }

  put(path, ...handlers) {
    this.addRoute('PUT', path, ...handlers);
  }

  patch(path, ...handlers) {
    this.addRoute('PATCH', path, ...handlers);
  }

  delete(path, ...handlers) {
    this.addRoute('DELETE', path, ...handlers);
  }

  /**
   * Main request handler to plug directly into http.createServer(router.handleRequest)
   */
  async handleRequest(req, res) {
    try {
      // 1. Set security & CORS headers
      setSecurityHeaders(res, req);

      // Handle OPTIONS preflight immediately
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }

      // 2. Parse URL, pathname, query parameters
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      req.pathname = parsedUrl.pathname;
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());

      // 3. Parse cookies
      req.cookies = parseCookies(req.headers.cookie);

      // 4. Parse JSON body (if appropriate)
      try {
        req.body = await parseJsonBody(req);
      } catch (err) {
        return sendError(res, err.statusCode || 400, err.message || 'Malformed body');
      }

      // 5. Run global middlewares
      for (const mw of this.middlewares) {
        let middlewareCalledNext = false;
        await mw(req, res, () => {
          middlewareCalledNext = true;
        });
        if (!middlewareCalledNext) {
          // Middleware handled or ended the response
          return;
        }
      }

      // 6. Match route
      const method = req.method.toUpperCase();
      let matchedRoute = null;
      let matchedParams = {};

      for (const route of this.routes) {
        if (route.method !== method) continue;

        const match = req.pathname.match(route.regex);
        if (match) {
          matchedRoute = route;
          matchedParams = {};
          route.paramNames.forEach((name, i) => {
            matchedParams[name] = decodeURIComponent(match[i + 1]);
          });
          break;
        }
      }

      if (!matchedRoute) {
        return sendError(res, 404, `Endpoint ${req.method} ${req.pathname} not found`);
      }

      req.params = matchedParams;

      // 7. Execute route handlers sequentially
      for (const handler of matchedRoute.handlers) {
        let calledNext = false;
        await handler(req, res, () => {
          calledNext = true;
        });
        if (!calledNext) {
          // Handler finished response
          break;
        }
      }
    } catch (error) {
      console.error('[Router Error]', error);
      if (!res.writableEnded) {
        sendError(res, 500, 'Internal server error');
      }
    }
  }
}
