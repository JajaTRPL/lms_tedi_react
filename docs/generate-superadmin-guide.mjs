import { jsPDF } from 'jspdf';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('docs');
fs.mkdirSync(outDir, { recursive: true });

const title = 'Panduan Fitur Super Admin';
const subtitle = 'Aplikasi Web Penyuratan';
const generated = new Date().toLocaleDateString('id-ID', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
});

const sections = [
  {
    title: '1. Gambaran Umum Role Super Admin',
    body: [
      'Super Admin adalah role pengelola sistem tingkat tertinggi. Role ini dipakai untuk mengelola data master, akun pengguna, pemantauan surat, template dokumen, retensi arsip, periode akademik, peminjaman ruangan, dan log aktivitas.',
      'Super Admin bersifat mengelola dan memantau. Untuk beberapa alur, persetujuan operasional tetap dilakukan oleh reviewer sesuai role masing-masing, seperti Tendik, Akademik, atau Kepala Lab.',
      'Gunakan akun Super Admin dengan hati-hati karena perubahan pada data master dapat memengaruhi pilihan form, proses reviewer, dan tampilan pengguna lain.'
    ],
    bullets: [
      'Pastikan login menggunakan akun dengan role super_admin.',
      'Gunakan menu sidebar untuk berpindah fitur.',
      'Periksa notifikasi sukses/gagal setelah melakukan perubahan.',
      'Setiap aksi penting akan tercatat pada Log Report atau riwayat audit terkait.'
    ]
  },
  {
    title: '2. Dashboard Super Admin',
    body: [
      'Dashboard menampilkan ringkasan kondisi sistem secara cepat. Umumnya berisi jumlah akun, statistik aktivitas, dan ringkasan data yang membantu Super Admin melihat keadaan sistem tanpa masuk ke tiap menu.',
      'Dashboard cocok digunakan sebagai halaman pertama untuk mengecek apakah data utama dan aktivitas sistem berjalan normal.'
    ],
    bullets: [
      'Lihat ringkasan jumlah pengguna berdasarkan role.',
      'Pantau statistik aktivitas dan data sistem terbaru.',
      'Gunakan dashboard sebagai titik awal sebelum melakukan pengecekan lebih detail di menu lain.'
    ]
  },
  {
    title: '3. Manajemen Akun',
    body: [
      'Menu Manajemen Akun digunakan untuk mengelola akun Super Admin, Tendik, Akademik, dan Mahasiswa. Data akun menjadi dasar akses pengguna ke sistem, sehingga pengisian role dan relasi organisasi harus tepat.',
      'Super Admin dapat menambah akun baru, mengedit data akun, melihat detail, memblokir atau membuka blokir akun, menghapus akun tertentu, serta melakukan impor/ekspor data mahasiswa.'
    ],
    bullets: [
      'Tambah Akun: klik tombol Tambah Akun, isi email, nama, role, dan field tambahan sesuai role.',
      'Edit Akun: buka menu aksi atau detail akun, lalu pilih Edit dan simpan perubahan.',
      'Blokir/Buka Blokir: digunakan untuk menghentikan sementara akses akun tanpa menghapus data.',
      'Hapus Akun: gunakan hanya jika akun benar-benar tidak diperlukan. Sistem menampilkan modal konfirmasi sebelum menghapus.',
      'Impor Mahasiswa: unggah file data mahasiswa sesuai template. Mode perbarui data membutuhkan alasan karena tercatat dalam audit.',
      'Ekspor Data: wajib memberi alasan ekspor karena berisi data pribadi dan tercatat di log aktivitas.'
    ],
    notes: [
      'Primary Super Admin tidak boleh dihapus sembarangan.',
      'Secondary Super Admin memiliki batasan saat mengelola akun Super Admin lain.',
      'Data role Tendik dapat terkait tugas reviewer atau unit laboratorium.'
    ]
  },
  {
    title: '4. Monitoring Surat',
    body: [
      'Menu Monitoring Surat digunakan untuk memantau status dan progres pengajuan surat dalam sistem. Fitur ini bukan tempat menyetujui atau menolak surat, melainkan dashboard pemantauan untuk Super Admin.',
      'Filter periode seperti Hari Ini, Minggu Ini, 1 Bulan, 3 Bulan, 6 Bulan, dan 12 Bulan membantu melihat tren pengajuan berdasarkan rentang waktu.'
    ],
    bullets: [
      'Surat Masuk: jumlah pengajuan surat yang masuk pada periode terpilih.',
      'Menunggu Persetujuan: pengajuan yang masih menunggu verifikasi atau persetujuan reviewer.',
      'Perlu Revisi: pengajuan yang dikembalikan ke mahasiswa untuk diperbaiki.',
      'Surat Selesai: pengajuan yang sudah selesai diproses.',
      'Daftar Surat Melebihi Batas Proses: pengajuan yang belum diproses lebih dari batas waktu, misalnya lebih dari 3 hari.'
    ],
    notes: [
      'Jika angka masih 0, kemungkinan belum ada data pada periode yang dipilih atau endpoint statistik belum mengembalikan data.',
      'Aksi persetujuan tetap dilakukan oleh reviewer sesuai role, bukan oleh Super Admin dari halaman monitoring ini.'
    ]
  },
  {
    title: '5. Template Dokumen',
    body: [
      'Menu Template Dokumen dipakai untuk melihat dan mengelola template surat yang digunakan sistem. Template menjadi dasar pembuatan dokumen akhir untuk berbagai jenis pengajuan.',
      'Beberapa template bersifat terkelola melalui cache atau integrasi sumber dokumen. Super Admin dapat memperbarui cache template agar sistem memakai versi terbaru.'
    ],
    bullets: [
      'Buka menu Template Dokumen dari sidebar.',
      'Periksa daftar template yang tersedia dan status cache-nya.',
      'Gunakan aksi Refresh/Perbarui Cache jika template sumber berubah.',
      'Pastikan template yang dipakai sesuai format placeholder yang dibutuhkan sistem.'
    ],
    notes: [
      'Kesalahan pada template dapat berdampak pada hasil dokumen akhir.',
      'Sebaiknya uji template setelah perubahan besar.'
    ]
  },
  {
    title: '6. Retensi dan Arsip Surat',
    body: [
      'Menu Retensi & Arsip Surat digunakan untuk mengatur kebijakan penyimpanan dokumen, melihat kandidat retensi, mengelola arsip, dan memantau riwayat aksi retensi.',
      'Fitur ini penting untuk menjaga penyimpanan sistem tetap terkontrol dan memastikan dokumen lama ditangani sesuai kebijakan.'
    ],
    bullets: [
      'Kebijakan Retensi: atur jumlah hari penyimpanan dokumen pendukung, artefak antara, dan arsip PDF final.',
      'Kandidat Retensi: melihat dokumen yang memenuhi syarat untuk tindakan retensi.',
      'Dry-run: menjalankan simulasi tanpa benar-benar memproses data.',
      'Execute: menjalankan tindakan retensi manual dengan alasan yang wajib diisi.',
      'Archive Pool: melihat dokumen final yang sudah diarsipkan.',
      'Restore: memulihkan arsip jika masih tersedia.',
      'Purge: menghapus arsip secara permanen sesuai aturan yang berlaku.',
      'Audit Actions: melihat riwayat tindakan retensi.'
    ],
    notes: [
      'Aksi execute, restore, dan purge membutuhkan alasan dan tercatat sebagai audit.',
      'Gunakan dry-run sebelum execute untuk mengurangi risiko salah proses.'
    ]
  },
  {
    title: '7. Periode Akademik',
    body: [
      'Menu Periode Akademik mengatur semester dan tahun akademik yang digunakan sistem. Periode aktif memengaruhi pengisian data akademik pada surat tertentu, misalnya Surat Keterangan Aktif.',
      'Sistem dapat memberi peringatan jika tidak ada periode berjalan hari ini atau jika lebih dari satu periode aktif terdeteksi.'
    ],
    bullets: [
      'Tambah Periode: isi tahun akademik, tipe semester, tanggal mulai, tanggal selesai, dan status aktif jika diperlukan.',
      'Edit Periode: ubah data periode jika ada kesalahan tanggal atau semester.',
      'Aktif/Nonaktifkan: menentukan periode yang dipakai sistem sebagai periode berjalan.',
      'Hapus Periode: tersedia dengan modal konfirmasi. Jika periode sedang berjalan, sistem menampilkan peringatan tambahan.',
      'Filter: gunakan pencarian, filter semester, dan filter status untuk menemukan periode tertentu.'
    ],
    notes: [
      'Idealnya hanya ada satu periode aktif yang mencakup tanggal hari ini.',
      'Jika tidak ada periode berjalan, beberapa surat dapat menampilkan data periode kosong.',
      'Aksi tambah, edit, hapus, dan aktif/nonaktif tercatat pada Log Report.'
    ]
  },
  {
    title: '8. Peminjaman Ruangan - Gambaran Umum',
    body: [
      'Menu Peminjaman Ruangan di sisi Super Admin terdiri dari Master Ruangan, Unit Laboratorium, dan Monitoring Pengajuan. Super Admin mengelola data master dan memantau pengajuan, sementara persetujuan pengajuan tetap dilakukan reviewer Tendik sesuai lingkupnya.',
      'Data master ruangan dan unit laboratorium memengaruhi pilihan ruangan mahasiswa serta penanggung jawab laboratorium.'
    ],
    bullets: [
      'Master Ruangan: mengelola data ruangan, foto, fasilitas, template, dan status aktif.',
      'Unit Laboratorium: mengelola daftar unit lab sebagai referensi ruangan dan akun penanggung jawab.',
      'Monitoring Pengajuan: melihat seluruh pengajuan peminjaman tanpa aksi approval/revisi/penolakan.'
    ]
  },
  {
    title: '9. Master Ruangan',
    body: [
      'Master Ruangan digunakan untuk menambah dan mengelola ruangan yang dapat dipinjam. Ruangan tidak dihapus permanen dari sistem; statusnya dikelola melalui Aktif/Nonaktif agar riwayat dan relasi lama tetap aman.',
      'Super Admin dapat mengelola ruang kelas dan laboratorium, termasuk informasi dasar, foto, fasilitas, template surat peminjaman, dan riwayat audit ruangan.'
    ],
    bullets: [
      'Tambah Ruangan: isi kode ruangan, nama ruangan, jenis, kapasitas, lokasi, unit lab pemilik jika jenisnya laboratorium, dan tata tertib.',
      'Edit Informasi: buka detail ruangan lalu pilih edit untuk memperbaiki data dasar ruangan.',
      'Aktif/Nonaktifkan: nonaktifkan ruangan agar tidak muncul sebagai pilihan baru, tanpa menghapus riwayat.',
      'Foto Ruangan: unggah foto, pilih sampul, atur urutan, atau hapus foto jika tidak relevan.',
      'Fasilitas: tambah/ubah daftar fasilitas, jumlah, kondisi, dan catatan.',
      'Template: unggah template PDF/DOCX untuk surat peminjaman ruangan, aktifkan/nonaktifkan versi template.',
      'Riwayat: melihat audit perubahan ruangan seperti update data, foto, fasilitas, dan template.'
    ],
    notes: [
      'Ruangan dengan peminjaman disetujui yang akan datang tidak boleh dinonaktifkan.',
      'CRUD ruangan, foto, fasilitas, dan template tercatat di Log Report dan riwayat ruangan.'
    ]
  },
  {
    title: '10. Unit Laboratorium',
    body: [
      'Unit Laboratorium adalah master data untuk mengelompokkan laboratorium. Data ini dipakai oleh ruangan laboratorium dan akun Tendik seperti Kepala Lab atau Laboran.',
      'Seperti ruangan, Unit Laboratorium tidak dihapus dari UI. Statusnya dikelola menggunakan Aktif/Nonaktif agar data lama tetap aman.'
    ],
    bullets: [
      'Tambah Unit Lab: isi kode unit lab, nama unit lab, dan departemen jika tersedia.',
      'Edit Unit Lab: ubah kode, nama, atau departemen unit lab.',
      'Aktif/Nonaktifkan: unit lab nonaktif tidak dipakai sebagai pilihan baru, tetapi data lama tetap aman.',
      'Kolom Dipakai menampilkan jumlah ruangan dan akun yang terhubung dengan unit lab tersebut.',
      'Status Aktif/Nonaktif membantu admin mengetahui apakah unit lab masih dipakai untuk input baru.'
    ],
    notes: [
      'Unit lab yang sudah terkait ruangan atau akun sebaiknya dinonaktifkan, bukan dihapus permanen.',
      'Aksi tambah, edit, dan aktif/nonaktif unit lab tercatat pada Log Report.'
    ]
  },
  {
    title: '11. Monitoring Pengajuan Peminjaman Ruangan',
    body: [
      'Tab Monitoring Pengajuan menampilkan seluruh permohonan peminjaman ruangan. Super Admin hanya memantau, tidak menyetujui, menolak, atau meminta revisi dari halaman ini.',
      'Detail pengajuan dapat dibuka untuk melihat pemohon, ruangan, jadwal, status, reviewer, tujuan, catatan revisi, alasan penolakan, dokumen surat peminjaman, dan riwayat status.'
    ],
    bullets: [
      'Gunakan filter status, jenis ruangan, ruangan, dan rentang tanggal untuk mempersempit data.',
      'Klik Detail untuk membuka informasi lengkap pengajuan.',
      'Gunakan preview atau unduh surat peminjaman jika dokumen tersedia.',
      'Pantau riwayat status untuk melihat alur proses pengajuan.'
    ],
    notes: [
      'Persetujuan tetap dilakukan reviewer Tendik sesuai cakupan ruangan.',
      'Super Admin bersifat monitoring pada fitur ini.'
    ]
  },
  {
    title: '12. Log Report / Log Aktivitas',
    body: [
      'Log Report menampilkan aktivitas admin yang tercatat di sistem. Fitur ini dipakai untuk audit, penelusuran perubahan, dan melihat siapa melakukan aksi tertentu.',
      'Setiap log umumnya berisi aktor, aksi, target, waktu, dan detail tindakan.'
    ],
    bullets: [
      'Pantau aktivitas CRUD akun, impor, ekspor, periode akademik, unit lab, dan peminjaman ruangan.',
      'Gunakan pagination untuk melihat riwayat lebih lama.',
      'Periksa detail log saat terjadi perubahan data yang perlu ditelusuri.'
    ],
    notes: [
      'Log aktivitas membantu akuntabilitas, tetapi bukan pengganti backup data.',
      'Aksi penting sebaiknya tetap dilakukan dengan alasan yang jelas, terutama impor, ekspor, retensi, dan purge.'
    ]
  },
  {
    title: '13. Profil dan Logout',
    body: [
      'Menu profil digunakan untuk melihat informasi akun Super Admin dan keluar dari sistem. Logout sebaiknya dilakukan setelah selesai menggunakan aplikasi, terutama pada komputer bersama.',
      'Sistem menampilkan modal konfirmasi sebelum logout agar tidak keluar secara tidak sengaja.'
    ],
    bullets: [
      'Buka menu profil dari area akun.',
      'Periksa informasi akun jika diperlukan.',
      'Klik Keluar dan konfirmasi logout.'
    ]
  },
  {
    title: '14. Rekomendasi Operasional',
    body: [
      'Bagian ini berisi praktik yang disarankan agar pengelolaan Super Admin aman dan rapi.'
    ],
    bullets: [
      'Gunakan nonaktif daripada hapus permanen untuk data master yang sudah punya riwayat.',
      'Periksa Log Report setelah perubahan penting.',
      'Jalankan migrasi database setelah deploy fitur yang menambah kolom atau tabel baru.',
      'Jangan mengubah template dokumen tanpa pengujian hasil generate.',
      'Gunakan fitur monitoring untuk mendeteksi proses yang terlambat.',
      'Simpan alasan yang jelas saat melakukan impor, ekspor, retensi, restore, atau purge.',
      'Pastikan periode akademik aktif selalu sesuai kalender akademik berjalan.'
    ]
  }
];

