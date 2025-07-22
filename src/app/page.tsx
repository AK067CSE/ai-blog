import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenTool, Sparkles, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100">
      {/* Header */}
      <header className="border-b-2 border-purple-300 dark:border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenTool className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">BlogCraft AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-white/80 hover:text-white font-semibold transition-colors">Dashboard</Link>
            <Link href="/posts" className="text-white/80 hover:text-white font-semibold transition-colors">Posts</Link>
            <Link href="/editor" className="text-white/80 hover:text-white font-semibold transition-colors">Editor</Link>
            <Link href="/analytics" className="text-white/80 hover:text-white font-semibold transition-colors">Analytics</Link>
            <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            <Button className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/editor">Get Started</Link>
              </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-purple-900 dark:text-purple-900 mb-6">
              Create Amazing Content with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered</span> Blogging
            </h2>
            <p className="text-xl text-purple-700 dark:text-purple-700 mb-8 max-w-2xl mx-auto font-semibold">
              BlogCraft AI combines powerful writing tools, real-time collaboration,
              and intelligent content generation to help you create engaging blog posts faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Input
                placeholder="Enter your email to get started"
                className="max-w-sm border-2 border-purple-300 dark:border-purple-400 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 placeholder:text-purple-500 dark:placeholder:text-purple-600 font-semibold"
              />
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                <Link href="/auth/register">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Writing for Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-900 mb-4">
              Powerful Features for Modern Bloggers
            </h3>
            <p className="text-xl text-purple-700 dark:text-purple-700 max-w-2xl mx-auto font-semibold">
              Everything you need to create, collaborate, and grow your blog audience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border-2 border-purple-300 dark:border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-purple-900 dark:text-purple-900 mb-2">AI Writing Assistant</h4>
              <p className="text-purple-700 dark:text-purple-700 font-semibold">Generate content, improve SEO, and check readability with advanced AI</p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 border-purple-300 dark:border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <PenTool className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-purple-900 dark:text-purple-900 mb-2">Rich Text Editor</h4>
              <p className="text-purple-700 dark:text-purple-700 font-semibold">Beautiful editor with real-time collaboration and version history</p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 border-purple-300 dark:border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-purple-900 dark:text-purple-900 mb-2">Analytics Dashboard</h4>
              <p className="text-purple-700 dark:text-purple-700 font-semibold">Track engagement, traffic sources, and content performance</p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 border-purple-300 dark:border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-purple-900 dark:text-purple-900 mb-2">Team Collaboration</h4>
              <p className="text-purple-700 dark:text-purple-700 font-semibold">Work together in real-time with your team and contributors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-800 to-pink-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PenTool className="h-6 w-6" />
            <span className="text-xl font-bold">BlogCraft AI</span>
          </div>
          <p className="text-purple-200 mb-4 font-semibold">
            The future of content creation is here. Start your blogging journey today.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-purple-200">
            <a href="#" className="hover:text-white font-semibold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white font-semibold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white font-semibold transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
