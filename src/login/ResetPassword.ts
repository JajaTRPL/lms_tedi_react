import { renderLogin } from './Login'

declare global {
  interface Window {
    tempEmail?: string;
  }
}

const startCountdown = (button: HTMLElement, seconds: number) => {
  let timeLeft = seconds
  const originalText = button.innerText
  const isButton = button instanceof HTMLButtonElement
  if (isButton) (button as HTMLButtonElement).disabled = true

  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer)
      if (isButton) (button as HTMLButtonElement).disabled = false
      button.innerText = originalText
      return
    }
    button.innerText = `Tunggu ${timeLeft} detik`
    timeLeft--
  }, 1000)
}

export const renderForgotPassword = () => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-['Inter']" style="background-image: url('/bc-login.png');">
      <div class="absolute inset-0 bg-[#002d2d]/40 pointer-events-none"></div>

      <div class="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-around gap-12 relative z-10">
        <div class="flex flex-col items-center text-center lg:items-center lg:text-center max-w-xl text-white">
          <div class="mb-6 animate-fade-in ">
            <img src="/ugm-logo.png" alt="University Logo" class="w-32 h-32 object-contain drop-shadow-2xl">
          </div>
          <h1 class="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg text-center">
            Sistem Persuratan<br>
            <span class="text-secondary-teal">Departemen Teknik Elektro dan Informatika</span>
          </h1>
        </div>

        <div class="flex flex-col items-center w-full max-w-md">
          <div class="text-center mb-8 text-white">
            <h2 class="text-3xl font-semibold mb-2">Lupa Kata Sandi?</h2>
            <p class="text-sm opacity-90 px-4">Masukkan email Anda untuk menerima token reset.</p>
          </div>

          <div class="bg-white w-full p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 animate-slide-up">
            <form id="forgot-password-form" class="space-y-6">
              <div class="space-y-2">
                <label for="email" class="block text-sm font-semibold text-gray-700">Email</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary-teal transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Masukkan email" 
                    required
                    class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-teal/20 focus:border-secondary-teal outline-none transition-all placeholder-gray-400 text-gray-700"
                  >
                </div>
              </div>

              <div class="flex justify-end">
                <button type="button" id="back-to-login" class="text-xs font-medium text-gray-400 hover:text-secondary-teal transition-colors focus:outline-none">Kembali ke Login</button>
              </div>

              <button 
                type="submit" 
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-secondary-teal hover:bg-secondary-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-teal transition-all transform active:scale-[0.98]"
              >
                Generate Token
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  document.getElementById('forgot-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const submitBtn = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement
    const email = (document.getElementById('email') as HTMLInputElement).value
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      }

      if (response.ok) {
        if (data.token_simulation) {
          alert(`Mode Simulasi: Token Anda adalah ${data.token_simulation}\n\nSalin token ini untuk verifikasi karena sistem sedang tidak mengirim email asli.`);
        }
        window.tempEmail = email
        renderVerifyToken()
      } else {
        if (response.status === 429) {
          const seconds = data.seconds_left || 60
          startCountdown(submitBtn, seconds)
          alert(data.message || 'Harap tunggu sebentar sebelum mengirim ulang.')
        } else if (response.status === 404) {
          alert('Endpoint API tidak ditemukan (404).')
        } else {
          alert(data.message || 'Email tidak ditemukan atau terjadi kesalahan.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan pada server. Pastikan backend Laravel aktif.')
    }
  })

  document.getElementById('back-to-login')?.addEventListener('click', () => {
    renderLogin()
  })
}

export const renderVerifyToken = () => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-['Inter']" style="background-image: url('/bc-login.png');">
      <div class="absolute inset-0 bg-[#002d2d]/40 pointer-events-none"></div>

      <div class="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-around gap-12 relative z-10">
        <div class="flex flex-col items-center text-center lg:items-center lg:text-center max-w-xl text-white">
          <div class="mb-6 animate-fade-in ">
            <img src="/ugm-logo.png" alt="University Logo" class="w-32 h-32 object-contain drop-shadow-2xl">
          </div>
          <h1 class="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg text-center">
            Sistem Persuratan<br>
            <span class="text-secondary-teal">Departemen Teknik Elektro dan Informatika</span>
          </h1>
        </div>

        <div class="flex flex-col items-center w-full max-w-md text-white">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold mb-2">Verifikasi Token</h2>
            <p class="text-sm opacity-90 px-4">Kami telah mengirimkan kode verifikasi ke email Anda.</p>
          </div>

          <div class="bg-white w-full p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 animate-slide-up">
            <form id="verify-token-form" class="space-y-6">
              <div class="space-y-4">
                <label class="block text-sm font-semibold text-gray-700 text-center">Token Verifikasi (6 Digit)</label>
                <div class="flex justify-between gap-2" id="otp-inputs">
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                  <div class="flex items-center text-gray-300 font-bold">-</div>
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                  <input type="text" maxlength="1" class="otp-input w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-secondary-teal focus:ring-2 focus:ring-secondary-teal/20 outline-none transition-all text-gray-700" required>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="button" id="back-to-forgot" class="text-xs font-medium text-gray-400 hover:text-secondary-teal transition-colors focus:outline-none">Kirim ulang token</button>
              </div>

              <button 
                type="submit" 
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-secondary-teal hover:bg-secondary-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-teal transition-all transform active:scale-[0.98]"
              >
                Verifikasi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  // OTP Input Logic
  const otpInputs = document.querySelectorAll<HTMLInputElement>('.otp-input')
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value
      if (val && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus()
      }
    })

    // On paste, spread the numbers
    input.addEventListener('paste', (e) => {
      e.preventDefault()
      const pasteData = e.clipboardData?.getData('text').slice(0, 6)
      if (pasteData) {
        pasteData.split('').forEach((char, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = char
          }
        })
        otpInputs[Math.min(pasteData.length, 5)].focus()
      }
    })
  })

  document.getElementById('verify-token-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const token = Array.from(otpInputs).map(i => i.value).join('')
    if (token.length < 6) {
      alert('Silakan masukkan 6 digit token dengan lengkap.')
      return
    }
    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: window.tempEmail,
          token: token
        })
      })

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      }

      if (response.ok) {
        renderResetPassword()
      } else {
        if (response.status === 404) {
          alert('Endpoint API tidak ditemukan (404). Pastikan backend Laravel sudah jalan di port 8000.')
        } else {
          alert(data.message || 'Token salah atau sudah kadaluwarsa.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan pada verifikasi token. Pastikan backend Laravel aktif.')
    }
  })

  document.getElementById('back-to-forgot')?.addEventListener('click', async (e) => {
    const resendBtn = e.target as HTMLButtonElement
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: window.tempEmail })
      })

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      }

      if (response.ok) {
        if (data.token_simulation) {
          alert(`Mode Simulasi: Token baru Anda adalah ${data.token_simulation}\n\nSalin token ini untuk verifikasi.`);
        } else {
          alert('Token baru telah dikirim ke email Anda.')
        }
        startCountdown(resendBtn, 60)
      } else {
        if (response.status === 429) {
          const seconds = data.seconds_left || 60
          startCountdown(resendBtn, seconds)
          alert(data.message || 'Harap tunggu sebentar sebelum mengirim ulang.')
        } else {
          alert(data.message || 'Terjadi kesalahan saat mengirim ulang token.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan pada server.')
    }
  })
}

