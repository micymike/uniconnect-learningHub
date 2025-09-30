# LangSearch API Integration Setup 🔍

LangSearch API has been integrated into your Study Buddy to provide real-time web search results for students.

## 🚀 Quick Setup

1. **Get API Key**:
   - Visit [LangSearch API Documentation](https://docs.langsearch.com/api/web-search-api)
   - Sign up for an account
   - Get your API key from the dashboard

2. **Add to Environment**:
   ```bash
   LANGSEARCH_API_KEY=your_langsearch_api_key_here
   ```

3. **Test Integration**:
   Ask your Study Buddy: *"Search for latest developments in AI"*

## 🔧 How It Works

The Study Buddy now automatically uses LangSearch for queries that start with:
- "who", "what", "when", "where", "why", "how"
- "explain", "define", "tell me about"
- "search", "find", "latest", "recent", "current"

### Example Queries:
- ✅ "What are the latest developments in quantum computing?"
- ✅ "Search for recent climate change research"
- ✅ "Find information about renewable energy trends"

## 📊 Features

- **Real-time Results**: Gets fresh web search results
- **Smart Fallback**: Uses Wikipedia if LangSearch fails
- **Optimized**: Returns top 3 most relevant results
- **Fast**: 8-second timeout for quick responses

## 💡 Benefits for Students

1. **Current Information**: No more outdated data complaints
2. **Comprehensive Results**: Web search + Wikipedia backup
3. **Automatic Detection**: Smart query recognition
4. **Reliable**: Graceful fallback system

## 🛠️ Technical Details

- **Endpoint**: `https://api.langsearch.com/search`
- **Results**: Top 5 results, displays best 3
- **Timeout**: 8 seconds
- **Fallback**: Wikipedia API
- **Format**: Title + snippet for each result

## 🔒 Security

- API key stored securely in environment variables
- No sensitive data logged
- Timeout protection against hanging requests

Your Study Buddy is now powered by real-time web search! 🎉