import puppeteer from 'puppeteer';
import fs from 'fs';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Enterprise Cloud ERP - System Features</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-1: #3b82f6;
            --accent-2: #8b5cf6;
            --gradient: linear-gradient(135deg, var(--accent-1), var(--accent-2));
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            -webkit-font-smoothing: antialiased;
        }

        /* Print Specifics */
        @page {
            size: A4;
            margin: 0;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            position: relative;
            background: #0f172a;
            overflow: hidden;
            page-break-after: always;
        }

        /* Decorative background elements */
        .bg-glow-1 {
            position: absolute;
            top: -100px;
            left: -100px;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%);
            border-radius: 50%;
            z-index: 0;
        }

        .bg-glow-2 {
            position: absolute;
            bottom: -200px;
            right: -100px;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(15,23,42,0) 70%);
            border-radius: 50%;
            z-index: 0;
        }

        .content {
            position: relative;
            z-index: 10;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 38px;
            font-weight: 800;
            margin: 0 0 10px 0;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1px;
        }

        .subtitle {
            font-size: 16px;
            color: var(--text-muted);
            font-weight: 400;
            max-width: 80%;
            margin: 0 auto;
            line-height: 1.5;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }

        .module-card {
            background: var(--card-bg);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }

        .module-title {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .module-title::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 24px;
            background: var(--gradient);
            border-radius: 4px;
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        li {
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 10px;
            color: #cbd5e1;
            display: flex;
            align-items: flex-start;
        }

        li::before {
            content: '✦';
            color: var(--accent-1);
            font-size: 14px;
            margin-right: 8px;
            line-height: 1.6;
        }

        .highlight {
            color: #fff;
            font-weight: 500;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>

<div class="page">
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    
    <div class="content">
        <div class="header">
            <h1>Enterprise Cloud ERP</h1>
            <div class="subtitle">A comprehensive, multi-tenant application designed to handle all aspects of enterprise operations. Next-generation features built for scale.</div>
        </div>

        <div class="grid">
            <!-- Module 1 -->
            <div class="module-card">
                <h2 class="module-title">Multi-Tenancy & Admin</h2>
                <ul>
                    <li><span class="highlight">Company Management:</span> Support for multiple tenants in a single database.</li>
                    <li><span class="highlight">Subscription Plans:</span> Dynamic allocation based on subscription tiers (Core, Plus, Enterprise).</li>
                    <li><span class="highlight">Role-Based Access:</span> Customizable roles with fine-grained permissions.</li>
                    <li><span class="highlight">Audit Logging:</span> System-wide tracking (who, what, when) for security.</li>
                    <li><span class="highlight">Approval Workflows:</span> Multi-step rules for sensitive operations.</li>
                </ul>
            </div>

            <!-- Module 2 -->
            <div class="module-card">
                <h2 class="module-title">HR & Payroll</h2>
                <ul>
                    <li><span class="highlight">Employee Profiles:</span> Directory, custom fields, and self-service updates.</li>
                    <li><span class="highlight">Attendance:</span> Real-time clock-in/out with GPS/IP verification.</li>
                    <li><span class="highlight">Leave & OKRs:</span> Track time off, objectives, and key results.</li>
                    <li><span class="highlight">Payroll Processing:</span> Dynamic salary bands, tax config, and automated payslips.</li>
                </ul>
            </div>

            <!-- Module 3 -->
            <div class="module-card">
                <h2 class="module-title">Financial Accounting</h2>
                <ul>
                    <li><span class="highlight">General Ledger:</span> Complete chart of accounts and double-entry journals.</li>
                    <li><span class="highlight">AP & AR:</span> Manage vendor bills, customer invoices, and payments.</li>
                    <li><span class="highlight">Banking:</span> Account management and automated reconciliation.</li>
                    <li><span class="highlight">Fixed Assets:</span> Automated depreciation schedules.</li>
                    <li><span class="highlight">Multi-Currency & Tax:</span> Dynamic rates and electronic tax returns.</li>
                </ul>
            </div>

            <!-- Module 4 -->
            <div class="module-card">
                <h2 class="module-title">Sales & CRM</h2>
                <ul>
                    <li><span class="highlight">Lead Pipeline:</span> Track prospects to close with stage management.</li>
                    <li><span class="highlight">Orders & Quotes:</span> Generate quotes and convert to sales orders.</li>
                    <li><span class="highlight">Activity Logs:</span> Track tasks, calls, and emails tied to clients.</li>
                    <li><span class="highlight">Sales Targets:</span> Monitor KPI targets for the sales team.</li>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="page">
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    
    <div class="content">
        <div class="grid">
            <!-- Module 5 -->
            <div class="module-card">
                <h2 class="module-title">Point of Sale (POS)</h2>
                <ul>
                    <li><span class="highlight">Retail Interface:</span> Complete fast POS interface for cashiers.</li>
                    <li><span class="highlight">Shift Management:</span> Track cash drawers and discrepancies.</li>
                    <li><span class="highlight">Sales & Returns:</span> Apply discounts, print receipts, and manage returns.</li>
                    <li><span class="highlight">Daily Reporting:</span> Automated end-of-day Z-reports.</li>
                </ul>
            </div>

            <!-- Module 6 -->
            <div class="module-card">
                <h2 class="module-title">Inventory & Manufacturing</h2>
                <ul>
                    <li><span class="highlight">Inventory Tracking:</span> Real-time stock, multi-warehouse support.</li>
                    <li><span class="highlight">Bill of Materials (BOM):</span> Material requirements and cost analyses.</li>
                    <li><span class="highlight">Work Orders:</span> Schedule and track manufacturing runs.</li>
                    <li><span class="highlight">Quality & Maintenance:</span> Enforce quality checks and preventative maintenance.</li>
                </ul>
            </div>

            <!-- Module 7 -->
            <div class="module-card">
                <h2 class="module-title">Collaboration & Comms</h2>
                <ul>
                    <li><span class="highlight">Team Chat:</span> Restricted department rooms & custom groups.</li>
                    <li><span class="highlight">Direct Messaging:</span> Private 1-on-1 messaging.</li>
                    <li><span class="highlight">Announcements & Polls:</span> Broadcast news and run company-wide voting.</li>
                    <li><span class="highlight">Knowledge Base & LMS:</span> Internal Wiki and staff training courses.</li>
                </ul>
            </div>

            <!-- Module 8 -->
            <div class="module-card">
                <h2 class="module-title">Enterprise Operations</h2>
                <ul>
                    <li><span class="highlight">Procurement:</span> Manage Vendors, Purchase Orders, and RFQs.</li>
                    <li><span class="highlight">Helpdesk:</span> Internal ticketing system with collaborative threads.</li>
                    <li><span class="highlight">Intercompany Txns:</span> Automated tracking between sister entities.</li>
                    <li><span class="highlight">Compliance:</span> Manage regulatory checks and filing deadlines.</li>
                    <li><span class="highlight">Document Vault:</span> Secure centralized storage with visibility scopes.</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            Generated securely by Enterprise Cloud ERP Systems &bull; Confidential
        </div>
    </div>
</div>

</body>
</html>
`;

async function generatePDF() {
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] 
    });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: 'Premium_System_Features.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    
    await browser.close();
    console.log('PDF Generated Successfully!');
}

generatePDF().catch(console.error);
