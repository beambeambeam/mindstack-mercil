

//  เปลี่ยนชื่อ Package เป็น '@weaviate/client' และใช้ Destructuring
const { WeaviateClient } = require('@weaviate/client'); 
const { properties } = require('./data.js'); 

// ต้องเปลี่ยนค่าเหล่านี้เป็นของจริงของคุณ 
const WEAVIATE_URL = 'https://[your-cluster-name].weaviate.network'; 
const WEAVIATE_API_KEY = 'YOUR_API_API_KEY';

//  ใช้ 'new WeaviateClient' ในการสร้าง Instance
const client = new WeaviateClient({
    cluster: WEAVIATE_URL,
    apiKey: WEAVIATE_API_KEY,
});



async function indexData() {
    console.log('--- เริ่มต้น Indexing ข้อมูลทรัพย์สิน ---');
    

    try {
        await client.schema.classDeleter().withClassName('Asset').do();
        console.log('ลบ Class "Asset" เดิมเรียบร้อย');
    } catch (e) {
        // ...
    }

    //  สร้าง Schema ใหม่ (กำหนดโครงสร้างข้อมูล)
    await client.schema.classCreator().withClass({
        class: 'Asset',
        description: 'Property assets for hybrid search',
        properties: [
            { name: 'asset_code', dataType: ['text'] },
            { name: 'description', dataType: ['text'] }, // สร้างเวกเตอร์จ
            //  Filters (ราคาและประเภททรัพย์สิน)
            { name: 'asset_type_id', dataType: ['int'] },
            { name: 'selling_price', dataType: ['int'] },
        ],
        vectorizer: 'text2vec-contextionary', // โมเดลอื่นที่รองรับภาษาไทย
    }).do();
    console.log('สร้าง Schema "Asset" เรียบร้อย');

    //  Indexing ข้อมูล (ส่งข้อมูลเข้า Vector DB)
    let counter = 0;
    for (const prop of properties) {
        await client.data.creator().withClassName('Asset').withProperties({
            asset_code: prop.asset_code,
            // รายละเอียดเป็นข้อความหลัก
            description: prop.asset_details_description_th, 
            asset_type_id: prop.asset_type_id,
            // แปลงราคาจาก String เป็น Integer ก่อนจัดเก็บ
            selling_price: parseInt(prop.asset_details_selling_price || '0'), 
        }).do();
        counter++;
    }
    
    console.log(`✅ Indexing Complete! จัดเก็บทรัพย์สิน ${counter} รายการ.`);
}

//  คำสั่งรัน: node indexer.js 
indexData().catch(console.error);