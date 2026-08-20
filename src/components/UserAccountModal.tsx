import React, { useState } from 'react';
import { actions } from '../utils/store';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string } | null;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [view, setView] = useState<'signin' | 'signup'>('signin');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState<string | null>(null);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  const [isShaking, setIsShaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError(null);
    const res = actions.login(signinEmail.trim(), signinPassword);
    if (!res.success) {
      setSigninError(res.error || "No account was found with this email. Please check your email or create an account.");
      triggerShake();
    } else {
      setSigninEmail('');
      setSigninPassword('');
      setSigninError(null);
      onClose();
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    const res = actions.signUp(signupName.trim(), signupEmail.trim(), signupPassword);
    if (!res.success) {
      setSignupError(res.error || "Registration failed. Please check your details.");
      triggerShake();
    } else {
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupError(null);
      onClose();
    }
  };

  const handleLogout = () => {
    actions.logout();
    onClose();
  };

  const switchView = (targetView: 'signin' | 'signup') => {
    setSigninError(null);
    setSignupError(null);
    setView(targetView);
  };

  return (
    <div id="modal-profile" className="modal-wrapper active modal-full">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>👤</span> User Account
          </h2>
          <button
            onClick={onClose}
            className="panel-close-btn text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {currentUser ? (
          /* Logged-In View */
          <div id="auth-profile-container">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center font-display font-extrabold text-lg text-primary-foreground">
                <span id="profile-initial">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 id="profile-name" className="font-display font-bold text-foreground">
                  Hello, {currentUser.name}!
                </h3>
                <p id="profile-email" className="text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <div className="border-t border-border/30 pt-4 mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
                Workspace Streak
              </p>
              <div className="flex justify-between items-center bg-secondary/20 border border-border/20 rounded-2xl p-4">
                <div>
                  <div className="text-2xl font-bold text-primary">Active</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Session tracking enabled
                  </div>
                </div>
                <span className="text-3xl">🔥</span>
              </div>
            </div>
            <button
              id="auth-logout-btn"
              onClick={handleLogout}
              className="w-full border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 font-bold rounded-xl py-2.5 text-sm transition cursor-pointer"
            >
              Log Out
            </button>
          </div>
        ) : view === 'signin' ? (
          /* Sign In View */
          <div id="auth-signin-container" className={isShaking ? 'animate-shake' : ''}>
            <p className="text-xs text-muted-foreground mb-4">
              Log in to keep track of your focus streak and custom settings.
            </p>
            <form id="signin-form" onSubmit={handleSignIn} className="space-y-3">
              <div>
                <input
                  type="email"
                  id="signin-email"
                  placeholder="Email Address"
                  required
                  value={signinEmail}
                  onChange={(e) => {
                    setSigninEmail(e.target.value);
                    if (signinError) setSigninError(null);
                  }}
                  className={`auth-input ${signinError ? 'error' : ''}`}
                />
                {signinError && (
                  <div id="signin-error-msg" className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5 animate-[fade-in-up_0.2s_ease-out]">
                    <span>⚠️</span>
                    <span>{signinError}</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  id="signin-password"
                  placeholder="Password"
                  required
                  value={signinPassword}
                  onChange={(e) => {
                    setSigninPassword(e.target.value);
                    if (signinError) setSigninError(null);
                  }}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="auth-submit-btn cursor-pointer">
                Sign In
              </button>
            </form>
            <div className="mt-4 text-center text-xs">
              <span className="text-muted-foreground">New to FocusFlow?</span>
              <button
                type="button"
                id="go-to-signup-btn"
                onClick={() => switchView('signup')}
                className="text-primary font-bold ml-1 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          /* Sign Up View */
          <div id="auth-signup-container" className={isShaking ? 'animate-shake' : ''}>
            <p className="text-xs text-muted-foreground mb-4">
              Create your study dashboard and customize your environment.
            </p>
            <form id="signup-form" onSubmit={handleSignUp} className="space-y-3">
              <div>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="Enter your full name"
                  required
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="auth-input"
                />
              </div>
              <div>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="Email Address"
                  required
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className={`auth-input ${signupError ? 'error' : ''}`}
                />
                {signupError && (
                  <div id="signup-error-msg" className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5 animate-[fade-in-up_0.2s_ease-out]">
                    <span>⚠️</span>
                    <span>{signupError}</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Password"
                  required
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (signupError) setSignupError(null);
                  }}
                  className="auth-input"
                />
              </div>
              <button type="submit" className="auth-submit-btn cursor-pointer">
                Sign Up
              </button>
            </form>
            <div className="mt-4 text-center text-xs">
              <span className="text-muted-foreground">Already have an account?</span>
              <button
                type="button"
                id="go-to-signin-btn"
                onClick={() => switchView('signin')}
                className="text-primary font-bold ml-1 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
