const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ตรวจสอบว่ามีค่าครบไหมก่อนเริ่มรัน
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in Environment Variables!");
}

const app = express();
app.use(express.json());
app.use(express.static('public')); // ให้เข้าหน้าเว็บจากโฟลเดอร์ public ได้

// เชื่อมต่อ Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. API สำหรับรับ Webhook เมื่อจ่ายเงินสำเร็จ
app.post('/webhook', async (req, res) => {
    const { status, metadata } = req.body; // โครงสร้างตามที่ Payment Gateway ส่งมา

    if (status === 'successful') {
        const duration = metadata.duration_minutes;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60000);

        // อัปเดต Database
        const { error } = await supabase
            .from('ads_display1')
            .update({ 
                status: 'paid', 
                start_time: startTime.toISOString(), 
                end_time: endTime.toISOString() 
            })
            .eq('id', metadata.ad_id);

        if (error) console.error('Error:', error);
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));