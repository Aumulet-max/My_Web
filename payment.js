const API_URL = "https://script.google.com/macros/s/AKfycbyYUqFmLqqAswp03PGphVUiurl4hc4DdoVfuvkHbCPv1Zq0Qj1xQnwsF4AuMpepg-IY/exec";

const params = new URLSearchParams(window.location.search);
const id = params.get('id') || '-';
const name = params.get('name') || '-';
const total = parseInt(params.get('total'), 10) || 0;

// คำนวณยอดค้างชำระ (ยอดเต็ม 150 บาท)
const dueAmount = Math.max(0, 150 - total);

// แสดงข้อมูลชื่อ รหัส และยอดค้างชำระ
document.getElementById('displayId').innerText = id;
document.getElementById('displayName').innerText = decodeURIComponent(name);
document.getElementById('displayAmount').innerText = dueAmount;

// แปลงตัวเลขเป็น 3 หลัก เช่น 80 -> "080", 150 -> "150"
const formattedAmount = dueAmount.toString().padStart(3, '0');

// อัปเดตรูป QR Code ตามยอดเงิน
const qrImage = document.getElementById('qrImage');
if (qrImage) {
  qrImage.src = `images/qr-${formattedAmount}.jpeg`;
}

const slipInput = document.getElementById('slipInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const submitSlipBtn = document.getElementById('submitSlipBtn');
const uploadStatus = document.getElementById('uploadStatus');

let base64String = "";

slipInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  fileNameDisplay.innerText = file.name;

  const reader = new FileReader();
  reader.onload = function() {
    base64String = reader.result;
    submitSlipBtn.disabled = false;
    submitSlipBtn.style.backgroundColor = "#2563eb";
  };
  reader.readAsDataURL(file);
});

submitSlipBtn.addEventListener('click', function() {
  if (!base64String) return;

  submitSlipBtn.disabled = true;
  submitSlipBtn.innerText = "กำลังอัปโหลดสลิป...";
  uploadStatus.style.display = "block";
  uploadStatus.style.color = "#0284c7";
  uploadStatus.innerText = "กำลังส่งข้อมูลเข้าสู่ระบบ...";

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      id: id,
      name: decodeURIComponent(name),
      image: base64String
    })
  })
  .then(res => res.json())
  .then(result => {
    if (result.status === "success") {
      uploadStatus.style.color = "#16a34a";
      uploadStatus.innerText = "ส่งสลิปเรียบร้อยแล้ว! ข้อมูลถูกบันทึกลงระบบแล้วครับ";
      submitSlipBtn.innerText = "อัปโหลดสำเร็จ";
    } else {
      throw new Error(result.message);
    }
  })
  .catch(err => {
    uploadStatus.style.color = "#dc2626";
    uploadStatus.innerText = "เกิดข้อผิดพลาดในการส่ง กรุณาลองใหม่อีกครั้ง";
    submitSlipBtn.disabled = false;
    submitSlipBtn.innerText = "ส่งหลักฐานสลิป";
    console.error(err);
  });
});