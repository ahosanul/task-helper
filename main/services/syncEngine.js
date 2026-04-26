const { v4: uuidv4 } = require('uuid');
const JiraService = require('./jiraService');
const { getDatabase } = require('../db/connection');
const taskOps = require('../ipc/tasks');

class SyncEngine {
  constructor() {
    this.jira = new JiraService();
  }

  async sync() {
    const db = getDatabase();
    
    // Initialize Jira connection
    const hasCredentials = await this.jira.init();
    if (!hasCredentials) {
      throw new Error('Jira credentials not configured');
    }

    // Verify connection
    try {
      await this.jira.fetchMyself();
    } catch (error) {
      throw new Error(`Jira authentication failed: ${error.message}`);
    }

    // Fetch all issues from both queries
    const allIssues = await this.fetchAllIssues();
    
    // Process each issue
    let syncedCount = 0;
    for (const issue of allIssues) {
      await this.processIssue(issue);
      syncedCount++;
    }

    // Mark removed tickets as done_on_jira
    await this.markRemovedTickets(allIssues);

    // Update last sync time
    db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('last_synced_at', ?)`)
      .run(new Date().toISOString());

    return { syncedCount };
  }

  async fetchAllIssues() {
    const issuesMap = new Map();
    
    // Query 1: assignee = currentUser()
    const query1 = 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC';
    await this.fetchWithPagination(query1, issuesMap);
    
    // Query 2: "Responsible Dev" = currentUser()
    const query2 = '"Responsible Dev" = currentUser() AND statusCategory != Done ORDER BY updated DESC';
    await this.fetchWithPagination(query2, issuesMap);
    
    return Array.from(issuesMap.values());
  }

  async fetchWithPagination(jql, issuesMap) {
    let startAt = 0;
    const maxResults = 100;
    
    while (true) {
      const result = await this.jira.searchIssues(jql, startAt, maxResults);
      
      for (const issue of result.issues) {
        if (!issuesMap.has(issue.key)) {
          issuesMap.set(issue.key, issue);
        }
      }
      
      if (startAt + maxResults >= result.total) {
        break;
      }
      
      startAt += maxResults;
    }
  }

  async processIssue(issue) {
    const db = getDatabase();
    
    // Check if issue exists locally
    const existing = db.prepare('SELECT * FROM tasks WHERE jira_key = ?').get(issue.key);
    
    const taskData = {
      id: existing ? existing.id : uuidv4(),
      title: issue.fields.summary,
      description: issue.fields.description || null,
      source: 'jira',
      jiraKey: issue.key,
      jiraUrl: `${this.jira.credentials.url}/browse/${issue.key}`,
      jiraUpdatedAt: issue.fields.updated,
      jiraEstimatedSeconds: this.jira.parseTimeSeconds(issue.fields.timeoriginalestimate),
      jiraLoggedSeconds: this.jira.parseTimeSeconds(issue.fields.timespent),
      jiraRemainingSeconds: this.jira.parseTimeSeconds(issue.fields.timeestimate),
      status: this.mapStatus(issue.fields.status),
      priority: this.jira.mapPriority(issue.fields.priority),
      dueDate: issue.fields.duedate || null,
      parentId: null,
      parentJiraKey: null,
      isPinned: existing ? existing.is_pinned : false
    };

    // Handle parent for subtasks
    if (issue.fields.parent) {
      taskData.parentJiraKey = issue.fields.parent.key;
      const parentTask = db.prepare('SELECT id FROM tasks WHERE jira_key = ?').get(issue.fields.parent.key);
      taskData.parentId = parentTask ? parentTask.id : null;
    }

    if (existing) {
      // Update only if changed
      if (existing.jira_updated_at !== issue.fields.updated) {
        taskOps.updateTask(taskData.id, {
          title: taskData.title,
          description: taskData.description,
          jiraUpdatedAt: taskData.jiraUpdatedAt,
          jiraEstimatedSeconds: taskData.jiraEstimatedSeconds,
          jiraLoggedSeconds: taskData.jiraLoggedSeconds,
          jiraRemainingSeconds: taskData.jiraRemainingSeconds,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          parentId: taskData.parentId
        });
      }
    } else {
      // Insert new
      taskOps.createTask(taskData);
    }

    // Process subtasks
    if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
      for (const subtask of issue.fields.subtasks) {
        const fullSubtask = await this.jira.getIssue(subtask.key);
        await this.processIssue(fullSubtask);
      }
    }
  }

  mapStatus(jiraStatus) {
    if (!jiraStatus) return 'todo';
    const statusCategory = (jiraStatus.statusCategory || {}).name || '';
    
    if (statusCategory.toLowerCase().includes('done')) {
      return 'done_on_jira';
    }
    
    const statusName = (jiraStatus.name || '').toLowerCase();
    if (statusName.includes('progress')) {
      return 'in_progress';
    }
    
    return 'todo';
  }

  async markRemovedTickets(syncedIssues) {
    const db = getDatabase();
    const syncedKeys = new Set(syncedIssues.map(i => i.key));
    
    const jiraTasks = db.prepare("SELECT id, jira_key FROM tasks WHERE source = 'jira'").all();
    
    for (const task of jiraTasks) {
      if (!syncedKeys.has(task.jira_key)) {
        db.prepare(`
          UPDATE tasks SET status = 'done_on_jira', updated_at = datetime('now')
          WHERE id = ?
        `).run(task.id);
      }
    }
  }
}

module.exports = SyncEngine;
