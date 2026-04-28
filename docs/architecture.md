# Architecture Overview

## Problem Statement

Lab resources in colleges are often managed with manual approvals and spreadsheets, causing slot clashes, poor tracking, and delayed approvals. This project provides a role-based web platform for digital booking and lifecycle tracking.

## High-Level Design

- Frontend (`React`) handles user interaction and role-specific UI.
- Backend follows microservice-style separation:
  - `auth-service`: user accounts, login/signup, JWT generation
  - `resource-service`: resource CRUD, search, availability metadata
  - `booking-service`: booking request workflow and overlap prevention
- Database: shared MongoDB database with separate collections.

## Component Interaction

1. User signs up/logs in via `auth-service`.
2. Frontend stores JWT token and sends it in `Authorization` header.
3. Frontend fetches resources from `resource-service`.
4. Students submit booking requests to `booking-service`.
5. Faculty/Admin reviews requests and updates booking state.
6. Booking is marked returned after usage.

## Security and Access Control

- JWT token validation in each service.
- Role checks:
  - `student`: create booking, view own bookings
  - `faculty`: review requests, mark returned
  - `admin`: all faculty capabilities + resource management

## Scalability Notes

- Services can be deployed independently.
- API Gateway can be added later for centralized routing/rate limiting.
- Collections can be indexed by `email`, `resourceId`, and `status` for scale.
