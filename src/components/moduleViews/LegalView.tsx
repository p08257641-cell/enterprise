import React from 'react';

export const LegalView = ({ type, onBack }: { type: 'privacy' | 'terms'; onBack?: () => void }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        
        {onBack && (
          <button 
            onClick={onBack} 
            className="group absolute -top-12 left-0 sm:left-4 text-slate-300 hover:text-white cursor-pointer flex items-center gap-2 text-sm font-semibold transition-all duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg"
          >
            <i className="bi bi-arrow-left group-hover:-translate-x-1 transition-transform duration-300"></i> Back
          </button>
        )}

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative p-8 md:p-12 pb-6 text-center border-b border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-white shadow-xl shadow-black/20 p-2 mb-6 border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <img src="/logo.jpg" alt="Oheneba Media Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight mb-3 drop-shadow-sm">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] bg-white/5 py-1.5 px-4 rounded-full border border-white/5">
                Last Updated: August 2026
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-4 md:pr-10">
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white text-slate-300 leading-relaxed text-sm md:text-base">
              
              {type === 'privacy' ? (
                <>
                  <div className="bg-blue-900/30 border border-blue-500/30 text-blue-200 rounded-xl p-5 mb-10 shadow-inner backdrop-blur-sm">
                    This Privacy Policy explains how <strong className="text-white">Oheneba Media</strong> collects, uses, and discloses information about you when you access or use our websites, mobile applications, and other online products and services.
                  </div>

                  <p className="mb-6">
                    <strong className="text-white">Oheneba Media</strong> ("we", "us", or "our") operates this website and the associated Enterprise platform. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
                  </p>
                  <p className="mb-10">
                    This Privacy Policy applies to all information collected through our services, as well as any related services, sales, marketing, or events.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">1</span> 
                    Information We Collect
                  </h3>
                  <div className="mb-10 pl-6 border-l-2 border-purple-500/30">
                    <h4 className="font-bold text-white mb-3 text-lg">Personal Information You Disclose to Us</h4>
                    <p className="mb-5">
                      We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the Services.
                    </p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex gap-3"><i className="bi bi-check-circle-fill text-blue-400 mt-1"></i> <span><strong>Personal Data:</strong> Names, phone numbers, email addresses, mailing addresses, job titles, usernames, and passwords.</span></li>
                      <li className="flex gap-3"><i className="bi bi-check-circle-fill text-blue-400 mt-1"></i> <span><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument.</span></li>
                    </ul>

                    <h4 className="font-bold text-white mb-3 text-lg">Information Automatically Collected</h4>
                    <p>
                      We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. 
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">2</span> 
                    How We Use Your Information
                  </h3>
                  <p className="mb-5">
                    We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {[
                      'Facilitate account creation and logon process.',
                      'Deliver and facilitate delivery of services to the user.',
                      'Respond to user inquiries and offer support to users.',
                      'Send administrative information to you.',
                      'Fulfill and manage your orders and subscriptions.'
                    ].map((item, idx) => (
                      <li key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-3 hover:bg-white/10 transition-colors">
                        <i className="bi bi-shield-check text-purple-400"></i> <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">3</span> 
                    Information Sharing
                  </h3>
                  <p className="mb-10">
                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">4</span> 
                    Data Retention
                  </h3>
                  <p className="mb-10">
                    We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">5</span> 
                    Security
                  </h3>
                  <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-200 rounded-xl p-5 mb-5 shadow-inner flex gap-4 items-start">
                    <i className="bi bi-lock-fill text-2xl text-emerald-400"></i>
                    <div>
                      We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                    </div>
                  </div>
                  <p className="mb-10">
                    However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">6</span> 
                    Your Privacy Rights
                  </h3>
                  <p className="mb-10">
                    In some regions, you have certain rights under applicable data protection laws. These may include the right to request access and obtain a copy of your personal information, to request rectification or erasure, and to restrict the processing of your personal information.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">7</span> 
                    Contact Us
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <i className="bi bi-envelope-paper-heart text-2xl text-white"></i>
                    </div>
                    <div>
                      <p className="mb-2">If you have questions or comments about this notice, you may contact the owner directly:</p>
                      <p className="text-white font-medium text-lg">Oheneba Media</p>
                      <p className="text-slate-400">Owner: <strong className="text-slate-300">Oheneba Micheal Baah</strong></p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-900/30 border border-blue-500/30 text-blue-200 rounded-xl p-6 mb-10 shadow-inner backdrop-blur-sm flex gap-4 items-center">
                    <i className="bi bi-info-circle-fill text-2xl text-blue-400 shrink-0"></i>
                    <p className="text-sm md:text-base leading-relaxed">
                      Welcome! These terms and conditions outline the rules and regulations for the use of <strong className="text-white">Oheneba Media's</strong> services.
                    </p>
                  </div>

                  <p className="mb-10">
                    By accessing our services, we assume you accept these terms and conditions. Do not continue to use our platform if you do not agree to take all of the terms and conditions stated on this page.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">1</span> 
                    License and Usage
                  </h3>
                  <p className="mb-5">
                    Unless otherwise stated, <strong className="text-white">Oheneba Media</strong> and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You may access this from Oheneba Media for your own personal and commercial use subjected to restrictions set in these terms and conditions.
                  </p>
                  <p className="mb-4 font-bold text-white">You must not:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {[
                      'Republish material from our platform without consent.',
                      'Sell, rent, or sub-license material from our platform.',
                      'Reproduce, duplicate or copy material from our platform.',
                      'Redistribute content from our platform.'
                    ].map((item, idx) => (
                      <li key={idx} className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 hover:bg-rose-900/20 transition-colors">
                        <i className="bi bi-x-circle text-rose-400"></i> <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">2</span> 
                    User Accounts
                  </h3>
                  <p className="mb-5">
                    When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                  </p>
                  <div className="bg-amber-900/30 border border-amber-500/30 text-amber-200 rounded-xl p-5 mb-10 shadow-inner flex gap-4 items-start">
                    <i className="bi bi-exclamation-triangle-fill text-2xl text-amber-400"></i>
                    <div>
                      You are entirely responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">3</span> 
                    Acceptable Use
                  </h3>
                  <p className="mb-4 font-bold text-white">You agree not to use the Service:</p>
                  <ul className="space-y-4 mb-10 pl-2">
                    {[
                      'In any way that violates any applicable national or international law or regulation.',
                      'To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter" or "spam" or any other similar solicitation.',
                      'To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.'
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <i className="bi bi-dot text-2xl text-purple-400 -mt-1"></i> <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">4</span> 
                    Limitation of Liability
                  </h3>
                  <p className="mb-10">
                    In no event shall <strong className="text-white">Oheneba Media</strong>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">5</span> 
                    Termination
                  </h3>
                  <div className="bg-rose-900/30 border border-rose-500/30 text-rose-200 rounded-xl p-5 mb-5 shadow-inner">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                  </div>
                  <p className="mb-10">
                    Upon termination, your right to use the Service will immediately cease.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">6</span> 
                    Governing Law
                  </h3>
                  <p className="mb-10">
                    These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">7</span> 
                    Changes to Terms
                  </h3>
                  <p className="mb-10">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. 
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 text-sm">8</span> 
                    Contact Information
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <i className="bi bi-envelope-paper-heart text-2xl text-white"></i>
                    </div>
                    <div>
                      <p className="mb-2">If you have any questions about these Terms, please contact us:</p>
                      <p className="text-white font-medium text-lg">Oheneba Media</p>
                      <p className="text-slate-400">Owner: <strong className="text-slate-300">Oheneba Micheal Baah</strong></p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Footer Decor */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
      </div>
    </div>
  );
};
