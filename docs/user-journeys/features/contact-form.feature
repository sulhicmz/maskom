Feature: Contact Form Submission
  As a potential customer
  I want to submit my inquiry through the contact form
  So that the Maskom team can help with my connectivity needs

  Background:
    Given I am on the Maskom platform
    And I am on the contact page

  Scenario: Submit contact form with valid data
    When I enter my name "Budi Santoso"
    And I enter my corporate email "budi@enterprise.co.id"
    And I enter my message "I need information about managed network services"
    And I submit the contact form
    Then I should see a success message "Pesan berhasil dikirim"
    And the email should be sent to the Maskom team

  Scenario: Contact form validation - empty name
    When I leave the name field empty
    And I enter my corporate email "test@company.co.id"
    And I enter a message
    And I submit the contact form
    Then I should see a name validation error
    And the form should not be submitted

  Scenario: Contact form validation - invalid email
    When I enter my name "Test User"
    And I enter an invalid email "invalid-email"
    And I enter a message
    And I submit the contact form
    Then I should see an email validation error
    And the form should not be submitted

  Scenario: Contact form validation - empty message
    When I enter my name "Test User"
    And I enter my corporate email "test@company.co.id"
    And I leave the message field empty
    And I submit the contact form
    Then I should see a message validation error
    And the form should not be submitted

  Scenario: Contact form with long message
    When I enter my name "Test User"
    And I enter my corporate email "test@company.co.id"
    And I enter a message longer than 500 characters
    And I submit the contact form
    Then the message should be truncated or validated
    And I should see appropriate feedback

  Scenario: Submit multiple inquiries
    Given I have previously submitted a contact form
    When I submit another contact form with different content
    Then both inquiries should be recorded
    And I should receive confirmation for each submission
