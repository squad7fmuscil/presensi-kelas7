import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi!')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .eq('active', true)
        .single()

      if (error || !data) {
        setError('Username atau password salah!')
      } else {
        console.log('Login berhasil:', data)
        localStorage.setItem('user', JSON.stringify(data))
        
        if (onLogin) {
          onLogin(data)
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
      console.error('Login error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Background floating elements - reduced from 7 to 4 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-32 w-56 h-56 bg-blue-300/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Reduced bouncing elements from 3 to 2 */}
      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-blue-300/30 rounded-lg animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="absolute bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2">
        <div className="w-14 h-14 bg-cyan-300/30 rounded-xl animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Card width reduced from max-w-xl to max-w-md for better symmetry */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            {/* School icon instead of generic "M" */}
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-3 sm:mb-4 border border-white/20">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
                {/* School/Education icon */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 px-2">SMP MUSLIMIN CILILIN</h1>
            <p className="text-sm sm:text-base text-blue-200/80 px-4">Sistem Administrasi Digital</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Login</h2>
              <p className="text-sm sm:text-base text-blue-200/80">Masuk ke sistem administrasi sekolah</p>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="username" className="text-xs sm:text-sm font-medium text-white/90">Username</label>
                <div className="relative">
                  {/* User icon */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    disabled={loading}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  {/* Lock icon */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    disabled={loading}
                    className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                  />
                  {/* Password toggle button with proper icons */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/70 hover:text-white transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? (
                      // Eye slash (hide password)
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      </svg>
                    ) : (
                      // Eye (show password)
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400/50 focus:ring-2"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-blue-200/80">Ingat saya</span>
                </label>
                <button
                  type="button"
                  className="text-xs sm:text-sm text-blue-300 hover:text-white transition-colors duration-200"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Masuk...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-blue-200/70">
                Butuh bantuan?{' '}
                <button className="text-blue-300 hover:text-white font-medium transition-colors duration-200">
                  Hubungi Admin
                </button>
              </p>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-blue-200/60 px-4">
              © 2025 SMP MUSLIMIN CILILIN. Sistem Administrasi Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login