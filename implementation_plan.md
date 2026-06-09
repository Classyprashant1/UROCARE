# Complete Root Cause Analysis Report

Per your request, here is the full end-to-end audit of the Urocare Apolo Hospital booking system. **No code or database changes have been made yet.**

## A. DATABASE SCHEMA

- **Doctors Table (`public.doctors`):** 
  - `department_id`: **MISSING** (Dropped intentionally by `20260606000001_add_doctor_departments.sql`).
  - `morning_start_time`, `morning_end_time`, `evening_start_time`, `evening_end_time`, `slot_duration`: **MISSING**.
- **Appointments Table (`public.appointments`):**
  - `appointment_slot`: **MISSING**.
  - `appointment_time`: **EXISTS** (Currently stores malformed string data like `'Morning'` instead of exact times).
- **Doctor Departments Table (`public.doctor_departments`):**
  - **EXISTS**. Verified it contains records mapping `doctor_id` to `department_id` UUIDs successfully.
- **Migrations Status:**
  - **NOT APPLIED**: `20260608000001_fix_avatars_storage.sql` and `20260608000002_add_doctor_slots.sql` have **never** been run against the database. 

## B. DEPARTMENT SAVE FLOW

**Trace:** `DoctorDashboardClient` → `updateDoctorProfile()` → DB write
1. **Submitted Data:** Client submits `FormData` containing an array of `department_ids` (UUIDs).
2. **Server Action:** Reaches `actions/doctor.ts` perfectly.
3. **DB Write:** The code successfully runs `delete()` and then `insert()` into `doctor_departments` using the `adminClient` to bypass missing RLS policies on the join table.
4. **Success/Failure:** The database writes **SUCCEED**. 
5. **Why it fails to reflect:** The server action `updateDoctorProfile` calls `revalidatePath('/doctors')` but misses `revalidatePath('/booking')`. Therefore, the booking page continues to serve cached Next.js data until the cache expires, causing the "saves but doesn't reflect" behavior.

## C. BOOKING FLOW

**Trace:** Booking page → `getDoctors()` → department filtering
1. **Returned Data:** `getDoctors()` successfully fetches DB doctors and constructs a `departmentIds` array (containing UUIDs) for each doctor.
2. **Filtering Logic:** `doctors.filter(d => d.departmentIds?.includes(deptId))`
3. **The "No Doctors Available" Bug:** 
   - The homepage (`app/page.tsx`) dropdown passes `deptId` to the booking page. 
   - **However**, if the database query in `getDepartments` ever fails (e.g. timeout), it falls back to static `FallbackDepts` which use string slugs like `"urology"`. 
   - More importantly, if `getDoctors` fails, it falls back to `FallbackDoctors` which lack the `departmentIds` array completely (it only has a single string `departmentId`). Thus `d.departmentIds` is undefined, throwing the filter into a fail state returning 0 doctors.

## D. TIME SLOT FLOW

**Trace:** Availability save → DB storage → Slot generation
1. **DB Storage:** Values are **NULL/MISSING**. Because the migration was not applied, the slot columns do not exist in the database.
2. **Slot Generation:** `getAvailableTimeSlots` in `actions/appointments.ts` queries the DB for `morning_start_time` and others. Since the columns are missing, Supabase returns undefined/null.
3. **Result:** `generateSlots` immediately returns `[]`. The booking form receives an empty array, so no slots appear.

## E. PROFILE PHOTO FLOW

**Trace:** Client upload → `updateDoctorProfile` → `avatars` bucket
1. **Bucket Name:** `avatars`
2. **Upload Response:** Fails entirely.
3. **Exact Error / RLS:** The migration `20260608000001_fix_avatars_storage.sql` was never applied. This means the RLS policy granting the doctor permission to upload their avatar (`owner = auth.uid()`) does not exist, causing Supabase Storage to reject the upload.

---

## Final Summary & Recommended Fixes

### 1. Root Causes & Exact Files
| Issue | Root Cause | Exact File / Table |
|-------|------------|--------------------|
| **1. Depts not persisting** | Missing cache revalidation for the booking page. | `src/app/actions/doctor.ts` |
| **2. "No doctors available"** | Fallback static data lacks `departmentIds` array, causing filter logic to crash if DB fails. | `src/lib/data.ts` |
| **3. Time slots missing** | Missing DB schema columns; migration never applied. | `public.doctors`, `public.appointments` |
| **4. Booking times hidden** | Missing DB columns returning null to the generator. | `src/app/actions/appointments.ts` |
| **5. Photo upload failing** | Missing Storage RLS policies; migration never applied. | `storage.objects` (`avatars` bucket) |

### 2. Migrations Missing
**YES.** `20260608000001_fix_avatars_storage.sql` and `20260608000002_add_doctor_slots.sql` are completely missing from the live database.

### 3. Additional Database Issue Found (Patient Dashboard Crash)
- **Table:** `public.doctors`
- **File:** `src/app/(portal)/dashboard/page.tsx`
- **Issue:** The patient dashboard is querying `.select('*, departments(name)')` on the `doctors` table, but `department_id` no longer exists. This silently crashes the query, forcing the patient dashboard to use static fallback data.

### Recommended Fixes to Apply (Pending Approval):
1. Execute the two missing `.sql` migration files against the database.
2. Update `src/app/actions/doctor.ts` to add `revalidatePath('/booking')`.
3. Update `src/lib/data.ts` `FallbackDoctors` to include `departmentIds: [d.departmentId]`.
4. Update `src/app/(portal)/dashboard/page.tsx` to use `.select('*, doctor_departments(departments(name))')` so patient dashboards don't crash.
5. Wipe the 3 existing corrupted test appointments since their `appointment_time` format (`'Morning'`) violates the new numeric logic.

Please let me know if you approve these recommended fixes.
