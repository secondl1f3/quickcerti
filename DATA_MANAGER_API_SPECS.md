# Data Manager API Specifications

This document outlines the API endpoints required for the Data Manager (Pengelola Data) functionality, including database storage and design relationships.

## Overview

The Data Manager allows users to:
- Create and manage datasets with custom variables
- Import/export CSV data
- Associate datasets with specific designs for certificate generation
- Store data persistently in the database

## Database Schema

### Tables

#### `datasets`
```sql
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `dataset_variables`
```sql
CREATE TABLE dataset_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date')),
  default_value TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dataset_id, name)
);
```

#### `dataset_rows`
```sql
CREATE TABLE dataset_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  row_data JSONB NOT NULL,
  row_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dataset_id, row_index)
);
```

## API Endpoints

### Base URL
```
/api/datasets
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Dataset Management

### GET /api/datasets
Get all datasets for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Customer Data",
      "description": "Customer information for certificates",
      "designId": "uuid",
      "designName": "Certificate Template",
      "variableCount": 5,
      "rowCount": 150,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z"
    }
  ]
}
```

### POST /api/datasets
Create a new dataset.

**Request Body:**
```json
{
  "name": "Customer Data",
  "description": "Customer information for certificates",
  "designId": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Customer Data",
    "description": "Customer information for certificates",
    "designId": "uuid",
    "userId": "uuid",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/datasets/:id
Get a specific dataset with its variables and data.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Customer Data",
    "description": "Customer information for certificates",
    "designId": "uuid",
    "variables": [
      {
        "id": "uuid",
        "name": "fullName",
        "type": "text",
        "defaultValue": "",
        "position": 0
      },
      {
        "id": "uuid",
        "name": "completionDate",
        "type": "date",
        "defaultValue": "",
        "position": 1
      }
    ],
    "data": [
      {
        "id": "uuid",
        "rowIndex": 0,
        "data": {
          "fullName": "John Doe",
          "completionDate": "2024-01-15"
        }
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

### PUT /api/datasets/:id
Update dataset information.

**Request Body:**
```json
{
  "name": "Updated Customer Data",
  "description": "Updated description",
  "designId": "uuid"
}
```

### DELETE /api/datasets/:id
Delete a dataset and all associated data.

**Response:**
```json
{
  "success": true,
  "message": "Dataset deleted successfully"
}
```

---

## 2. Variable Management

### POST /api/datasets/:id/variables
Add a new variable to a dataset.

**Request Body:**
```json
{
  "name": "courseName",
  "type": "text",
  "defaultValue": "",
  "position": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "courseName",
    "type": "text",
    "defaultValue": "",
    "position": 2
  }
}
```

### PUT /api/datasets/:datasetId/variables/:variableId
Update a variable.

**Request Body:**
```json
{
  "name": "updatedName",
  "type": "number",
  "defaultValue": "0",
  "position": 1
}
```

### DELETE /api/datasets/:datasetId/variables/:variableId
Delete a variable and remove it from all data rows.

**Response:**
```json
{
  "success": true,
  "message": "Variable deleted successfully"
}
```

---

## 3. Data Row Management

### POST /api/datasets/:id/rows
Add a new data row.

**Request Body:**
```json
{
  "data": {
    "fullName": "Jane Smith",
    "completionDate": "2024-01-16",
    "courseName": "Advanced JavaScript"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rowIndex": 1,
    "data": {
      "fullName": "Jane Smith",
      "completionDate": "2024-01-16",
      "courseName": "Advanced JavaScript"
    }
  }
}
```

### PUT /api/datasets/:datasetId/rows/:rowId
Update a data row.

**Request Body:**
```json
{
  "data": {
    "fullName": "Jane Smith Updated",
    "completionDate": "2024-01-17",
    "courseName": "Advanced JavaScript"
  }
}
```

### DELETE /api/datasets/:datasetId/rows/:rowId
Delete a data row.

**Response:**
```json
{
  "success": true,
  "message": "Data row deleted successfully"
}
```

---

## 4. Bulk Operations

### POST /api/datasets/:id/import-csv
Import data from CSV.

**Request Body:**
```json
{
  "csvData": "fullName,completionDate,courseName\nJohn Doe,2024-01-15,JavaScript Basics\nJane Smith,2024-01-16,Advanced JavaScript",
  "replaceExisting": true,
  "createVariables": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "importedRows": 2,
    "createdVariables": 3,
    "errors": []
  }
}
```

### GET /api/datasets/:id/export-csv
Export dataset as CSV.

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="dataset-name.csv"

fullName,completionDate,courseName
"John Doe","2024-01-15","JavaScript Basics"
"Jane Smith","2024-01-16","Advanced JavaScript"
```

---

## 5. Design Integration

### GET /api/datasets/:id/compatible-designs
Get designs that are compatible with this dataset (have matching variables).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Certificate Template",
      "matchingVariables": ["fullName", "completionDate"],
      "missingVariables": ["courseName"],
      "compatibilityScore": 0.67
    }
  ]
}
```

### POST /api/datasets/:id/associate-design
Associate a dataset with a design.

**Request Body:**
```json
{
  "designId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dataset associated with design successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "name",
    "message": "Name is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Dataset not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Implementation Notes

### Security Considerations
1. **Authorization**: Ensure users can only access their own datasets
2. **Input Validation**: Validate all input data, especially CSV imports
3. **Rate Limiting**: Implement rate limiting for bulk operations
4. **File Size Limits**: Limit CSV import file sizes

### Performance Considerations
1. **Pagination**: Implement pagination for large datasets
2. **Indexing**: Add database indexes on frequently queried fields
3. **Caching**: Consider caching frequently accessed datasets
4. **Async Processing**: Use background jobs for large CSV imports

### Data Validation
1. **Variable Types**: Validate data according to variable types
2. **Required Fields**: Support required/optional variables
3. **Data Constraints**: Implement min/max values, regex patterns
4. **Duplicate Prevention**: Prevent duplicate variable names

### Frontend Integration
The frontend will need to be updated to:
1. Call these APIs instead of using local storage
2. Handle loading states and errors
3. Implement proper data synchronization
4. Add dataset selection UI for design association