import { useState, useEffect } from 'react';
import { FiSmartphone, FiDownload, FiCheck, FiCopy, FiX, FiShare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MobileInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const [activeTab, setActiveTab] = useState('apk');

  // Network URLs for phone access
  const networkUrl = `${window.location.protocol}//${window.location.hostname === 'localhost' ? '10.226.176.89' : window.location.hostname}:${window.location.port || '5173'}`;
  const apkDownloadUrl = `${networkUrl}/diafit-ai.apk`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeTab === 'apk' ? apkDownloadUrl : networkUrl)}`;

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Thank you for installing DiaFit AI Mobile App!');
      }
      setDeferredPrompt(null);
      onClose();
    } else {
      toast('To install: Tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".', { duration: 6000 });
    }
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-13 h-13 bg-primary-50 border border-primary-200 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <FiSmartphone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Get DiaFit AI Mobile App</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Choose your preferred method to use DiaFit AI on your smartphone.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-white text-emerald-700 shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🤖 Android APK</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-md">Native</span>
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'web'
                ? 'bg-white text-primary-700 shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🌐 Web App (PWA)</span>
          </button>
        </div>

        {activeTab === 'apk' ? (
          <div>
            {/* Direct APK Download Button */}
            <div className="mb-4 space-y-2">
              <a
                href="/diafit-ai.apk"
                download="DiaFit-AI.apk"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition transform active:scale-98 text-center"
              >
                <FiDownload className="w-5 h-5" />
                <span>Download Android App (.apk)</span>
              </a>
              <p className="text-[11px] text-center text-emerald-700 font-bold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                ✓ Full Camera & AI Pose Tracking Enabled • No HTTPS Warning
              </p>
            </div>

            {/* QR Code Section for Direct APK Download */}
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-4 rounded-2xl border border-emerald-100 text-center mb-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Scan with Phone Camera to Download APK
              </p>
              <div className="bg-white p-2.5 rounded-2xl shadow-sm inline-block border border-gray-100">
                <img
                  src={qrUrl}
                  alt="Scan to download APK"
                  className="w-40 h-40 mx-auto rounded-lg"
                  loading="eager"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-medium">
                Scanning this QR code immediately starts downloading the APK file to your phone.
              </p>
            </div>

            {/* Direct APK Link */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Direct APK Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apkDownloadUrl}
                  className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-mono text-gray-700 select-all"
                />
                <button
                  onClick={() => handleCopy(apkDownloadUrl)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {isCopied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* 3 Step Install Guide */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 text-xs text-gray-700 space-y-1.5">
              <p className="font-bold text-gray-900">Easy 3-Step Installation:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                <li>Tap <strong>Download Android App (.apk)</strong> above.</li>
                <li>When download finishes, tap <strong>Open</strong> (If prompted, allow <em>Install unknown apps</em>).</li>
                <li>Tap <strong>Install</strong> and open DiaFit AI!</li>
              </ol>
            </div>
          </div>
        ) : (
          <div>
            {/* Direct One-Tap Install Button (if browser prompt available) */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full mb-4 py-3 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition transform active:scale-98"
              >
                <FiDownload className="w-5 h-5" /> Install DiaFit AI PWA
              </button>
            )}

            {/* QR Code Section for Phone Scan */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-gray-200/80 text-center mb-4">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Scan to Open on Mobile Browser
              </p>
              <div className="bg-white p-2.5 rounded-2xl shadow-sm inline-block border border-gray-100">
                <img
                  src={qrUrl}
                  alt="Scan to open on phone"
                  className="w-40 h-40 mx-auto rounded-lg"
                  loading="eager"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-medium">
                Point your camera at the QR code to open directly in mobile browser.
              </p>
            </div>

            {/* Direct Link Section */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Mobile Web URL (Same Wi-Fi Network)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={networkUrl}
                  className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-mono text-gray-700 select-all"
                />
                <button
                  onClick={() => handleCopy(networkUrl)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {isCopied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* OS Specific Instructions */}
            <div className="space-y-2 text-left">
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  🤖 Android (Chrome / Edge)
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Open link in Chrome $\rightarrow$ Tap <strong>three dots (⋮)</strong> $\rightarrow$ Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                <p className="font-bold flex items-center gap-1.5 mb-0.5">
                  🍎 iPhone / iPad (Safari)
                </p>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Open in Safari $\rightarrow$ Tap <strong>Share (<FiShare className="inline w-3 h-3" />)</strong> $\rightarrow$ Tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
