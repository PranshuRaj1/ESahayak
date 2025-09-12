"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-from"

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <div className="min-h-screen relative">
      {/* Background Image & Blur Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm z-10"
        style={{
          backgroundImage: "url('bg.png')", // Replace with your image path
        }}
      />

      {/* Card Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isRegistering ? (
            <RegisterForm onSwitchToLogin={() => setIsRegistering(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setIsRegistering(true)} />
          )}
        </div>
      </div>
    </div>
  )
}