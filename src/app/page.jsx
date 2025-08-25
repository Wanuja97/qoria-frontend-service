"use client";

import Image from 'next/image';
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          Sign in to ABT Corporation
        </div>
        
        <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">
          {/* Logo */}
          <div className="relative w-full aspect-[3/1] mb-6">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="relative w-full h-full">
          <Image
            src="/home-bg.webp"
            alt="Background"
            fill
            className="object-fit"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}