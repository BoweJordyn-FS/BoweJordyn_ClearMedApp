# ClearMed Clinic - REST API

A Node.js/Express REST API for managing a clinic's doctors and patients.

## Project Overview

ClearMed Clinic API provides endpoints to manage two core resources:

- **Doctors** - Medical professionals with specialties and availability status
- **Patients** - Clinic patients with demographic information and insurance details

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas connection string)
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Install development dependencies**:

   ```bash
   npm install nodemon -D
   ```

3. **Create a `.env` file** in the root directory with the following variables:

   ```
   PORT=3002
   MONGODB_URI=mongodb://localhost:27017/clearmed-clinic
   ```

### Running the Server

**Development mode** (with auto-reload):

```
npm run dev
```

## Mongoose Query Features

### `.select()` — Field Filtering

`.select()` controls which fields are returned in a query. Prefixing a field with `-` excludes it; listing fields without a prefix includes only those fields.
I use `.select('-__v')` on all read operations to strip the internal version key from every response:

### `.populate()` — Reference Resolution

`.populate()` replaces an ObjectId reference with the actual document it points to. It accepts a `path` and `select` to limit which fields come back from the referenced document.

**Doctor → Patients** (one doctor has many patients)

The `Doctor` schema stores an array of Patient ObjectIds in `patients`. When fetching a doctor, `.populate()` resolves each ID into a patient sub-document:

```javascript
Doctors.find()
	.select('-__v')
	.populate({ path: 'patients', select: 'name dob new_Patient' });
```

Response includes only `name`, `dob`, and `new_Patient` from each linked patient — not the full patient document.

**Patient → Doctor** (each patient references one doctor)

The `Patient` schema stores a single Doctor ObjectId in `doctor_id`. When fetching a patient, `.populate()` resolves it to the doctor's name:

```javascript
Patients.find().select('-__v').populate({ path: 'doctor_id', select: 'name' });
```

Response replaces the raw `doctor_id` ObjectId with an object containing only the doctor's `name`.

---

## Data Models

### Doctor Schema

```javascript
{
  name: String (required, 2-50 characters)
  specialty: String (required, 2-100 characters)
  email: String (required, unique, valid email format)
  available: Boolean (default: true)
  timestamps: { createdAt, updatedAt }
}
```

**Example**:

```json
{
	"name": "Dr. John Smith",
	"specialty": "Cardiology",
	"email": "john.smith@clinic.com",
	"available": true
}
```

### Patient Schema

```javascript
{
  name: String (required)
  dob: Date (required, between 1900 and today)
  gender: String (required, enum: ['male', 'female', 'non-binary'])
  new_Patient: Boolean (default: false)
  insurance: Boolean (required)
  doctor_id: ObjectId (reference to Doctor, required)
  timestamps: { createdAt, updatedAt }
}
```

**Example**:

```json
{
	"name": "Jane Doe",
	"dob": "1985-05-15",
	"gender": "female",
	"new_Patient": true,
	"insurance": true,
	"doctor_id": "507f1f77bcf86cd799439011"
}
```

## API Endpoints

### Base URL

```
http://localhost:3002/ClearMed/v1
```

### Doctor Endpoints

| Method | Endpoint       | Description                 |
| ------ | -------------- | --------------------------- |
| GET    | `/doctors`     | Get all doctors             |
| POST   | `/doctors`     | Create a new doctor         |
| GET    | `/doctors/:id` | Get a specific doctor by ID |
| PUT    | `/doctors/:id` | Update a doctor             |
| DELETE | `/doctors/:id` | Delete a doctor             |

### Patient Endpoints

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| GET    | `/patients`     | Get all patients             |
| POST   | `/patients`     | Create a new patient         |
| GET    | `/patients/:id` | Get a specific patient by ID |
| PUT    | `/patients/:id` | Update a patient             |
| DELETE | `/patients/:id` | Delete a patient             |

## Query Guide

Both `GET /doctors` and `GET /patients` support query strings to filter, sort, limit fields, and paginate results. Add these to the end of the URL in Postman.

---

### Filter — narrow down results

Add `?field=value` to only return records that match.

```
GET /doctors?available=true
GET /patients?new_Patient=true
```

---

### Filter with multiple values — `$in`

Separate values with a comma to match **any** of them.

```
GET /doctors?specialty[in]=Cardiology,Pediatrics
GET /patients?gender=male,female
```

You can combine filters:

```
GET /doctors?available=true&specialty[in]=Cardiology,Pediatrics
GET /patients?new_Patient=true&gender=female
```

---

### Select — choose which fields come back

Add `?select=field1,field2` to only return those fields.

```
GET /doctors?select=name,specialty[in]
GET /patients?select=name,dob,gender
```

Combine with a filter:

```
GET /doctors?available=true&select=name,specialty[in]
GET /patients?new_Patient=true&select=name,gender
```

---

### Sort — control the order

Add `?sort=field` and `?order=asc` or `?order=desc`.

```
GET /doctors?sort=name&order=asc       <- A to Z
GET /doctors?sort=name&order=desc      <- Z to A
GET /patients?sort=dob&order=asc       <- oldest first
GET /patients?sort=dob&order=desc      <- youngest first
```

> Default sort: doctors sort by newest created first, patients sort by oldest birth date first.

---

### Paginate — get results one page at a time

Add `?page=` and `?limit=` to control how many results come back and which page you're on.

```
GET /doctors?page=1&limit=5       <- first 5 doctors
GET /doctors?page=2&limit=5       <- next 5 doctors
GET /patients?page=1&limit=10     <- first 10 patients
```

The response always includes `page`, `limit`, and `count` so you know where you are:

```json
{
  "success": true,
  "count": 5,
  "page": 2,
  "limit": 5,
  "data": [...]
}
```

---

### Put it all together

You can mix and match any of the above:

```
GET /doctors?available=true&sort=name&order=asc&select=name,specialty&page=1&limit=5
GET /patients?gender=female&sort=dob&order=asc&select=name,dob&page=1&limit=10
```

---

## Testing

A Postman collection (`ClearMed Clinic.postman_collection.json`) is included in the project for testing all API endpoints.

Run unit tests with:

```
npm test
```

## Error Handling

The API includes proper error handling with appropriate HTTP status codes:

- `200` - OK (successful GET, DELETE)
- `201` - Created (successful POST)
- `202` - Accepted (successful PUT)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (unexpected errors)
