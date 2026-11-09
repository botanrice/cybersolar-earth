exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
    const SITE_ID = process.env.SITE_ID;

    if (!NETLIFY_API_TOKEN || !SITE_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing environment variables' })
      };
    }

    const auth = { Authorization: `Bearer ${NETLIFY_API_TOKEN}` };

    // Resolve the form id by name so only "www-hack" submissions are returned
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`,
      { headers: auth }
    );
    if (!formsRes.ok) throw new Error(`Forms request failed: ${formsRes.status}`);
    const forms = await formsRes.json();
    const form = forms.find(f => f.name === 'www-hack');

    if (!form) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }

    const response = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions`,
      { headers: auth }
    );
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

    const submissions = await response.json();

    const links = submissions
      .map(submission => ({
        id: submission.id,
        url: submission.data.link || '',
        nickname: submission.data.nickname || 'anonymous surfer',
        timestamp: submission.created_at
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(links)
    };
  } catch (error) {
    console.error('Error fetching www-hack submissions:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch links' })
    };
  }
};
