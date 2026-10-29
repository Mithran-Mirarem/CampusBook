# CampusBook — Assignment 2 Overview

- **Student:** V.P. Mithramoorthy  
- **Roll No.:** 24AD063  
- **Course:** U21AD502 — Application Development  
- **Project:** Campus Facility Booking System

## Application overview

CampusBook helps students find and reserve campus labs, classrooms, halls, auditorium and sports facilities. Users can check capacity, request a slot, see reservation records, edit eligible bookings and update booking status. The server rejects requests exceeding a facility's capacity or overlapping an existing booking for the same facility and date.

## Assignment 2 enhancements over Assignment 1

- The multi-page static HTML/JavaScript interface was enhanced to a React single-page application.
- Reusable React components and React Router organize navigation and pages.
- A Node.js + Express server provides RESTful API endpoints.
- Mongoose models store facilities and bookings in MongoDB instead of JSON files.
- CRUD operations are available for facility records and booking records.
- Server-side validation, API status codes and centralized error handling complement client-side validation.

## Application modules / React pages

- `Home.jsx`: dashboard summary and workflow shortcuts.
- `Facilities.jsx`: facility search, category filter, capacity/location display.
- `BookingForm.jsx`: create/edit form, client validation and capacity warning.
- `Bookings.jsx`: search/filter records, edit, update status and delete.
- `ManageFacilities.jsx`: create, read, update and delete facility records.
- `Navbar.jsx`: shared navigation component.
- `LoadingState.jsx`: reusable loading indicator.

## Architecture and data flow

```text
Student / Demonstrator
        ↓
React UI (Vite, React Router, reusable components)
        ↓ fetch() JSON requests
Express REST API (Node.js)
        ↓ Mongoose
MongoDB Atlas / local MongoDB
        ↓ JSON response
React updates its state and re-renders the page
```

## MongoDB collections

**facilities**
- `name`: facility name
- `type`: Laboratory / Hall / Auditorium / Classroom / Sports
- `capacity`: maximum people per booking
- `location`: campus location
- `description`: facility description
- `createdAt`, `updatedAt`: timestamps

**bookings**
- `studentName`, `rollNumber`: booking requester information
- `facility`: reference to a Facility document
- `facilityName`: facility name snapshot used in booking history
- `date`, `startTime`, `endTime`: selected booking slot
- `peopleCount`, `purpose`: request details
- `status`: Pending / Approved / Rejected / Cancelled / Completed
- `createdAt`, `updatedAt`: timestamps

## REST API operations

| HTTP method | Endpoint | Operation |
|---|---|---|
| GET | `/api/health` | Check API and database status |
| GET | `/api/facilities` | Read/search/filter facilities |
| GET | `/api/facilities/:id` | Read one facility |
| POST | `/api/facilities` | Create a facility |
| PUT | `/api/facilities/:id` | Update a facility |
| DELETE | `/api/facilities/:id` | Delete facility (only with no booking history) |
| GET | `/api/bookings` | Read/search/filter bookings |
| GET | `/api/bookings/:id` | Read one booking |
| POST | `/api/bookings` | Create a booking |
| PUT | `/api/bookings/:id` | Update a booking |
| PATCH | `/api/bookings/:id/status` | Change booking status |
| DELETE | `/api/bookings/:id` | Delete a booking |

## Main validation and business rules

- Required fields are checked in the React form and validated again on the server.
- Student name, roll number, purpose, date, time and people count must be valid.
- Booking date cannot be in the past and end time must be later than start time.
- Requested people cannot exceed the facility's maximum capacity.
- A booking cannot overlap another non-cancelled/non-rejected booking for the same facility and date.
- Facility capacity cannot be reduced below the number of people in an existing active booking.
- Invalid input, missing documents and conflicts return appropriate HTTP error responses.

## Run

1. Copy `.env.example` to `.env` and set `MONGODB_URI` to your own MongoDB Atlas/local connection string.
2. From the root, run `npm install`.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:5173`.
5. For a production-style local demo, run `npm run build` then `npm start`, and open `http://localhost:5000`.

> The facility management page is intentionally unauthenticated for the classroom demo; authentication and permissions should be added before any public deployment.
