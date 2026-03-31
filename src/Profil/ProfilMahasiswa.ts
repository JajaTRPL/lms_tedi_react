import { renderDashboardLayout } from '../dashboard/DashboardLayout';
import Toastify from 'toastify-js';

export const renderProfilMahasiswa = () => {
    const content = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
            
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Profil Mahasiswa</h2>
                    <p class="text-gray-500 mt-2">Lengkapi data diri dan keluarga Anda di bawah ini untuk keperluan pengajuan surat.</p>
                </div>
                <button id="btn-back-dashboard" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Kembali ke Dashboard
                </button>
            </div>

            <form id="form-update-profil" class="space-y-8">
                
                <!-- PROFIL SSO (Readonly) -->
                <div class="bg-gray-50/80 rounded-[24px] p-8 border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profil SSO (Read-only)
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                            <input type="text" readonly value="${localStorage.getItem('auth_name') || 'Mahasiswa UGM'}" class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">NIM</label>
                            <input type="text" readonly value="21/471234/TK/52345" class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Fakultas</label>
                            <input type="text" readonly value="Teknik" class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Program Studi</label>
                            <input type="text" readonly value="Teknologi Informasi" class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium">
                        </div>
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Email UGM</label>
                            <input type="text" readonly value="mahasiswa@mail.ugm.ac.id" class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium">
                        </div>
                    </div>
                </div>

                <!-- DETAIL PROFIL -->
                <div class="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Detail Profil
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Tempat Lahir</label>
                            <input type="text" id="tempat_lahir" placeholder="Masukkan tempat lahir" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                            <input type="date" id="tanggal_lahir" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                            <select id="jenis_kelamin" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]">
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="L">Laki-Laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">No. Telp / WhatsApp</label>
                            <input type="tel" id="no_hp" placeholder="Contoh: 08123456789" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Alamat Asal</label>
                            <textarea id="alamat_asal" rows="2" placeholder="Masukkan alamat asal lengkap" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400 resize-none"></textarea>
                        </div>
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Alamat di Yogyakarta (Domisili)</label>
                            <textarea id="alamat_domisili" rows="2" placeholder="Masukkan alamat kos/kontrakan di Yogyakarta" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400 resize-none"></textarea>
                        </div>
                        
                        <!-- Uploads -->
                        <div class="space-y-2 mt-4">
                            <label class="block text-sm font-semibold text-gray-700">Pas Foto 3x4</label>
                            <div class="flex items-center gap-4">
                                <label class="flex-1 cursor-pointer">
                                    <div id="preview-foto-container" class="flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 overflow-hidden min-h-[50px]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        <span id="label-foto" class="text-sm font-medium">Unggah Foto</span>
                                    </div>
                                    <input type="file" id="input-foto" class="hidden" accept="image/*">
                                </label>
                                <span class="text-xs text-gray-400 w-1/2">Format JPG/PNG, maks 2MB</span>
                            </div>
                        </div>

                        <div class="space-y-2 mt-4">
                            <label class="block text-sm font-semibold text-gray-700">Tanda Tangan</label>
                            <div class="flex items-center gap-4">
                                <label class="flex-1 cursor-pointer">
                                    <div id="preview-ttd-container" class="flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 overflow-hidden min-h-[50px]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z"></path></svg>
                                        <span id="label-ttd" class="text-sm font-medium">Unggah TTD</span>
                                    </div>
                                    <input type="file" id="input-ttd" class="hidden" accept="image/*">
                                </label>
                                <span class="text-xs text-gray-400 w-1/2">Format PNG (transparan), maks 1MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DATA AYAH -->
                <div class="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Data Ayah
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Nama Lengkap Ayah</label>
                            <input type="text" id="ayah_nama" placeholder="Masukkan nama ayah" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Pekerjaan</label>
                            <input type="text" id="ayah_pekerjaan" placeholder="Pekerjaan ayah" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Penghasilan Per Bulan</label>
                            <select id="ayah_penghasilan" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg...')] bg-no-repeat bg-[position:right_1rem_center]">
                                <option value="">Pilih Rentang</option>
                                <option value="1">Tidak Berpenghasilan</option>
                                <option value="2">< Rp 1.000.000</option>
                                <option value="3">Rp 1.000.000 - Rp 3.000.000</option>
                                <option value="4">Rp 3.000.000 - Rp 5.000.000</option>
                                <option value="5">> Rp 5.000.000</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Status</label>
                            <select id="ayah_status" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                                <option value="hidup">Masih Hidup</option>
                                <option value="meninggal">Meninggal</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Tanggal Meninggal <span class="text-xs text-gray-400 font-normal">(opsional)</span></label>
                            <input type="date" id="ayah_tgl_meninggal" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-500">
                        </div>
                    </div>
                </div>

                <!-- DATA IBU -->
                <div class="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Data Ibu
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Nama Lengkap Ibu</label>
                            <input type="text" id="ibu_nama" placeholder="Masukkan nama ibu" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Pekerjaan</label>
                            <input type="text" id="ibu_pekerjaan" placeholder="Pekerjaan ibu" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Penghasilan Per Bulan</label>
                            <select id="ibu_penghasilan" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                                <option value="">Pilih Rentang</option>
                                <option value="1">Tidak Berpenghasilan / Ibu Rumah Tangga</option>
                                <option value="2">< Rp 1.000.000</option>
                                <option value="3">Rp 1.000.000 - Rp 3.000.000</option>
                                <option value="4">Rp 3.000.000 - Rp 5.000.000</option>
                                <option value="5">> Rp 5.000.000</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Status</label>
                            <select id="ibu_status" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                                <option value="hidup">Masih Hidup</option>
                                <option value="meninggal">Meninggal</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Tanggal Meninggal <span class="text-xs text-gray-400 font-normal">(opsional)</span></label>
                            <input type="date" id="ibu_tgl_meninggal" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-500">
                        </div>
                    </div>
                </div>

                <!-- DATA WALI -->
                <div id="section-wali" class="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 transition-all duration-300">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Data Wali <span class="text-xs font-normal text-gray-400 ml-2">(Opsional jika tidak ada wali)</span>
                        </h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2 md:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700">Nama Lengkap Wali</label>
                            <input type="text" id="wali_nama" placeholder="Masukkan nama wali (kosongkan jika tidak ada)" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Pekerjaan</label>
                            <input type="text" id="wali_pekerjaan" placeholder="Pekerjaan wali" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all placeholder-gray-400">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Penghasilan Per Bulan</label>
                            <select id="wali_penghasilan" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                                <option value="">Pilih Rentang</option>
                                <option value="1">Tidak Berpenghasilan</option>
                                <option value="2">< Rp 1.000.000</option>
                                <option value="3">Rp 1.000.000 - Rp 3.000.000</option>
                                <option value="4">Rp 3.000.000 - Rp 5.000.000</option>
                                <option value="5">> Rp 5.000.000</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold text-gray-700">Status</label>
                            <select id="wali_status" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-gray-700">
                                <option value="hidup">Masih Hidup</option>
                                <option value="meninggal">Meninggal</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- DATA SAUDARA KANDUNG -->
                <div class="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg class="text-teal-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Data Saudara Kandung
                        </h3>
                    </div>
                    
                    <div class="border border-gray-200 rounded-xl overflow-hidden mb-4">
                        <table class="w-full text-left ">
                            <thead class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th class="px-6 py-4">Nama</th>
                                    <th class="px-6 py-4">Pekerjaan / Sekolah</th>
                                    <th class="px-6 py-4">Status Kawin</th>
                                    <th class="px-6 py-4">Keterangan</th>
                                    <th class="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="saudara-tbody" class="divide-y divide-gray-100 text-sm">
                                <tr>
                                    <td class="px-6 py-4 font-medium text-gray-800"><input type="text" placeholder="Nama saudara" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none"></td>
                                    <td class="px-6 py-4"><input type="text" placeholder="Pekerjaan/Sekolah" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none"></td>
                                    <td class="px-6 py-4">
                                        <select class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none">
                                            <option>Belum Kawin</option>
                                            <option>Sudah Kawin</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-4"><input type="text" placeholder="..." class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none"></td>
                                    <td class="px-6 py-4 text-center">
                                        <button type="button" class="btn-hapus-saudara text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button type="button" id="btn-tambah-saudara" class="text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tambah Saudara
                    </button>
                </div>

                <!-- SUBMIT / EDIT BUTTONS -->
                <div class="pt-6 border-t border-gray-200 flex justify-end gap-4" id="action-buttons-container">
                    <button type="button" id="btn-edit-profil" class="px-8 py-3 bg-white border border-gray-200 text-teal-600 font-bold rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all shadow-sm flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Profil
                    </button>
                    <button type="button" id="btn-batal-edit" class="hidden px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        Batal
                    </button>
                    <button type="submit" id="btn-simpan-profil" class="hidden px-8 py-3 bg-primary-teal text-white font-bold rounded-xl hover:bg-teal-800 transition-colors shadow-sm focus:ring-4 focus:ring-teal-100 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    `;
    
    renderDashboardLayout('Detail & Update Profil', content, 'mahasiswa');

    // Add interceptors and logic
    setTimeout(() => {
        const form = document.getElementById('form-update-profil');
        const btnEditProfil = document.getElementById('btn-edit-profil');
        const btnBatalEdit = document.getElementById('btn-batal-edit');
        const btnSimpanProfil = document.getElementById('btn-simpan-profil');
        const btnTambahSaudara = document.getElementById('btn-tambah-saudara');
        const tbody = document.getElementById('saudara-tbody');

        document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
            import('../dashboard/MahasiswaDashboard').then(({ renderMahasiswaDashboard }) => {
                renderMahasiswaDashboard();
            });
        });

        const hapusSaudara = (e: Event) => {
            const btn = e.currentTarget as HTMLElement;
            const tr = btn.closest('tr');
            if (tr) {
                tr.remove();
            }
        };

        const bindHapusButtons = () => {
            document.querySelectorAll('.btn-hapus-saudara').forEach(btn => {
                btn.removeEventListener('click', hapusSaudara);
                btn.addEventListener('click', hapusSaudara);
            });
        };

        const toggleEditMode = (isEditing: boolean) => {
            if (btnEditProfil) btnEditProfil.classList.toggle('hidden', isEditing);
            if (btnBatalEdit) btnBatalEdit.classList.toggle('hidden', !isEditing);
            if (btnSimpanProfil) btnSimpanProfil.classList.toggle('hidden', !isEditing);
            if (btnTambahSaudara) btnTambahSaudara.classList.toggle('hidden', !isEditing);

            if (form) {
                // Use CSS-only read-only state — DO NOT use input.disabled!
                // Disabled inputs are excluded from FormData, causing data loss on save.
                const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:not([readonly]), select, textarea');
                inputs.forEach(input => {
                    if (!isEditing) {
                        input.classList.add('bg-gray-50', 'text-gray-500', 'pointer-events-none');
                        input.classList.remove('bg-white');
                    } else {
                        input.classList.remove('bg-gray-50', 'text-gray-500', 'pointer-events-none');
                        input.classList.add('bg-white');
                    }
                });

                // Toggle delete sibling buttons
                const deleteBtns = form.querySelectorAll('.btn-hapus-saudara');
                deleteBtns.forEach(btn => {
                    if (isEditing) {
                        btn.classList.remove('hidden');
                    } else {
                        btn.classList.add('hidden');
                    }
                });

                // Toggle file input wrapper cursor
                const fileLabels = form.querySelectorAll('input[type="file"]');
                fileLabels.forEach(fileInput => {
                    const label = fileInput.closest('label');
                    if (label) {
                        if (isEditing) {
                            label.classList.remove('pointer-events-none', 'opacity-60');
                        } else {
                            label.classList.add('pointer-events-none', 'opacity-60');
                        }
                    }
                });
            }
        };

        if (btnEditProfil) {
            btnEditProfil.addEventListener('click', () => toggleEditMode(true));
        }

        if (btnBatalEdit) {
            btnBatalEdit.addEventListener('click', () => toggleEditMode(false));
        }

        async function loadProfile() {
            const token = localStorage.getItem('auth_token');
            if(!token) return;
            try {
                const res = await fetch('/api/profile', { 
                    headers: { 'Authorization': 'Bearer ' + token },
                    cache: 'no-store'
                });
                if(res.ok) {
                    const data = await res.json();
                    const profile = data.profile;
                    if(profile) {
                        if(document.getElementById('tempat_lahir')) (document.getElementById('tempat_lahir') as HTMLInputElement).value = profile.tempat_lahir || '';
                        if(document.getElementById('tanggal_lahir')) (document.getElementById('tanggal_lahir') as HTMLInputElement).value = profile.tanggal_lahir?.split('T')[0] || '';
                        if(document.getElementById('jenis_kelamin')) (document.getElementById('jenis_kelamin') as HTMLSelectElement).value = profile.jenis_kelamin || '';
                        if(document.getElementById('no_hp')) (document.getElementById('no_hp') as HTMLInputElement).value = profile.no_hp || '';
                        if(document.getElementById('alamat_asal')) (document.getElementById('alamat_asal') as HTMLTextAreaElement).value = profile.alamat_asal || '';
                        if(document.getElementById('alamat_domisili')) (document.getElementById('alamat_domisili') as HTMLTextAreaElement).value = profile.alamat_domisili || '';

                        if(profile.keluarga && Array.isArray(profile.keluarga)) {
                            const tbody = document.getElementById('saudara-tbody');
                            if(tbody) tbody.innerHTML = '';

                            profile.keluarga.forEach((k: any) => {
                                if(k.jenis_relasi === 'ayah') {
                                    if(document.getElementById('ayah_nama')) (document.getElementById('ayah_nama') as HTMLInputElement).value = k.nama_lengkap || '';
                                    if(document.getElementById('ayah_pekerjaan')) (document.getElementById('ayah_pekerjaan') as HTMLInputElement).value = k.pekerjaan || '';
                                    if(document.getElementById('ayah_penghasilan')) (document.getElementById('ayah_penghasilan') as HTMLSelectElement).value = k.penghasilan || '';
                                    if(document.getElementById('ayah_status')) (document.getElementById('ayah_status') as HTMLSelectElement).value = k.status_hidup || 'hidup';
                                    if(document.getElementById('ayah_tgl_meninggal')) (document.getElementById('ayah_tgl_meninggal') as HTMLInputElement).value = k.tanggal_meninggal?.split('T')[0] || '';
                                } else if(k.jenis_relasi === 'ibu') {
                                    if(document.getElementById('ibu_nama')) (document.getElementById('ibu_nama') as HTMLInputElement).value = k.nama_lengkap || '';
                                    if(document.getElementById('ibu_pekerjaan')) (document.getElementById('ibu_pekerjaan') as HTMLInputElement).value = k.pekerjaan || '';
                                    if(document.getElementById('ibu_penghasilan')) (document.getElementById('ibu_penghasilan') as HTMLSelectElement).value = k.penghasilan || '';
                                    if(document.getElementById('ibu_status')) (document.getElementById('ibu_status') as HTMLSelectElement).value = k.status_hidup || 'hidup';
                                    if(document.getElementById('ibu_tgl_meninggal')) (document.getElementById('ibu_tgl_meninggal') as HTMLInputElement).value = k.tanggal_meninggal?.split('T')[0] || '';
                                } else if(k.jenis_relasi === 'wali') {
                                    if(document.getElementById('wali_nama')) (document.getElementById('wali_nama') as HTMLInputElement).value = k.nama_lengkap || '';
                                    if(document.getElementById('wali_pekerjaan')) (document.getElementById('wali_pekerjaan') as HTMLInputElement).value = k.pekerjaan || '';
                                    if(document.getElementById('wali_penghasilan')) (document.getElementById('wali_penghasilan') as HTMLSelectElement).value = k.penghasilan || '';
                                    if(document.getElementById('wali_status')) (document.getElementById('wali_status') as HTMLSelectElement).value = k.status_hidup || 'hidup';
                                } else if(k.jenis_relasi === 'saudara' && tbody) {
                                    const tr = document.createElement('tr');
                                    tr.innerHTML = `
                                        <td class="px-6 py-4 font-medium text-gray-800"><input type="text" value="${k.nama_lengkap || ''}" placeholder="Nama saudara" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                                        <td class="px-6 py-4"><input type="text" value="${k.pekerjaan || ''}" placeholder="Pekerjaan/Sekolah" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                                        <td class="px-6 py-4">
                                            <select class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700">
                                                <option ${k.status_kawin === 'Belum Kawin' ? 'selected' : ''}>Belum Kawin</option>
                                                <option ${k.status_kawin === 'Sudah Kawin' ? 'selected' : ''}>Sudah Kawin</option>
                                            </select>
                                        </td>
                                        <td class="px-6 py-4"><input type="text" value="${k.keterangan || ''}" placeholder="..." class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                                        <td class="px-6 py-4 text-center">
                                            <button type="button" class="btn-hapus-saudara text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </td>
                                    `;
                                    tbody.appendChild(tr);
                                }
                            });
                        }

                        // Preview images if paths exist
                        if(profile.pas_foto_path) {
                            console.log('Loading Pas Foto:', profile.pas_foto_path);
                            const container = document.getElementById('preview-foto-container');
                            if(container) container.innerHTML = `<img src="${profile.pas_foto_path}?t=${new Date().getTime()}" class="h-10 w-10 object-cover rounded-lg border border-gray-200"> <span class="text-xs text-teal-600 font-bold italic">Tersimpan</span>`;
                        }
                        if(profile.tanda_tangan_path) {
                            console.log('Loading TTD:', profile.tanda_tangan_path);
                            const container = document.getElementById('preview-ttd-container');
                            if(container) container.innerHTML = `<img src="${profile.tanda_tangan_path}?t=${new Date().getTime()}" class="h-10 w-20 object-contain rounded-lg border border-gray-200 bg-gray-50"> <span class="text-xs text-teal-600 font-bold italic">Tersimpan</span>`;
                        }

                        if(profile.pas_foto_path) {
                            localStorage.setItem('auth_photo', profile.pas_foto_path);
                            const headerAvatar = document.getElementById('header-user-avatar') as HTMLImageElement;
                            if(headerAvatar) {
                                headerAvatar.src = `${profile.pas_foto_path}?t=${new Date().getTime()}`;
                                headerAvatar.className = 'w-full h-full object-cover';
                            }
                        }
                        checkWaliVisibility();
                    }
                }
            } catch(e) { console.error('Fetch profile error:', e); }
            toggleEditMode(false); // Ensure sync
            bindHapusButtons();
        }

        const checkWaliVisibility = () => {
            const ayahStatus = (document.getElementById('ayah_status') as HTMLSelectElement)?.value;
            const ibuStatus = (document.getElementById('ibu_status') as HTMLSelectElement)?.value;
            const sectionWali = document.getElementById('section-wali');
            
            if (sectionWali) {
                if (ayahStatus === 'meninggal' && ibuStatus === 'meninggal') {
                    sectionWali.classList.remove('hidden');
                } else {
                    sectionWali.classList.add('hidden');
                }
            }
        };

        const statusAyah = document.getElementById('ayah_status');
        const statusIbu = document.getElementById('ibu_status');
        if(statusAyah) statusAyah.addEventListener('change', checkWaliVisibility);
        if(statusIbu) statusIbu.addEventListener('change', checkWaliVisibility);
        
        loadProfile();

        // Image Preview Handler
        const handleImagePreview = (inputId: string, containerId: string, labelId: string) => {
            const input = document.getElementById(inputId) as HTMLInputElement;
            const container = document.getElementById(containerId);
            const label = document.getElementById(labelId);
            if(input && container && label) {
                input.addEventListener('change', () => {
                    if(input.files && input.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            container.innerHTML = `<img src="${e.target?.result}" class="h-10 w-auto max-w-[100px] object-contain rounded-lg border border-teal-500 shadow-sm animate-pulse">`;
                            label.innerText = input.files![0].name;
                        };
                        reader.readAsDataURL(input.files[0]);
                    }
                });
            }
        };

        handleImagePreview('input-foto', 'preview-foto-container', 'label-foto');
        handleImagePreview('input-ttd', 'preview-ttd-container', 'label-ttd');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('auth_token');
                
                const formData = new FormData();
                formData.append('_method', 'PUT');
                formData.append('tempat_lahir', (document.getElementById('tempat_lahir') as HTMLInputElement)?.value || '');
                formData.append('tanggal_lahir', (document.getElementById('tanggal_lahir') as HTMLInputElement)?.value || '');
                formData.append('jenis_kelamin', (document.getElementById('jenis_kelamin') as HTMLSelectElement)?.value || '');
                formData.append('no_hp', (document.getElementById('no_hp') as HTMLInputElement)?.value || '');
                formData.append('alamat_asal', (document.getElementById('alamat_asal') as HTMLTextAreaElement)?.value || '');
                formData.append('alamat_domisili', (document.getElementById('alamat_domisili') as HTMLTextAreaElement)?.value || '');

                const inputFoto = document.getElementById('input-foto') as HTMLInputElement;
                const inputTtd = document.getElementById('input-ttd') as HTMLInputElement;
                if(inputFoto?.files?.[0]) formData.append('pas_foto', inputFoto.files[0]);
                if(inputTtd?.files?.[0]) formData.append('tanda_tangan', inputTtd.files[0]);

                let kelIndex = 0;
                const pushKel = (rel: string, n: string, p: string, ph: string, s: string, t: string) => {
                    const nama = (document.getElementById(n) as HTMLInputElement)?.value;
                    if(nama) {
                        formData.append(`keluarga[${kelIndex}][jenis_relasi]`, rel);
                        formData.append(`keluarga[${kelIndex}][nama_lengkap]`, nama);
                        formData.append(`keluarga[${kelIndex}][pekerjaan]`, (document.getElementById(p) as HTMLInputElement)?.value || '');
                        formData.append(`keluarga[${kelIndex}][penghasilan]`, (document.getElementById(ph) as HTMLSelectElement)?.value || '');
                        formData.append(`keluarga[${kelIndex}][status_hidup]`, (document.getElementById(s) as HTMLSelectElement)?.value || 'hidup');
                        formData.append(`keluarga[${kelIndex}][tanggal_meninggal]`, (document.getElementById(t) as HTMLInputElement)?.value || '');
                        kelIndex++;
                    }
                };

                pushKel('ayah', 'ayah_nama', 'ayah_pekerjaan', 'ayah_penghasilan', 'ayah_status', 'ayah_tgl_meninggal');
                pushKel('ibu', 'ibu_nama', 'ibu_pekerjaan', 'ibu_penghasilan', 'ibu_status', 'ibu_tgl_meninggal');
                
                const waliNama = (document.getElementById('wali_nama') as HTMLInputElement)?.value;
                if(waliNama) {
                     formData.append(`keluarga[${kelIndex}][jenis_relasi]`, 'wali');
                     formData.append(`keluarga[${kelIndex}][nama_lengkap]`, waliNama);
                     formData.append(`keluarga[${kelIndex}][pekerjaan]`, (document.getElementById('wali_pekerjaan') as HTMLInputElement)?.value || '');
                     formData.append(`keluarga[${kelIndex}][penghasilan]`, (document.getElementById('wali_penghasilan') as HTMLSelectElement)?.value || '');
                     formData.append(`keluarga[${kelIndex}][status_hidup]`, (document.getElementById('wali_status') as HTMLSelectElement)?.value || 'hidup');
                     kelIndex++;
                }

                const rows = document.getElementById('saudara-tbody')?.querySelectorAll('tr') || [];
                rows.forEach(tr => {
                    const inputs = tr.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>;
                    if(inputs.length >= 4 && inputs[0].value) {
                         formData.append(`keluarga[${kelIndex}][jenis_relasi]`, 'saudara');
                         formData.append(`keluarga[${kelIndex}][nama_lengkap]`, inputs[0].value);
                         formData.append(`keluarga[${kelIndex}][pekerjaan]`, inputs[1].value || '');
                         formData.append(`keluarga[${kelIndex}][status_kawin]`, inputs[2].value || '');
                         formData.append(`keluarga[${kelIndex}][keterangan]`, inputs[3].value || '');
                         kelIndex++;
                    }
                });

                try {
                    const res = await fetch('/api/profile', {
                        method: 'POST', // Use POST with _method spoofing for multipart PUT
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        body: formData
                    });
                    
                    if(res.ok) {
                        Toastify({
                            text: 'Data profil berhasil disimpan secara permanen!',
                            duration: 3000, gravity: 'top', position: 'right', style: { background: '#10B981' }
                        }).showToast();
                        // Reload to show saved state
                        await loadProfile();
                    } else {
                        Toastify({
                            text: 'Gagal menyimpan profil, periksa inputan Anda.',
                            duration: 3000, gravity: 'top', position: 'right', style: { background: '#EF4444' }
                        }).showToast();
                    }
                } catch(e) {
                    Toastify({
                        text: 'Terjadi kesalahan saat menghubungi API.',
                        duration: 3000, gravity: 'top', position: 'right', style: { background: '#EF4444' }
                    }).showToast();
                }
            });
        }

        bindHapusButtons(); // bind initial row

        if (btnTambahSaudara && tbody) {
            btnTambahSaudara.addEventListener('click', () => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-800"><input type="text" placeholder="Nama saudara" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                    <td class="px-6 py-4"><input type="text" placeholder="Pekerjaan/Sekolah" class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                    <td class="px-6 py-4">
                        <select class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700">
                            <option>Belum Kawin</option>
                            <option>Sudah Kawin</option>
                        </select>
                    </td>
                    <td class="px-6 py-4"><input type="text" placeholder="..." class="w-full p-2 border border-gray-200 rounded focus:border-teal-500 outline-none text-sm bg-white text-gray-700"></td>
                    <td class="px-6 py-4 text-center">
                        <button type="button" class="btn-hapus-saudara text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
                bindHapusButtons(); // re-bind to include new button
            });
        }

        // Initialize state
        // toggleEditMode(false) is now called inside loadProfile ensuring everything matches the loaded data


    }, 100);
};
