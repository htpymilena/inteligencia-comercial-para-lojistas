# Spec Delta

## Purpose

Enables mall administrators and participating store managers to configure, monitor, and evaluate cooperative marketing circuits across three retail stores using aggregate demonstration metrics.

## ADDED Requirements

### Requirement: Cooperative Circuit Overview and Access Control
The application SHALL list cooperative marketing campaigns, displaying full administrative management tools to mall administrators and read-only views to participating retailers.

#### Scenario: Retailer views participating circuits
- **GIVEN** an authenticated lojista user
- **WHEN** opening the circuits section
- **THEN** the list displays only campaigns in which at least one of their assigned stores participates, without showing creation controls

#### Scenario: Administrator views all circuits
- **GIVEN** an authenticated admin user
- **WHEN** opening the circuits section
- **THEN** the view lists all registered circuits and presents the action to create a new circuit

### Requirement: Administrator Circuit Creation with Three Distinct Stores
The application SHALL require administrators configuring a circuit to select exactly three distinct stores before creating the campaign.

#### Scenario: Submitting valid circuit with three distinct stores
- **GIVEN** an administrator on the circuit creation form
- **WHEN** the admin provides a name, reward description, date interval, and selects exactly three distinct participating stores and submits
- **THEN** the system creates the circuit and redirects to its detail view

#### Scenario: Rejecting invalid store selections
- **WHEN** fewer or more than three stores are selected, or duplicate stores are picked
- **THEN** the form blocks submission with an explicit validation error

### Requirement: Circuit Progress and Aggregate Demonstration Statistics
The circuit detail view SHALL render the three participating stores in an illustrative route along with aggregated simulated completion statistics and simulation disclaimers.

#### Scenario: Viewing circuit performance details
- **WHEN** an authorized user opens a circuit detail view
- **THEN** the screen displays the three participating stores in an illustrative route, aggregate completion counts, and a disclaimer noting that metrics are simulated

#### Scenario: Administrative status lifecycle transitions
- **GIVEN** an administrator viewing an active circuit
- **WHEN** the admin toggles status between active, completed, or cancelled
- **THEN** the status update is recorded and reflected on the circuit screen
