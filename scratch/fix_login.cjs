const fs = require('fs');

let content = fs.readFileSync('scratch/LoginPage.bak.tsx', 'utf-8');

const startHooks = `  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);
  const splashImages = ['/splash1.jpg', '/splash2.jpg', '/splash3.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % splashImages.length);
    }, 3000);
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 9000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (showWhisper) {
      fetch('/api/public/companies')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCompanies(data);
            
            const currentHost = window.location.hostname;
            const subdomain = currentHost.split('.')[0].toLowerCase();
            
            const found = data.find((c: any) => 
              c.domain === currentHost || 
              c.id === \`c-\${subdomain}\` ||
              c.domain?.toLowerCase().startsWith(subdomain)
            );
            
            if (found) {
              setMatchedCompany(found);
              setWhisperCompanyId(found.id);
            } else if (data.length > 0) {
              setMatchedCompany(null);
              setWhisperCompanyId(data[0].id);
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [showWhisper]);`;

const newHooks = `  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [showSplash, setShowSplash] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  const activeImages = matchedCompany?.loginImages?.length > 0 
    ? matchedCompany.loginImages 
    : ['/splash1.jpg', '/splash2.jpg', '/splash3.jpg'];

  useEffect(() => {
    fetch('/api/public/companies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCompanies(data);
          const currentHost = window.location.hostname;
          const subdomain = currentHost.split('.')[0].toLowerCase();
          
          const found = data.find((c: any) => 
            c.domain === currentHost || 
            c.id === \`c-\${subdomain}\` ||
            c.domain?.toLowerCase().startsWith(subdomain)
          );
          
          if (found) {
            setMatchedCompany(found);
            setWhisperCompanyId(found.id);
          } else if (data.length > 0) {
            setMatchedCompany(null);
            setWhisperCompanyId(data[0].id);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        setDataLoaded(true);
      });
  }, []);

  // Preload images
  useEffect(() => {
    if (!dataLoaded) return;
    
    let loadedCount = 0;
    if (!activeImages || activeImages.length === 0) {
      setImagesPreloaded(true);
      return;
    }
    
    activeImages.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === activeImages.length) setImagesPreloaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === activeImages.length) setImagesPreloaded(true);
      };
      img.src = src;
    });
  }, [dataLoaded, activeImages]);

  // Carousel timer
  useEffect(() => {
    if (!imagesPreloaded) return;
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % activeImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [imagesPreloaded, activeImages.length]);

  // Show splash until everything is ready
  useEffect(() => {
    if (dataLoaded && imagesPreloaded) {
      setTimeout(() => setShowSplash(false), 300);
    }
  }, [dataLoaded, imagesPreloaded]);`;


const startRender = `  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 overflow-hidden p-4 sm:p-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 animate-fade-in-up">
          
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-4 mb-8 shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="Core360 Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">Core<span className="text-blue-600">360</span></h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium tracking-wide mb-10 max-w-md">
              {bgIndex === 0 ? 'Empowering Modern Enterprise' : bgIndex === 1 ? 'Seamless Supply Chain & ERP' : 'Next-Generation Workforce Management'}
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-2">
              {splashImages.map((_, idx) => (
                <div 
                  key={idx}
                  className={\`h-1.5 rounded-full transition-all duration-500 \${idx === bgIndex ? 'w-8 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'w-2 bg-slate-300'}\`}
                />
              ))}
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 w-full max-w-2xl relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            {splashImages.map((img, idx) => (
              <div
                key={idx}
                className={\`absolute inset-0 transition-opacity duration-1000 ease-in-out \${idx === bgIndex ? 'opacity-100' : 'opacity-0'}\`}
              >
                <img src={img} alt="Splash Content" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white shadow-sm border border-slate-200 mb-5 overflow-hidden p-2">
            <img src="/logo.jpg" alt="Core360 Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl fw-bold text-slate-900 tracking-tight">Core360</h1>
          <p className="fs-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">`;


const newRender = `  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-4 shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden">
            <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white animate-fade-in overflow-hidden">
      {/* Left Side - Image Carousel */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-slate-900 shadow-2xl z-10">
        {activeImages.map((img, idx) => (
          <div
            key={idx}
            className={\`absolute inset-0 transition-all duration-1000 ease-in-out \${idx === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}\`}
          >
            <img src={img} alt={\`Slide \${idx}\`} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute inset-0 bg-slate-900/20"></div>

        <div className="absolute bottom-12 left-12 right-12 z-20">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md p-3 mb-6 shadow-xl border border-white/20 flex items-center justify-center overflow-hidden">
            <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            {matchedCompany ? matchedCompany.name : 'Core360'}
          </h2>
          <p className="text-lg text-white/90 font-medium max-w-lg mb-8 drop-shadow">
            {matchedCompany ? 'Welcome back to your workspace.' : 'Next-Generation Enterprise Management System.'}
          </p>
          <div className="flex items-center gap-2">
            {activeImages.map((_, idx) => (
              <div 
                key={idx}
                className={\`h-1.5 rounded-full transition-all duration-500 \${idx === bgIndex ? 'w-8 bg-white' : 'w-3 bg-white/30'}\`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto relative z-10 py-12">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-200 mb-5 overflow-hidden p-2">
              <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl fw-bold text-slate-900 tracking-tight">Sign in to your account</h1>
            <p className="fs-sm text-slate-500 mt-2">Enter your credentials to access the platform.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">`;

const originalEnd = `              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="fs-xs text-slate-500 mb-4">Want to report a concern?</p>
                <button
                  onClick={() => setShowWhisper(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-200 bg-violet-50 text-violet-700 fs-xs fw-semibold hover:bg-violet-100 transition-colors shadow-sm cursor-pointer"
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  Whisper Report (Anonymous)
                </button>
              </div>

              {/* Legal Links */}
              <div className="mt-6 flex items-center justify-center gap-4 fs-xs text-slate-500">
                <button onClick={() => setShowLegal('privacy')} className="hover:text-slate-900 hover:underline cursor-pointer transition-colors">Privacy Policy</button>
                <span>&bull;</span>
                <button onClick={() => setShowLegal('terms')} className="hover:text-slate-900 hover:underline cursor-pointer transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

const endRender = `              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="fs-xs text-slate-500 mb-4">Want to report a concern?</p>
                <button
                  type="button"
                  onClick={() => setShowWhisper(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-200 bg-violet-50 text-violet-700 fs-xs fw-semibold hover:bg-violet-100 transition-colors shadow-sm cursor-pointer"
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  Whisper Report (Anonymous)
                </button>
              </div>

              {/* Legal Links */}
              <div className="mt-6 flex items-center justify-center gap-4 fs-xs text-slate-500">
                <button type="button" onClick={() => setShowLegal('privacy')} className="hover:text-slate-900 hover:underline cursor-pointer transition-colors">Privacy Policy</button>
                <span>&bull;</span>
                <button type="button" onClick={() => setShowLegal('terms')} className="hover:text-slate-900 hover:underline cursor-pointer transition-colors">Terms of Service</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;

content = content.replace(startHooks, newHooks);
content = content.replace(startRender, newRender);
content = content.replace(originalEnd, endRender);

fs.writeFileSync('src/components/LoginPage.tsx', content, 'utf-8');
console.log("Replaced!");
