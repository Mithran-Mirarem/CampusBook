# CampusBook â€” Assignment 2

- **Student:** V.P. Mithramoorthy
- **Roll number:** 24AD063
- **Project:** Campus Facility Booking System

This project extends the Assignment 1 CampusBook application into the Assignment 2 stack stated in the official brief: **React.js + Node.js/Express.js REST APIs + MongoDB**. It keeps the campus facilities, student booking workflow, capacity validation, and overlapping-time conflict detection.

## Features

- React single-page application with reusable navigation, form, loading, and page components.
- Facility directory with live search and category filters.
- Facility administration CRUD: create, list, update and delete facilities. A facility with booking history cannot be deleted.
- Booking CRUD: create, read, edit, update status, cancel and permanently delete bookings.
- Client-side validation for required fields, student name, roll number, dates, time range, purpose and people count.
- Express API validates the same data on the server and checks that requested people do not exceed the facility's capacity.
- The API checks for overlapping bookings for the same facility and date.
- MongoDB collections are managed with Mongoose models. On first successful connection, the 74 supplied facility records are seeded automatically if the collection is empty.
- Responsive layout for desktop, tablet and mobile.

## Requirements

- Node.js 20 or newer recommended.
- npm.
- A MongoDB Atlas cluster (recommended) or a local MongoDB server.

## Setup

1. Extract the ZIP and open the `CampusBook-Assignment2` folder in VS Code.
2. In the project root, copy `.env.example` to a new file named `.env`.
3. Edit `.env` and set `MONGODB_URI` to your MongoDB connection string. For Atlas, paste the connection string copied from **MongoDB Atlas â†’ Database â†’ Connect â†’ Drivers** and replace the username/password placeholders. Make sure your Atlas database user exists and your current IP is allowed in Network Access.

   Example format (not a real credential):

   ```text
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/campusbook_assignment2?retryWrites=true&w=majority
   PORT=5000
   ```

   If you use a local MongoDB installation instead, use:

   ```text
   MONGODB_URI=mongodb://127.0.0.1:27017/campusbook_assignment2
   PORT=5000
   ```

4. In the VS Code terminal, from the project root, install all workspace dependencies:

   ```bash
   npm install
   ```

5. Start the React development server and Express API together:

   ```bash
   npm run dev
   ```

6. Open the frontend URL shown by Vite, normally `http://127.0.0.1:5173`.

The backend connects to MongoDB before it starts. On its first successful start, it inserts the included campus facility list only if the Facilities collection is empty. Bookings created in the app are stored in MongoDB and remain there after restart.

## Production-style run

Build React and serve the build from Express:

```bash
npm run build
npm start
```

Then open `http://localhost:5000`.

## REST API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API/database status |
| GET | `/api/facilities` | List/search/filter facilities |
| GET | `/api/facilities/:id` | Get one facility |
| POST | `/api/facilities` | Create a facility |
| PUT | `/api/facilities/:id` | Update a facility |
| DELETE | `/api/facilities/:id` | Delete a facility if it has no booking history |
| GET | `/api/bookings` | List/search/filter bookings |
| GET | `/api/bookings/:id` | Get one booking |
| POST | `/api/bookings` | Create a booking |
| PUT | `/api/bookings/:id` | Edit a booking |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id` | Permanently delete a booking |

## MongoDB structure

- **facilities**: `name`, `type`, `capacity`, `location`, `description`, timestamps.
- **bookings**: `studentName`, `rollNumber`, `facility` (ObjectId reference), `facilityName` (snapshot), `date`, `startTime`, `endTime`, `peopleCount`, `purpose`, `status`, timestamps.

## Notes

- This is a college assignment demonstration, not a production-ready public booking service. The Facility Management screen is intentionally available without login for easy demonstration; do not deploy it publicly without adding authentication and authorization.
- Capacities in the original Assignment 1 seed file that were not supplied by the student are illustrative values. Confirm actual capacities with the institution before treating them as authoritative.
- Never upload your actual `.env` or MongoDB password to source control or share it in a report.

### Windows DNS troubleshooting

If the backend fails with `querySrv ECONNREFUSED` while `nslookup` resolves the Atlas host, the server configures Node DNS to use Google (`8.8.8.8`) and Cloudflare (`1.1.1.1`) before Mongoose starts. If your network blocks those resolvers, add `DNS_SERVERS=your.dns.ip,backup.dns.ip` to `.env`. Keep `.env` private and do not share database credentials.
