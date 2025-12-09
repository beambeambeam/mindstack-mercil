

app.post('/api/hybrid-search', async (req, res) => {
    // ดึงตัวแปรทั้งหมดที่ Frontend ส่งมา: คำค้นหา และ Filters
    const { query, asset_type_id, price_min, price_max } = req.body; 

    // Log ข้อมูลที่ได้รับจาก Frontend (เพื่อ Debug)
    console.log(`-- ได้รับคำค้นหา: "${query || '[No Query]'}" --`);
    console.log(`Filters: { asset_type_id: ${asset_type_id}, price_min: ${price_min}, price_max: ${price_max} }`);

    try {
        //  สร้าง Query Object
        let queryBuilder = weaviateClient.graphql.get()
            .withClassName('Asset');
            
        // Hybrid Search สำหรับคำค้นหาที่เป็นข้อความ
        queryBuilder = queryBuilder.withHybrid({
            query: query || '', // คำค้นหาจาก Frontend
            alpha: 0.7,         // กำหนดน้ำหนัก: 70% Semantic (ความหมาย) / 30% Keyword (คำหลัก)
        });
        

        //  เพิ่มการกรองแบบโครงสร้าง (Structured Filtering - WHERE)
        const filters = [];
        
        if (asset_type_id) {
            filters.push({ path: ['asset_type_id'], operator: 'Equal', valueInt: asset_type_id });
        }
        if (price_min) {
            filters.push({ path: ['selling_price'], operator: 'GreaterThanEqual', valueInt: parseInt(price_min) });
        }
        if (price_max) {
            filters.push({ path: ['selling_price'], operator: 'LessThanEqual', valueInt: parseInt(price_max) });
        }
        
        if (filters.length > 0) {
             queryBuilder = queryBuilder.withWhere({ 
                 operator: 'And', 
                 operands: filters 
             });
        }
        
        //  สั่งให้ดึงผลลัพธ์
        const { data } = await queryBuilder
            .withFields('asset_code _additional { score }') // ดึงรหัสและคะแนนความเกี่ยวข้อง
            .withLimit(50)
            .do();

        const results = data.Get.Asset || [];
        
        //  ส่งผลลัพธ์กลับในรูปแบบที่ app.js คาดหวัง
        res.json({
            success: true,
            results: results.map(item => ({ 
                asset_code: item.asset_code,
                score: item._additional.score // คะแนนความเกี่ยวข้องจาก AI
            }))
        });

    } catch (error) {
        console.error('Hybrid Search Error:', error);
        // Fallback: ถ้าเกิดข้อผิดพลาดในการค้นหา ให้ส่งผลลัพธ์ว่าง หรือ Error กลับไป
        res.status(500).json({ success: false, error: 'AI Search failed. Check Weaviate connection/API Key.' });
    }
});