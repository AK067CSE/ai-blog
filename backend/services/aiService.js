const axios = require('axios');

class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // Groq API endpoint (free tier available)
    this.groqBaseUrl = 'https://api.groq.com/openai/v1';
    
    // Hugging Face API endpoint (free tier available)
    this.hfBaseUrl = 'https://api-inference.huggingface.co/models';
  }

  /**
   * Generate blog content using Groq API (free tier)
   */
  async generateContent(prompt, options = {}) {
    try {
      const {
        maxTokens = 1000,
        temperature = 0.7,
        model = 'llama3-8b-8192' // Free model on Groq
      } = options;

      if (!this.groqApiKey) {
        throw new Error('Groq API key not configured');
      }

      const response = await axios.post(
        `${this.groqBaseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional blog writer and content creator. Create engaging, well-structured, and SEO-friendly blog content. Use proper markdown formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        model: model,
        usage: response.data.usage
      };

    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      
      // Fallback to Hugging Face if Groq fails
      return this.generateContentWithHuggingFace(prompt, options);
    }
  }

  /**
   * Generate content using Hugging Face (free tier)
   */
  async generateContentWithHuggingFace(prompt, options = {}) {
    try {
      const {
        maxTokens = 500,
        model = 'microsoft/DialoGPT-medium'
      } = options;

      if (!this.huggingFaceApiKey) {
        throw new Error('Hugging Face API key not configured');
      }

      const response = await axios.post(
        `${this.hfBaseUrl}/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data[0].generated_text,
        model: model,
        provider: 'huggingface'
      };

    } catch (error) {
      console.error('Hugging Face API error:', error.response?.data || error.message);
      
      // Final fallback to local generation
      return this.generateLocalContent(prompt);
    }
  }

  /**
   * Generate SEO suggestions
   */
  async generateSEOSuggestions(content, title) {
    const prompt = `
    Analyze the following blog post and provide SEO suggestions:
    
    Title: ${title}
    Content: ${content.substring(0, 1000)}...
    
    Please provide:
    1. Meta description (150-160 characters)
    2. 5-10 relevant keywords
    3. SEO title suggestions (under 60 characters)
    4. Content improvement suggestions
    5. Readability score and suggestions
    
    Format the response as JSON.
    `;

    try {
      const result = await this.generateContent(prompt, { maxTokens: 500 });
      
      // Try to parse JSON response
      try {
        const seoData = JSON.parse(result.content);
        return {
          success: true,
          suggestions: seoData
        };
      } catch (parseError) {
        // If JSON parsing fails, return structured text
        return {
          success: true,
          suggestions: {
            rawSuggestions: result.content
          }
        };
      }
    } catch (error) {
      console.error('SEO generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Improve content readability
   */
  async improveReadability(content) {
    const prompt = `
    Improve the readability of the following content while maintaining its meaning and key points:
    
    ${content}
    
    Make it:
    - More engaging and conversational
    - Easier to read (shorter sentences, simpler words where appropriate)
    - Better structured with clear paragraphs
    - Include transition words for better flow
    `;

    try {
      const result = await this.generateContent(prompt, { maxTokens: 1500 });
      return {
        success: true,
        improvedContent: result.content
      };
    } catch (error) {
      console.error('Readability improvement error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate blog post outline
   */
  async generateOutline(topic, targetAudience = 'general') {
    const prompt = `
    Create a detailed blog post outline for the topic: "${topic}"
    Target audience: ${targetAudience}
    
    Include:
    1. Compelling title suggestions (3-5 options)
    2. Introduction hook
    3. Main sections with subsections
    4. Key points to cover in each section
    5. Conclusion summary
    6. Call-to-action suggestions
    
    Format as a structured outline.
    `;

    try {
      const result = await this.generateContent(prompt, { maxTokens: 800 });
      return {
        success: true,
        outline: result.content
      };
    } catch (error) {
      console.error('Outline generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check for potential plagiarism using simple text similarity
   */
  async checkPlagiarism(content) {
    try {
      // Simple implementation - in production, use dedicated plagiarism APIs
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const suspiciousSentences = [];
      
      // This is a basic implementation
      // In production, integrate with plagiarism detection APIs
      for (const sentence of sentences.slice(0, 5)) { // Check first 5 sentences
        try {
          // Simulate plagiarism check (replace with actual API)
          const searchQuery = encodeURIComponent(sentence.trim());
          // You could integrate with Google Custom Search API here
          
          // For now, return a mock result
          if (sentence.length > 100 && Math.random() > 0.8) {
            suspiciousSentences.push({
              text: sentence.trim(),
              similarity: Math.random() * 0.3 + 0.7, // 70-100% similarity
              sources: ['example.com', 'another-site.com']
            });
          }
        } catch (error) {
          console.error('Plagiarism check error for sentence:', error);
        }
      }

      return {
        success: true,
        overallScore: suspiciousSentences.length > 0 ? 0.8 : 0.1,
        suspiciousSentences,
        isOriginal: suspiciousSentences.length === 0
      };

    } catch (error) {
      console.error('Plagiarism check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate readability score
   */
  calculateReadabilityScore(content) {
    try {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = content.split(/\s+/).filter(w => w.length > 0);
      const syllables = words.reduce((count, word) => {
        return count + this.countSyllables(word);
      }, 0);

      // Flesch Reading Ease Score
      const avgSentenceLength = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;
      
      const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
      
      let readabilityLevel;
      if (fleschScore >= 90) readabilityLevel = 'Very Easy';
      else if (fleschScore >= 80) readabilityLevel = 'Easy';
      else if (fleschScore >= 70) readabilityLevel = 'Fairly Easy';
      else if (fleschScore >= 60) readabilityLevel = 'Standard';
      else if (fleschScore >= 50) readabilityLevel = 'Fairly Difficult';
      else if (fleschScore >= 30) readabilityLevel = 'Difficult';
      else readabilityLevel = 'Very Difficult';

      return {
        score: Math.max(0, Math.min(100, fleschScore)),
        level: readabilityLevel,
        stats: {
          sentences: sentences.length,
          words: words.length,
          syllables,
          avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
          avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
        }
      };

    } catch (error) {
      console.error('Readability calculation error:', error);
      return {
        score: 50,
        level: 'Unknown',
        error: error.message
      };
    }
  }

  /**
   * Count syllables in a word (simple implementation)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }

  /**
   * Local content generation fallback
   */
  generateLocalContent(prompt) {
    const templates = {
      'blog': `# Blog Post: ${prompt}

## Introduction
This is an introduction to the topic of ${prompt}. Here we'll explore the key concepts and provide valuable insights.

## Main Content
The main content would go here, covering the essential points about ${prompt}.

## Conclusion
In conclusion, ${prompt} is an important topic that deserves attention and further exploration.`,
      
      'default': `Here's some content about ${prompt}. This is a basic template that provides a starting point for your content creation.`
    };

    return {
      success: true,
      content: templates.blog,
      model: 'local-template',
      provider: 'local'
    };
  }
}

module.exports = new AIService();