export const renderResetPassword = () => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden font-['Inter']" style="background-image: url('/bc-login.png');">
      <div class="absolute inset-0 bg-[#002d2d]/40 pointer-events-none"></div>

      <div class="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-around gap-12 relative z-10">
        <div class="flex flex-col items-center text-center lg:items-center lg:text-center max-w-xl text-white">
          <div class="mb-6 animate-fade-in ">
            <img src="/ugm-logo.png" alt="University Logo" class="w-32 h-32 object-contain drop-shadow-2xl">
          </div>
          <h1 class="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg text-center">
            Sistem Persuratan<br>
            <span class="text-secondary-teal">Departemen Teknik Elektro dan Informatika</span>
          </h1>
        </div>

        <div class="flex flex-col items-center w-full max-w-md text-white">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold mb-2">Atur Ulang Kata Sandi</h2>
            <p class="text-sm opacity-90 px-4">Kata sandi baru Anda harus aman.</p>
          </div>

          <div class="bg-white w-full p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 animate-slide-up">
            <form id="reset-password-form" class="space-y-6">
              <div class="space-y-2">
                <label for="new-password" class="block text-sm font-semibold text-gray-700">Kata Sandi Baru</label>
                <div class="relative group text-gray-700">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary-teal transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="new-password" 
                    placeholder="Masukkan kata sandi baru" 
                    required
                    class="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-teal/20 focus:border-secondary-teal outline-none transition-all placeholder-gray-400"
                  >
                  <button type="button" id="toggle-new-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                    <svg id="eye-icon-new" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="space-y-2 text-gray-700">
                <label for="confirm-password" class="block text-sm font-semibold text-gray-700">Konfirmasi Kata Sandi</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-secondary-teal transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    placeholder="Ulangi kata sandi baru" 
                    required
                    class="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-teal/20 focus:border-secondary-teal outline-none transition-all placeholder-gray-400"
                  >
                  <button type="button" id="toggle-confirm-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                    <svg id="eye-icon-confirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-secondary-teal hover:bg-secondary-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-teal transition-all transform active:scale-[0.98]"
              >
                Simpan Kata Sandi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  const newPasswordInput = document.getElementById('new-password') as HTMLInputElement
  const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement
  const toggleNewBtn = document.getElementById('toggle-new-password') as HTMLButtonElement
  const toggleConfirmBtn = document.getElementById('toggle-confirm-password') as HTMLButtonElement

  const setupToggle = (input: HTMLInputElement, btn: HTMLButtonElement, iconId: string) => {
    btn?.addEventListener('click', () => {
      const isPassword = input.type === 'password'
      input.type = isPassword ? 'text' : 'password'
      const icon = document.getElementById(iconId)
      if (icon) {
        if (isPassword) {
          icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
        } else {
          icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`
        }
      }
    })
  }

  setupToggle(newPasswordInput, toggleNewBtn, 'eye-icon-new')
  setupToggle(confirmPasswordInput, toggleConfirmBtn, 'eye-icon-confirm')

  document.getElementById('reset-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newPassword = newPasswordInput.value
    const confirmPassword = confirmPasswordInput.value

    if (newPassword !== confirmPassword) {
      alert('Kata sandi dan konfirmasi tidak cocok!')
      return
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: window.tempEmail,
          password: newPassword,
          password_confirmation: confirmPassword
        })
      })

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      }

      if (response.ok) {
        alert('Kata sandi berhasil diatur ulang!')
        renderLogin()
      } else {
        if (response.status === 404) {
          alert('Endpoint API tidak ditemukan (404). Pastikan backend Laravel sudah jalan di port 8000.')
        } else {
          alert(data.message || 'Gagal mereset password.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan pada saat mereset kata sandi. Pastikan backend Laravel aktif.')
    }
  })
}
