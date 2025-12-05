import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const loginRes = await fetch(`${process.env.INDX_URL}/api/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*'
      },
      credentials: 'include',
      body: JSON.stringify({
        userEmail: process.env.INDX_EMAIL,
        userPassWord: process.env.INDX_PASSWORD
      })
    });

    if (!loginRes.ok) {
      return NextResponse.json(
        { error: 'Login failed', status: loginRes.status },
        { status: loginRes.status }
      );
    }

    const data = await loginRes.json();

    // Forward cookies from INDX API to client
    const setCookieHeaders = loginRes.headers.getSetCookie();
    const response = NextResponse.json(data);

    setCookieHeaders.forEach(cookie => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
