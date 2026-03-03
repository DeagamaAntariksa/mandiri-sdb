import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Buat transporter Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verifikasi koneksi SMTP saat server start
transporter.verify((error) => {
    if (error) {
        console.error('[Mailer] ❌ Koneksi SMTP gagal:', error.message);
    } else {
        console.log('[Mailer] ✅ SMTP Gmail siap digunakan, email dari:', process.env.EMAIL_USER);
    }
});

/**
 * Kirim email konfirmasi + kode pelacakan ke user
 * @param {string} toEmail - Email tujuan
 * @param {string} trackingCode - Kode pelacakan
 * @param {object} applicantData - Data lengkap pemohon
 */
export async function sendTrackingCodeEmail(toEmail, trackingCode, applicantData) {
    const { fullName, nik, phone, address, accountNumber, boxSize } = applicantData;
    const mailOptions = {
        from: `"SDB Mandiri Pondok Indah" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Pengajuan Diterima - Kode Pelacakan: ${trackingCode}`,
        html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 40px; text-align:center;">
                                    <h1 style="color:#ffffff; margin:0; font-size:26px; font-weight:700;">🏦 Safe Deposit Box</h1>
                                    <p style="color:rgba(255,255,255,0.8); margin:8px 0 0 0; font-size:14px;">Layanan Penyewaan Kotak Penyimpanan</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="color:#1e293b; font-size:20px; margin:0 0 12px 0;">Halo, ${fullName}! 👋</h2>
                                    <p style="color:#475569; font-size:15px; line-height:1.7; margin:0 0 28px 0;">
                                        Terima kasih telah mengajukan permohonan penyewaan Safe Deposit Box.<br>
                                        Pengajuan Anda telah kami terima dan saat ini <strong>sedang dalam proses peninjauan</strong> oleh tim kami.
                                    </p>

                                    <!-- Tracking Code -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="background:#eff6ff; border: 2px solid #93c5fd; border-radius:10px; padding:24px; text-align:center;">
                                                <p style="color:#1e40af; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin:0 0 10px 0;">Kode Pelacakan Anda</p>
                                                <p style="color:#1e3a5f; font-size:34px; font-weight:900; letter-spacing:6px; margin:0; font-family: 'Courier New', monospace;">${trackingCode}</p>
                                                <p style="color:#3b82f6; font-size:13px; margin:10px 0 0 0;">Gunakan kode ini untuk mengecek status pengajuan Anda</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Data Lengkap Pemohon -->
                                    <p style="color:#1e293b; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:28px 0 12px 0;">📋 Data Pengajuan</p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                                        <tr style="background:#f8fafc;">
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; width:40%; color:#64748b; font-size:13px; font-weight:600;">Nama Lengkap</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px; font-weight:600;">${fullName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px; font-weight:600;">NIK</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px;">${nik}</td>
                                        </tr>
                                        <tr style="background:#f8fafc;">
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px; font-weight:600;">No. Telepon</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px;">${phone}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px; font-weight:600;">Email</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px;">${toEmail}</td>
                                        </tr>
                                        <tr style="background:#f8fafc;">
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px; font-weight:600;">Alamat</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px;">${address}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px; font-weight:600;">No. Rekening</td>
                                            <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#1e293b; font-size:14px;">${accountNumber}</td>
                                        </tr>
                                        <tr style="background:#f8fafc;">
                                            <td style="padding:12px 16px; color:#64748b; font-size:13px; font-weight:600;">Ukuran Box</td>
                                            <td style="padding:12px 16px; color:#1e293b; font-size:14px; font-weight:700;">Tipe ${boxSize}</td>
                                        </tr>
                                    </table>

                                    <!-- Steps -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                                        <tr><td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                                            <table><tr>
                                                <td style="width:32px;height:32px;background:#dbeafe;border-radius:50%;text-align:center;vertical-align:middle;">
                                                    <span style="color:#2563eb;font-weight:700;">1</span>
                                                </td>
                                                <td style="padding-left:12px;">
                                                    <p style="margin:0;color:#1e293b;font-size:14px;font-weight:600;">Pengajuan Diterima ✅</p>
                                                    <p style="margin:2px 0 0;color:#64748b;font-size:13px;">Data Anda sedang kami review</p>
                                                </td>
                                            </tr></table>
                                        </td></tr>
                                        <tr><td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                                            <table><tr>
                                                <td style="width:32px;height:32px;background:#f1f5f9;border-radius:50%;text-align:center;vertical-align:middle;">
                                                    <span style="color:#94a3b8;font-weight:700;">2</span>
                                                </td>
                                                <td style="padding-left:12px;">
                                                    <p style="margin:0;color:#94a3b8;font-size:14px;font-weight:600;">Verifikasi Dokumen</p>
                                                    <p style="margin:2px 0 0;color:#94a3b8;font-size:13px;">Tim kami verifikasi KTP & Buku Tabungan</p>
                                                </td>
                                            </tr></table>
                                        </td></tr>
                                        <tr><td style="padding:12px 0;">
                                            <table><tr>
                                                <td style="width:32px;height:32px;background:#f1f5f9;border-radius:50%;text-align:center;vertical-align:middle;">
                                                    <span style="color:#94a3b8;font-weight:700;">3</span>
                                                </td>
                                                <td style="padding-left:12px;">
                                                    <p style="margin:0;color:#94a3b8;font-size:14px;font-weight:600;">Keputusan</p>
                                                    <p style="margin:2px 0 0;color:#94a3b8;font-size:13px;">Anda akan dihubungi terkait hasil pengajuan</p>
                                                </td>
                                            </tr></table>
                                        </td></tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background:#f8fafc; padding:20px 40px; border-top:1px solid #e2e8f0; text-align:center;">
                                    <p style="color:#94a3b8; font-size:12px; margin:0;">© ${new Date().getFullYear()} Safe Deposit Box. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✅ Email berhasil dikirim ke ${toEmail} | MessageID: ${info.messageId}`);
    return info;
}

/**
 * Kirim email payment reminder ke nasabah yang terlambat bayar
 * @param {string} toEmail - Email tujuan
 * @param {string} fullName - Nama nasabah
 * @param {string} trackingCode - Kode kontrak
 * @param {string} boxSize - Ukuran box
 * @param {string} endDate - Tanggal jatuh tempo
 */
export async function sendPaymentReminderEmail(toEmail, fullName, trackingCode, boxSize, endDate) {
    const mailOptions = {
        from: `"Safe Deposit Box Bank Mandiri KC Pondok Indah" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `⚠️ Pengingat Pembayaran Safe Deposit Box – ${trackingCode}`,
        html: `
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
                <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%);padding:36px 40px;text-align:center;">
                                <p style="font-size:36px;margin:0;">⚠️</p>
                                <h1 style="color:#ffffff;margin:8px 0 0;font-size:24px;font-weight:700;">Pengingat Pembayaran</h1>
                                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Safe Deposit Box Bank Mandiri KC Pondok Indah</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:36px 40px;">
                                <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">
                                    Yth. <strong>${fullName}</strong>,
                                </p>
                                <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
                                    Kami ingin menginformasikan bahwa pembayaran sewa Safe Deposit Box Anda <strong>telah melewati tanggal jatuh tempo</strong>. Mohon segera melakukan pembayaran untuk menghindari sanksi atau pemutusan layanan.
                                </p>

                                <!-- Detail Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #fecaca;border-radius:10px;overflow:hidden;margin-bottom:28px;">
                                    <tr style="background:#fef2f2;">
                                        <td style="padding:20px 24px;">
                                            <p style="color:#991b1b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Detail Kontrak</p>
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;width:45%;">Kode Kontrak</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;font-family:monospace;padding:6px 0;">${trackingCode}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Ukuran Box</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;padding:6px 0;">Tipe ${boxSize}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Status Pembayaran</td>
                                                    <td style="color:#dc2626;font-size:13px;font-weight:700;padding:6px 0;">TERLAMBAT ⚠️</td>
                                                </tr>
                                                ${endDate ? `
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Jatuh Tempo</td>
                                                    <td style="color:#dc2626;font-size:13px;font-weight:700;padding:6px 0;">${endDate}</td>
                                                </tr>` : ''}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 8px;">
                                    Untuk melakukan pembayaran atau informasi lebih lanjut, silakan hubungi kami atau kunjungi cabang Bank Mandiri KC Pondok Indah terdekat.
                                </p>
                                <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
                                    Jika Anda merasa sudah melakukan pembayaran, abaikan email ini dan hubungi customer service kami.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Safe Deposit Box – Bank Mandiri KC Pondok Indah</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✅ Reminder email dikirim ke ${toEmail}`);
    return info;
}

