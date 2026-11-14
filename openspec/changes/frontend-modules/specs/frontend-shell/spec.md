# Spec Delta

## Purpose

Provides the primary application frame, persistent navigation layout, simulation indicators, and system connectivity monitoring for the NEXO 2031 commercial intelligence front-end.

## ADDED Requirements

### Requirement: Application Layout and Navigation Frame
The web application SHALL render a persistent shell layout containing a sidebar navigation, a top header displaying the active store name, and an indicator of system connectivity.

#### Scenario: Navigating between accessible modules
- **GIVEN** an authenticated user with an active store selected
- **WHEN** the user selects a module link in the navigation sidebar
- **THEN** the application transitions to the requested module view while preserving the layout shell and active store context

#### Scenario: Responsive navigation on smaller screens
- **WHEN** the viewport width drops below 1024 pixels
- **THEN** the sidebar collapses into a retractable drawer accessible via a toggle button

### Requirement: Demonstration and Simulation Transparency
The user interface SHALL visibly display a DEMO badge and informative caption on all views presenting simulated, synthetic, or rule-based demonstration data.

#### Scenario: Viewing demonstration metrics or sensors
- **WHEN** a user views views displaying synthetic metrics, camera mockups, or heatmaps
- **THEN** the UI displays an explicit DEMO badge and text explaining that data is simulated for demonstration purposes

### Requirement: Backend Health and Connection State
The application SHALL monitor API connectivity through the health endpoint and notify the user when the backend is unreachable.

#### Scenario: API is healthy
- **WHEN** the application initializes or checks connectivity and receives a successful status response
- **THEN** the health indicator shows operational status

#### Scenario: API becomes unreachable
- **WHEN** a network error occurs or the health check fails
- **THEN** the application displays a persistent connectivity banner with an option to retry

### Requirement: Global Error and Boundary Feedback
The application SHALL provide accessible error boundaries and standard feedback states for loading, empty datasets, and server failures.

#### Scenario: Network or server error during data retrieval
- **WHEN** an API call returns an unexpected error code
- **THEN** the view renders a localized error alert describing the issue and offering a retry button
