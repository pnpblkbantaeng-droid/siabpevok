document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (result.success) {
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil',
      text: result.message,
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/dashboard';
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: result.message
    });
  }
});
