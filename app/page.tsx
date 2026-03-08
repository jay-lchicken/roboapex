"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { 
  ArrowRight,
  Users,
  Calendar,
  BarChart,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image"

const carouselImages = [
  { src: "/caro1.png", alt: "Robotics@Apex activity 1" },
  { src: "/caro2.png", alt: "Robotics@Apex activity 2" },
  { src: "/caro3.png", alt: "Robotics@Apex activity 3" },
] as const

export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-14 items-center">
          <div className="mr-4 flex flex-1">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Robotics@Apex</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">

              <Link href="#about" className="text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="#stats" className="text-muted-foreground transition-colors hover:text-foreground">
                Stats
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col space-y-3 p-4">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Stats
              </Link>

            </nav>
          </div>
        )}
      </header>

      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto flex flex-col items-center gap-4 text-center">
          <div className="mt-2 w-full max-w-4xl">
            <Carousel opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {carouselImages.map((item) => (
                  <CarouselItem key={item.src}>
                    <div className="h-[260px] overflow-hidden rounded-xl border bg-muted/20 sm:h-[340px] md:h-[420px]">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={1200}
                        height={675}
                        className="h-full w-full object-cover"
                        priority={item.src === "/caro1.png"}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Attendance tracking for
            <br />
            <span className="text-primary">Robotics@Apex</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Simple, efficient attendance management for Robotics@Apex.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Open Attendance Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin-dashboard">
              <Button size="lg" variant="outline">
                For attendance takers
              </Button>
            </Link>

          </div>

        </div>
      </section>

      <section id="stats" className="border-y bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <span className="text-3xl font-bold">100+</span>
              <span className="text-sm text-muted-foreground">Active Members</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <span className="text-3xl font-bold">0+</span>
              <span className="text-sm text-muted-foreground">Sessions Tracked</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart className="h-8 w-8 text-muted-foreground" />
              <span className="text-3xl font-bold">0%</span>
              <span className="text-sm text-muted-foreground">Attendance Rate</span>
            </div>

          </div>
        </div>
      </section>



      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-[600px] flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sign in now!
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg">Open Attendance Dashboard</Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2026 Robotics@Apex. All rights reserved.
            </p>

          </div>
        </div>
      </footer>
    </div>
  );
}
