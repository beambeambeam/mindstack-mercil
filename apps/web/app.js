

// ข้อมูลประเภททรัพย์สิน (Asset Types) ดึงมาจากส่วนท้ายของไฟล์ Website.docx
const assetTypes = [
    { id: 1, name_th: "ทาวน์เฮ้าส์" },
    { id: 2, name_th: "ที่ดินเปล่า" },
    { id: 3, name_th: "ห้องชุดพักอาศัย" }, // Condominium
    { id: 4, name_th: "บ้านเดี่ยว" }, // Detached house
    { id: 5, name_th: "อาคารพาณิชย์" },
    { id: 15, name_th: "บ้านแฝด" }, // Semi-detached house
    // ... สามารถเพิ่มประเภทอื่น ๆ ที่มีในไฟล์ของคุณได้
];

// ข้อมูลทรัพย์สิน (Properties) ดึงมาจากส่วนหน้าของไฟล์ Website.docx
const properties = [
    {
        asset_code: "8Z5956",
        name_th: "โครงการห้าดาวคอนโดมิเนียม โครงการ 2",
        asset_type_id: 3, 
        asset_details_selling_price: "776000",
        asset_details_total_area: "32", 
        asset_details_number_of_bedrooms: "1",
        asset_details_number_of_bathrooms: "1",
        location_latitude: "13.7933663",
        location_longitude: "100.5409665",
        asset_details_description_th: "ห้องชุดพักอาศัย เลขที่ 110/113 ชั้นที่ 4 ชื่ออาคารชุดห้าดาวคอนโดมิเนียม โครงการ 2 ทะเบียนอาคารชุดเลขที่ 15/2535 (มี 1 ห้องโถง 1 ห้องน้ำ) อัตราส่วนแห่งกรรมสิทธิ์ในทรัพย์ส่วนกลาง : 629 ส่วน ใน 178,546 ส่วน ข้อมูลอาคารชุด : อาคารสูง 12 ชั้น มีจำนวนห้องชุดรวม 258 ห้อง มีลิฟท์ 2 ชุด ยามรักษาความปลอดภัย 24 ชม. กล้องวงจรปิด ข้อมูล ณ วันที่ 20 ต.ค. 65 ค่าส่วนกลางประมาณ 640.00 บาท/เดือน หมายเหตุ : -สถานที่สำคัญบริเวณใกล้เคียง ได้แก่ สำนักงานใหญ่ธนาคารออมสิน แนวรถไฟฟ้าสายสีเขียวอ่อนสุขุมวิท สถานีรถไฟฟ้าสะพานควาย โรงพยาบาลเปาโล ห้างบิ๊กซี เป็นต้น"
    },
    {
        asset_code: "2T0377",
        name_th: "บ้านเดี่ยว",
        asset_type_id: 4, 
        asset_details_selling_price: "64686000",
        asset_details_total_area: "6324", 
        asset_details_number_of_bedrooms: "1", // ใช้ตามข้อมูลในไฟล์
        asset_details_number_of_bathrooms: "1", // ใช้ตามข้อมูลในไฟล์
        location_latitude: "13.784407",
        location_longitude: "100.701647",
        asset_details_description_th: "ที่ดินจำนวน 3 แปลงติดต่อกัน เป็นรูปหลายเหลี่ยม ขนาดแปลงที่ดินด้านทิศตะวันออก กว้างประมาณ 36 ม. (ส่วนที่ติดถนนกว้างประมาณ 8 ม.) ลึกสุดประมาณ 180 ม. บสส.รับโอนกรรมสิทธิ์สิ่งปลูกสร้าง ประกอบด้วย 1.อาคารพักอาศัย 2 ชั้น (คสล.) 2.อาคารศาลากลางน้ำ (คสล.) 3.อาคารป้อมยาม (คสล.) ทางเข้า-ออกทรัพย์สิน ก่อนออกสู่ทางสาธารณประโยชน์ ต้องผ่านซอยราษฎร์พัฒนา 2 เป็นทางส่วนบุคคลโฉนดที่ดินเลขที่ 214201 เลขที่ดิน 656 ได้มีการจดภาระจำยอมให้แปลงทรัพย์สินโฉนดที่ดินเลขที่ 218866 และ 242134 เรียบร้อยแล้ว ส่วนทรัพย์สินโฉนดที่ดินเลขที่ 2037 ได้แบ่งจากแปลงทางจึงไม่มีปัญหาเรื่องทางเข้า-ออก ผิวจราจรคอนกรีต กว้างประมาณ 5 ม. เขตทางกว้างประมาณ 8 ม. ++ผู้สนใจควรตรวจสอบเรื่องสิทธิในการใช้ทางให้เป็นที่พึงพอใจก่อนการเสนอซื้อ++ หมายเหตุ : - ทรัพย์สินตั้งอยู่ในย่านที่อยู่อาศัย การคมนาคมสะดวก - สถานที่สำคัญบริเวณใกล้เคียง ได้แก่ โรงเรียนวิทยานนท์ และสำนักงานที่ดิน สาขาบึงกุ่ม เป็นต้น"
    },
    {
        asset_code: "TL0576",
        name_th: "บ้านแฝด",
        asset_type_id: 15, 
        asset_details_selling_price: "1936000",
        asset_details_total_area: "171.2", 
        asset_details_number_of_bedrooms: "2",
        asset_details_number_of_bathrooms: "1",
        location_latitude: "12.778317",
        location_longitude: "101.205449",
        asset_details_description_th: "ที่ดินเป็นรูปสี่เหลี่ยมจัตุรัส ขนาดแปลงที่ดินด้านทิศใต้ติดถนน กว้างประมาณ 13 ม. ลึกประมาณ 13 ม. บสส. รับโอนกรรมสิทธิ์สิ่งปลูกสร้างระบุเป็นบ้านพักอาศัยแฝดตึกชั้นเดียว เลขที่ 82/37 ถนนผ่านหน้าทรัพย์สิน ได้แก่ หมู่บ้านเดอะพาโน่ (มาบข่า-ทับมา) เป็นทางในโครงการจัดสรรที่ได้รับอนุญาตแล้ว ผิวจราจรคอนกรีต กว้างประมาณ 6 ม. เขตทางกว้างประมาณ 8 ม. หมายเหตุ : - ทรัพย์สินตั้งอยู่ในย่านที่อยู่อาศัย สาธารณูปโภคครบครัน การคมนาคมสะดวก - สถานที่สำคัญบรเิวณใกล้เคียง ได้แก่ โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านกระเฉท, วัดมาบข่า (บุษบาธาราม) และสำนักงานเทศบาลตำบลมาบข่าพัฒนา เป็นต้น"
    },
    {
        asset_code: "3A1163",
        name_th: "ชีวาทัย ราชปรารภ",
        asset_type_id: 3, 
        asset_details_selling_price: "5211000",
        asset_details_total_area: "55.85",
        asset_details_number_of_bedrooms: "2",
        asset_details_number_of_bathrooms: "1",
        // ใช้พิกัดที่ประมาณการจากชื่อสถานที่ (เนื่องจากไม่มีในส่วน JSON สำหรับทรัพย์สินนี้)
        location_latitude: "13.7541", 
        location_longitude: "100.5427",
        asset_details_description_th: "Chewathai Ratchaprarop (ชีวาทัย ราชปรารภ) เป็นคอนโดมิเนียมมีอาคารเดียว จำนวน 26 ชั้น 329 ยูนิต แหล่งช๊อปปิ้ง : ปิรามิตพลาซ่า ห้างสรรพสินค้าเซ็นเตอร์วัน (อนุสาวรีย์ชัยสมรภูมิ) ดีมาร์ทซุปเปอร์มาร์เก็ต คิงเพาเวอร์คอมเพล็กซ์ สถานศึกษาใกล้เคียง : โรงเรียนวัดทัศนารุณสุนทริการาม มหาวิทยาลัยราชภัฏสวนดุสิต ศูนย์การศึกษาศูนย์รางน้ำ โรงเรียนจันทรวิชา โรงเรียนนิธิปริญญา โรงเรียนรัศมีนานาชาติ สถานพยาบาลใกล้เคียง : โรงพยาบาลราชวิถี สิ่งอำนวยความสะดวก : ลิฟท์ ที่จอดรถ การรักษาความปลอดภัย 24 ชั่วโมง กล้องวงจรปิด สระว่ายนำ้ ฟิตเนส สวนหย่อม / พื้นที่จัดบาร์บีคิว - ห้องชุดพักอาศัย เลขที่ 11/94 ชั้นที่ 11 ชื่ออาคารชุด ชีวาทัย ราชปรารภ ทะเบียนอาคารชุดเลขที่ 8/2554 - อัตราส่วนแห่งกรรมสิทธิ์ในทรัพย์ส่วนกลาง : 55.85 ส่วน ใน 17,038.82 ส่วน - ข้อมูลอาคารชุด : อาคารสูง 26 ชั้น มีจำนวนห้องชุดรวม 325 ห้อง สิ่งอำนวยความสะดวก : สระว่ายน้ำ ฟิตเนส ลิฟท์โดยสาร 2 ตัว ลิฟท์ขนของ 1 ตัว สวนหย่อม ข้อมูล ณ วันที่ 20 ต.ค. 65 ค่าส่วนกลางประมาณ 1,954.75 บาท/เดือน"
    }
];

