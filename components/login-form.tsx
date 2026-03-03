"use client"

import {useState, FormEvent, useEffect} from "react"
import { useSignIn, useClerk } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Logo from "@/components/google-logo";
import {useSearchParams} from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signIn, isLoaded } = useSignIn()
  const { setActive, openSignIn } = useClerk()
  const searchParams = useSearchParams()


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
    }
  }, [searchParams])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else {
        setError("Additional authentication is required.")
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ??
        "Unable to sign in with those credentials."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGithub = async () => {
    if (!isLoaded) return
    await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/login/callback",
        redirectUrlComplete: "/",
      })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">
            {error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={() =>*/}
            {/*    openSignIn({ strategy: "reset_password_email_code" })*/}
            {/*  }*/}
            {/*  className="ml-auto text-sm underline-offset-4 hover:underline"*/}
            {/*>*/}
            {/*  Forgot your password?*/}
            {/*</button>*/}
          </div>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading || !isLoaded}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-muted dark:*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={signInWithGithub}
            disabled={!isLoaded}
          >
            <Logo/>

            Login with Google
          </Button>

          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
