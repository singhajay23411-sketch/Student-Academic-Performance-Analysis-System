import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import './LoginPage.css';

const lampStates = [
  {
    mode: "OFF",
    themeColor: "#2a2c30",
    themeGlowRGB: "42,44,48",
    shadeColor: "#2c2c2c",
    bulbColor: "#1a1a1a",
    lightOpacity: "0",
    btnBg: "#2a2c30",
    btnText: "#888",
    cardBg: "rgba(18,24,32,0.55)",
    inputBg: "rgba(255,255,255,0.06)",
    inputBorder: "rgba(255,255,255,0.08)",
    cardText: "#ffffff",
    secondaryText: "#d1d5db",
    shadowColor: "rgba(0,0,0,0.35)",
    awake: "0",
    sleep: "1"
  },
  {
    mode: "ON",
    themeColor: "#f5b300",
    themeGlowRGB: "245,179,0",
    shadeColor: "#ffd980",
    bulbColor: "#fff6d6",
    lightOpacity: "1",
    btnBg: "linear-gradient(90deg,#ffbf00,#f6aa00)",
    btnText: "#ffffff",
    cardBg: "rgba(255,255,255,0.82)",
    inputBg: "rgba(255,255,255,0.65)",
    inputBorder: "rgba(255,255,255,0.4)",
    cardText: "#0f172a",
    secondaryText: "#475569",
    shadowColor: "rgba(0,0,0,0.12)",
    awake: "1",
    sleep: "0"
  }
];

