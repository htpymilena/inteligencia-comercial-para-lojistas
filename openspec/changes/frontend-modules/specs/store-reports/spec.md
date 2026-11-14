# Spec Delta

## Purpose

Delivers comparative retail reporting across equivalent consecutive calendar periods, displaying percentage and percentage-point variations alongside client-side aggregate data export.

## ADDED Requirements

### Requirement: Period Comparative Reporting
The application SHALL compare store performance across an active date window against the immediately preceding interval of equal duration.

#### Scenario: Requesting comparative analysis
- **WHEN** the user selects a start date and end date and triggers the report generation
- **THEN** the report presents metrics for the active period compared against the immediately preceding window of identical duration

#### Scenario: Displaying comparative variations
- **WHEN** comparative figures are returned
- **THEN** summary cards display current value, baseline value, percentage variation for volumetric metrics, and percentage-point change for conversion rate

#### Scenario: Zero-baseline handling in comparisons
- **GIVEN** a metric with zero recorded value during the baseline comparison window
- **WHEN** the percentage variation cannot be computed mathematically
- **THEN** the variation indicator displays an em dash placeholder rather than zero or infinity

### Requirement: Client-Side Aggregated CSV Export
The application SHALL provide a client-side export generating a downloadable CSV containing the aggregated comparative report data.

#### Scenario: Exporting aggregate metrics
- **GIVEN** a comparative report loaded on screen
- **WHEN** the user clicks the export CSV button
- **THEN** the browser generates and downloads a CSV file containing the aggregated metrics without requesting personal visitor data
