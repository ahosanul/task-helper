const keytar = require('keytar');
const { getDatabase } = require('../db/connection');

const SERVICE_NAME = 'flowdesk';
const ACCOUNT_NAME = 'jira_api_token';

// Save Jira credentials
async function saveCredentials({ url, email, token }) {
  const db = getDatabase();
  
  // Store URL and email in SQLite
  db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('jira_url', ?)`).run(url);
  db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('jira_email', ?)`).run(email);
  
  // Store API token in system keychain
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
  
  return true;
}

// Get Jira credentials
async function getCredentials() {
  const db = getDatabase();
  
  const urlRow = db.prepare(`SELECT value FROM settings WHERE key = 'jira_url'`).get();
  const emailRow = db.prepare(`SELECT value FROM settings WHERE key = 'jira_email'`).get();
  
  if (!urlRow || !emailRow) {
    return null;
  }
  
  const token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  
  if (!token) {
    return null;
  }
  
  return {
    url: urlRow.value,
    email: emailRow.value,
    token
  };
}

// Test Jira connection
async function testConnection() {
  const credentials = await getCredentials();
  
  if (!credentials) {
    throw new Error('No credentials configured');
  }
  
  const authHeader = Buffer.from(`${credentials.email}:${credentials.token}`).toString('base64');
  
  try {
    const response = await fetch(`${credentials.url}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Jira API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`);
  }
}

// Delete credentials
async function deleteCredentials() {
  const db = getDatabase();
  
  db.prepare(`DELETE FROM settings WHERE key IN ('jira_url', 'jira_email')`).run();
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  
  return true;
}

module.exports = {
  saveCredentials,
  getCredentials,
  testConnection,
  deleteCredentials
};