export default function LoginPage() {
  const [currentState, setCurrentState] = useState(0);
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [pulling, setPulling] = useState(false);
  const containerRef = useRef(null);
  
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // Navigate to dashboard only AFTER the store has committed isAuthenticated=true.
  // This prevents the race where navigate() fires before the Zustand set() resolves.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      if (useStore.getState().isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Form State
  const [loginEmail, setLoginEmail] = useState('ajay.raj@university.edu');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleLamp = () => {
    setPulling(true);
    setTimeout(() => {
      setPulling(false);
    }, 180);

    if (currentState === 1) return;
    setCurrentState(1);
  };

  const handleLogin = () => {
    login(loginEmail);
    // navigation is handled by the isAuthenticated useEffect above
  };

  const handleSignup = () => {
    if (validatePassword() && password === confirmPassword) {
        login(signupEmail, signupName);
        // navigation is handled by the isAuthenticated useEffect above
    }
  };

  const validatePassword = () => {
    const val = password;
    const isValidLength = val.length >= 6 && val.length <= 16;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    return isValidLength && hasUpper && hasLower && hasNumber;
  };

  const config = lampStates[currentState];

  const containerStyle = {
    '--theme-color': config.themeColor,
    '--theme-glow-rgb': config.themeGlowRGB,
    '--shade-color': config.shadeColor,
    '--bulb-color': config.bulbColor,
    '--light-opacity': config.lightOpacity,
    '--btn-bg': config.btnBg,
    '--btn-text-color': config.btnText,
    '--card-bg': config.cardBg,
    '--input-bg': config.inputBg,
    '--input-border': config.inputBorder,
    '--card-text': config.cardText,
    '--secondary-text': config.secondaryText,
    '--shadow-color': config.shadowColor,
  };

  const isValidLength = password.length >= 6 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password === confirmPassword;
  const isFormValid = validatePassword() && isMatch && confirmPassword !== '';

  return (
    <div 
      className={`login-page-body ${config.mode === 'ON' ? 'light-mode' : ''}`}
      style={containerStyle}
      ref={containerRef}
    >
      <div className="login-container">
        {/* LEFT */}
        <div className="lamp-section">
          <div className="bg-blur"></div>
          <div className="light-mode-shapes">
            <div className="shape1"></div>
            <div className="shape2"></div>
          </div>
          <div className="light-cone"></div>

          <svg className="lamp-svg" viewBox="0 0 300 450">
            <defs>
              <clipPath id="mouthClip">
                <path d="M 125 155 Q 150 190 175 155 Z" />
              </clipPath>
            </defs>

            <ellipse cx="150" cy="400" rx="60" ry="15" fill="#151515" />
            <ellipse cx="150" cy="395" rx="60" ry="15" fill="#3a3c40" />

            <rect x="140" y="180" width="20" height="220" fill="#2a2c30" />
            <rect x="142" y="180" width="8" height="220" fill="#4a4c50" />

            <ellipse cx="150" cy="175" rx="90" ry="20" className="shade-inner" />

            <g 
              className="pull-string-group" 
              onClick={toggleLamp}
              style={{ transform: pulling ? 'translateY(18px)' : 'translateY(0px)' }}
            >
              <line x1="105" y1="180" x2="105" y2="280" stroke="#777" strokeWidth="3" />
              <line x1="105" y1="280" x2="105" y2="315" stroke="#ccc" strokeWidth="7" strokeLinecap="round" />
            </g>

            <path d="M 95 60 Q 150 45 205 60 L 240 175 Q 150 195 60 175 Z" className="shade-main" />

            <g className="face-sleep" style={{ opacity: config.sleep }}>
              <path d="M 115 130 Q 125 140 135 130" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 165 130 Q 175 140 185 130" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>

            <g className="face-awake" style={{ opacity: config.awake }}>
              <path d="M 115 130 Q 125 115 135 130" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 165 130 Q 175 115 185 130" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
              <g>
                <path d="M 125 155 Q 150 190 175 155 Z" fill="#111" />
                <path d="M 140 165 Q 150 190 160 165 Z" fill="#f87171" clipPath="url(#mouthClip)" />
              </g>
            </g>
          </svg>
        </div>

        {/* RIGHT */}
        <div className="login-section">
          <div className="login-card">
            <div className="logo-row">
              <div className="logo-box">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 2L4 8V24L16 30L28 24V8L16 2Z" fill="#fff" fillOpacity="0.16" />
                  <path d="M16 4.5L6.5 9.25V22.75L16 27.5L25.5 22.75V9.25L16 4.5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 11V21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M11 14V18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M21 13V19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="logo-text">SAPAS</div>
            </div>

            {/* LOGIN VIEW */}
            <div 
              id="login-view" 
              className="auth-view"
              style={{
                display: view === 'login' ? 'block' : 'none',
                opacity: view === 'login' ? 1 : 0,
                transform: view === 'login' ? 'translateX(0)' : 'translateX(-20px)'
              }}
            >
              <div className="heading">Welcome Back</div>
              <div className="subtext">Enter your credentials to access the analytics portal.</div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="" />
              </div>

              <div className="input-group">
                <div className="input-row">
                  <label>Password</label>
                  <div className="forgot">Forgot?</div>
                </div>
                <input type="password" placeholder="••••••••" />
              </div>

              <button className="login-btn" onClick={handleLogin}>Sign In</button>

              <div className="footer">
                New to SAPAS?{' '}
                <span onClick={() => setView('signup')}>Create Account</span>
              </div>
            </div>

            {/* SIGN UP VIEW */}
            <div 
              id="signup-view" 
              className="auth-view signup-compact" 
              style={{
                display: view === 'signup' ? 'block' : 'none',
                opacity: view === 'signup' ? 1 : 0,
                transform: view === 'signup' ? 'translateX(0)' : 'translateX(20px)'
              }}
            >
              <button className="back-to-login" type="button" onClick={() => setView('login')}>
                Back to Sign In
              </button>
              <div className="heading">Create Account</div>
              <div className="subtext">
                Create your SAPAS account to start tracking academic performance and receive AI-powered insights.
              </div>

              <div className="input-group">
                <label>Full Name</label>
                <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="" />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="" />
              </div>

              <div className="input-group">
                <label>Create Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ul className="password-validation">
                  <li className={hasUpper ? 'valid' : ''}>One uppercase letter</li>
                  <li className={hasLower ? 'valid' : ''}>One lowercase letter</li>
                  <li className={hasNumber ? 'valid' : ''}>One number</li>
                  <li className={isValidLength ? 'valid' : ''}>6-16 characters</li>
                </ul>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword !== '' && !isMatch && (
                  <div className="error-msg visible">Passwords do not match</div>
                )}
              </div>

              <button 
                className="login-btn" 
                disabled={!isFormValid}
                onClick={handleSignup}
              >
                Create Account
              </button>

              <div className="footer">
                Already have an account?{' '}
                <span onClick={() => setView('login')}>Sign In</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
