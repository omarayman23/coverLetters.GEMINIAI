// This is our secure Vercel serverless function.
// It acts as a proxy to the Google Gemini API.

export default async function handler(request, response) {
  // We only allow POST requests to this function
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  try {
    // We get the original payload from the client's request
    const clientPayload = request.body;

    // We make the request to the Google API from the server, using our secret key
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientPayload), // Pass along the original payload
    });

    if (!geminiResponse.ok) {
      // If Google's API returns an error, we send it back to our client
      const errorBody = await geminiResponse.text();
      console.error('Gemini API Error:', errorBody);
      return response.status(geminiResponse.status).json({ message: 'Error from Gemini API', details: errorBody });
    }

    // If the request is successful, we send the AI's response back to our client
    const data = await geminiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An internal error occurred.' });
  }
}
