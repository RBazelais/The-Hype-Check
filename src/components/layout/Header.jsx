// src/components/layout/Header.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from '../../hooks/useAuth';
import LoginForm from "../auth/LoginForm.jsx";
import SignupForm from "../auth/SignUpForm.jsx";
import toast from "react-hot-toast";

const Header = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
    const [searchQuery, setSearchQuery] = useState("");
    
    // Add more verbose logging to debug profile issues
    console.log("Header render - Auth state:", { 
        userObject: user ? `ID: ${user.id}, Email: ${user.email}` : 'No user', 
        profileObject: profile ? `ID: ${profile.id}, Name: ${profile.display_name}` : 'No profile',
        userMetadata: user?.user_metadata ? JSON.stringify(user.user_metadata) : 'No metadata',
        authProvidedDisplayName: profile?.display_name || 'Not available'
    });
    
    // Track internal display name state for consistent UI
    const [displayName, setDisplayName] = useState("");
    
    // Add effect to track display name from profile
    useEffect(() => {
        // If we have a profile with a display name, use that
        if (profile?.display_name) {
            console.log("Header - Setting display name from profile:", profile.display_name);
            setDisplayName(profile.display_name);
        }
        // If no user or no profile, reset to empty
        else if (!user) {
            console.log("Header - No user, clearing display name");
            setDisplayName("");
        }
    }, [user, profile]);

    const handleSignOut = async () => {
        // Show loading toast
        const loadingToast = toast.loading("Signing out...");
        
        try {
            // Simply call the signOut function - it handles page redirection
            await signOut();
            toast.dismiss(loadingToast);
            toast.success("Signed out successfully");
        } catch (err) {
            console.error("Header - Sign out error:", err);
            toast.dismiss(loadingToast);
            toast.error("Something went wrong during logout");
            
            // Force reload as a fallback
            setTimeout(() => {
                window.location.reload();
            }, 300);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    // Lock/unlock body scroll when modal opens/closes
    useEffect(() => {
        if (showAuthModal) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAuthModal]);

    return (
        <>
            <header className="w-full bg-gray-900 border-b-4 border-black">
                <div className="w-full px-4 py-4">
                    <div className="flex flex-col gap-4">
                        {/* Top row: Logo and Nav */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            {/* Logo */}
                            <Link to="/" className="group flex-shrink-0">
                                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-yellow-400 hover:text-yellow-300 transition-colors">
                                    THE HYPE CHECK
                                </h1>
                                <div className="font-mono text-xs text-gray-300 group-hover:text-gray-100 transition-colors">
                                    movie//trailer//discussions
                                </div>
                            </Link>

                            {/* Navigation */}
                            <nav className="flex items-center justify-between lg:justify-end gap-2">
                                {user ? (
                                    <div className="flex items-center gap-1 sm:gap-2 w-full lg:w-auto">
                                        <span className="font-mono text-xs text-gray-100 mr-1 hidden md:inline flex-shrink-0">
                                            {profile?.display_name || displayName || "Anonymous User"}
                                        </span>
                                        <Link
                                            to="/create"
                                            className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-mono font-bold border-2 border-black text-xs sm:text-sm transition-all flex-shrink-0"
                                        >
                                            <Plus size={14} className="sm:hidden" />
                                            <Plus size={16} className="hidden sm:inline" />
                                            <span className="hidden sm:inline">NEW HYPE</span>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-1 px-2 py-2 bg-gray-700 hover:bg-red-600 text-gray-100 hover:text-white font-mono border-2 border-black text-xs sm:text-sm transition-colors flex-shrink-0"
                                        >
                                            <LogOut size={14} className="sm:hidden" />
                                            <LogOut size={16} className="hidden sm:inline" />
                                            <span className="hidden md:inline">OUT</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-1 sm:gap-2 w-full lg:w-auto justify-end">
                                        <button
                                            onClick={() => openAuthModal("login")}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-black hover:bg-gray-800 text-white font-mono font-bold border-2 border-black text-xs sm:text-sm transition-all flex-shrink-0"
                                        >
                                            <LogIn size={14} className="sm:hidden" />
                                            <LogIn size={16} className="hidden sm:inline" />
                                            <span className="hidden sm:inline">LOGIN</span>
                                        </button>
                                        <button
                                            onClick={() => openAuthModal("signup")}
                                            className="px-2 sm:px-3 py-2 bg-white hover:bg-gray-100 text-black font-mono border-2 border-black text-xs sm:text-sm transition-colors flex-shrink-0"
                                        >
                                            <span className="hidden sm:inline">SIGN UP</span>
                                            <span className="sm:hidden">JOIN</span>
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>

                        {/* Search Bar - Always below other elements */}
                        <form
                            onSubmit={handleSearch}
                            className="w-full max-w-none lg:max-w-2xl lg:mx-auto"
                        >
                            <div className="relative flex w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="FIND DISCUSSIONS..."
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 border-2 border-black font-mono text-xs sm:text-sm text-black placeholder-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white border-2 border-l-0 border-black transition-colors flex-shrink-0"
                                >
                                    <Search size={16} className="sm:hidden" />
                                    <Search size={18} className="hidden sm:inline" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-16 p-4 z-40">
                    <div className="border-5 border-black shadow-brutal max-w-md w-full mt-4 rounded-none overflow-hidden">
                        <div className="bg-concrete-800 border-b-3 border-black p-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-brutal text-2xl text-white">
                                    {authMode === "login" ? "LOGIN" : "SIGN UP"}
                                </h2>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="text-2xl font-bold text-white hover:text-red-400 transition-colors bg-red-600 hover:bg-red-700 w-8 h-8 flex items-center justify-center border-2 border-white"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6 bg-white">
                            {authMode === "login" ? (
                                <LoginForm
                                    onSuccess={() => setShowAuthModal(false)}
                                />
                            ) : (
                                <SignupForm
                                    onSuccess={() => setShowAuthModal(false)}
                                />
                            )}

                            <div className="mt-4 text-center">
                                <button
                                    onClick={() =>
                                        setAuthMode(
                                            authMode === "login"
                                                ? "signup"
                                                : "login",
                                        )
                                    }
                                    className="font-mono text-sm text-concrete-600 hover:text-concrete-900 transition-colors"
                                >
                                    {authMode === "login"
                                        ? "Don't have an account? Sign up"
                                        : "Already have an account? Login"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
