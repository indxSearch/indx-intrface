import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, dataset } = await request.json();

    if (!token || !dataset) {
      return NextResponse.json(
        { error: 'Token and dataset are required' },
        { status: 400 }
      );
    }

    // Forward cookies from the client request
    const cookies = request.headers.get('cookie') || '';

    // Debug logging
    console.log('[Session] Received cookies:', cookies ? 'present' : 'none');
    console.log('[Session] Token:', token ? 'present' : 'missing');

    const createOrOpenRes = await fetch(
      `${process.env.INDX_URL}/api/CreateOrOpen/${dataset}/400`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cookie': cookies
        },
        body: '""'
      }
    );

    if (!createOrOpenRes.ok) {
      const errorText = await createOrOpenRes.text();
      console.error('[Session] CreateOrOpen failed:', createOrOpenRes.status, errorText);
      return NextResponse.json(
        { error: 'CreateOrOpen failed', details: errorText, status: createOrOpenRes.status },
        { status: createOrOpenRes.status }
      );
    }

    // Forward any new cookies from INDX API to client
    const setCookieHeaders = createOrOpenRes.headers.getSetCookie();
    const response = NextResponse.json({ success: true });

    setCookieHeaders.forEach(cookie => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('CreateOrOpen error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
