# GitHub Project Board Setup for Maskom

## Creating a GitHub Project Board

1. Navigate to the Maskom repository on GitHub
2. Click on the "Projects" tab
3. Click "New project"
4. Choose "Kanban" or "Automated kanban" project type
5. Name the project "Maskom Development Board"

## Column Setup

Set up the following columns on your project board:

- **To Do**: Issues that need to be worked on
- **In Progress**: Issues currently being developed
- **Review**: Pull requests and issues under review
- **Done**: Completed issues

## Column Automation

Configure these automation rules:

### To Do Column
- Issues that are unassigned or assigned to anyone
- Issues with priority "low" or no priority label

### In Progress Column
- Issues assigned to someone
- Issues with "in progress" or "development" labels

### Review Column
- Pull requests
- Issues with "review" or "testing" labels

### Done Column
- Closed issues
- Merged pull requests

## Issue and Pull Request Integration

Ensure that the project board automatically tracks:

- New issues added to "To Do"
- Issues moved to "In Progress" when assigned
- Pull requests created from issues move to "Review"
- Closed issues and merged PRs move to "Done"

## Labels to Use

Create and use these labels for better organization:

- `priority:high`
- `priority:medium` 
- `priority:low`
- `bug`
- `feature`
- `enhancement`
- `documentation`
- `needs-review`
- `in-progress`
- `waiting`

## Project Board Permissions

- Grant "Write" access to team members who will be working on issues
- Keep "Admin" access limited to project maintainers
- Configure automatic archiving of closed issues after 30 days