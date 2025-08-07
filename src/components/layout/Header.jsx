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

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            if (error) {
                toast.error("Error signing out");
            } else {
                toast.success("Signed out successfully");
                // Navigate to home instead of hard refresh
                navigate('/');
            }
        } catch (err) { // eslint-disable-line no-unused-vars
            toast.error("Something went wrong during logout");
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
            <header className="bg-gray-900 border-b-4 border-black">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Top row: Logo and Nav (on mobile) */}
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link to="/" className="group flex-shrink-0">
                                <h1 className="font-bold text-2xl md:text-3xl text-yellow-400 hover:text-yellow-300 transition-colors">
                                    THE HYPE CHECK
                                </h1>
                                <div className="font-mono text-xs text-gray-300 group-hover:text-gray-100 transition-colors">
                                    movie//trailer//discussions
                                </div>
                            </Link>

                            {/* Mobile Navigation */}
                            <nav className="flex lg:hidden items-center gap-2">
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/create"
                                            className="flex items-center gap-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-mono font-bold border-2 border-black text-sm transition-all"
                                        >
                                            <Plus size={16} />
                                            <span className="hidden sm:inline">NEW HYPE</span>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-1 px-2 py-2 bg-gray-700 hover:bg-red-600 text-gray-100 hover:text-white font-mono border-2 border-black text-sm transition-colors"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openAuthModal("login")}
                                            className="flex items-center gap-1 px-3 py-2 bg-black hover:bg-gray-800 text-white font-mono font-bold border-2 border-black text-sm transition-all"
                                        >
                                            <LogIn size={16} />
                                            <span className="hidden sm:inline">LOGIN</span>
                                        </button>
                                        <button
                                            onClick={() => openAuthModal("signup")}
                                            className="px-3 py-2 bg-white hover:bg-gray-100 text-black font-mono border-2 border-black text-sm transition-colors"
                                        >
                                            <span className="hidden sm:inline">SIGN UP</span>
                                            <span className="sm:hidden">JOIN</span>
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>

                        {/* Second row: Search Bar and Desktop Navigation */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                            {/* Search Bar */}
                            <form
                                onSubmit={handleSearch}
                                className="flex-1 lg:max-w-md lg:mx-8 min-w-0"
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="FIND DISCUSSIONS..."
                                        className="w-full min-w-48 px-4 py-3 bg-gray-100 border-2 border-black font-mono text-sm text-black placeholder-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-0 top-0 h-full px-4 bg-red-600 hover:bg-red-700 text-white border-l-2 border-black transition-colors"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </form>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center gap-4 flex-shrink-0">
                                {user ? (
                                    <>
                                        <Link
                                            to="/create"
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-mono font-bold border-2 border-black transition-all"
                                        >
                                            <Plus size={18} />
                                            NEW HYPE
                                        </Link>

                                        <div className="flex items-center gap-2 text-gray-100">
                                            <User size={18} />
                                            <span className="font-mono text-sm">
                                                {profile?.display_name || "User"}
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-red-600 text-gray-100 hover:text-white font-mono border-2 border-black transition-colors"
                                        >
                                            <LogOut size={16} />
                                            SIGNOUT
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openAuthModal("login")}
                                            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white font-mono font-bold border-2 border-black transition-all"
                                        >
                                            <LogIn size={18} />
                                            LOGIN
                                        </button>
                                        <button
                                            onClick={() => openAuthModal("signup")}
                                            className="px-4 py-2 bg-white hover:bg-gray-100 text-black font-mono border-2 border-black transition-colors"
                                        >
                                            SIGN UP
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>
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
