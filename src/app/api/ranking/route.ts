import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * User preferences for ranking attractions.
 */
interface UserPreferences {
  type_of_group: string;
  destination: string;
  age: number;
  budget: string;
  themes: string[];
  days: number;
}

/**
 * Attraction data structure for ranking context.
 */
interface Attraction {
  id: string;
  name: string;
  destination: string;
  themes: string[];
  budget_level: string;
  age_suitability: string;
  group_suitability: string;
}





/**
 * POST handler for attraction ranking.
 * Uses AI to rank attractions based on user profile and preferences.
 * 
 * @param request - Next.js request object containing UserPreferences.
 * @returns JSON array of ranked attraction IDs.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.DS_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing DS_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      type_of_group,
      destination,
      age,
      budget,
      themes,
      days
    }: UserPreferences = body;

    // Validate required fields
    if (!destination || !days) {
      return NextResponse.json(
        { success: false, error: 'Destination and days are required' },
        { status: 400 }
      );
    }

    // Load attractions from CSV
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const allAttractions: Attraction[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    }).map((row: any) => ({
      id: row.A_id || row.id || row.ID,
      name: row.Attraction || row.name || row.Name,
      destination: row.Place || row.destination || row.Destination,
      themes: (row.Travel_Theme || row.themes || row.Themes || '').split(';').map((t: string) => t.trim()).filter((t: string) => t),
      budget_level: 'moderate', // Default since this column doesn't exist in CSV
      age_suitability: 'all', // Default since this column doesn't exist in CSV
      group_suitability: 'all' // Default since this column doesn't exist in CSV
    })).filter(attraction => attraction.id && attraction.name && attraction.destination);

    // Debug: Log first few attractions to see the data structure
    console.log('First 3 attractions:', allAttractions.slice(0, 3));
    console.log('Looking for destination:', destination);

    // Filter attractions by destination
    const destinationAttractions = allAttractions.filter(attraction => {
      if (!attraction.destination) {
        console.log('Attraction missing destination:', attraction);
        return false;
      }
      return attraction.destination.toLowerCase().includes(destination.toLowerCase());
    });

    if (destinationAttractions.length === 0) {
      return NextResponse.json(
        { success: false, error: `No attractions found for destination: ${destination}` },
        { status: 404 }
      );
    }

    console.log(`Found ${destinationAttractions.length} attractions for ${destination}`);

    // Create detailed attraction mapping for the prompt (ALL destination attractions)
    const attractionMapping = destinationAttractions
      .map(attraction => {
        const themes = attraction.themes.join(', ') || 'N/A';
        const budget = attraction.budget_level || 'N/A';
        const ageGroup = attraction.age_suitability || 'N/A';
        const groupType = attraction.group_suitability || 'N/A';
        return `${attraction.id}: "${attraction.name}" - Themes: ${themes} - Budget: ${budget} - Age: ${ageGroup} - Group: ${groupType}`;
      })
      .join('\n');

    const rankingPrompt = `You are an expert travel planner tasked with ranking attractions for a personalized itinerary.

**User Profile:**
- Group Type: ${type_of_group}
- Age: ${age}
- Budget Level: ${budget}
- Preferred Themes: ${themes ? themes.join(', ') : 'All'}
- Trip Duration: ${days} days
- Destination: ${destination}

**Available Attractions:**
${attractionMapping}

**Task:** From ALL the available attractions above, intelligently filter and select up to ${4 * days} attractions that best match the user's profile and preferences. If fewer than ${4 * days} attractions are available, select all suitable ones without duplicates.

**Ranking Criteria:**
1. **Theme Alignment**: Prioritize attractions matching user's preferred themes
2. **Budget Compatibility**: Consider attractions suitable for the user's budget level
3. **Group Suitability**: Select attractions appropriate for the group type and age
4. **Quality & Significance**: Choose well-known, highly-rated attractions
5. **Variety & Balance**: Ensure diverse experiences across different categories
6. **Practical Considerations**: Consider accessibility and logistics

**Critical Instructions:**
1. Return ONLY a JSON array of attraction IDs (e.g., ["A001", "A002", "A003"])
2. Select up to ${4 * days} attractions from the complete list (never use duplicates)
3. Apply intelligent filtering based on user preferences
4. Rank from most suitable to least suitable
5. Do not include any explanations or additional text
6. If fewer attractions are available than requested, return all suitable ones without duplicates

**Example Response Format:**
["A123", "A456", "A789"]

**Important:** You must filter and select the best attractions yourself - do not just pick the first ones in the list.

Provide your ranking now:`;

    // Log the ranking process start
    console.log('🎯 RANKING PROCESS - Starting AI-Powered Attraction Ranking:', {
      destination,
      totalAttractions: destinationAttractions.length,
      travelerType: type_of_group,
      budget,
      themes,
      days,
      maxAttractions: Math.min(4 * days, destinationAttractions.length),
      timestamp: new Date().toISOString()
    });

    // Use AI-powered ranking algorithm
    console.log('🤖 RANKING PROCESS - Using OpenRouter AI for Intelligent Ranking');

    try {
      // Call OpenRouter AI API for intelligent ranking
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DS_KEY}`,
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Quick AI Itinerary',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'user',
              content: rankingPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300,
          top_p: 0.9
        })
      });

      console.log('📡 RANKING PROCESS - AI API Response:', {
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ RANKING PROCESS - AI API Error:', {
          status: response.status,
          error: errorText,
          timestamp: new Date().toISOString()
        });

        // Handle rate limit errors specifically
        if (response.status === 429) {
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: { message: errorText } };
          }

          const resetTime = errorData.error?.metadata?.reset_time || 'unknown';
          throw new Error(`Rate limit exceeded. The daily free tier limit (50 requests/day) has been reached. Service will reset at ${new Date(resetTime * 1000).toLocaleString()} or you can add credits to your OpenRouter account.`);
        }

        throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const rankingResponse = aiResponse.choices[0]?.message?.content;

      if (!rankingResponse) {
        throw new Error('No content received from AI API');
      }

      console.log('🤖 RANKING PROCESS - AI Response:', {
        responseLength: rankingResponse.length,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      });

      // Parse the AI response to extract ranked IDs
      const jsonArrayRegex = /\[(?:\s*"[^"]*"\s*(?:,\s*"[^"]*"\s*)*)\]/;
      const match = rankingResponse.match(jsonArrayRegex);

      if (!match) {
        console.log('❌ RANKING PROCESS - Failed to parse AI response:', rankingResponse);
        throw new Error('Invalid AI response format - no JSON array found');
      }

      const jsonStr = match[0];
      const finalRankedIds = JSON.parse(jsonStr);

      // Validate that all returned IDs exist in our attractions
      const validIds = finalRankedIds.filter((id: string) =>
        destinationAttractions.some(attr => attr.id === id)
      );

      console.log('✅ RANKING PROCESS - AI Ranking Complete:', {
        aiRankedCount: finalRankedIds.length,
        validatedCount: validIds.length,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        rankedIds: validIds,
        timestamp: new Date().toISOString()
      });

      console.log('🏆 RANKING PROCESS - AI-Ranked Attractions:');
      validIds.forEach((id: string, index: number) => {
        const attraction = destinationAttractions.find(attr => attr.id === id);
        if (attraction) {
          console.log(`  ${index + 1}. ${id}: ${attraction.name}`);
        }
      });

      if (validIds.length === 0) {
        throw new Error('No valid attraction IDs returned from AI ranking');
      }

      // Return just the array of ranked IDs as expected
      return NextResponse.json(validIds);

    } catch (aiError) {
      console.error('❌ RANKING PROCESS - AI Ranking Failed:', aiError);

      // Fallback to rule-based ranking if AI fails
      console.log('🔄 RANKING PROCESS - Falling back to Rule-Based Algorithm');

      const scoredAttractions = destinationAttractions.map(attraction => {
        let score = 0;

        // Theme matching (highest priority)
        if (themes && themes.length > 0) {
          const attractionThemes = attraction.themes.map(t => t.toLowerCase());
          const userThemes = themes.map(t => t.toLowerCase());
          const themeMatches = userThemes.filter(theme =>
            attractionThemes.some(aTheme => aTheme.includes(theme) || theme.includes(aTheme))
          ).length;
          score += themeMatches * 10;
        }

        // Budget compatibility
        if (budget) {
          const budgetLower = budget.toLowerCase();
          const attractionBudget = attraction.budget_level.toLowerCase();
          if (attractionBudget.includes(budgetLower) || budgetLower.includes(attractionBudget)) {
            score += 5;
          }
        }

        // Group suitability
        if (type_of_group) {
          const groupLower = type_of_group.toLowerCase();
          const attractionGroup = attraction.group_suitability.toLowerCase();
          if (attractionGroup.includes(groupLower) || groupLower.includes(attractionGroup) || attractionGroup.includes('all')) {
            score += 3;
          }
        }

        // Age suitability
        if (age) {
          const attractionAge = attraction.age_suitability.toLowerCase();
          if (attractionAge.includes('all') ||
            (age >= 18 && attractionAge.includes('adult')) ||
            (age < 18 && attractionAge.includes('child'))) {
            score += 2;
          }
        }

        score += Math.random() * 0.5;
        return { ...attraction, score };
      });

      const maxAttractions = Math.min(4 * days, scoredAttractions.length);
      const sortedAttractions = scoredAttractions.sort((a, b) => b.score - a.score);
      const finalRankedIds = sortedAttractions
        .slice(0, maxAttractions)
        .map(attraction => attraction.id);

      console.log('✅ RANKING PROCESS - Fallback Ranking Complete:', {
        totalScored: scoredAttractions.length,
        topSelected: finalRankedIds.length,
        rankedIds: finalRankedIds,
        timestamp: new Date().toISOString()
      });

      if (finalRankedIds.length === 0) {
        throw new Error('No valid attraction IDs returned from ranking');
      }

      return NextResponse.json(finalRankedIds);
    }

  } catch (error) {
    console.error('Ranking API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}