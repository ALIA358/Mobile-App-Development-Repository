export const generateReportHTML = (totalChildren, boysCount, girlsCount, expenses) => {
  const total = expenses.reduce((sum, item) => {
    const cleanAmount = String(item.amount || '0').replace(/[^0-9.-]+/g, "");
    return sum + parseFloat(cleanAmount || 0);
  }, 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background-color: #fff; }
          .header { text-align: center; border-bottom: 3px solid #eb8cac; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #eb8cac; margin: 0; font-size: 28px; }
          .header p { color: #666; font-size: 15px; margin: 8px 0 0 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #0D47A1; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .grid { display: table; width: 100%; margin-bottom: 20px; }
          .card { display: table-cell; background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; width: 48%; border-radius: 8px; vertical-align: top; }
          .card h3 { margin-top: 0; color: #2e7d32; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
          th { background-color: #f1f3f5; color: #333; text-align: left; padding: 12px; border: 1px solid #dee2e6; }
          td { padding: 12px; border: 1px solid #dee2e6; }
          .total-section { margin-top: 30px; text-align: right; font-size: 20px; font-weight: bold; color: #212529; background: #f8f9fa; padding: 15px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CareNest Orphanage Management System</h1>
          <p>Official Annual Financial & Welfare Analytics Report</p>
        </div>

        <div class="section-title">📊 Executive Summary & Demographics</div>
        <div class="grid">
          <div class="card" style="background-color: #e3f2fd;">
            <h3 style="color: #0d47a1;">Admissions Breakdown</h3>
            <p><strong>Total Residents:</strong> ${totalChildren}</p>
            <p><strong>Boys Dormitory:</strong> ${boysCount}</p>
            <p><strong>Girls Dormitory:</strong> ${girlsCount}</p>
          </div>
          <div class="card" style="background-color: #e8f5e9; padding-left: 15px;">
            <h3>Medical Health Trends</h3>
            <p><strong>Primary Trend:</strong> Asthma & Seasonal Flu</p>
            <p><strong>Audit Status:</strong> Fully Monitored & Vaccinated</p>
          </div>
        </div>

        <div class="section-title">📋 Detailed Expense Logs</div>
        <table>
          <tr>
            <th>Date</th>
            <th>Expense Title</th>
            <th>Category</th>
            <th>Amount (PKR)</th>
          </tr>
          ${expenses.map(item => `
            <tr>
              <td>${item.date || 'N/A'}</td>
              <td>${item.title || 'Expense'}</td>
              <td>${item.category || 'General'}</td>
              <td>Rs. ${item.amount || '0'}</td>
            </tr>
          `).join('')}
        </table>

        <div class="total-section">
          Total Expenses: Rs. ${total.toLocaleString()} PKR
        </div>
      </body>
    </html>
  `;
};