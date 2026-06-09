# Booking System Fixes Task Tracker

- [/] 1. Apply missing database migrations
  - [x] Check `.env.local` for DB connection string (Not found, need manual execution)
  - [ ] Execute `20260608000001_fix_avatars_storage.sql` (Pending user action)
  - [ ] Execute `20260608000002_add_doctor_slots.sql` (Pending user action)
  - [x] Clear old malformed test appointments
- [x] 2. Fix Patient Dashboard Crash
  - [x] Update `app/(portal)/dashboard/page.tsx` query and mapping logic
- [x] 3. Fix Doctor Dashboard Missing Department
  - [x] Update `app/(portal)/doctor/page.tsx` to fetch departments
  - [x] Update `app/(portal)/doctor/DoctorDashboardClient.tsx` to display department
- [x] 4. Fix Doctor Filtering & Cache Revalidation
  - [x] Update `FallbackDoctors` in `src/lib/data.ts`
  - [x] Add `revalidatePath('/booking')` in `src/app/actions/doctor.ts`
- [x] 5. Run build and lint to verify success
