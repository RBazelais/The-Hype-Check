import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const LoginForm = ({ onSuccess }) => {
	const { signIn } = useAuth()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		setIsLoading(true)
		try {
			const { error } = await signIn(data.email, data.password)

			if (error) {
				toast.error(error.message)
			} else {
				toast.success('Welcome back!')
				onSuccess?.()
			}
		} catch (err) {
			console.error('Login error:', err)
			toast.error('Login failed')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
					<p className="mt-1 text-theater-red font-mono text-sm">
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
					<p className="mt-1 text-theater-red font-mono text-sm">
						{errors.password.message}
					</p>
				)}
			</div>

			{/* Submit Button */}
			<button
				type="submit"
				disabled={isLoading}
				className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-theater-red hover:bg-theater-gold text-white font-mono font-bold border-3 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					'LOGGING IN...'
				) : (
					<>
						<LogIn size={18} />
						LOGIN
					</>
				)}
			</button>
		</form>
	)
}

export default LoginForm