# Spec Delta

## Purpose

Enables retailers to plan, launch, manage the lifecycle, and inspect observational outcomes of commercial improvement experiments linked to accepted recommendations.

## ADDED Requirements

### Requirement: Experiment Listing and Status Overview
The application SHALL render a list of experiments associated with the active store, detailing title, target metric, lifecycle status, and scheduled date intervals.

#### Scenario: Viewing store experiments
- **GIVEN** an active store
- **WHEN** the user accesses the experiments overview
- **THEN** the view lists all recorded experiments displaying status badges, target KPI labels, and date windows

#### Scenario: Empty experiments state
- **GIVEN** a store with no recorded experiments
- **WHEN** the user visits the experiments view
- **THEN** an empty state encourages reviewing recommendations to initiate a new trial

### Requirement: Experiment Creation from Recommendations
The application SHALL provide a creation form allowing users to configure a new experiment linked to an accepted commercial recommendation.

#### Scenario: Creating a valid experiment
- **GIVEN** an accepted recommendation available for the store
- **WHEN** the user inputs an experiment title, planned start date, planned end date, and target metric and submits
- **THEN** the system registers the experiment in draft status and redirects to its detail view

#### Scenario: Date validation on creation
- **WHEN** the planned start date is set after the planned end date
- **THEN** the form blocks submission and displays a date interval validation error

### Requirement: Experiment Lifecycle Management
The application SHALL support transitioning an experiment through its valid lifecycle phases: Draft, Running, Completed, or Cancelled.

#### Scenario: Starting a draft experiment
- **GIVEN** an experiment in draft status
- **WHEN** the user triggers the start experiment action
- **THEN** the status transitions to running and logs the active timeframe

#### Scenario: Completing an active experiment
- **GIVEN** an experiment in running status
- **WHEN** the user triggers the complete action
- **THEN** the status transitions to completed and triggers outcome metric computation

#### Scenario: Rejecting invalid status transitions
- **GIVEN** an experiment already in completed or cancelled status
- **WHEN** an invalid state transition is attempted
- **THEN** the application presents a conflict notification and refreshes the experiment view

### Requirement: Observational Outcome Comparison and Disclaimer
The application SHALL display a comparison of metrics before and during the experiment accompanied by an explicit non-causal observational disclaimer.

#### Scenario: Viewing experiment results
- **GIVEN** a completed experiment with sufficient metric data
- **WHEN** the user views the experiment outcome tab
- **THEN** cards display before and after values for the target metric alongside a disclaimer stating that results are observational and do not prove causality

#### Scenario: Insufficient data for outcome calculation
- **GIVEN** an experiment where data points are unavailable for comparison
- **WHEN** the user requests results
- **THEN** the view states that outcome data is currently unavailable rather than showing fabricated numbers
