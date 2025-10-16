document.addEventListener('DOMContentLoaded', async () => {
  const authCheck = await fetch('/auth/check');
  const authData = await authCheck.json();

  if (!authData.authenticated) {
    window.location.href = '/admin-login';
    return;
  }

  document.getElementById('adminUsername').textContent = authData.user.username;

  loadStatistics();
  loadPrograms();
  loadUsers();
  loadAttendances();
  loadSettings();

  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/admin-login';
  });

  document.getElementById('filterBtn').addEventListener('click', loadAttendances);
  document.getElementById('exportCSV').addEventListener('click', () => {
    window.location.href = '/admin/export/csv';
  });
  document.getElementById('exportPDF').addEventListener('click', () => {
    window.location.href = '/admin/export/pdf';
  });

  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  document.getElementById('importCSVForm').addEventListener('submit', importCSV);
  document.getElementById('importSheetsForm').addEventListener('submit', importSheets);
});

async function loadStatistics() {
  const response = await fetch('/admin/statistics');
  const stats = await response.json();

  document.getElementById('totalAttendances').textContent = stats.totalAttendances;
  document.getElementById('totalPrograms').textContent = stats.totalPrograms;
  document.getElementById('todayAttendances').textContent = stats.todayAttendances;
}

async function loadPrograms() {
  const response = await fetch('/admin/programs');
  const programs = await response.json();

  const tbody = document.getElementById('programList');
  tbody.innerHTML = '';

  programs.forEach((program, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${program.name}</td>
      <td>${new Date(program.created_at).toLocaleString('id-ID')}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editProgram(${program.id})">
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProgram(${program.id})">
          <i class="bi bi-trash"></i> Hapus
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const filterSelect = document.getElementById('filterProgram');
  const editSelect = document.getElementById('editProgram');
  
  filterSelect.innerHTML = '<option value="">Semua Program</option>';
  editSelect.innerHTML = '';
  
  programs.forEach(program => {
    filterSelect.innerHTML += `<option value="${program.id}">${program.name}</option>`;
    editSelect.innerHTML += `<option value="${program.id}">${program.name}</option>`;
  });
}

async function loadUsers() {
  const response = await fetch('/admin/users');
  const users = await response.json();

  const tbody = document.getElementById('userList');
  tbody.innerHTML = '';

  users.forEach((user, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.username}</td>
      <td>${new Date(user.created_at).toLocaleString('id-ID')}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
          <i class="bi bi-trash"></i> Hapus
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadAttendances() {
  const search = document.getElementById('searchAttendance').value;
  const program = document.getElementById('filterProgram').value;
  const date = document.getElementById('filterDate').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (program) params.append('program', program);
  if (date) params.append('date', date);

  const response = await fetch(`/admin/attendances?${params}`);
  const attendances = await response.json();

  const tbody = document.getElementById('attendanceList');
  tbody.innerHTML = '';

  attendances.forEach((att, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${att.program_name || '-'}</td>
      <td>${att.nama}</td>
      <td>${att.nik}</td>
      <td>${att.nomor_hp}</td>
      <td>${att.email}</td>
      <td>${new Date(att.created_at).toLocaleString('id-ID')}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="viewDetail(${att.id})">
          <i class="bi bi-eye"></i> Detail
        </button>
        <button class="btn btn-sm btn-warning" onclick="editAttendance(${att.id})">
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${att.id})">
          <i class="bi bi-trash"></i> Hapus
        </button>
        <a href="https://wa.me/${att.nomor_hp.replace(/\+/g, '')}" target="_blank" class="btn btn-sm btn-success">
          <i class="bi bi-whatsapp"></i> WA
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadSettings() {
  const response = await fetch('/admin/settings');
  const settings = await response.json();

  document.getElementById('absensiStatusSelect').value = settings.absensi_status;
  document.getElementById('absensiMessageInput').value = settings.absensi_message;
  document.getElementById('absensiStatus').textContent = settings.absensi_status;
}

async function saveSettings() {
  const absensi_status = document.getElementById('absensiStatusSelect').value;
  const absensi_message = document.getElementById('absensiMessageInput').value;

  const response = await fetch('/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ absensi_status, absensi_message })
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pengaturan berhasil disimpan'
    });
    loadSettings();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.message
    });
  }
}

function showProgramModal() {
  document.getElementById('programModalTitle').textContent = 'Tambah Program';
  document.getElementById('programId').value = '';
  document.getElementById('programName').value = '';
  document.getElementById('passwordHint').style.display = 'none';
}

async function editProgram(id) {
  const response = await fetch(`/admin/programs`);
  const programs = await response.json();
  const program = programs.find(p => p.id === id);

  document.getElementById('programModalTitle').textContent = 'Edit Program';
  document.getElementById('programId').value = program.id;
  document.getElementById('programName').value = program.name;

  const modal = new bootstrap.Modal(document.getElementById('programModal'));
  modal.show();
}

async function saveProgram() {
  const id = document.getElementById('programId').value;
  const name = document.getElementById('programName').value;

  const url = id ? `/admin/programs/${id}` : '/admin/programs';
  const method = id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Program berhasil disimpan'
    });
    bootstrap.Modal.getInstance(document.getElementById('programModal')).hide();
    loadPrograms();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.message
    });
  }
}

