import { z } from "zod";

export const BookingSchema = z.object({
  department_id: z.string().uuid("Invalid department selected."),
  doctor_id: z.string().uuid("Please select a specific doctor."),
  appointment_date: z.string().refine((date) => {
    return new Date(date) >= new Date(new Date().setHours(0,0,0,0));
  }, { message: "Appointment date cannot be in the past." }),
  appointment_time: z.enum(["Morning", "Evening"], { errorMap: () => ({ message: "Please select Morning or Evening." }) }),
  reason: z.string().min(5, "Please provide a brief reason for your visit (min 5 characters).").max(1000),
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number."),
  subject: z.string().min(5, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

export const DoctorSchema = z.object({
  department_id: z.string().uuid("Invalid department."),
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  phone: z.string().optional(),
  designation: z.string().min(2, "Designation is required."),
  qualifications: z.string().min(2, "Qualifications are required."),
  experience: z.string().min(1, "Experience is required."),
  consultation_fee: z.coerce.number().min(0, "Fee must be a valid number."),
  languages: z.string().min(2, "Languages are required (e.g., Hindi, English)."),
  bio: z.string().optional(),
  email: z.string().email("Valid email required for doctor login."),
  password: z.string().min(6, "Initial password must be at least 6 characters."),
  available_days: z.array(z.string()).min(1, "Select at least one available day."),
});

export const PatientProfileSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_group: z.string().optional(),
  address: z.string().optional(),
});

export const DepartmentSchema = z.object({
  name: z.string().min(2, "Name is required."),
  description: z.string().optional(),
  is_coe: z.boolean().default(false),
  services: z.string().optional(), // Comma separated
});

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});



