import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, await params, 'PUT');
}

async function handleProxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const url = `${process.env.INDX_URL}/${path}`;

    // Forward cookies from the client request
    const cookies = request.headers.get('cookie') || '';

    // Get authorization header from client
    const authHeader = request.headers.get('authorization');

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      'Accept': request.headers.get('accept') || '*/*',
      'Cookie': cookies
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Get body for POST/PUT requests
    let body;
    if (method === 'POST' || method === 'PUT') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = JSON.stringify(await request.json());
      } else {
        body = await request.text();
      }
    }

    const proxyRes = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      ...(body && { body })
    });

    // Get response body
    const contentType = proxyRes.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await proxyRes.json();
    } else {
      data = await proxyRes.text();
    }

    // Forward any new cookies from INDX API to client
    const setCookieHeaders = proxyRes.headers.getSetCookie();
    const response = NextResponse.json(data, { status: proxyRes.status });

    setCookieHeaders.forEach(cookie => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}
