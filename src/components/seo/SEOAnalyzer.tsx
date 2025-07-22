'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Target, 
  Eye,
  Clock,
  Hash,
  FileText,
  TrendingUp
} from 'lucide-react';

interface SEOAnalysis {
  readabilityScore: number;
  readabilityGrade: string;
  wordCount: number;
  readingTime: number;
  keywords: string[];
  suggestions: {
    type: 'success' | 'warning' | 'error';
    message: string;
    icon: any;
  }[];
  seoScore: number;
}

interface SEOAnalyzerProps {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  onAnalysisUpdate?: (analysis: SEOAnalysis) => void;
}

export default function SEOAnalyzer({ title, content, excerpt, tags, onAnalysisUpdate }: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-analyze when content changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        performAnalysis();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, excerpt, tags]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Perform both local analysis and AI-enhanced analysis
      const localAnalysis = await analyzeContent(title, content, excerpt, tags);

      // Get AI-powered SEO suggestions
      const aiSuggestions = await getAISEOSuggestions(title, content, excerpt, tags);

      // Combine local and AI analysis
      const enhancedAnalysis = {
        ...localAnalysis,
        suggestions: [...localAnalysis.suggestions, ...aiSuggestions]
      };

      setAnalysis(enhancedAnalysis);
      onAnalysisUpdate?.(enhancedAnalysis);
    } catch (error) {
      console.error('SEO Analysis failed:', error);
      // Fallback to local analysis only
      const fallbackAnalysis = await analyzeContent(title, content, excerpt, tags);
      setAnalysis(fallbackAnalysis);
      onAnalysisUpdate?.(fallbackAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAISEOSuggestions = async (title: string, content: string, excerpt: string, tags: string[]) => {
    try {
      const response = await fetch('/api/ai/seo-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          content: content.replace(/<[^>]*>/g, ''), // Remove HTML tags
          excerpt,
          tags
        })
      });

      if (!response.ok) {
        throw new Error('AI SEO analysis failed');
      }

      const data = await response.json();

      if (data.success && data.data && data.data.suggestions) {
        // Convert AI suggestions to our format
        const aiSuggestions = [];

        if (data.data.suggestions.rawSuggestions) {
          // Handle raw text suggestions
          aiSuggestions.push({
            type: 'success' as const,
            message: `AI Analysis: ${data.data.suggestions.rawSuggestions.substring(0, 200)}...`,
            icon: CheckCircle
          });
        } else {
          // Handle structured suggestions
          if (data.data.suggestions.metaDescription) {
            aiSuggestions.push({
              type: 'success' as const,
              message: `AI suggests meta description: "${data.data.suggestions.metaDescription}"`,
              icon: CheckCircle
            });
          }

          if (data.data.suggestions.keywords && data.data.suggestions.keywords.length > 0) {
            aiSuggestions.push({
              type: 'success' as const,
              message: `AI recommended keywords: ${data.data.suggestions.keywords.slice(0, 5).join(', ')}`,
              icon: CheckCircle
            });
          }

          if (data.data.suggestions.titleSuggestions) {
            aiSuggestions.push({
              type: 'success' as const,
              message: `AI title suggestion: "${data.data.suggestions.titleSuggestions}"`,
              icon: CheckCircle
            });
          }
        }

        return aiSuggestions;
      }

      return [];
    } catch (error) {
      console.error('AI SEO suggestions failed:', error);
      return []; // Return empty array on failure
    }
  };

  const analyzeContent = async (title: string, content: string, excerpt: string, tags: string[]): Promise<SEOAnalysis> => {
    // Remove HTML tags for analysis
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Simple readability score (Flesch Reading Ease approximation)
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
    const avgSyllablesPerWord = 1.5; // Simplified approximation
    
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Determine readability grade
    let readabilityGrade = 'Graduate';
    if (readabilityScore >= 90) readabilityGrade = 'Very Easy';
    else if (readabilityScore >= 80) readabilityGrade = 'Easy';
    else if (readabilityScore >= 70) readabilityGrade = 'Fairly Easy';
    else if (readabilityScore >= 60) readabilityGrade = 'Standard';
    else if (readabilityScore >= 50) readabilityGrade = 'Fairly Difficult';
    else if (readabilityScore >= 30) readabilityGrade = 'Difficult';

    // Extract keywords (simplified)
    const keywords = extractKeywords(plainText, 10);

    // Generate SEO suggestions
    const suggestions = generateSEOSuggestions(title, plainText, excerpt, tags, wordCount, keywords);

    // Calculate overall SEO score
    const seoScore = calculateSEOScore(title, plainText, excerpt, tags, wordCount, readabilityScore);

    return {
      readabilityScore: Math.round(readabilityScore),
      readabilityGrade,
      wordCount,
      readingTime,
      keywords,
      suggestions,
      seoScore
    };
  };

  const extractKeywords = (text: string, limit: number): string[] => {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  };

  const generateSEOSuggestions = (title: string, content: string, excerpt: string, tags: string[], wordCount: number, keywords: string[]) => {
    const suggestions: SEOAnalysis['suggestions'] = [];

    // Title length check
    if (title.length < 30) {
      suggestions.push({
        type: 'warning',
        message: 'Title is too short. Aim for 30-60 characters for better SEO.',
        icon: AlertCircle
      });
    } else if (title.length > 60) {
      suggestions.push({
        type: 'warning',
        message: 'Title is too long. Keep it under 60 characters for better search visibility.',
        icon: AlertCircle
      });
    } else {
      suggestions.push({
        type: 'success',
        message: 'Title length is optimal for SEO.',
        icon: CheckCircle
      });
    }

    // Content length check
    if (wordCount < 300) {
      suggestions.push({
        type: 'error',
        message: 'Content is too short. Aim for at least 300 words for better SEO ranking.',
        icon: XCircle
      });
    } else if (wordCount > 2000) {
      suggestions.push({
        type: 'success',
        message: 'Excellent content length! Long-form content performs well in search.',
        icon: CheckCircle
      });
    } else {
      suggestions.push({
        type: 'success',
        message: 'Good content length for SEO.',
        icon: CheckCircle
      });
    }

    // Excerpt check
    if (!excerpt || excerpt.length < 120) {
      suggestions.push({
        type: 'warning',
        message: 'Add a meta description (excerpt) of 120-160 characters for better search snippets.',
        icon: AlertCircle
      });
    } else if (excerpt.length > 160) {
      suggestions.push({
        type: 'warning',
        message: 'Meta description is too long. Keep it under 160 characters.',
        icon: AlertCircle
      });
    } else {
      suggestions.push({
        type: 'success',
        message: 'Meta description length is perfect.',
        icon: CheckCircle
      });
    }

    // Tags check
    if (tags.length === 0) {
      suggestions.push({
        type: 'warning',
        message: 'Add relevant tags to improve content discoverability.',
        icon: AlertCircle
      });
    } else if (tags.length > 10) {
      suggestions.push({
        type: 'warning',
        message: 'Too many tags. Focus on 3-5 most relevant tags.',
        icon: AlertCircle
      });
    } else {
      suggestions.push({
        type: 'success',
        message: 'Good use of tags for categorization.',
        icon: CheckCircle
      });
    }

    // Keyword density check
    if (keywords.length > 0) {
      const topKeyword = keywords[0];
      const keywordCount = (content.toLowerCase().match(new RegExp(topKeyword, 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;

      if (density < 0.5) {
        suggestions.push({
          type: 'warning',
          message: `Consider using your main keyword "${topKeyword}" more frequently (current density: ${density.toFixed(1)}%).`,
          icon: AlertCircle
        });
      } else if (density > 3) {
        suggestions.push({
          type: 'warning',
          message: `Keyword "${topKeyword}" might be overused (${density.toFixed(1)}%). Aim for 1-3% density.`,
          icon: AlertCircle
        });
      } else {
        suggestions.push({
          type: 'success',
          message: `Good keyword density for "${topKeyword}" (${density.toFixed(1)}%).`,
          icon: CheckCircle
        });
      }
    }

    return suggestions;
  };

  const calculateSEOScore = (title: string, content: string, excerpt: string, tags: string[], wordCount: number, readabilityScore: number): number => {
    let score = 0;

    // Title score (20 points)
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length > 0) score += 10;

    // Content length score (25 points)
    if (wordCount >= 300) score += 25;
    else if (wordCount >= 150) score += 15;
    else if (wordCount > 0) score += 5;

    // Excerpt score (15 points)
    if (excerpt.length >= 120 && excerpt.length <= 160) score += 15;
    else if (excerpt.length > 0) score += 8;

    // Tags score (10 points)
    if (tags.length >= 3 && tags.length <= 5) score += 10;
    else if (tags.length > 0) score += 5;

    // Readability score (30 points)
    if (readabilityScore >= 60) score += 30;
    else if (readabilityScore >= 30) score += 20;
    else score += 10;

    return Math.min(100, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!analysis && !isAnalyzing) {
    return (
      <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-2">SEO Analysis</h3>
          <p className="text-purple-600 dark:text-purple-600 mb-4">
            Start writing to get real-time SEO and readability insights
          </p>
          <Button
            onClick={performAnalysis}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analyze Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">SEO Analysis</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={performAnalysis}
          disabled={isAnalyzing}
          className="bg-purple-200 dark:bg-purple-200 hover:bg-purple-300 dark:hover:bg-purple-300 text-purple-900 dark:text-purple-900 border-purple-400 font-bold"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-purple-600 dark:text-purple-600 font-semibold">Analyzing your content...</p>
        </div>
      ) : analysis && (
        <>
          {/* Overall SEO Score */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-900 dark:text-purple-900">SEO Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                {analysis.seoScore}/100
              </span>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-300 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getScoreBg(analysis.seoScore)}`}
                style={{ width: `${analysis.seoScore}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-3 border border-purple-300 dark:border-purple-400">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900 dark:text-purple-900">Words</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-900">{analysis.wordCount}</p>
            </div>

            <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-3 border border-purple-300 dark:border-purple-400">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900 dark:text-purple-900">Read Time</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-900">{analysis.readingTime} min</p>
            </div>

            <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-3 border border-purple-300 dark:border-purple-400">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900 dark:text-purple-900">Readability</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-900">{analysis.readabilityScore}</p>
            </div>

            <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-3 border border-purple-300 dark:border-purple-400">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900 dark:text-purple-900">Keywords</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-900">{analysis.keywords.length}</p>
            </div>
          </div>

          {/* Readability Grade */}
          <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
            <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-2">Readability Grade</h4>
            <p className="text-purple-800 dark:text-purple-800">
              <span className="font-bold">{analysis.readabilityGrade}</span> 
              <span className="text-sm ml-2">(Score: {analysis.readabilityScore}/100)</span>
            </p>
          </div>

          {/* Top Keywords */}
          {analysis.keywords.length > 0 && (
            <div className="bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
              <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-2">Top Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.slice(0, 8).map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-purple-200 dark:bg-purple-300 text-purple-900 dark:text-purple-900 text-xs rounded-full font-bold"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SEO Suggestions */}
          <div className="space-y-3">
            <h4 className="font-bold text-purple-900 dark:text-purple-900">SEO Suggestions</h4>
            {analysis.suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    suggestion.type === 'success' ? 'bg-green-50 border-green-200' :
                    suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    suggestion.type === 'success' ? 'text-green-600' :
                    suggestion.type === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <p className={`text-sm font-semibold ${
                    suggestion.type === 'success' ? 'text-green-800' :
                    suggestion.type === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {suggestion.message}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