// Global State
let currentAssetTypeFilter = 'all';


// ฟังก์ชันช่วยเหลือในการจัดรูปแบบราคา
const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', { 
        style: 'decimal', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    }).format(price);
};
window.formatPrice = formatPrice;

// ฟังก์ชันช่วยเหลือในการค้นหาชื่อประเภททรัพย์สิน
const getAssetTypeById = (id) => {
    const type = assetTypes.find(t => t.id === id);
    return type ? type.name_th : 'ไม่ระบุ';
};



    

// โค้ดสำหรับจัดการ Modal และ Tab Login/Register
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------
    // A. ตัวแปรสำหรับ Modal
    // ----------------------------------
    const modal = document.getElementById('auth-modal');
    const loginBtn = document.querySelector('.login-btn'); // ปุ่มใน Header: "เข้าร่วม / ลงทะเบียน"
    const closeBtn = document.querySelector('.close-btn');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');

    // ----------------------------------
    // B. ฟังก์ชันเปิด/ปิด Modal
    // ----------------------------------

    // เมื่อคลิกปุ่ม "เข้าร่วม / ลงทะเบียน" ให้เปิด Modal
    if (loginBtn) {
        loginBtn.onclick = function() {
            modal.style.display = 'block';
            // ตั้งค่าเริ่มต้นให้เป็นหน้า Login เมื่อเปิด Modal
            showForm('login'); 
        }
    }

    // เมื่อคลิกที่ปุ่มปิด (x) ให้ปิด Modal
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }

    // เมื่อคลิกนอก Modal ให้ปิด Modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    // ----------------------------------
    // C. ฟังก์ชันสลับ Tab
    // ----------------------------------
    function showForm(type) {
        if (type === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            formLogin.classList.add('active');
            formRegister.classList.remove('active');
        } else if (type === 'register') {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            formRegister.classList.add('active');
            formLogin.classList.remove('active');
        }
    }

    if (tabLogin) {
        tabLogin.onclick = () => showForm('login');
    }
    if (tabRegister) {
        tabRegister.onclick = () => showForm('register');
    }
    
});



