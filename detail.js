// ข้อมูลทรัพย์สินทั้งหมด (ต้องคัดลอกมาจากส่วนบนของ app.js)
const properties = [
    {
        asset_code: "8Z5956",
        name_th: "โครงการห้าดาวคอนโดมิเนียม โครงการ 2",
        asset_details_selling_price: "776000",
        location_latitude: "13.7933663",
        location_longitude: "100.5409665",
        asset_details_description_th: "ห้องชุดพักอาศัย เลขที่ 110/113 ชั้นที่ 4 อาคารชุดห้าดาวคอนโดมิเนียม... (ข้อมูลเพิ่มเติมจากไฟล์)",
        asset_details_total_area: "32", 
        asset_details_number_of_bedrooms: "1",
        asset_details_number_of_bathrooms: "1"
    },
    {
        asset_code: "2T0377",
        name_th: "บ้านเดี่ยว",
        asset_details_selling_price: "64686000",
        location_latitude: "13.784407",
        location_longitude: "100.701647",
        asset_details_description_th: "ที่ดินจำนวน 3 แปลงติดต่อกัน เป็นรูปหลายเหลี่ยม... (ข้อมูลเพิ่มเติมจากไฟล์)",
        asset_details_total_area: "6324", // ตร.ม. หรือ ตร.วา
        asset_details_number_of_bedrooms: "3",
        asset_details_number_of_bathrooms: "3"
    },
    // ... เพิ่มรายการทรัพย์สินอื่น ๆ ที่เหลือจาก Website.docx ที่นี่ ...
    {
        asset_code: "TL0576",
        name_th: "บ้านแฝด",
        asset_details_selling_price: "1936000",
        location_latitude: "12.778317",
        location_longitude: "101.205449",
        asset_details_description_th: "ที่ดินเป็นรูปสี่เหลี่ยมจัตุรัส ขนาดแปลงที่ดินด้านทิศใต้ติดถนน กว้างประมาณ 13 ม....",
        asset_details_total_area: "171.2",
        asset_details_number_of_bedrooms: "3",
        asset_details_number_of_bathrooms: "2"
    },
    {
        asset_code: "3A1163",
        name_th: "ชีวาทัย ราชปรารภ",
        asset_details_selling_price: "5211000",
        location_latitude: "13.7541", 
        location_longitude: "100.5427",
        asset_details_description_th: "ห้องชุดพักอาศัย เลขที่ 11/94 ชั้นที่ 11 ชื่ออาคารชุด ชีวาทัย ราชปรารภ...",
        asset_details_total_area: "55.85",
        asset_details_number_of_bedrooms: "1",
        asset_details_number_of_bathrooms: "1"
    }
];

// ฟังก์ชันสำหรับดึงค่า Parameter จาก URL (เช่น asset_code)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function loadAssetDetails() {
    const assetCode = getUrlParameter('asset_code');
    
    // ค้นหาทรัพย์สินที่ตรงกับรหัสที่ส่งมา
    const selectedAsset = properties.find(p => p.asset_code === assetCode);

    if (!selectedAsset) {
        document.getElementById('asset-detail-name').innerText = 'ไม่พบทรัพย์สินนี้';
        return;
    }

    // ฟอร์แมตและแสดงข้อมูลบนหน้า HTML
    document.getElementById('asset-title').innerText = selectedAsset.name_th;
    document.getElementById('asset-detail-name').innerText = selectedAsset.name_th;
    document.getElementById('asset-detail-code').innerText = `รหัสทรัพย์: ${selectedAsset.asset_code}`;
    
    const priceFormatted = parseFloat(selectedAsset.asset_details_selling_price).toLocaleString('th-TH');
    document.getElementById('starting-price').innerText = `${priceFormatted} บาท`;
    document.getElementById('current-price').innerText = `${priceFormatted} บาท (ราคาเริ่มต้น)`;
    document.getElementById('closing-time').innerText = '25 พ.ย. 2568 เวลา 14:00 น.';
    document.getElementById('asset-description').innerText = selectedAsset.asset_details_description_th.replace(/\r\n/g, '\n');
    
    // รายละเอียดปลีกย่อย
    document.getElementById('area-size').innerText = `${selectedAsset.asset_details_total_area}`;
    document.getElementById('num-bed').innerText = selectedAsset.asset_details_number_of_bedrooms || 'N/A';
    document.getElementById('num-bath').innerText = selectedAsset.asset_details_number_of_bathrooms || 'N/A';

    // **จัดการแผนที่ย่อ (Mini Map)**
    const lat = parseFloat(selectedAsset.location_latitude);
    const lng = parseFloat(selectedAsset.location_longitude);
    
    if (lat && lng) {
        const miniMap = L.map('mini-map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(miniMap);
        L.marker([lat, lng]).addTo(miniMap)
            .bindPopup(selectedAsset.name_th)
            .openPopup();
            
        // ต้องสั่ง Invalidate Size เพื่อให้ Leaflet คำนวณขนาดแผนที่ที่ซ่อนอยู่ถูก
        setTimeout(() => miniMap.invalidateSize(), 100); 
    } else {
        document.getElementById('mini-map').innerHTML = '<p style="padding: 20px;">ไม่พบพิกัดทรัพย์สินนี้</p>';
    }

    // จำลอง Live Timer
    const countdownElement = document.getElementById('live-timer');
    // ตั้งค่าเวลาสำหรับแสดงผลนาฬิกา
    let secondsLeft = 1 * 24 * 60 * 60 + 5 * 3600 + 30 * 60; // 1D 5H 30M
    setInterval(() => {
        secondsLeft--;
        const days = Math.floor(secondsLeft / (3600 * 24));
        const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;

        countdownElement.innerText = `${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
        if (secondsLeft <= 0) {
            clearInterval(this);
            countdownElement.innerText = 'ปิดประมูลแล้ว';
        }
    }, 1000);
}

// เริ่มต้นการโหลดข้อมูลเมื่อหน้าเว็บพร้อม
document.addEventListener('DOMContentLoaded', loadAssetDetails);