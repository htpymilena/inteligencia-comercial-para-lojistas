# Spec Delta

## Purpose

Enables secure user authentication, in-memory credential and token management, store switching, and role-based route protection across the application.

## ADDED Requirements

### Requirement: User Authentication and Login
The application SHALL provide a login screen requiring valid email and password credentials, rejecting invalid inputs and storing session tokens strictly in application memory.

#### Scenario: Successful authentication
- **GIVEN** an unauthenticated user on the login screen
- **WHEN** the user submits valid credentials
- **THEN** the system issues an in-memory session token, retrieves user profile details, and navigates to the store selection screen

#### Scenario: Invalid credentials provided
- **WHEN** the user submits incorrect email or password
- **THEN** the application displays a descriptive authentication error without storing any token

#### Scenario: Input validation failure
- **WHEN** the user submits a malformed email or empty password
- **THEN** inline validation errors are highlighted before sending requests to the server

### Requirement: In-Memory Session Lifetime
The application SHALL hold authentication tokens exclusively in memory, never persisting tokens to browser local storage or persistent cookies.

#### Scenario: Browser refresh or page reload
- **WHEN** the user refreshes the browser or reloads the tab
- **THEN** the in-memory token is cleared and the user is redirected to the login view

#### Scenario: Session expiration or unauthorized response
- **WHEN** any API call returns an HTTP 401 Unauthorized status
- **THEN** the application clears the current session state and redirects the user to the login screen

### Requirement: Store Selection and Switching
The application SHALL allow authenticated users to view only their authorized retail stores and select one to operate as the active store context.

#### Scenario: Displaying authorized stores
- **GIVEN** an authenticated user
- **WHEN** the user visits the store selection screen
- **THEN** the view lists all stores assigned to the user with their name, segment, and demonstration indicators

#### Scenario: Selecting an active store
- **WHEN** the user selects an authorized store
- **THEN** the application sets the active store context and navigates to that store's dashboard

### Requirement: Access Control and Forbidden Route Guard
The application SHALL protect store-specific routes against unauthorized access, presenting a dedicated forbidden view when access is denied.

#### Scenario: Attempting to access an unauthorized store
- **GIVEN** a lojista user attempting to access a store ID not assigned to their account
- **WHEN** navigating directly to that store's URL
- **THEN** the application renders a 403 Forbidden view with a link to return to the store selection screen

### Requirement: User Logout
The application SHALL allow the authenticated user to terminate their session on demand.

#### Scenario: Explicit logout
- **WHEN** the user clicks the logout action
- **THEN** the application clears all in-memory credentials, invalidates cached store data, and navigates to the login screen
