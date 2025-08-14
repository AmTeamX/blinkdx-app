"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { PublicPage } from "@/components/AuthWrapper";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/");
  };

  return (
    <PublicPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              BlinkDX
            </h1>
            <p className="text-gray-600">Medical Diagnostic Platform</p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />

          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2024 BlinkDX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
