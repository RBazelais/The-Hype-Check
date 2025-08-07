// src/components/auth/ProtectedRoute.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from './LoginForm'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const [showLoginForm, setShowLoginForm] = useState(false)
  
  // Set up a one-time check for user auth status
  useEffect(() => {
    // Only trigger the login form if we've finished loading and there's no user
    if (!loading && !user) {
      console.log('🛡️ Auth complete, no user found - showing login form')
      setShowLoginForm(true)
    }
    
    // If at any point we have a user, ensure login form is hidden
    if (user) {
      console.log('🛡️ User detected - hiding login form')
      setShowLoginForm(false)
    }
  }, [loading, user])
  
  // If loading and no user yet, show brief loading state (simple and reliable)
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="bg-concrete-900 text-concrete-100 px-8 py-4 border-5 border-black font-brutal text-xl">
          LOADING...
        </div>
      </div>
    )
  }
  
  // If we have a user, always show content
  if (user) {
    return children
  }
  
  // If we've determined we need to show login form
  if (showLoginForm) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-theater-gold text-black p-6 border-5 border-black mb-6">
          <h2 className="font-brutal text-2xl mb-2">ACCESS DENIED</h2>
          <p className="font-mono">You need to log in to access this page.</p>
        </div>
        <LoginForm />
      </div>
    )
  }
  
  // Default: while we determine auth state and haven't decided to show login yet
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="bg-concrete-900 text-concrete-100 px-8 py-4 border-5 border-black font-brutal text-xl">
        AUTHENTICATING...
      </div>
    </div>
  )
}

export default ProtectedRoute