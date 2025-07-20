# Admin Dashboard API Specifications

This document provides comprehensive API specifications for the Admin Dashboard functionality. These endpoints require admin role authorization.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All admin endpoints require Bearer token authentication with admin role privileges.

```
Authorization: Bearer <jwt_token>
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 1. Admin Statistics

### GET /admin/stats
Retrieve comprehensive dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "totalUsers": 1250,
  "totalTransactions": 3420,
  "totalRevenue": 125000.50,
  "pendingPayments": 15,
  "activeUsers": 890,
  "certificatesGenerated": 8750,
  "monthlyRevenue": [10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 38000],
  "userGrowth": [50, 75, 100, 120, 150, 180, 200, 220, 250, 280, 300, 320]
}
```

**Error Responses:**
- `401` - Invalid or missing authentication token
- `403` - User does not have admin privileges
- `500` - Server error retrieving statistics

---

## 2. Payment Management

### GET /admin/payments/pending
Retrieve all pending payment approvals.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Response (200):**
```json
[
  {
    "id": "payment_123",
    "userId": "user_456",
    "username": "john_doe",
    "email": "john@example.com",
    "amount": 50000,
    "points": 500,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "paymentProof": "https://storage.example.com/proof_123.jpg",
    "description": "Bank transfer for 500 points"
  }
]
```

### POST /admin/payments/{paymentId}/approve
Approve a pending payment.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `paymentId` (string, required) - The payment ID to approve

**Response (200):**
```json
{
  "message": "Payment approved successfully",
  "paymentId": "payment_123",
  "pointsAwarded": 500
}
```

**Error Responses:**
- `404` - Payment not found
- `400` - Payment already processed
- `403` - Insufficient admin privileges

### POST /admin/payments/{paymentId}/reject
Reject a pending payment with optional reason.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `paymentId` (string, required) - The payment ID to reject

**Request Body:**
```json
{
  "reason": "Invalid payment proof provided"
}
```

**Response (200):**
```json
{
  "message": "Payment rejected successfully",
  "paymentId": "payment_123",
  "reason": "Invalid payment proof provided"
}
```

---

## 3. User Management

### GET /admin/users
Retrieve all users with management information.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 50, max: 100)
- `search` (string, optional) - Search by username or email
- `status` (string, optional) - Filter by status: 'active' | 'inactive'
- `role` (string, optional) - Filter by role

**Response (200):**
```json
{
  "users": [
    {
      "id": "user_123",
      "username": "john_doe",
      "email": "john@example.com",
      "roles": ["user"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T14:30:00Z",
      "totalPoints": 1500,
      "totalSpent": 750
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 25,
    "totalUsers": 1250,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### PUT /admin/users/{userId}/status
Update user active status.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `userId` (string, required) - The user ID to update

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "User status updated successfully",
  "userId": "user_123",
  "isActive": false
}
```

### PUT /admin/users/{userId}/roles
Update user roles.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `userId` (string, required) - The user ID to update

**Request Body:**
```json
{
  "roles": ["user", "moderator"]
}
```

**Response (200):**
```json
{
  "message": "User roles updated successfully",
  "userId": "user_123",
  "roles": ["user", "moderator"]
}
```

---

## 4. Additional Admin Endpoints

### GET /admin/transactions
Retrieve all system transactions for monitoring.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 50)
- `type` (string, optional) - Filter by type: 'PURCHASE' | 'USAGE' | 'REFUND'
- `userId` (string, optional) - Filter by specific user
- `startDate` (string, optional) - Start date filter (ISO 8601)
- `endDate` (string, optional) - End date filter (ISO 8601)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "txn_123",
      "userId": "user_456",
      "username": "john_doe",
      "type": "PURCHASE",
      "amount": 100,
      "description": "Purchased 100 points",
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "COMPLETED"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 68,
    "totalTransactions": 3420,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /admin/certificates
Retrieve certificate generation statistics and logs.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 50)
- `userId` (string, optional) - Filter by specific user
- `startDate` (string, optional) - Start date filter
- `endDate` (string, optional) - End date filter

**Response (200):**
```json
{
  "certificates": [
    {
      "id": "cert_123",
      "userId": "user_456",
      "username": "john_doe",
      "templateName": "Achievement Certificate",
      "recipientCount": 25,
      "pointsUsed": 25,
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "COMPLETED"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 175,
    "totalCertificates": 8750,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 5. System Configuration

### GET /admin/config
Retrieve system configuration settings.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "pointsPerCertificate": 1,
  "pointPackages": [
    { "points": 100, "price": 10000, "currency": "IDR" },
    { "points": 500, "price": 50000, "currency": "IDR" },
    { "points": 1000, "price": 95000, "currency": "IDR" }
  ],
  "maxCertificatesPerGeneration": 1000,
  "allowedFileTypes": ["csv", "xlsx"],
  "maxFileSize": 5242880,
  "maintenanceMode": false
}
```

### PUT /admin/config
Update system configuration settings.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pointsPerCertificate": 1,
  "maxCertificatesPerGeneration": 1000,
  "maintenanceMode": false
}
```

**Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "updatedFields": ["pointsPerCertificate", "maxCertificatesPerGeneration"]
}
```

---

## 6. Role-Based Access Control

### Middleware Requirements

All admin endpoints must implement the following middleware checks:

1. **Authentication Middleware**: Verify JWT token validity
2. **Authorization Middleware**: Check for admin role in user claims
3. **Rate Limiting**: Implement rate limiting for admin endpoints
4. **Audit Logging**: Log all admin actions for security purposes

### Required JWT Claims
```json
{
  "sub": "user_id",
  "roles": ["admin"],
  "iat": 1642234567,
  "exp": 1642320967
}
```

---

## 7. Database Schema Considerations

### Admin Action Logs Table
```sql
CREATE TABLE admin_action_logs (
  id VARCHAR(255) PRIMARY KEY,
  admin_user_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255),
  target_id VARCHAR(255),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
);
```

### Payment Transactions Enhancement
```sql
ALTER TABLE payment_transactions ADD COLUMN (
  approved_by VARCHAR(255),
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  admin_notes TEXT
);
```

---

## 8. Security Considerations

1. **Input Validation**: Validate all input parameters and request bodies
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize output data
4. **CSRF Protection**: Implement CSRF tokens for state-changing operations
5. **Rate Limiting**: Implement rate limiting per admin user
6. **Audit Trail**: Log all admin actions with timestamps and IP addresses
7. **Data Encryption**: Encrypt sensitive data in transit and at rest
8. **Session Management**: Implement secure session handling

---

## 9. Performance Considerations

1. **Pagination**: Implement pagination for all list endpoints
2. **Caching**: Cache frequently accessed statistics
3. **Database Indexing**: Ensure proper indexing on frequently queried fields
4. **Query Optimization**: Optimize database queries for large datasets
5. **Background Jobs**: Use background jobs for heavy operations

---

## 10. Testing Requirements

### Unit Tests
- Test all endpoint handlers
- Test authentication and authorization middleware
- Test input validation
- Test error handling

### Integration Tests
- Test complete admin workflows
- Test role-based access control
- Test database transactions
- Test external service integrations

### Load Tests
- Test admin endpoints under load
- Test concurrent admin operations
- Test database performance with large datasets

This specification provides a comprehensive foundation for implementing the admin dashboard backend APIs with proper security, performance, and maintainability considerations.