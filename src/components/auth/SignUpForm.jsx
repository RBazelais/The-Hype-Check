// src/components/auth/SignupForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const SignupForm = ({ onSuccess }) => {
	const { signUp } = useAuth()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm()

	const password = watch('password')

	const onSubmit = async (data) => {
		setIsLoading(true)
		try {
			const { error } = await signUp(data.email, data.password, data.displayName)
			
			if (error) {
				toast.error(error.message)
			} else {
				toast.success('Account created! Check your email to verify.')
				onSuccess?.()
			}
		} catch (err) {
			console.error('Signup error:', err)
			toast.error('Signup failed')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			{/* Display Name Field */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					DISPLAY NAME
				</label>
				<input
					type="text"
					{...register('displayName', {
						required: 'Display name is required',
						minLength: {
							value: 2,
							message: 'Display name must be at least 2 characters'
						},
						maxLength: {
							value: 30,
							message: 'Display name must be less than 30 characters'
						}
					})}
					className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
					placeholder="MovieBuff2024"
				/>
				{errors.displayName && (
					<p className="mt-1 text-red-600 font-mono text-sm">
						{errors.displayName.message}
					</p>
				)}
			</div>

			{/* Email Field */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					EMAIL
				</label>
				<input
					type="email"
					{...register('email', {
						required: 'Email is required',
						pattern: {
							value: /\S+@\S+\.\S+/,
							message: 'Invalid email address'
						}
					})}
					className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
					placeholder="your@email.com"
				/>
				{errors.email && (
					<p className="mt-1 text-red-600 font-mono text-sm">
						{errors.email.message}
					</p>
				)}
			</div>

			{/* Password Field */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					PASSWORD
				</label>
				<div className="relative">
					<input
						type={showPassword ? 'text' : 'password'}
						{...register('password', {
							required: 'Password is required',
							minLength: {
								value: 6,
								message: 'Password must be at least 6 characters'
							}
						})}
						className="w-full px-4 py-3 pr-12 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
						placeholder="••••••••"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-concrete-600 hover:text-concrete-900"
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				</div>
				{errors.password && (
					<p className="mt-1 text-red-600 font-mono text-sm">
						{errors.password.message}
					</p>
				)}
			</div>

			{/* Confirm Password Field */}
			<div>
				<label className="block font-mono text-sm font-bold text-concrete-800 mb-2">
					CONFIRM PASSWORD
				</label>
				<input
					type={showPassword ? 'text' : 'password'}
					{...register('confirmPassword', {
						required: 'Please confirm your password',
						validate: value => value === password || 'Passwords do not match'
					})}
					className="w-full px-4 py-3 bg-white border-3 border-black font-mono focus:outline-none focus:shadow-brutal-sm transition-all"
					placeholder="••••••••"
				/>
				{errors.confirmPassword && (
					<p className="mt-1 text-red-600 font-mono text-sm">
						{errors.confirmPassword.message}
					</p>
				)}
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading}
				className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					'CREATING ACCOUNT...'
				) : (
					<>
						<UserPlus size={18} />
						SIGN UP
					</>
				)}
			</button>
		</form>
	)
}

export default SignupForm