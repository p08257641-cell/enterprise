import React from 'react';

export const LegalView = ({ type }: { type: 'privacy' | 'terms' }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <img src="/logo.jpg" alt="Oheneba Media Logo" className="h-16 rounded-xl object-contain mb-6 shadow-sm border border-slate-100" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Last Updated: August 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-indigo-600">
          {type === 'privacy' ? (
            <>
              <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 mb-8 text-sm font-medium">
                This Privacy Policy explains how <strong>Oheneba Media</strong> collects, uses, and discloses information about you when you access or use our websites, mobile applications, and other online products and services.
              </div>

              <p className="mb-6 text-slate-600 leading-relaxed">
                <strong>Oheneba Media</strong> ("we", "us", or "our") operates this website and the associated Enterprise platform. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
              </p>
              <p className="mb-10 text-slate-600 leading-relaxed">
                This Privacy Policy applies to all information collected through our services, as well as any related services, sales, marketing, or events.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Information We Collect</h3>
              <div className="mb-8 pl-4 border-l-2 border-indigo-100">
                <h4 className="font-semibold text-slate-800 mb-2">Personal Information You Disclose to Us</h4>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the Services.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
                  <li><strong>Personal Data:</strong> Names, phone numbers, email addresses, mailing addresses, job titles, usernames, and passwords.</li>
                  <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument.</li>
                </ul>

                <h4 className="font-semibold text-slate-800 mb-2">Information Automatically Collected</h4>
                <p className="text-slate-600 leading-relaxed">
                  We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. 
                </p>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. How We Use Your Information</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                <li>Facilitate account creation and logon process.</li>
                <li>Deliver and facilitate delivery of services to the user.</li>
                <li>Respond to user inquiries and offer support to users.</li>
                <li>Send administrative information to you.</li>
                <li>Fulfill and manage your orders and subscriptions.</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Will Your Information Be Shared With Anyone?</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">4. How Long Do We Keep Your Information?</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">5. How Do We Keep Your Information Safe?</h3>
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-4 mb-4 text-sm">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">6. What Are Your Privacy Rights?</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                In some regions, you have certain rights under applicable data protection laws. These may include the right to request access and obtain a copy of your personal information, to request rectification or erasure, and to restrict the processing of your personal information.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">7. Contact Us</h3>
              <p className="text-slate-600 leading-relaxed">
                If you have questions or comments about this notice, you may contact the owner directly:<br/><br/>
                <strong>Oheneba Media</strong><br/>
                Owner: <strong>Oheneba Micheal Baah</strong>
              </p>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 mb-8 text-sm font-medium">
                Welcome! These terms and conditions outline the rules and regulations for the use of <strong>Oheneba Media's</strong> services.
              </div>

              <p className="mb-10 text-slate-600 leading-relaxed">
                By accessing our services, we assume you accept these terms and conditions. Do not continue to use our platform if you do not agree to take all of the terms and conditions stated on this page.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. License and Usage</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Unless otherwise stated, <strong>Oheneba Media</strong> and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You may access this from Oheneba Media for your own personal and commercial use subjected to restrictions set in these terms and conditions.
              </p>
              <p className="text-slate-600 mb-2 font-medium">You must not:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                <li>Republish material from our platform without consent.</li>
                <li>Sell, rent, or sub-license material from our platform.</li>
                <li>Reproduce, duplicate or copy material from our platform.</li>
                <li>Redistribute content from our platform.</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. User Accounts</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-lg p-4 mb-8 text-sm">
                You are entirely responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Acceptable Use</h3>
              <p className="text-slate-600 mb-2 font-medium">You agree not to use the Service:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 mb-8">
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter" or "spam" or any other similar solicitation.</li>
                <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">4. Limitation of Liability</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                In no event shall <strong>Oheneba Media</strong>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">5. Termination</h3>
              <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-lg p-4 mb-4 text-sm">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Upon termination, your right to use the Service will immediately cease.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">6. Governing Law</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">7. Changes to Terms</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. 
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">8. Contact Information</h3>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about these Terms, please contact us.<br/><br/>
                <strong>Oheneba Media</strong><br/>
                Owner: <strong>Oheneba Micheal Baah</strong>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
