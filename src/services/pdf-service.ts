import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { AnnualReturnDraft } from '@/types/domain';

let isProcessing = false;

const getBaseHTML = (title: string, bodyContent: string, data: AnnualReturnDraft) => `
<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
    body { font-family: 'Noto Nastaliq Urdu', Arial, sans-serif; margin: 0; padding: 40px; color: #13251f; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #06452f; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #06452f; margin: 0 0 10px 0; }
    .header h2 { font-size: 20px; color: #65746d; margin: 0; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 22px; color: #06452f; background-color: #eef5f0; padding: 8px 12px; border-right: 4px solid #06452f; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; }
    th, td { border: 1px solid #d9e6dd; padding: 12px; text-align: right; }
    th { background-color: #e5f4eb; color: #06452f; font-weight: bold; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .highlight { font-weight: bold; color: #06452f; }
    .summary-box { border: 2px solid #06452f; padding: 15px; background-color: #f8fffb; margin-top: 20px; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #d9e6dd; }
    .signature-block { text-align: center; width: 40%; }
    .signature-line { border-bottom: 1px solid #13251f; margin-bottom: 5px; height: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>پاکستان یونائیٹڈ ورکرز فیڈریشن</h1>
    <h2>${title}</h2>
    <p>Fiscal Year: ${data.fiscal_year} | Status: ${data.status.toUpperCase()}</p>
  </div>
  ${bodyContent}
</body>
</html>
`;

async function executePDFGeneration(htmlContent: string, filename: string) {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: filename, UTI: 'com.adobe.pdf' });
    }
  } catch (error: any) {
    if (error?.message?.includes('Another share request is being processed now')) {
      console.warn('Share request already active, ignoring extra tap.');
      return;
    }
    console.error("Failed to generate or share PDF", error);
    throw error;
  } finally {
    setTimeout(() => { isProcessing = false; }, 500);
  }
}

export async function exportFormLPDF(data: AnnualReturnDraft) {
  const content = `
    <div class="section">
      <div class="section-title">فارم ایل - ممبرشپ کی تفصیلات (Form L - Demographics)</div>
      <table>
        <tr><th>تفصیل (Description)</th><th>تعداد (Count)</th></tr>
        <tr><td>Total Members at Start of Year</td><td>${data.member_count_start.toLocaleString()}</td></tr>
        <tr><td>Members Admitted During Year</td><td>${(data.member_count_end - data.member_count_start > 0 ? data.member_count_end - data.member_count_start : 0).toLocaleString()}</td></tr>
        <tr><td>Members Departed During Year</td><td>${(data.member_count_start - data.member_count_end > 0 ? data.member_count_start - data.member_count_end : 0).toLocaleString()}</td></tr>
        <tr><td class="highlight">Total Members at End of Year</td><td class="highlight">${data.member_count_end.toLocaleString()}</td></tr>
        <tr><td>Gender Breakdown</td><td>Male: ${data.male_count.toLocaleString()} | Female: ${data.female_count.toLocaleString()}</td></tr>
      </table>
    </div>
    <div class="footer" style="page-break-inside: avoid;">
      <div class="signature-block"><div class="signature-line"></div><div>جنرل سیکرٹری (General Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.gs_approved_at || '_________________'}</div></div>
      <div class="signature-block"><div class="signature-line"></div><div>فنانس سیکرٹری (Finance Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.fs_approved_at || '_________________'}</div></div>
    </div>
  `;
  return executePDFGeneration(getBaseHTML("Form L (Demographics)", content, data), "Form_L.pdf");
}

export async function exportFormJPDF(data: AnnualReturnDraft) {
  const content = `
    <div class="section">
      <div class="section-title">فارم جے - مالیاتی گوشوارہ (Form J - Financial Balance Sheet)</div>
      <h3>آمدنی (Income)</h3>
      <table>
        <tr><th>Item</th><th>Amount (Rs.)</th></tr>
        ${data.income_line_items.map(item => `<tr><td>${item.description}</td><td>${item.amount.toLocaleString()}</td></tr>`).join('')}
        <tr><td class="highlight">Total Income</td><td class="highlight">${data.total_income.toLocaleString()}</td></tr>
      </table>
      <h3>اخراجات (Expenditure)</h3>
      <table>
        <tr><th>Item</th><th>Amount (Rs.)</th></tr>
        ${data.expense_line_items.map(item => `<tr><td>${item.description}</td><td>${item.amount.toLocaleString()}</td></tr>`).join('')}
        <tr><td class="highlight" style="color: #b42318;">Total Expenditure</td><td class="highlight" style="color: #b42318;">${data.total_expenditure.toLocaleString()}</td></tr>
      </table>
      <div class="summary-box">
        <table style="margin: 0; border: none;">
          <tr style="border: none;">
            <td style="border: none; font-size: 18px;" class="highlight">Closing Balance (خالص منافع/نقصان)</td>
            <td style="border: none; font-size: 18px;" class="highlight text-left">Rs. ${data.closing_balance.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="footer" style="page-break-inside: avoid;">
      <div class="signature-block"><div class="signature-line"></div><div>جنرل سیکرٹری (General Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.gs_approved_at || '_________________'}</div></div>
      <div class="signature-block"><div class="signature-line"></div><div>فنانس سیکرٹری (Finance Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.fs_approved_at || '_________________'}</div></div>
    </div>
  `;
  return executePDFGeneration(getBaseHTML("Form J (Financial Balance Sheet)", content, data), "Form_J.pdf");
}

export async function exportAffidavitPDF(data: AnnualReturnDraft) {
  const content = `
    <div class="section" style="page-break-inside: avoid;">
      <div class="section-title">حلفیہ بیان (Affidavit - Khalfiya Biyan)</div>
      <p style="font-size: 16px; margin-top: 30px; line-height: 2;">
        ہم حلفاً اقرار کرتے ہیں کہ یہ فارم یونین کے رجسٹروں اور کھاتوں کے مطابق بالکل درست ہے۔ 
        کوئی اثاثہ، واجب الادا رقم، یا ممبر چھپایا نہیں گیا۔ ہم سمجھتے ہیں کہ غلط بیانی کی صورت میں قانونی کارروائی ہو سکتی ہے۔
      </p>
      <p style="font-size: 14px; color: #65746d; margin-top: 20px;">
        I declare that this form corresponds truly to the registers and ledgers of the Union. I declare that no assets, liabilities, or members have been concealed.
      </p>
    </div>
    <div class="footer" style="page-break-inside: avoid; margin-top: 80px;">
      <div class="signature-block"><div class="signature-line"></div><div>جنرل سیکرٹری (General Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.gs_approved_at || '_________________'}</div></div>
      <div class="signature-block"><div class="signature-line"></div><div>فنانس سیکرٹری (Finance Secretary)</div><div style="font-size: 12px; color: #65746d; margin-top: 5px;">Date: ${data.fs_approved_at || '_________________'}</div></div>
    </div>
  `;
  return executePDFGeneration(getBaseHTML("Khalfiya Biyan (Affidavit)", content, data), "Khalfiya_Biyan_Affidavit.pdf");
}
