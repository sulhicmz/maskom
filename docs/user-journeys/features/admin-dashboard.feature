Feature: Admin Dashboard Usage
  As an administrator
  I want to manage platform settings and view analytics
  So that I can maintain and monitor the platform effectively

  Background:
    Given I am logged in as an administrator
    And I have access to the admin dashboard

  Scenario: Access admin dashboard
    When I navigate to the admin dashboard
    Then I should see the main dashboard overview
    And I should see navigation for all admin sections

  Scenario: View analytics overview
    When I navigate to the admin analytics section
    Then I should see key performance metrics
    And I should see user engagement statistics
    And I should see content performance data

  Scenario: Manage user comments
    Given there are pending user comments
    When I navigate to the admin comments section
    Then I should see a list of all comments
    And I should be able to approve or reject comments
    And I should be able to delete inappropriate comments

  Scenario: Configure email scheduler
    When I navigate to the email scheduler section
    Then I should see scheduled email campaigns
    And I should be able to create new email campaigns
    And I should be able to edit or delete existing campaigns

  Scenario: View audit logs
    When I navigate to the audit logs section
    Then I should see a chronological list of system events
    And I should be able to filter logs by date range
    And I should be able to filter logs by event type

  Scenario: Manage backup configurations
    When I navigate to the backups section
    Then I should see backup status and history
    And I should be able to trigger manual backups
    And I should be able to configure backup schedules

  Scenario: Monitor system performance
    When I navigate to the APM config section
    Then I should see application performance metrics
    And I should be able to configure monitoring thresholds
    And I should see any performance alerts

  Scenario: Manage CDN configuration
    When I navigate to the CDN config section
    Then I should see current CDN settings
    And I should be able to update cache rules
    And I should be able to purge cache

  Scenario: View anomaly reports
    When I navigate to the anomalies section
    Then I should see detected system anomalies
    And I should be able to acknowledge or resolve anomalies
    And I should see anomaly severity levels
