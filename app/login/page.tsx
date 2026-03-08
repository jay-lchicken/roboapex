"use client"

import Link from "next/link"
import {SignInButton, useUser} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {useRouter} from "next/navigation";

export default function LoginPage() {
  const {user} = useUser();
  const router = useRouter()
  if (user){
    router.push("/dashboard")

  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-primary-foreground">
              <img src="/logo-2.svg" className="size-6" alt="Robotics@Apex logo" />
            </div>
            Robotics@Apex
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-3 text-center">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Click on the button below to sign in
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">Sign In</Button>
            </SignInButton>
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/front1.png"
          alt="Robotics class"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
