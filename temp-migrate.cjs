const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  const migrationFiles = [
    'migration_attendance_settings.sql',
    'migration_budget_items.sql',
    'migration_auth.sql',
    'migration_chat.sql',
    'migration_chat_groups.sql',
    'migration_voting.sql',
    'migration_add_voting_to_acme.sql',
    'migration_gallery.sql',
    'migration_add_gallery_to_acme.sql',
    'migration_doc_visibility.sql',
    'migration_role_approval.sql',
    'migration_evat.sql',
    'migration_approval_workflow.sql',
    'migration_whisper_reports.sql',
    'migration_roles.sql',
    'audit-columns.sql',
    'create_announcements.sql',
    'create_email_templates.sql',
    'create_kb_articles.sql',
    'create_lms_courses.sql',
    'create_payroll_tax_config.sql',
    'create_sales_customers.sql',
    'create_sales_orders.sql',
    'create_sales_quotations.sql',
    'create_sales_targets.sql',
    'create_workflow_triggers.sql',
    'add_ticket_columns.sql'
  ];

  for (const file of migrationFiles) {
    let p = path.join(__dirname, 'db', file);
    if (!fs.existsSync(p)) p = path.join(__dirname, file);
    if (!fs.existsSync(p)) continue;
    console.log(`Running ${file}...`);
    const sql = fs.readFileSync(p, 'utf8');
    try {
      await client.query(sql);
      console.log(`Successfully ran ${file}`);
    } catch(err) {
      console.error(`Error in ${file}:`, err);
    }
  }
  await client.end();
}

migrate();
