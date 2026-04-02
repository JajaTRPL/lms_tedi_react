import { renderDashboardLayout } from '../dashboard/DashboardLayout';
import { renderDokumenMahasiswa } from './DokumenMahasiswa';
import Toastify from 'toastify-js';

export const renderScholarshipForm = () => {
    let currentStep = 1;
    let formData: any = {
        siblings: []
    };

    const render = () => {
        const content = `
            <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                <!-- Header & Back Button -->
                <div class="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                    <div class="flex items-center gap-4">
                        <button id="btn-back-to-docs" class="p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div>
                            <h2 class="text-xl font-bold text-gray-800">Permohonan Beasiswa</h2>
                            <p class="text-xs text-gray-500">Lengkapi formulir pengajuan surat rekomendasi</p>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Draft Autosaved
                    </div>
                </div>

                <!-- Progress Stepper -->
                <div class="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                    <div class="relative flex justify-between">
                        <!-- Progress Line Background -->
                        <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 -z-0 mx-8"></div>
                        <!-- Active Progress Line -->
                        <div class="absolute top-5 left-0 h-0.5 bg-primary-teal transition-all duration-500 -z-0 mx-8" style="width: ${(currentStep - 1) * 33.33}%"></div>

                        ${[1, 2, 3, 4].map(step => `
                            <div class="relative z-10 flex flex-col items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${currentStep === step ? 'bg-primary-teal text-white scale-110 ring-4 ring-teal-50' :
                currentStep > step ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
            }">
                                    ${currentStep > step ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : `<span class="font-bold text-sm">${step}</span>`}
                                </div>
                                <span class="text-[10px] font-bold uppercase tracking-wider ${currentStep === step ? 'text-primary-teal' : 'text-gray-400'}">
                                    ${step === 1 ? 'Biodata' : step === 2 ? 'Keluarga' : step === 3 ? 'Akademik' : 'Submit'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Form Card -->
                <div class="bg-white rounded-[32px] shadow-xl shadow-teal-900/5 border border-gray-100 overflow-hidden min-h-[400px]">
                    <div class="p-8 md:p-12">
                        <form id="scholarship-form" class="space-y-8">
                            ${renderStepContent()}

                            <!-- Navigation Buttons -->
                            <div class="pt-8 flex justify-between items-center border-t border-gray-50">
                                <button type="button" id="btn-prev" class="px-8 py-3.5 text-gray-500 font-bold hover:text-gray-800 transition-colors ${currentStep === 1 ? 'invisible' : ''}">
                                    Sebelumnya
                                </button>
                                <button type="button" id="btn-next" class="px-10 py-3.5 bg-primary-teal text-white font-bold rounded-2xl hover:bg-teal-800 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                    ${currentStep === 4 ? 'Kirim Pengajuan' : 'Lanjutkan'}
                                    ${currentStep < 4 ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' : ''}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        renderDashboardLayout('Permohonan Beasiswa', content, 'mahasiswa');
        attachEvents();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return `
                <div class="animate-enter-right space-y-6">
                    <div class="border-l-4 border-primary-teal pl-4 mb-8">
                        <h3 class="text-xl font-bold text-gray-800">Biodata Mahasiswa</h3>
                        <p class="text-sm text-gray-500">Pastikan data akademik Anda sudah benar.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Nomor Induk Mahasiswa (NIM)</label>
                            <input type="text" name="nim" value="${formData.nim || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium" placeholder="Contoh: 21/123456/TK/12345">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Fakultas</label>
                            <input type="text" name="faculty" value="${formData.faculty || 'Teknik'}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="md:col-span-2 space-y-2">
                            <label class="text-sm font-bold text-gray-700">Program Studi</label>
                            <input type="text" name="study_program" value="${formData.study_program || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium" placeholder="Contoh: Teknologi Informasi">
                        </div>
                    </div>
                </div>
            `;
            case 2: return `
                <div class="animate-enter-right space-y-8">
                    <div class="border-l-4 border-primary-teal pl-4">
                        <h3 class="text-xl font-bold text-gray-800">Detail Pribadi & Keluarga</h3>
                        <p class="text-sm text-gray-500">Data ini digunakan untuk analisis kelayakan beasiswa.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Tempat Lahir</label>
                            <input type="text" name="pob" value="${formData.pob || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Tanggal Lahir</label>
                            <input type="date" name="dob" value="${formData.dob || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Jenis Kelamin</label>
                            <select name="gender" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                                <option value="Laki-laki" ${formData.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                                <option value="Perempuan" ${formData.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-4 pt-4">
                        <h4 class="font-bold text-gray-800 flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary-teal rounded-full"></span>
                            Alamat
                        </h4>
                        <div class="grid grid-cols-1 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700">Alamat Asal (KTP)</label>
                                <textarea name="origin_address" rows="2" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">${formData.origin_address || ''}</textarea>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700">Alamat di Jogja</label>
                                <textarea name="jogja_address" rows="2" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">${formData.jogja_address || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6 pt-4">
                        <h4 class="font-bold text-gray-800 flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary-teal rounded-full"></span>
                            Data Orang Tua / Wali
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <!-- Ayah -->
                            <div class="space-y-4 p-6 bg-gray-50 rounded-2xl">
                                <p class="text-xs font-black text-primary-teal uppercase">Ayah</p>
                                <input type="text" name="father_name" placeholder="Nama Ayah" value="${formData.father_name || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <input type="text" name="father_job" placeholder="Pekerjaan" value="${formData.father_job || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <input type="number" name="father_income" placeholder="Penghasilan (Rp)" value="${formData.father_income || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <select name="father_status" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                    <option value="Hidup" ${formData.father_status === 'Hidup' ? 'selected' : ''}>Masih Hidup</option>
                                    <option value="Meninggal" ${formData.father_status === 'Meninggal' ? 'selected' : ''}>Meninggal</option>
                                </select>
                            </div>
                            <!-- Ibu -->
                            <div class="space-y-4 p-6 bg-gray-50 rounded-2xl">
                                <p class="text-xs font-black text-pink-500 uppercase">Ibu</p>
                                <input type="text" name="mother_name" placeholder="Nama Ibu" value="${formData.mother_name || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <input type="text" name="mother_job" placeholder="Pekerjaan" value="${formData.mother_job || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <input type="number" name="mother_income" placeholder="Penghasilan (Rp)" value="${formData.mother_income || ''}" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                <select name="mother_status" class="w-full px-4 py-2.5 bg-white rounded-lg border-none shadow-sm outline-none text-sm font-medium">
                                    <option value="Hidup" ${formData.mother_status === 'Hidup' ? 'selected' : ''}>Masih Hidup</option>
                                    <option value="Meninggal" ${formData.mother_status === 'Meninggal' ? 'selected' : ''}>Meninggal</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            case 3: return `
                <div class="animate-enter-right space-y-8">
                    <div class="border-l-4 border-primary-teal pl-4">
                        <h3 class="text-xl font-bold text-gray-800">Detail Beasiswa & Akademik</h3>
                        <p class="text-sm text-gray-500">Informasi spesifik mengenai beasiswa yang diajukan.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2 space-y-2">
                            <label class="text-sm font-bold text-gray-700">Nama Beasiswa yang Diajukan</label>
                            <input type="text" name="scholarship_name" value="${formData.scholarship_name || ''}" placeholder="Misal: Beasiswa Djarum 2024" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Semester Saat Ini</label>
                            <input type="number" name="current_semester" value="${formData.current_semester || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">IPK Terakhir</label>
                            <input type="number" step="0.01" name="ipk" value="${formData.ipk || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Jumlah Tanggungan Keluarga</label>
                            <input type="number" name="family_dependents" value="${formData.family_dependents || ''}" class="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-teal/20 outline-none transition-all font-medium">
                        </div>
                    </div>

                    <div class="space-y-4 pt-4">
                        <h4 class="font-bold text-gray-800 flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary-teal rounded-full"></span>
                            Dokumen Pendukung
                        </h4>
                        <div class="p-8 border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50 hover:bg-gray-100/50 hover:border-primary-teal/30 transition-all cursor-pointer relative group">
                            <input type="file" id="ktm-upload" class="absolute inset-0 opacity-0 cursor-pointer">
                            <div class="flex flex-col items-center gap-3 text-center">
                                <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-teal">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>
                                <div id="ktm-preview-name">
                                    <p class="text-sm font-bold text-gray-700">Upload KTM (Kartu Tanda Mahasiswa)</p>
                                    <p class="text-xs text-gray-400 mt-1">Format: PDF atau Image (Max 2MB)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            case 4: return `
                <div class="animate-enter-right space-y-8 text-center py-8">
                    <div class="w-24 h-24 bg-teal-50 text-primary-teal rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div class="max-w-md mx-auto">
                        <h3 class="text-2xl font-black text-gray-800 mb-4">Siap untuk Kirim?</h3>
                        <p class="text-gray-500 text-sm leading-relaxed">
                            Pastikan semua data yang Anda masukkan sudah benar. Setelah dikirim, Anda tidak dapat mengubah data sampai proses verifikasi selesai.
                        </p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-2xl p-6 text-left space-y-3 max-w-lg mx-auto">
                        <div class="flex justify-between text-xs border-b border-gray-200 pb-2">
                            <span class="text-gray-400 uppercase font-bold tracking-widest">Jenis Surat</span>
                            <span class="text-gray-800 font-bold">Permohonan Beasiswa</span>
                        </div>
                        <div class="flex justify-between text-xs border-b border-gray-200 pb-2">
                            <span class="text-gray-400 uppercase font-bold tracking-widest">Nama Beasiswa</span>
                            <span class="text-gray-800 font-bold">${formData.scholarship_name || '-'}</span>
                        </div>
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-400 uppercase font-bold tracking-widest">Mahasiswa</span>
                            <span class="text-gray-800 font-bold">${formData.nim || '-'}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    const attachEvents = () => {
        document.getElementById('btn-back-to-docs')?.addEventListener('click', () => {
            renderDokumenMahasiswa();
        });

        document.getElementById('btn-prev')?.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                render();
            }
        });

        document.getElementById('btn-next')?.addEventListener('click', async () => {
            if (currentStep < 4) {
                const stepSaved = await saveCurrentStep();
                if (stepSaved) {
                    currentStep++;
                    render();
                }
            } else {
                submitFinal();
            }
        });

        // Auto-fill initial data
        if (currentStep === 1 && !formData.nim) {
            fetchDraft();
        }

        // File upload preview
        const fileInput = document.getElementById('ktm-upload') as HTMLInputElement;
        fileInput?.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const preview = document.getElementById('ktm-preview-name');
                if (preview) {
                    preview.innerHTML = `
                        <p class="text-sm font-bold text-teal-600">File Terpilih:</p>
                        <p class="text-xs font-medium text-gray-700 mt-1">${fileInput.files[0].name}</p>
                    `;
                }
            }
        });
    };

    const fetchDraft = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch('/api/mahasiswa/scholarship/step1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.application) {
                    formData = { ...formData, ...data.application };
                    render();
                }
            }
        } catch (e) { console.error(e); }
    };

    const saveCurrentStep = async () => {
        const token = localStorage.getItem('auth_token');
        const formElement = document.getElementById('scholarship-form') as HTMLFormElement;
        const currentFormData = new FormData(formElement);
        const data: any = {};
        currentFormData.forEach((value, key) => { data[key] = value; });

        let endpoint = `/api/mahasiswa/scholarship/step-${currentStep}`;
        let body: any = data;

        // Custom handling for Step 3 (File Upload)
        if (currentStep === 3) {
            const bodyFormData = new FormData();
            Object.keys(data).forEach(key => bodyFormData.append(key, data[key]));
            const fileInput = document.getElementById('ktm-upload') as HTMLInputElement;
            if (fileInput.files && fileInput.files[0]) {
                bodyFormData.append('ktm', fileInput.files[0]);
            }
            bodyFormData.append('has_scholarship_history', '0'); // Mocking simple version
            body = bodyFormData;
        } else {
            body = JSON.stringify(data);
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: currentStep === 3 ? { 'Authorization': `Bearer ${token}` } : {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body
            });

            if (res.ok) {
                const result = await res.json();
                formData = { ...formData, ...result.application };
                return true;
            } else {
                const err = await res.json();
                Toastify({
                    text: "Gagal menyimpan: " + (err.message || "Pastikan semua kolom terisi"),
                    duration: 3000,
                    style: { background: "#EF4444" }
                }).showToast();
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const submitFinal = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch('/api/mahasiswa/scholarship/submit', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Toastify({
                    text: "Berhasil! Pengajuan telah dikirim.",
                    duration: 2000,
                    style: { background: "#10B981" }
                }).showToast();
                setTimeout(() => renderDokumenMahasiswa(), 1500);
            }
        } catch (e) { console.error(e); }
    };

    render();
};