function markdownEscape(text) { return text; }
let md = `# ${title}\n\n${subtitle}\n\nTanggal draft: ${generated}\n\n> Dokumen ini adalah draft panduan. Silakan dirapikan kembali sesuai kebutuhan instansi.\n\n## Daftar Isi\n\n`;
sections.forEach((section) => { md += `- ${section.title}\n`; });
md += '\n';
sections.forEach((section) => {
  md += `## ${section.title}\n\n`;
  section.body?.forEach(p => { md += `${markdownEscape(p)}\n\n`; });
  if (section.bullets?.length) {
    section.bullets.forEach(b => { md += `- ${markdownEscape(b)}\n`; });
    md += '\n';
  }
  if (section.notes?.length) {
    md += `Catatan:\n`;
    section.notes.forEach(n => { md += `- ${markdownEscape(n)}\n`; });
    md += '\n';
  }
});
fs.writeFileSync(path.join(outDir, 'Panduan_Fitur_Super_Admin.md'), md, 'utf8');

const doc = new jsPDF({ unit: 'pt', format: 'a4' });
const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() };
const margin = 54;
const maxWidth = page.w - margin * 2;
let y = margin;
let pageNo = 1;

function addFooter() {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 145);
  doc.text('Panduan Fitur Super Admin - Aplikasi Web Penyuratan', margin, page.h - 28);
  doc.text(String(pageNo), page.w - margin, page.h - 28, { align: 'right' });
}
function addPage() {
  addFooter();
  doc.addPage();
  pageNo += 1;
  y = margin;
}
function ensure(space) { if (y + space > page.h - 60) addPage(); }
function writeParagraph(text, opts = {}) {
  const size = opts.size ?? 11;
  const leading = opts.leading ?? 16;
  const indent = opts.indent ?? 0;
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(opts.color ?? [38, 50, 70]));
  const lines = doc.splitTextToSize(text, maxWidth - indent);
  ensure(lines.length * leading + 6);
  doc.text(lines, margin + indent, y);
  y += lines.length * leading + (opts.after ?? 8);
}
function writeHeading(text, level = 1) {
  const size = level === 1 ? 18 : 14;
  ensure(level === 1 ? 46 : 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size);
  doc.setTextColor(0, 83, 76);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, y);
  y += lines.length * (size + 5) + 10;
}
function writeBullet(text) {
  const size = 10.5;
  const leading = 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(38, 50, 70);
  const lines = doc.splitTextToSize(text, maxWidth - 22);
  ensure(lines.length * leading + 4);
  doc.text('•', margin + 2, y);
  doc.text(lines, margin + 18, y);
  y += lines.length * leading + 4;
}