/**
 * Kirim email notifikasi approval/persetujuan ke nasabah
 */
export async function sendApprovalEmail(toEmail, fullName, trackingCode, boxSize, startDate, endDate) {
    const mailOptions = {
        from: `"Safe Deposit Box Bank Mandiri KC Pondok Indah" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `✅ Pengajuan SDB Anda Telah Disetujui – ${trackingCode}`,
        html: `
        <!DOCTYPE html>
        <html lang="id">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
                <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#065f46 0%,#059669 100%);padding:36px 40px;text-align:center;">
                                <p style="font-size:48px;margin:0;">🎉</p>
                                <h1 style="color:#ffffff;margin:8px 0 0;font-size:26px;font-weight:700;">Selamat! Pengajuan Disetujui</h1>
                                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Safe Deposit Box Bank Mandiri KC Pondok Indah</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:36px 40px;">
                                <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">
                                    Yth. <strong>${fullName}</strong>,
                                </p>
                                <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
                                    Kami dengan senang hati memberitahukan bahwa pengajuan Safe Deposit Box Anda telah <strong style="color:#059669;">disetujui</strong> oleh Bank Mandiri KC Pondok Indah. Kontrak Anda kini aktif.
                                </p>

                                <!-- Detail Kontrak -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #a7f3d0;border-radius:10px;overflow:hidden;margin-bottom:28px;">
                                    <tr style="background:#ecfdf5;">
                                        <td style="padding:20px 24px;">
                                            <p style="color:#065f46;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Detail Kontrak Anda</p>
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;width:45%;">Kode Kontrak</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;font-family:monospace;padding:6px 0;">${trackingCode}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Ukuran Box</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;padding:6px 0;">Tipe ${boxSize}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Status</td>
                                                    <td style="color:#059669;font-size:13px;font-weight:700;padding:6px 0;">✅ AKTIF</td>
                                                </tr>
                                                ${startDate ? `<tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Tanggal Mulai</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;padding:6px 0;">${startDate}</td>
                                                </tr>` : ''}
                                                ${endDate ? `<tr>
                                                    <td style="color:#6b7280;font-size:13px;padding:6px 0;">Tanggal Pembayaran Selanjutnya</td>
                                                    <td style="color:#111827;font-size:13px;font-weight:700;padding:6px 0;">${endDate}</td>
                                                </tr>` : ''}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Langkah selanjutnya -->
                                <p style="color:#374151;font-size:14px;font-weight:700;margin:0 0 10px;">Langkah Selanjutnya:</p>
                                <ol style="color:#374151;font-size:14px;line-height:1.9;margin:0 0 24px;padding-left:20px;">
                                                <li>Kunjungi cabang Bank Mandiri KC Pondok Indah atau hubungi <strong>14000</strong></li>
                                                <li>Bawa dokumen identitas (KTP) dan kode kontrak di atas</li>
                                                <li>Selesaikan proses aktivasi fisik Safe Deposit Box Anda</li>
                                </ol>

                                <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
                                    Jika ada pertanyaan, hubungi customer service kami di <strong>14000</strong> atau kunjungi cabang terdekat. Terima kasih telah mempercayakan keamanan aset Anda kepada Bank Mandiri.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Safe Deposit Box – Bank Mandiri KC Pondok Indah</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✅ Approval email dikirim ke ${toEmail}`);
    return info;
}
