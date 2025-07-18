# API Setup Guide

This guide explains how to configure the certificate generation system to use real API endpoints instead of mock data.

## Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables in `.env`:**
   ```env
   # API Configuration
   VITE_API_BASE_URL=https://your-api-domain.com/api
   
   # R2 Configuration
   VITE_R2_PUBLIC_DOMAIN=https://your-r2-domain.com
   
   # Development Configuration
   VITE_USE_MOCK_API=false
   ```

## API Endpoints

The system expects the following API endpoints to be available:

### Template Management

#### 1. Get Pre-signed URL for Upload
- **Endpoint:** `POST /api/templates/upload-url`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
  ```json
  {
    "fileName": "my-template.pdf",
    "contentType": "application/pdf"
  }
  ```
- **Response:**
  ```json
  {
    "uploadUrl": "https://r2-presigned-url...",
    "finalUrl": "https://your-r2-public-url/my-template.pdf"
  }
  ```

#### 2. Save Template Metadata
- **Endpoint:** `POST /api/templates`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
  ```json
  {
    "name": "My Uploaded Template",
    "templateUrl": "https://your-r2-public-url/my-template.pdf",
    "userId": "c777f5a6-db67-41d8-a534-5a9919db6270",
    "isPublic": false
  }
  ```

#### 3. Get User Templates
- **Endpoint:** `GET /api/templates/my-templates`
- **Headers:** `Authorization: Bearer <accessToken>`

#### 4. Get Public Templates
- **Endpoint:** `GET /api/templates/public`
- **Headers:** `Authorization: Bearer <accessToken>`

### Design Management

#### 1. Save Design

- **Endpoint:** `POST /api/designs`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
  ```json
  {
    "name": "My Certificate Design",
    "elements": [...],
    "pageCount": 1
  }
  ```

#### 1.1. Update Design

- **Endpoint:** `PUT /api/designs/{designId}`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
  ```json
  {
    "name": "Updated Certificate Design",
    "elements": [...],
    "pageCount": 1
  }
  ```

#### 2. Get User Designs
- **Endpoint:** `GET /api/designs`
- **Headers:** `Authorization: Bearer <accessToken>`

#### 3. Get Specific Design
- **Endpoint:** `GET /api/designs/{designId}`
- **Headers:** `Authorization: Bearer <accessToken>`

### Certificate Generation

#### Generate Certificate
- **Endpoint:** `POST /api/certificate/generate`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
  ```json
  {
    "designId": "design-123",
    "pageCount": 1
  }
  ```
- **Response:**
  ```json
  {
    "downloadUrl": "https://your-domain.com/certificates/cert-123.pdf",
    "pointsDeducted": 30,
    "remainingPoints": 970
  }
  ```

## Authentication

The system expects authentication tokens to be stored in localStorage:

- `accessToken`: JWT token for API authentication
- `userId`: Current user's ID

These are typically set by your authentication flow.

## R2 Storage Configuration

For file uploads, you'll need:

1. **Cloudflare R2 bucket** configured for your application
2. **Pre-signed URL generation** on your backend
3. **Public domain** for accessing uploaded files

### Backend Implementation Example

Here's a basic example of how to generate pre-signed URLs:

```javascript
// Example using AWS SDK v3 with R2
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(fileName, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const finalUrl = `${R2_PUBLIC_DOMAIN}/${fileName}`;

  return { uploadUrl, finalUrl };
}
```

## Development vs Production

### Development Mode
Set `VITE_USE_MOCK_API=true` to use mock data for development.

### Production Mode
Set `VITE_USE_MOCK_API=false` and configure all API endpoints.

## Error Handling

The system includes automatic fallback to mock API if real endpoints fail, ensuring a smooth development experience.

## Security Considerations

1. **Always validate file types and sizes** on the backend
2. **Use time-limited pre-signed URLs** (recommended: 1 hour)
3. **Implement proper authentication** for all endpoints
4. **Validate user permissions** before allowing template/design access
5. **Sanitize file names** to prevent path traversal attacks