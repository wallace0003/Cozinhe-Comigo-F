export async function testConnection() {
  try {
    const response = await fetch('cozinhe-comigo-api-production.up.railway.app/CozinheComigoAPI/Recipe');
    console.log('API Status:', response.status);
    console.log('API Headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Data:', data);
    }
  } catch (error) {
    console.error('Connection failed:', error);
  }
}