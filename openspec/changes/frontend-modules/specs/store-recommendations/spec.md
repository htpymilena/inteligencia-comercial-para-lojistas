# Spec Delta

## Purpose

Presents explainable, rule-based commercial recommendations to store operators and supports accepting or dismissing actions with automated conflict resolution.

## ADDED Requirements

### Requirement: Commercial Recommendations Feed
The application SHALL render a feed of actionable retail recommendations featuring title, strategic hypothesis, priority classification, supporting evidence, and demonstration source badge.

#### Scenario: Displaying proposed recommendations
- **GIVEN** an active store with generated recommendations
- **WHEN** the user visits the recommendations view
- **THEN** recommendation cards render priority badges, explanation narratives, supporting metric evidence, and rule-based demonstration badges

#### Scenario: Filtering recommendations by status
- **WHEN** the user filters by status (such as Proposed, Accepted, Dismissed, or All)
- **THEN** only cards matching the chosen status filter are displayed

### Requirement: Accepting or Dismissing Recommendations
The application SHALL allow users to accept or dismiss proposed recommendations and update their status accordingly.

#### Scenario: Accepting a proposed recommendation
- **GIVEN** a recommendation in proposed status
- **WHEN** the user clicks the accept action
- **THEN** the recommendation transitions to accepted status and enables a create experiment shortcut button

#### Scenario: Dismissing a proposed recommendation
- **GIVEN** a recommendation in proposed status
- **WHEN** the user clicks the dismiss action
- **THEN** the recommendation transitions to dismissed status and disables further acceptance actions

### Requirement: Concurrent Modification and Conflict Handling
The application SHALL handle conflict errors gracefully when a recommendation state has changed on the server.

#### Scenario: State conflict response on action
- **GIVEN** a recommendation whose status was modified in another session
- **WHEN** the user attempts an action that yields an HTTP 409 Conflict
- **THEN** the application presents a message explaining the status changed and automatically refreshes the recommendation list

### Requirement: Bridging Accepted Recommendations to Experiments
The application SHALL provide a transition from an accepted recommendation directly into the experiment creation flow.

#### Scenario: Launching experiment from accepted recommendation
- **GIVEN** a recommendation marked as accepted
- **WHEN** the user selects the create experiment action on that card
- **THEN** the application navigates to the experiment creation screen with the recommendation reference pre-populated
