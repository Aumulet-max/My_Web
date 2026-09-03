// วาง Web app URL ของ Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbyYUqFmLqqAswp03PGphVUiurl4hc4DdoVfuvkHbCPv1Zq0Qj1xQnwsF4AuMpepg-IY/exec";

let studentsData = [];
const form = document.getElementById('searchForm');
const input = document.getElementById('studentId');
const resultBox = document.getElementById('resultBox');
const submitBtn = document.getElementById('submitBtn');

submitBtn.disabled = true;

// ดึงข้อมูลล่วงหน้าทันทีที่โหลดหน้าเว็บ
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    studentsData = data;
    submitBtn.disabled = false;
    submitBtn.innerText = "ค้นหา";
  })
  .catch(err => {
    submitBtn.innerText = "เชื่อมต่อชีตไม่สำเร็จ";
    console.error(err);
  });

// กำหนดสี badge ตามสถานะในชีต
function getStatusClass(text) {
  if (!text) return 'status-unpaid';
  if (text.includes('จ่ายแล้ว')) return 'status-paid';
  if (text.includes('ลาพัก')) return 'status-leave';
  return 'status-unpaid';
}

// ฟังก์ชันสำหรับกดปุ่มย้อนกลับ/ค้นหาใหม่
function resetSearch() {
  resultBox.style.display = 'none';
  input.value = '';
  input.focus();
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = input.value.trim();
  const student = studentsData.find(item => item.id === query);

  resultBox.style.display = 'block';

  if (student) {
    resultBox.className = 'result-box result-success';

    const totalAmount = parseInt(student.total, 10) || 0;

    let actionButtonHtml = '';
    if (totalAmount >= 150) {
      // สำหรับคนที่จ่ายครบ 150 บาท: แสดงข้อความเรียบร้อย พร้อมปุ่มย้อนกลับ
      actionButtonHtml = `
        <div style="text-align: center; margin-top: 14px; color: #16a34a; font-weight: 600; font-size: 14px;">
          🎉 ชำระเงินครบถ้วนเรียบร้อยแล้ว
        </div>
        <div class="btn-container">
          <button type="button" class="my-btn" style="background-color: #64748b;" onclick="resetSearch()">ย้อนกลับ</button>
        </div>
      `;
    } else {
      // สำหรับคนที่ยังจ่ายไม่ครบ: แสดงปุ่มจ่ายเลยตามปกติ
      const payUrl = `payment.html?id=${encodeURIComponent(student.id)}&name=${encodeURIComponent(student.name)}&total=${encodeURIComponent(student.total || 0)}`;

      actionButtonHtml = `
        <div class="btn-container">
          <a href="${payUrl}" class="my-btn">จ่ายเลย</a>
        </div>
      `;
    }

    resultBox.innerHTML = `
      <div class="student-header">
        <div class="student-name">${student.name}</div>
        <div class="student-id">รหัส: ${student.id}</div>
      </div>
      
      <div style="font-size: 12px; font-weight: 600; color: #475569;">สถานะรายเดือน:</div>
      <div class="month-grid">
        <div class="month-item ${getStatusClass(student.jun)}">มิ.ย.<br>${student.jun || '-'}</div>
        <div class="month-item ${getStatusClass(student.jul)}">ก.ค.<br>${student.jul || '-'}</div>
        <div class="month-item ${getStatusClass(student.aug)}">ส.ค.<br>${student.aug || '-'}</div>
        <div class="month-item ${getStatusClass(student.sep)}">ก.ย.<br>${student.sep || '-'}</div>
        <div class="month-item ${getStatusClass(student.oct)}">ต.ค.<br>${student.oct || '-'}</div>
      </div>

      <div class="total-badge">
        รวมเงินเก็บรายเดือน + ค่ากีฬาสี: ${student.total || '0'} บาท
      </div>

      ${actionButtonHtml}
    `;
  } else {
    resultBox.className = 'result-box result-error';
    resultBox.innerHTML = `
      <div>ไม่พบข้อมูลสำหรับรหัส <b>${query}</b></div>
      <div class="btn-container">
        <button type="button" class="my-btn" style="background-color: #64748b; margin-top: 10px;" onclick="resetSearch()">ย้อนกลับ</button>
      </div>
    `;
  }
});