function renderAssetCards(propertiesToRender) {
    const container = document.getElementById('asset-card-container');
    container.innerHTML = ''; // เคลียร์ของเก่า
    
    propertiesToRender.forEach(property => {
        const typeId = property.asset_type_id;
        
        // ค้นหาชื่อประเภททรัพย์สินจาก assetTypes
        const typeInfo = assetTypes.find(type => type.id === typeId) || { name_th: 'อสังหาฯ อื่นๆ', name_en: 'OTHER' };
        
        // กำหนด Class และ Label
        const cardClass = `asset-type-${typeId}`; 
        const typeLabel = typeInfo.name_en ? typeInfo.name_en.toUpperCase().split(' ')[0] : 'OTHER'; // เอาคำแรก
        const typeName = typeInfo.name_th;

        // ฟอร์แมตราคา
        const price = parseFloat(property.asset_details_selling_price).toLocaleString('th-TH');
        
        // *************** ส่วนสำคัญ: สร้าง URL เชื่อมโยง ***************
        const detailURL = `detail.html?asset_code=${property.asset_code}`;

        // โค้ด HTML สำหรับการ์ด
        const cardHTML = `
            <div class="asset-card ${cardClass}">
                <div class="timer-tag">เหลือ 1D 5H 30M</div> 
                
                <div class="card-image">
                    <span class="type-label">${typeLabel}</span>
                </div>
                
                <div class="card-details">
                    <div class="asset-type-label">${typeName}</div>
                    <h3>${property.name_th}</h3>
                    <p class="asset-code-text">รหัสทรัพย์: ${property.asset_code}</p>
                    <p class="price-value">${price} บาท</p>
                    
                    <a href="${detailURL}" class="bid-button">เข้าร่วมประมูล →</a>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// ----------------------------------------------------
// ส่วนการเรียกใช้งานฟังก์ชัน
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. เรียกแสดงผลการ์ดทรัพย์สินทั้งหมดทันที
    renderAssetCards(properties); 
    
    // 2. โค้ดสำหรับฟังก์ชัน Filter ตามประเภททรัพย์สิน
    const filterLinks = document.querySelectorAll('.asset-filter-nav .nav-link');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            filterLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            const selectedType = e.target.getAttribute('data-asset-type');
            
            let filteredList = [];
            if (selectedType === 'all') {
                filteredList = properties;
            } else {
                const typeId = parseInt(selectedType);
                filteredList = properties.filter(p => p.asset_type_id === typeId);
            }
            
            renderAssetCards(filteredList);
        });
    });

    // ในไฟล์ app.js

// ----------------------------------------------------
// ฟังก์ชันค้นหาแบบง่าย (ใช้เป็น Fallback)
// ----------------------------------------------------
function simpleTextSearch(searchTerm) {
    // ต้องให้แน่ใจว่า properties ถูกประกาศใน global scope หรือเข้าถึงได้
    if (!searchTerm) return properties;
    searchTerm = searchTerm.toLowerCase().trim();
    return properties.filter(p => 
        (p.name_th && p.name_th.toLowerCase().includes(searchTerm)) || 
        (p.asset_code && p.asset_code.toLowerCase().includes(searchTerm))
    );
}
window.simpleTextSearch = simpleTextSearch; // ทำให้เรียกจาก search.html ได้


// ----------------------------------------------------
// ฟังก์ชันช่วยแยก Filter จากข้อความ (Basic NLP)
// ----------------------------------------------------
function parseQueryForFilters(query) {
    const filters = {
        query: query,
        price_max: undefined,
        radius_km: undefined,
        location_keyword: undefined,
    };

    let remainingQuery = query;

    // 1. ตรวจสอบ ราคา (Price): หาคำว่า 'under X' หรือ 'ต่ำกว่า X'
    const priceMatch = query.match(/(under|ต่ำกว่า|ไม่เกิน)\s*([\d\.]+[MK]{0,1})\s*บาท?/i);
    if (priceMatch) {
        const rawPrice = priceMatch[2];
        let priceValue = parseFloat(rawPrice);
        if (rawPrice.toUpperCase().includes('M')) {
            priceValue *= 1000000;
        } else if (rawPrice.toUpperCase().includes('K')) {
            priceValue *= 1000;
        }
        filters.price_max = priceValue;
        
        // ลบส่วนราคาออกจาก query
        remainingQuery = remainingQuery.replace(priceMatch[0], '').trim();
    }
    
    // 2. ตรวจสอบ รัศมี (Radius) และ ตำแหน่ง (Location): หาคำว่า 'within X km of Y'
    const radiusLocationMatch = remainingQuery.match(/(within|รัศมี|ในระยะ)\s*(\d+)\s*km\s*(of|จาก)\s*(.+)/i);
    if (radiusLocationMatch) {
        filters.radius_km = parseFloat(radiusLocationMatch[2]);
        filters.location_keyword = radiusLocationMatch[4].trim();
        
        // ลบส่วนรัศมีออกจาก query
        remainingQuery = remainingQuery.replace(radiusLocationMatch[0], '').trim();
    }
    
    // อัปเดต query ที่เหลือหลังจากดึง filter ออก
    filters.query = remainingQuery;
    
    // **หมายเหตุ:** ในการใช้งานจริง ต้องมี API Geocoding (เช่น Google Maps API) 
    // เพื่อแปลง location_keyword ("Bang Na") ให้เป็น (lat, lng) ก่อนส่งไป Backend
    // สำหรับตอนนี้เราจะส่ง location_keyword ไปให้ Backend จัดการ (ถ้า Backend รองรับ) หรือใช้ค่าคงที่

    return filters;
}
window.parseQueryForFilters = parseQueryForFilters; // ทำให้เรียกจาก search.html ได้


// ----------------------------------------------------
// [ใหม่] ฟังก์ชัน Hybrid Search API
// ----------------------------------------------------
const API_ENDPOINT = 'http://localhost:3000/api/hybrid-search';

async function hybridSearchAPI(query) {
    if (!query) return simpleTextSearch('');

    //  แยก Filter ออกจาก Query**
    const parsedFilters = parseQueryForFilters(query);
    const effectiveQuery = parsedFilters.query; // คำค้นหาที่ถูกตัด Filter ออกไปแล้ว

    const requestBody = {
        query: query.trim(),
        k_semantic: 15, // จำนวนผลลัพธ์จาก Semantic Search
        k_keyword: 5,   // จำนวนผลลัพธ์จาก Keyword Search
        // สามารถเพิ่ม filter อื่นๆ ได้ที่นี่เมื่อมี UI รองรับ
        // **เพิ่ม Filters ที่ดึงออกมา**
        price_max: parsedFilters.price_max,
        radius_km: parsedFilters.radius_km,
        
        // ถ้า Backend รองรับการค้นหาพิกัดจาก Keyword (เช่น Bang Na) 
        // ให้ส่ง location_keyword ไปด้วย
        location_keyword: parsedFilters.location_keyword, 
        
        // หากต้องการ Geo-filtering ที่แม่นยำ ต้องส่ง lat/lng ไป:
        // location_latitude: 13.6677, // ตัวอย่างพิกัดของ Bang Na
        // location_longitude: 100.6128,
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}. Falling back to simple search.`);
            return simpleTextSearch(query);
        }

        const data = await response.json();
        const results = data.results || []; 
        
        // Backend คืนผลลัพธ์ที่เรียงตามความเกี่ยวข้องมาแล้ว (มี asset_code)
        const rankedAssetCodes = results.map(item => item.asset_code).filter(Boolean);
            
        // กรองและจัดเรียงข้อมูลทรัพย์สินท้องถิ่น (properties ที่โหลดใน app.js)
        const filteredAndRankedList = rankedAssetCodes
            .map(code => properties.find(p => p.asset_code === code))
            .filter(p => p !== undefined);
            
        return filteredAndRankedList;

    } catch (error) {
        console.error('Network or Fetch Error, Falling back to simple search:', error);
        return simpleTextSearch(query);
    }// ----------------------------------------------------
