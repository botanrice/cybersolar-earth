const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const url = (payload.link || '').toString().trim().slice(0, 500);
    const nickname = (payload.nickname || '').toString().trim().slice(0, 40) || 'anonymous surfer';

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Link is required' })
      };
    }

    const store = getStore('search-party-links');
    const links = (await store.get('links', { type: 'json' })) || [];

    const entry = { url, nickname, timestamp: new Date().toISOString() };
    links.unshift(entry);

    // keep the wall from growing unbounded
    const trimmed = links.slice(0, 200);
    await store.setJSON('links', trimmed);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    };
  } catch (err) {
    console.error('Error submitting link:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit link' })
    };
  }
};
