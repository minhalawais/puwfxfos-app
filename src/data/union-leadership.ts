/**
 * PUWF Union Leadership Data
 * Source: 03_union_office_bearers — official PUWF regional office bearer documents
 * Contains key officials (President, Chairman, General Secretary, Chief Organizer)
 * for all 8 regions.
 */

export type UnionLeader = {
  name: string;
  role: string;
  roleUrdu: string;
  region: string;
  regionUrdu: string;
};

export const UNION_LEADERS: UnionLeader[] = [
  // ─── Central Punjab ───
  { name: 'Ch Muhammad Yaqoob', role: 'President', roleUrdu: 'صدر', region: 'Central Punjab', regionUrdu: 'وسطی پنجاب' },
  { name: 'Mian Iftikhar Ahmed', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Central Punjab', regionUrdu: 'وسطی پنجاب' },
  { name: 'Ch Saad Muhammad', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Central Punjab', regionUrdu: 'وسطی پنجاب' },
  { name: 'M Khalid Pervaiz', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Central Punjab', regionUrdu: 'وسطی پنجاب' },
  { name: 'Ms. Arooma Shahzad', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Central Punjab', regionUrdu: 'وسطی پنجاب' },

  // ─── Northern Punjab ───
  { name: 'Tikka Khan', role: 'President', roleUrdu: 'صدر', region: 'Northern Punjab', regionUrdu: 'شمالی پنجاب' },
  { name: 'Abdul Rauf', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Northern Punjab', regionUrdu: 'شمالی پنجاب' },
  { name: 'Anser Mehmood', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Northern Punjab', regionUrdu: 'شمالی پنجاب' },
  { name: 'Abdul Rehman', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Northern Punjab', regionUrdu: 'شمالی پنجاب' },
  { name: 'Hameed Khan Jadoon', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Northern Punjab', regionUrdu: 'شمالی پنجاب' },

  // ─── Karachi ───
  { name: 'Mukhtar Hussain Awan', role: 'President', roleUrdu: 'صدر', region: 'Karachi', regionUrdu: 'کراچی' },
  { name: 'M. Ashfaque Ahmed', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Karachi', regionUrdu: 'کراچی' },
  { name: 'Waqar Ahmed Memon', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Karachi', regionUrdu: 'کراچی' },
  { name: 'Arshad Mehmood Khan', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Karachi', regionUrdu: 'کراچی' },
  { name: 'Imam-u-din Dahri', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Karachi', regionUrdu: 'کراچی' },

  // ─── Interior Sindh ───
  { name: 'Haji Ghulam Asghar Kumbhar', role: 'President', roleUrdu: 'صدر', region: 'Interior Sindh', regionUrdu: 'اندرون سندھ' },
  { name: 'Muhammad Aslam Bhatti', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Interior Sindh', regionUrdu: 'اندرون سندھ' },
  { name: 'Asadullah Memon', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Interior Sindh', regionUrdu: 'اندرون سندھ' },
  { name: 'Muhammad Asif Khattak', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Interior Sindh', regionUrdu: 'اندرون سندھ' },
  { name: 'Khadim Hussain Khaskheli', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Interior Sindh', regionUrdu: 'اندرون سندھ' },

  // ─── Balochistan ───
  { name: 'Ali Bakhsh Jamali', role: 'President', roleUrdu: 'صدر', region: 'Balochistan', regionUrdu: 'بلوچستان' },
  { name: 'Kareem Bakhsh', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Balochistan', regionUrdu: 'بلوچستان' },
  { name: 'Pir Muhammad Kakkar', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Balochistan', regionUrdu: 'بلوچستان' },
  { name: 'Shams ud din', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Balochistan', regionUrdu: 'بلوچستان' },
  { name: 'Babu Ashraf', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Balochistan', regionUrdu: 'بلوچستان' },

  // ─── Northern KPK ───
  { name: 'Muhammad Iqbal', role: 'President', roleUrdu: 'صدر', region: 'Northern KPK', regionUrdu: 'شمالی کے پی کے' },
  { name: 'Muhammad Aslam Aadil', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Northern KPK', regionUrdu: 'شمالی کے پی کے' },
  { name: 'Razam Khan', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Northern KPK', regionUrdu: 'شمالی کے پی کے' },
  { name: 'Muhammad Rasool', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Northern KPK', regionUrdu: 'شمالی کے پی کے' },
  { name: 'Alamgir Khan', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Northern KPK', regionUrdu: 'شمالی کے پی کے' },

  // ─── Southern KPK ───
  { name: 'Akhtar Shah', role: 'President', roleUrdu: 'صدر', region: 'Southern KPK', regionUrdu: 'جنوبی کے پی کے' },
  { name: 'Muhammad Ayoub', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Southern KPK', regionUrdu: 'جنوبی کے پی کے' },
  { name: 'Falak Niaz', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Southern KPK', regionUrdu: 'جنوبی کے پی کے' },
  { name: 'Syed Qudrat Ali Shah', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Southern KPK', regionUrdu: 'جنوبی کے پی کے' },
  { name: 'Eid Gul', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Southern KPK', regionUrdu: 'جنوبی کے پی کے' },

  // ─── Southern Punjab ───
  { name: 'Musawer Hussain Qureshi', role: 'President', roleUrdu: 'صدر', region: 'Southern Punjab', regionUrdu: 'جنوبی پنجاب' },
  { name: 'Hamid Hassan', role: 'Chairman', roleUrdu: 'چیئرمین', region: 'Southern Punjab', regionUrdu: 'جنوبی پنجاب' },
  { name: 'M. Mukhtar Awan', role: 'General Secretary', roleUrdu: 'جنرل سیکرٹری', region: 'Southern Punjab', regionUrdu: 'جنوبی پنجاب' },
  { name: 'Waheed Hussain', role: 'Chief Organizer', roleUrdu: 'چیف آرگنائزر', region: 'Southern Punjab', regionUrdu: 'جنوبی پنجاب' },
  { name: 'Malik Hussain', role: 'Finance Secretary', roleUrdu: 'مالیاتی سیکرٹری', region: 'Southern Punjab', regionUrdu: 'جنوبی پنجاب' },
];
