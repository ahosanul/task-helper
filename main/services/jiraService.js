const { getCredentials } = require('../ipc/credentials');

class JiraService {
  constructor() {
    this.credentials = null;
    this.authHeader = null;
  }

  async init() {
    this.credentials = await getCredentials();
    if (this.credentials) {
      this.authHeader = Buffer.from(`${this.credentials.email}:${this.credentials.token}`).toString('base64');
    }
    return !!this.credentials;
  }

  async fetchMyself() {
    if (!this.authHeader) throw new Error('Not authenticated');
    
    const response = await fetch(`${this.credentials.url}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${this.authHeader}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Jira API returned ${response.status}`);
    }
    
    return response.json();
  }

  async searchIssues(jql, startAt = 0, maxResults = 100) {
    if (!this.authHeader) throw new Error('Not authenticated');
    
    const fields = [
      'summary', 'description', 'priority', 'duedate', 'status',
      'subtasks', 'labels', 'parent', 'updated',
      'timeoriginalestimate', 'timespent', 'timeestimate'
    ].join(',');
    
    const url = new URL(`${this.credentials.url}/rest/api/3/search`);
    url.searchParams.set('jql', jql);
    url.searchParams.set('fields', fields);
    url.searchParams.set('maxResults', maxResults.toString());
    url.searchParams.set('startAt', startAt.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${this.authHeader}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Jira API returned ${response.status}`);
    }
    
    return response.json();
  }

  async getIssue(issueKey) {
    if (!this.authHeader) throw new Error('Not authenticated');
    
    const response = await fetch(`${this.credentials.url}/rest/api/3/issue/${issueKey}`, {
      headers: {
        'Authorization': `Basic ${this.authHeader}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Jira API returned ${response.status}`);
    }
    
    return response.json();
  }

  mapPriority(jiraPriority) {
    if (!jiraPriority) return 'medium';
    const name = (jiraPriority.name || '').toLowerCase();
    
    if (name.includes('critical') || name.includes('highest')) return 'critical';
    if (name.includes('high')) return 'high';
    if (name.includes('low')) return 'low';
    return 'medium';
  }

  parseTimeSeconds(timeInSecounds) {
    return timeInSecounds || 0;
  }
}

module.exports = JiraService;
