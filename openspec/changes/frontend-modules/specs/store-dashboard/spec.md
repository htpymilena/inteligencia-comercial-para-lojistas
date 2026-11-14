# Spec Delta

## Purpose

Provides retail store managers with an executive analytics dashboard summarizing aggregate commercial indicators, daily trends, and period filtering.

## ADDED Requirements

### Requirement: Aggregated Commercial KPI Summary
The dashboard SHALL display key retail indicators including visitors, interactions, sales, aggregate conversion rate, and gross revenue for the selected store and period.

#### Scenario: Displaying indicators for an active period
- **GIVEN** an active store with recorded metrics
- **WHEN** the dashboard loads
- **THEN** cards render the total visitors, interactions, sales count, conversion percentage, and total monetary revenue accompanied by a DEMO data tag

#### Scenario: Handling zero-visitor periods
- **GIVEN** a date interval where total visitors is zero
- **WHEN** the conversion rate cannot be calculated mathematically
- **THEN** the conversion rate displays an em dash placeholder rather than zero percent, NaN, or infinity

### Requirement: Period Selection and Interval Validation
The dashboard SHALL enable selecting arbitrary date intervals and validate that the start date precedes or equals the end date before querying metrics.

#### Scenario: Applying a valid date range
- **WHEN** the user selects a start date and end date with start date on or before end date and applies
- **THEN** the dashboard fetches updated aggregate metrics and refreshes the daily series

#### Scenario: Inverted date interval rejection
- **WHEN** the user sets a start date later than the end date
- **THEN** the application prevents query execution and presents an inline validation error

### Requirement: Daily Trend Visualization and Accessible Representation
The dashboard SHALL render a daily time series chart of visitors and sales along with an accessible textual summary or data table.

#### Scenario: Visualizing metric trends
- **WHEN** daily metric points are retrieved for the active range
- **THEN** a combined trend chart plots daily visitors alongside daily completed sales with visible legends

#### Scenario: Assistive and accessible metric consumption
- **WHEN** a screen reader or keyboard-only user inspects the trend section
- **THEN** an accessible summary table provides equivalent numerical data for each date in the period

### Requirement: Opportunity Link to Recommendations
The dashboard SHALL present an opportunities card directing the user to the store recommendations view.

#### Scenario: Navigating to recommendations from dashboard
- **WHEN** the user clicks the view recommendations button in the opportunities card
- **THEN** the application navigates to the recommendations screen for the active store
