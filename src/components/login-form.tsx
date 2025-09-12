"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "../../server/user"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Eye, EyeOff } from "lucide-react"

import { useRouter } from "next/navigation"


interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()



  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(email, password)

    

      if (result.success) {
        router.push("/buyers")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(error)
      console.error("Registration error:", err)
      //console.log(error);
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-0 pt-10 pb-10 bg-white dark:bg-gray-800">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Continue with an account</CardTitle>
        <p className="text-gray-600 dark:text-gray-300 mt-2">You must log in or register to continue.</p>
      </CardHeader>
      <CardContent className="space-y-4">
       

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <Mail className="w-4 h-4 mr-2" />
            Login with Email
          </Button>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={onSwitchToRegister}
            className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline"
          >
            New User? Create New Account
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-900 dark:hover:text-white">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-gray-900 dark:hover:text-white">
            T&Cs
          </a>
        </p>
      </CardContent>
    </Card>
  )
}