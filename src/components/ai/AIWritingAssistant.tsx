'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MarkdownIt from 'markdown-it';
import { 
  Sparkles, 
  FileText, 
  Search, 
  BarChart3, 
  CheckCircle, 
  Loader2,
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react';

interface AIWritingAssistantProps {
  onContentGenerated?: (content: string) => void;
  onSEOSuggestions?: (suggestions: {score: number; suggestions: string[]}) => void;
}

export default function AIWritingAssistant({ 
  onContentGenerated, 
  onSEOSuggestions 
}: AIWritingAssistantProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [readabilityScore, setReadabilityScore] = useState<any>(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(true);

  // Initialize markdown parser
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });

  const tabs = [
    { id: 'generate', label: 'Generate Content', icon: Sparkles },
    { id: 'outline', label: 'Create Outline', icon: FileText },
    { id: 'seo', label: 'SEO Optimize', icon: Target },
    { id: 'readability', label: 'Readability', icon: BarChart3 },
    { id: 'plagiarism', label: 'Plagiarism Check', icon: Search }
  ];

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prompt,
          options: {
            maxTokens: 1000,
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.data.content);
        onContentGenerated?.(data.data.content);
      } else {
        console.error('Content generation failed:', data.message);
      }
    } catch (error) {
      console.error('Content generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOutline = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          topic: prompt,
          targetAudience: 'general'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.data.outline);
        onContentGenerated?.(data.data.outline);
      }
    } catch (error) {
      console.error('Outline generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSEOSuggestions = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/seo-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: prompt,
          title: 'Blog Post Title'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSeoSuggestions(data.data.suggestions);
        onSEOSuggestions?.(data.data.suggestions);
      }
    } catch (error) {
      console.error('SEO suggestions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkReadability = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/readability-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: prompt })
      });

      const data = await response.json();
      
      if (data.success) {
        setReadabilityScore(data.data);
      }
    } catch (error) {
      console.error('Readability check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = () => {
    switch (activeTab) {
      case 'generate':
        generateContent();
        break;
      case 'outline':
        generateOutline();
        break;
      case 'seo':
        generateSEOSuggestions();
        break;
      case 'readability':
        checkReadability();
        break;
      case 'plagiarism':
        // Implement plagiarism check
        break;
      default:
        break;
    }
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'generate':
        return 'Enter a topic or prompt for content generation...';
      case 'outline':
        return 'Enter a blog topic to create an outline...';
      case 'seo':
        return 'Paste your content here for SEO analysis...';
      case 'readability':
        return 'Paste your content here to check readability...';
      case 'plagiarism':
        return 'Paste your content here to check for plagiarism...';
      default:
        return 'Enter your text here...';
    }
  };

  const getActionButtonText = () => {
    switch (activeTab) {
      case 'generate':
        return 'Generate Content';
      case 'outline':
        return 'Create Outline';
      case 'seo':
        return 'Analyze SEO';
      case 'readability':
        return 'Check Readability';
      case 'plagiarism':
        return 'Check Plagiarism';
      default:
        return 'Process';
    }
  };

  return (
    <div className="border-2 border-purple-300 dark:border-purple-400 rounded-lg bg-purple-50 dark:bg-purple-100 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="border-b-2 border-purple-200 dark:border-purple-300 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-900">AI Writing Assistant</h3>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-purple-200 dark:bg-purple-200 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-lg ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-300'
                    : 'bg-purple-300 dark:bg-purple-300 hover:bg-purple-400 dark:hover:bg-purple-400 text-purple-900 dark:text-purple-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 bg-white dark:bg-purple-50">
        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-900 dark:text-purple-900 font-bold">
            {activeTab === 'generate' && 'Content Prompt'}
            {activeTab === 'outline' && 'Blog Topic'}
            {activeTab === 'seo' && 'Content to Analyze'}
            {activeTab === 'readability' && 'Content to Check'}
            {activeTab === 'plagiarism' && 'Content to Check'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholderText()}
            className="w-full h-32 px-3 py-2 border-2 border-purple-300 dark:border-purple-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-purple-50 text-purple-900 dark:text-purple-900 shadow-md hover:shadow-lg transition-all"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {getActionButtonText()}
            </>
          )}
        </Button>

        {/* Results */}
        {generatedContent && (activeTab === 'generate' || activeTab === 'outline') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-purple-900 dark:text-purple-900 font-bold">
                Generated Content
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                  className="text-xs bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400"
                >
                  {showMarkdownPreview ? 'Show Raw' : 'Show Formatted'}
                </Button>
              </div>
            </div>

            {showMarkdownPreview ? (
              <div className="bg-white dark:bg-purple-50 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-400 shadow-lg">
                <div
                  className="prose prose-lg max-w-none blog-content"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    lineHeight: '1.8',
                    color: '#2d3748'
                  }}
                  dangerouslySetInnerHTML={{ __html: md.render(generatedContent) }}
                />
              </div>
            ) : (
              <div className="bg-purple-50 dark:bg-purple-100 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-400 shadow-md">
                <pre className="whitespace-pre-wrap text-sm text-purple-900 dark:text-purple-900 font-mono">{generatedContent}</pre>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContentGenerated?.(generatedContent)}
                className="bg-green-200 dark:bg-green-200 hover:bg-green-300 dark:hover:bg-green-300 text-green-900 dark:text-green-900 border-green-400 font-bold shadow-md hover:shadow-lg transition-all"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Use This Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  alert('Content copied to clipboard!');
                }}
                className="bg-blue-200 dark:bg-blue-200 hover:bg-blue-300 dark:hover:bg-blue-300 text-blue-900 dark:text-blue-900 border-blue-400 font-bold shadow-md hover:shadow-lg transition-all"
              >
                Copy Content
              </Button>
            </div>
          </div>
        )}

        {/* SEO Suggestions */}
        {seoSuggestions && activeTab === 'seo' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-purple-900 dark:text-purple-900 font-bold">
              SEO Suggestions
            </label>
            <div className="bg-white dark:bg-purple-50 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-400 shadow-lg">
              <div
                className="prose prose-lg max-w-none blog-content"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  lineHeight: '1.8',
                  color: '#2d3748'
                }}
                dangerouslySetInnerHTML={{
                  __html: md.render(typeof seoSuggestions === 'string' ? seoSuggestions : JSON.stringify(seoSuggestions, null, 2))
                }}
              />
            </div>
          </div>
        )}

        {/* Readability Score */}
        {readabilityScore && activeTab === 'readability' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-purple-900 dark:text-purple-900 font-bold">
              Readability Analysis
            </label>
            <div className="bg-white dark:bg-purple-50 rounded-lg p-6 border-2 border-purple-300 dark:border-purple-400 shadow-lg space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <span className="text-sm font-bold text-purple-900">Readability Score</span>
                <span className={`text-2xl font-bold ${
                  readabilityScore.score >= 70 ? 'text-green-600' :
                  readabilityScore.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(readabilityScore.score)}
                </span>
              </div>
              <div className="text-sm text-purple-700 font-semibold">
                Level: {readabilityScore.level}
              </div>
              {readabilityScore.stats && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="font-bold text-purple-900">Sentences:</span> {readabilityScore.stats.sentences}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="font-bold text-purple-900">Words:</span> {readabilityScore.stats.words}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="font-bold text-purple-900">Avg Sentence Length:</span> {readabilityScore.stats.avgSentenceLength}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="font-bold text-purple-900">Avg Syllables/Word:</span> {readabilityScore.stats.avgSyllablesPerWord}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
