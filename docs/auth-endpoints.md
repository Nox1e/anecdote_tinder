# Authentication Endpoints

This document describes the authentication endpoints implemented in the FastAPI backend.

## Overview

The authentication system provides user registration, login, logout, and profile management with session-based authentication using JWT tokens stored in the database.

## Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- Email must be valid and unique
- Username must be 3-100 characters and unique
- Password must be 6-100 characters

### POST /auth/login

Authenticate a user and receive a session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

Logout and invalidate the current session token.

**Authentication:** Required (Bearer token or cookie)

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

### GET /auth/me

Get the current user's profile information.

**Authentication:** Required (Bearer token or cookie)

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## Authentication Methods

The API supports two authentication methods:

### 1. Bearer Token (Authorization Header)

```http
Authorization: Bearer <token>
```

### 2. Session Cookie

```http
Cookie: token=<token>
```

Both methods are accepted for all protected endpoints.

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Sessions are stored in the database and can be revoked
- Input validation on all endpoints
- Protection against duplicate emails and usernames

## Database Schema

### Users Table

- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username (3-100 chars)
- `hashed_password`: Bcrypt hash
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Sessions Table

- `id`: Primary key
- `token`: JWT token (unique)
- `user_id`: Foreign key to users table
- `created_at`: Session creation timestamp
- `expires_at`: Token expiration timestamp

## Error Responses

### 400 Bad Request
- Validation errors
- Missing authentication token for logout

### 401 Unauthorized
- Invalid credentials
- Missing or invalid authentication token
- Expired session token

### 422 Unprocessable Entity
- Invalid email format
- Password too short
- Username too short or too long

## Usage Examples

### Register and Login

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Access Protected Endpoint

```bash
# Using Bearer token
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <token>"

# Using cookie
curl -X GET http://localhost:8000/auth/me \
  -H "Cookie: token=<token>"
```

### Logout

```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Authorization: Bearer <token>"
```