// Cover
const teal = [0, 128, 117];
doc.setFillColor(...teal);
doc.rect(0, 0, page.w, 190, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(28);
doc.text(title, margin, 86);
doc.setFontSize(16);
doc.setFont('helvetica', 'normal');
doc.text(subtitle, margin, 118);
doc.setFontSize(11);
doc.text(`Draft panduan - ${generated}`, margin, 148);
y = 240;
writeParagraph('Dokumen ini berisi panduan ringkas namun cukup lengkap untuk fitur-fitur Super Admin. Isi dapat dirapikan kembali sesuai gaya dokumentasi instansi, ditambahkan gambar layar, atau disesuaikan dengan perubahan aplikasi terbaru.', { size: 12, leading: 18 });
y += 10;
writeHeading('Daftar Isi', 2);
sections.forEach((section) => writeBullet(section.title));
addPage();

sections.forEach((section) => {
  writeHeading(section.title, 1);
  section.body?.forEach(p => writeParagraph(p));
  if (section.bullets?.length) {
    writeParagraph('Langkah/Fungsi utama:', { bold: true, after: 6 });
    section.bullets.forEach(writeBullet);
    y += 4;
  }
  if (section.notes?.length) {
    writeParagraph('Catatan:', { bold: true, color: [180, 92, 0], after: 6 });
    section.notes.forEach(writeBullet);
  }
  y += 12;
});

addFooter();
doc.save(path.join(outDir, 'Panduan_Fitur_Super_Admin.pdf'));