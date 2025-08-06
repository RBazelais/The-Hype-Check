// src/components/layout/Header.jsx
import { useState } from "react";
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
        console.log('🔴 Logout button clicked!')
        try {
            console.log('🔴 Calling signOut function...')
            const { error } = await signOut();
            console.log('🔴 SignOut result:', { error })
            
            if (error) {
                console.error('🔴 SignOut error:', error)
                toast.error("Error signing out");
            } else {
                console.log('🔴 SignOut successful, forcing page reload...')
                toast.success("Signed out successfully");
                // Force a hard refresh to clear everything
                window.location.href = '/';
            }
        } catch (err) {
            console.error('🔴 Logout catch error:', err)
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

    return (
        <>
            <header className="bg-concrete-900 border-b-5 border-black">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="group">
                            <h1 className="font-brutal text-3xl text-theater-gold hover:text-street-yellow transition-colors">
                                THE HYPE CHECK
                            </h1>
                            <div className="font-mono text-xs text-concrete-300 group-hover:text-concrete-100 transition-colors">
                                movie//trailer//discussions
                            </div>
                        </Link>

                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="flex-1 max-w-md mx-8"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="SEARCH MOVIES..."
                                    className="w-full px-4 py-3 bg-concrete-100 border-3 border-black font-mono text-sm text-black placeholder-concrete-600 focus:bg-white focus:outline-none focus:shadow-brutal-sm transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-4 bg-theater-red hover:bg-theater-gold text-white border-l-3 border-black transition-colors"
                                >
                                    <Search size={18} className="text-white" />
                                </button>
                            </div>
                        </form>

                        {/* Navigation */}
                        <nav className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link
                                        to="/create"
                                        className="flex items-center gap-2 px-4 py-2 bg-street-yellow hover:bg-street-orange text-black font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all"
                                    >
                                        <Plus size={18} className="text-black" />
                                        NEW HYPE
                                    </Link>

                                    <div className="flex items-center gap-2 text-concrete-100">
                                        <User size={18} className="text-concrete-100" />
                                        <span className="font-mono text-sm">
                                            {profile?.display_name || "User"}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-3 py-2 bg-concrete-700 hover:bg-concrete-600 text-concrete-100 font-mono border-3 border-black transition-colors"
                                    >
                                        <LogOut size={16} className="text-concrete-100" />
                                        OUT
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openAuthModal("login")}
                                        className="flex items-center gap-2 px-4 py-2 bg-theater-red hover:bg-theater-gold text-white font-mono font-bold border-3 border-black shadow-brutal-sm hover:shadow-none transition-all"
                                    >
                                        <LogIn size={18} className="text-white" />
                                        LOGIN
                                    </button>
                                    <button
                                        onClick={() => openAuthModal("signup")}
                                        className="px-4 py-2 bg-concrete-700 hover:bg-concrete-600 text-concrete-100 font-mono border-3 border-black transition-colors"
                                    >
                                        SIGN UP
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-concrete-100 border-5 border-black shadow-brutal max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-brutal text-2xl">
                                    {authMode === "login" ? "LOGIN" : "SIGN UP"}
                                </h2>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="text-2xl font-bold hover:text-theater-red transition-colors"
                                >
                                    ×
                                </button>
                            </div>

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