// [ใหม่] ฟังก์ชัน Hybrid Search API (เชื่อมต่อ Backend)
// ----------------------------------------------------
const API_ENDPOINT = 'http://localhost:3000/api/hybrid-search';

async function hybridSearchAPI(query) {
    if (!query) return simpleTextSearch(''); // ใช้ Fallback ถ้า Query ว่าง

    const parsedFilters = parseQueryForFilters(query);
    const effectiveQuery = parsedFilters.query; // คำค้นหาที่ถูกตัด Filter ออกไปแล้ว

    const requestBody = {
        // ส่วนของ Query ที่เป็นข้อความพรรณนา ("บ้านใกล้สีแยกไฟแดง")
        query: effectiveQuery, 
        k_semantic: 15,
        k_keyword: 5,
        
        // ส่วนของ Filters ที่ดึงออกมา (Geo-spatial และ Metadata)
        price_max: parsedFilters.price_max,
        radius_km: parsedFilters.radius_km,
        location_keyword: parsedFilters.location_keyword, 
        
        // ถ้าต้องการ Geo-filtering ที่แม่นยำต้องใส่ lat/lng ด้วย
        // location_latitude: undefined, 
        // location_longitude: undefined, 
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}. Falling back to simple search.`);
            // Zero Result Alternative/Fallback
            return simpleTextSearch(query); 
        }

        const data = await response.json();
        const results = data.results || []; 
        
        // Backend คืนผลลัพธ์ที่เรียงตามความเกี่ยวข้องมาแล้ว (มี asset_code)
        const rankedAssetCodes = results.map(item => item.asset_code).filter(Boolean);
            
        // กรองและจัดเรียงข้อมูลทรัพย์สินท้องถิ่นตามลำดับที่ได้จาก API
        const filteredAndRankedList = rankedAssetCodes
            .map(code => properties.find(p => p.asset_code === code))
            .filter(p => p !== undefined);
            
        return filteredAndRankedList;

    } catch (error) {
        console.error('Network or Fetch Error, Falling back to simple search:', error);
        return simpleTextSearch(query);
    }
}
}
window.hybridSearchAPI = hybridSearchAPI; // ทำให้เรียกจาก search.html ได้
    
});


