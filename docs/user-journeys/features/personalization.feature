Feature: Personalization Rule Creation
  As a content manager
  I want to create and manage personalization rules
  So that users receive relevant content based on their behavior

  Background:
    Given I am logged in as an administrator
    And I am on the personalization dashboard

  Scenario: View personalization dashboard
    When I navigate to the personalization page
    Then I should see tabs for Rules, Analytics, Preview, Versions, and Templates
    And I should see my current user profile segment
    And I should see the personalization status toggle

  Scenario: Create a new personalization rule
    When I click the "+ Aturan Baru" button
    Then a new rule should be created with default values
    And the edit modal should open
    And I should be able to set the rule name and description

  Scenario: Configure rule segment targeting
    Given I have created a new personalization rule
    When I select segment "Pengunjung Baru" (new_visitor)
    And I select trigger "Saat Halaman Dimuat" (on_page_load)
    And I save the rule
    Then the rule should be configured for new visitors
    And the rule should appear in the rules list

  Scenario: Set rule priority
    Given I have multiple personalization rules
    When I set a higher priority for a specific rule
    Then that rule should be evaluated first
    And the rules list should reflect the priority order

  Scenario: Toggle rule activation
    Given I have an active personalization rule
    When I click the toggle to deactivate the rule
    Then the rule status should change to "Nonaktif"
    And the rule should not be applied to content

  Scenario: Delete a personalization rule
    Given I have a personalization rule I want to remove
    When I click the delete button
    And I confirm the deletion
    Then the rule should be removed from the list
    And the rule should no longer affect content personalization

  Scenario: View personalization analytics
    When I click on the "Analitik" tab
    Then I should see total rules count
    And I should see active rules count
    And I should see total impressions
    And I should see overall lift percentage

  Scenario: Preview personalization effects
    When I click on the "Pratinjau" tab
    Then I should see a preview of personalized content
    And I should be able to simulate different user segments
    And I should see how rules affect content display

  Scenario: View rule version history
    Given I have selected a personalization rule
    When I click on the "Versi" tab
    Then I should see the version history for the selected rule
    And I should be able to restore previous versions
    And I should see what changes were made in each version

  Scenario: Apply personalization template
    When I click on the "Template" tab
    Then I should see available personalization templates
    And I should be able to browse templates by category
    And I should be able to apply a template to create a new rule

  Scenario: Enable/disable personalization globally
    When I toggle the "Personalisasi Diaktifkan" switch
    Then the personalization system should be enabled/disabled
    And all rules should respect this global setting
