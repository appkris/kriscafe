import type { Transaction, TransactionItem } from '../types/database';

export const receiptService = {
  /**
   * Format angka Rupiah standar
   */
  formatRupiah(val: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  },

  /**
   * Membuat teks struk rapi untuk dikirim via WhatsApp
   */
  generateWhatsAppMessage(
    transaction: Transaction,
    items: TransactionItem[],
    storeName: string = 'KrisCafe',
    storeAddress: string = 'Kantin Sentral'
  ): string {
    const dateFormatted = new Date(transaction.created_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const lines: string[] = [
      `🧾 *STRUK PEMBELIAN ${storeName.toUpperCase()}*`,
      `📍 _${storeAddress}_`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*No. Invoice:* \`${transaction.invoice_number}\``,
      `*Waktu:* ${dateFormatted}`,
      `*Tipe:* ${transaction.order_type === 'DINE_IN' ? `Makan di Tempat (Meja ${transaction.table_number || '-'})` : 'Bungkus / Takeaway'}`,
      `*Kasir:* ${transaction.cashier_name}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*DETAIL PESANAN:*`
    ];

    items.forEach((item) => {
      lines.push(`${item.quantity}x ${item.menu_name} - ${this.formatRupiah(item.item_subtotal)}`);
      if (item.notes) {
        lines.push(`   ↳ _Catatan: ${item.notes}_`);
      }
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`*Total Tagihan:* *${this.formatRupiah(transaction.total)}*`);
    lines.push(`*Metode Bayar:* ${transaction.payment_method}`);
    lines.push(`*Jumlah Diterima:* ${this.formatRupiah(transaction.amount_paid)}`);
    lines.push(`*Kembalian:* *${this.formatRupiah(transaction.change_due)}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`_Terima kasih atas kunjungan Anda! Selamat menikmati hidangan._`);

    return lines.join('\n');
  },

  /**
   * Menghasilkan URL wa.me untuk membuka obrolan WhatsApp dengan nomor pelanggan
   */
  generateWhatsAppUrl(
    phoneNumber: string,
    transaction: Transaction,
    items: TransactionItem[],
    storeName?: string,
    storeAddress?: string
  ): string {
    // Normalisasi nomor HP: ubah 08xxx menjadi 628xxx
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = this.generateWhatsAppMessage(transaction, items, storeName, storeAddress);
    const encodedMessage = encodeURIComponent(message);

    if (cleanPhone.length > 5) {
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  },

  /**
   * Memanggil dialog cetak sistem untuk printer thermal
   */
  triggerPrint(): void {
    window.print();
  }
};
