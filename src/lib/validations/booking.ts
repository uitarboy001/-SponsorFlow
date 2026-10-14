import { z } from 'zod';

export const bookingFormSchema = z.object({
  slotId: z.string().min(1, 'กรุณาเลือกวันที่ต้องการลงโฆษณา'),
  sponsorName: z.string().min(2, 'กรุณากรอกชื่อของคุณหรือชื่อแบรนด์'),
  sponsorEmail: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  adHeadline: z
    .string()
    .min(5, 'พาดหัวต้องมีความยาวอย่างน้อย 5 ตัวอักษร')
    .max(80, 'พาดหัวต้องไม่เกิน 80 ตัวอักษร'),
  adBody: z
    .string()
    .min(10, 'เนื้อหาโฆษณาต้องมีความยาวอย่างน้อย 10 ตัวอักษร')
    .max(250, 'เนื้อหาโฆษณาต้องไม่เกิน 250 ตัวอักษร'),
  adTargetUrl: z
    .string()
    .url('กรุณากรอก URL ที่ถูกต้อง (ต้องมี https://)'),
  adImageUrl: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;