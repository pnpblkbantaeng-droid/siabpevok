let signaturePad;

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('signaturePad');
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)'
  });

  const statusResponse = await fetch('/attendance/status');
  const statusData = await statusResponse.json();
  
  if (statusData.status === 'OFF') {
    Swal.fire({
      icon: 'warning',
      title: 'Absensi OFF',
      text: statusData.message || 'Absensi OFF, hubungi admin di +6281243397116',
      confirmButtonText: 'OK'
    });
  }

  const programsResponse = await fetch('/attendance/programs');
  const programs = await programsResponse.json();
  
  const programSelect = document.getElementById('program_id');
  programs.forEach(program => {
    const option = document.createElement('option');
    option.value = program.id;
    option.textContent = program.name;
    programSelect.appendChild(option);
  });

  document.getElementById('clearSignature').addEventListener('click', () => {
    signaturePad.clear();
  });

  document.getElementById('nik').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (signaturePad.isEmpty()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Silakan buat tanda tangan terlebih dahulu'
      });
      return;
    }

    const formData = {
      program_id: document.getElementById('program_id').value,
      nama: document.getElementById('nama').value,
      jenis_kelamin: document.getElementById('jenis_kelamin').value,
      pendidikan: document.getElementById('pendidikan').value,
      tempat_lahir: document.getElementById('tempat_lahir').value,
      tanggal_lahir: document.getElementById('tanggal_lahir').value,
      alamat: document.getElementById('alamat').value,
      kabupaten: document.getElementById('kabupaten').value,
      nomor_hp: document.getElementById('nomor_hp').value,
      nik: document.getElementById('nik').value,
      email: document.getElementById('email').value,
      signature: signaturePad.toDataURL()
    };

    const response = await fetch('/attendance/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: result.message,
        confirmButtonText: 'OK'
      }).then(() => {
        document.getElementById('attendanceForm').reset();
        signaturePad.clear();
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message
      });
    }
  });
});
