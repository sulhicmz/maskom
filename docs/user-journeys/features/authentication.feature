Feature: User Authentication
  As a visitor
  I want to register and login to the platform
  So that I can access personalized features and services

  Background:
    Given I am on the Maskom platform
    And I am not logged in

  Scenario: New user registration with valid data
    When I navigate to the sign-up page
    And I enter my full name "Andi Wijaya"
    And I enter my corporate email "andi@company.co.id"
    And I enter a password with at least 8 characters
    And I submit the registration form
    Then I should see a success message
    And my account should be created in the system

  Scenario: Registration with invalid email format
    When I navigate to the sign-up page
    And I enter my full name "Andi Wijaya"
    And I enter an invalid email "andi-invalid-email"
    And I submit the registration form
    Then I should see an email validation error
    And the form should not be submitted

  Scenario: Registration with weak password
    When I navigate to the sign-up page
    And I enter my full name "Andi Wijaya"
    And I enter my corporate email "andi@company.co.id"
    And I enter a password with less than 8 characters
    And I submit the registration form
    Then I should see a password validation error
    And the form should not be submitted

  Scenario: Existing user login with valid credentials
    Given I have a registered account with email "user@maskom.co.id"
    When I navigate to the login page
    And I enter my email "user@maskom.co.id"
    And I enter my password
    And I submit the login form
    Then I should be redirected to the dashboard
    And I should see my user profile

  Scenario: Login with invalid credentials
    When I navigate to the login page
    And I enter an unregistered email "unknown@test.com"
    And I enter any password
    And I submit the login form
    Then I should see an authentication error
    And I should remain on the login page

  Scenario: Navigate between login and registration
    When I navigate to the login page
    And I click on "Daftar Maskom" link
    Then I should be redirected to the sign-up page
    When I click on "Masuk di sini" link
    Then I should be redirected to the login page
