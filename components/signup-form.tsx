"use client"

import { useState, FormEvent } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"

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
import Logo from "@/components/google-logo"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signUp, isLoaded } = useSignUp()
  const { setActive } = useClerk()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError(null)

    try {
      const result = await signUp.create({
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        emailAddress: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else if (result.status === "missing_requirements") {
        setError("Please complete the verification sent to your email.")
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ??
        "Unable to create account with those credentials."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const signUpWithGoogle = async () => {
    if (!isLoaded) return
    await signUp.authenticateWithRedirect({
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">
            {error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>

        <Field>
          <Button type="submit" disabled={loading || !isLoaded}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-muted dark:*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={signUpWithGoogle}
            disabled={!isLoaded}
          >
            <Logo/>

            Sign up with Google
          </Button>

          <FieldDescription className="text-center">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
