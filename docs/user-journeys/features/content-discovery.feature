Feature: Content Discovery and Bookmarking
  As a reader
  I want to discover and save blog posts
  So that I can easily access content that interests me

  Background:
    Given I am on the Maskom platform

  Scenario: Browse blog posts
    When I navigate to the blog page
    Then I should see a list of blog posts
    And each post should display title, excerpt, and category
    And I should be able to filter posts by category

  Scenario: Read a blog post
    Given there is a blog post with title "Understanding Network Security"
    When I click on the blog post
    Then I should see the full post content
    And I should see the reading progress indicator
    And my reading history should be updated

  Scenario: Bookmark a blog post for later
    Given I am reading a blog post
    When I click the bookmark button
    Then the post should be added to my bookmarks
    And I should see a confirmation message

  Scenario: View saved bookmarks
    Given I have bookmarked 3 blog posts
    When I navigate to the bookmarks page
    Then I should see all 3 saved posts
    And each bookmark should display the post title and save date
    And I should be able to click to read any bookmarked post

  Scenario: Remove a bookmark
    Given I have bookmarked a blog post
    When I navigate to the bookmarks page
    And I click the remove bookmark button
    And I confirm the removal
    Then the bookmark should be removed from my list
    And I should see an updated bookmarks count

  Scenario: Empty bookmarks state
    Given I have not bookmarked any posts
    When I navigate to the bookmarks page
    Then I should see an empty state message
    And I should see a "Browse Blog" button to discover content

  Scenario: Reading history tracking
    Given I have read multiple blog posts
    When I navigate to the dashboard
    Then I should see my reading history section
    And the history should be grouped by date
    And I should see reading progress for each post
