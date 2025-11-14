// src/utils/debug.ts
export async function debugSignup(payload: any) {
  try {
    console.log('🔍 DEBUG SIGNUP - Payload:', payload);
    
  const response = await fetch('https://cozinhe-comigo-api-production.up.railway.app/CozinheComigoAPI/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('🔍 DEBUG SIGNUP - Status:', response.status);
    console.log('🔍 DEBUG SIGNUP - Headers:', response.headers);
    
    let responseBody;
    try {
      responseBody = await response.json();
      console.log('🔍 DEBUG SIGNUP - Response:', responseBody);
    } catch (e) {
      responseBody = await response.text();
      console.log('🔍 DEBUG SIGNUP - Response (text):', responseBody);
    }
    
    return { status: response.status, body: responseBody };
  } catch (error) {
    console.error('🔍 DEBUG SIGNUP - Error:', error);
    throw error;
  }
}