async function deleteProgram(id) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Konfirmasi',
    text: 'Yakin ingin menghapus program ini?',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    const response = await fetch(`/admin/programs/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      Swal.fire('Berhasil', 'Program berhasil dihapus', 'success');
      loadPrograms();
    } else {
      Swal.fire('Error', data.message, 'error');
    }
  }
}

function showUserModal() {
  document.getElementById('userModalTitle').textContent = 'Tambah Admin';
  document.getElementById('userId').value = '';
  document.getElementById('userUsername').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('passwordHint').style.display = 'none';
  document.getElementById('userPassword').required = true;
}

async function editUser(id) {
  const response = await fetch(`/admin/users`);
  const users = await response.json();
  const user = users.find(u => u.id === id);

  document.getElementById('userModalTitle').textContent = 'Edit Admin';
  document.getElementById('userId').value = user.id;
  document.getElementById('userUsername').value = user.username;
  document.getElementById('userPassword').value = '';
  document.getElementById('passwordHint').style.display = 'block';
  document.getElementById('userPassword').required = false;

  const modal = new bootstrap.Modal(document.getElementById('userModal'));
  modal.show();
}

async function saveUser() {
  const id = document.getElementById('userId').value;
  const username = document.getElementById('userUsername').value;
  const password = document.getElementById('userPassword').value;

  const url = id ? `/admin/users/${id}` : '/admin/users';
  const method = id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Admin berhasil disimpan'
    });
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    loadUsers();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.message
    });
  }
}

async function deleteUser(id) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Konfirmasi',
    text: 'Yakin ingin menghapus admin ini?',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    const response = await fetch(`/admin/users/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      Swal.fire('Berhasil', 'Admin berhasil dihapus', 'success');
      loadUsers();
    } else {
      Swal.fire('Error', data.message, 'error');
    }
  }
}

