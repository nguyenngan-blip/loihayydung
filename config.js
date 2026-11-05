// Điền thông tin dự án Supabase của bạn (Settings > API).
// Khóa "anon" là khóa công khai, an toàn khi đặt ở frontend vì đã có RLS.
// TUYỆT ĐỐI KHÔNG đặt khóa "service_role" vào đây.
window.CONFIG = {
  SUPABASE_URL: "",       // ví dụ: https://abcxyz.supabase.co
  SUPABASE_ANON_KEY: "",  // khóa anon public
  BUCKET: "resources"
};
