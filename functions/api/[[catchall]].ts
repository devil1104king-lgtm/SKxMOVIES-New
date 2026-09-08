import { handleApiRequest, ApiRequest } from '../api-router';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

/**
 * Handle CORS preflight requests
 */
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * Cloudflare Pages Functions Catch-all Handler
 * Handles all requests matching /api/*
 */
export async function onRequest(context: {
  request: Request;
  env: Record<string, any>;
}): Promise<Response> {
  const { request, env } = context;

  // Handle OPTIONS preflight
  if (request.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((val, key) => {
    query[key] = val;
  });

  const headers: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headers[key] = val;
  });

  let body: any = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  const apiReq: ApiRequest = {
    method: request.method,
    path: url.pathname,
    query,
    headers,
    body
  };

  try {
    const apiRes = await handleApiRequest(apiReq, env || {});
    return new Response(JSON.stringify(apiRes.body), {
      status: apiRes.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        ...(apiRes.headers || {})
      }
    });
  } catch (error: any) {
    console.error('[Cloudflare Pages Function] Uncaught Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal Server Error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      }
    );
  }
}