async function viewDetail(id) {
  const response = await fetch(`/admin/attendances/${id}`);
  const att = await response.json();

  const content = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Program:</strong> ${att.program_name || '-'}</p>
        <p><strong>Nama:</strong> ${att.nama}</p>
        <p><strong>Jenis Kelamin:</strong> ${att.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
        <p><strong>Pendidikan:</strong> ${att.pendidikan}</p>
        <p><strong>Tempat, Tanggal Lahir:</strong> ${att.tempat_lahir}, ${att.tanggal_lahir}</p>
        <p><strong>Alamat:</strong> ${att.alamat}</p>
        <p><strong>Kabupaten:</strong> ${att.kabupaten}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Nomor HP:</strong> ${att.nomor_hp}</p>
        <p><strong>NIK:</strong> ${att.nik}</p>
        <p><strong>Email:</strong> ${att.email}</p>
        <p><strong>Tanggal Absensi:</strong> ${new Date(att.created_at).toLocaleString('id-ID')}</p>
        <p><strong>Tanda Tangan:</strong></p>
        <img src="${att.signature}" class="signature-preview" alt="Tanda Tangan">
      </div>
    </div>
  `;

  document.getElementById('detailContent').innerHTML = content;
  const modal = new bootstrap.Modal(document.getElementById('detailModal'));
  modal.show();
}

async function editAttendance(id) {
  const response = await fetch(`/admin/attendances/${id}`);
  const att = await response.json();

  document.getElementById('editId').value = att.id;
  document.getElementById('editProgram').value = att.program_id;
  document.getElementById('editNama').value = att.nama;
  document.getElementById('editJenisKelamin').value = att.jenis_kelamin;
  document.getElementById('editPendidikan').value = att.pendidikan;
  document.getElementById('editKabupaten').value = att.kabupaten;
  document.getElementById('editTempatLahir').value = att.tempat_lahir;
  document.getElementById('editTanggalLahir').value = att.tanggal_lahir;
  document.getElementById('editAlamat').value = att.alamat;
  document.getElementById('editNomorHP').value = att.nomor_hp;
  document.getElementById('editNIK').value = att.nik;
  document.getElementById('editEmail').value = att.email;

  const createdAt = att.created_at;
  const tanggalAbsensi = createdAt.substring(0, 10);
  const waktuAbsensi = createdAt.substring(11, 16);
  
  document.getElementById('editTanggalAbsensi').value = tanggalAbsensi;
  document.getElementById('editWaktuAbsensi').value = waktuAbsensi;

  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const tanggalAbsensi = document.getElementById('editTanggalAbsensi').value;
  const waktuAbsensi = document.getElementById('editWaktuAbsensi').value;
  const created_at = `${tanggalAbsensi} ${waktuAbsensi}:00`;

  const data = {
    program_id: document.getElementById('editProgram').value,
    nama: document.getElementById('editNama').value,
    jenis_kelamin: document.getElementById('editJenisKelamin').value,
    pendidikan: document.getElementById('editPendidikan').value,
    kabupaten: document.getElementById('editKabupaten').value,
    tempat_lahir: document.getElementById('editTempatLahir').value,
    tanggal_lahir: document.getElementById('editTanggalLahir').value,
    alamat: document.getElementById('editAlamat').value,
    nomor_hp: document.getElementById('editNomorHP').value,
    nik: document.getElementById('editNIK').value,
    email: document.getElementById('editEmail').value,
    created_at: created_at
  };

  const response = await fetch(`/admin/attendances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil diupdate'
    });
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    loadAttendances();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.message
    });
  }
}

async function deleteAttendance(id) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Konfirmasi',
    text: 'Yakin ingin menghapus data absensi ini?',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    const response = await fetch(`/admin/attendances/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      Swal.fire('Berhasil', 'Data berhasil dihapus', 'success');
      loadAttendances();
    } else {
      Swal.fire('Error', data.message, 'error');
    }
  }
}

async function importCSV(e) {
  e.preventDefault();

  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    Swal.fire('Error', 'Pilih file CSV terlebih dahulu', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/admin/import/csv', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire('Berhasil', result.message, 'success');
    bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
    loadAttendances();
    fileInput.value = '';
  } else {
    Swal.fire('Error', result.message, 'error');
  }
}

async function importSheets(e) {
  e.preventDefault();

  const spreadsheetId = document.getElementById('spreadsheetId').value;
  const range = document.getElementById('sheetRange').value;

  const response = await fetch('/admin/import/sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spreadsheetId, range })
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire('Berhasil', result.message, 'success');
    bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
    loadAttendances();
  } else {
    Swal.fire('Error', result.message, 'error');
  }
}
