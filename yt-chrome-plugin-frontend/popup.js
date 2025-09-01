// Function to decode HTML entities
function decodeHTMLEntities(text) {
  if (!text) return '';
  
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…'
  };
  
  return text.replace(/&(amp|lt|gt|quot|#x27|#x2F|#x60|nbsp|copy|reg|trade|hellip);/g, 
    (match, entity) => entities[`&${entity};`] || match
  );
}

// popup.js - Enhanced YouTube Comment Insights Extension

document.addEventListener("DOMContentLoaded", async () => {
  const outputDiv = document.getElementById("output");
  const API_KEY = 'AIzaSyAOW0GQW0ikEsVh7OUQJ2bpSghG1FpqC_I'
  // const API_URL = 'http://my-elb-2062136355.us-east-1.elb.amazonaws.com:80';   
  const API_URL = 'http://localhost:5000/';

  // Utility function to create loading indicator
  function createLoadingElement(message) {
    return `
      <div class="loading pulse">
        <div class="spinner"></div>
        <span>${message}</span>
      </div>
    `;
  }

  // Utility function to format sentiment display
  function formatSentimentLabel(sentiment) {
    const sentimentMap = {
      '1': { label: 'Positive', class: 'sentiment-positive' },
      '0': { label: 'Neutral', class: 'sentiment-neutral' },
      '-1': { label: 'Negative', class: 'sentiment-negative' }
    };
    return sentimentMap[sentiment] || { label: 'Unknown', class: 'sentiment-neutral' };
  }

  // Utility function to format numbers with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Utility function to format timestamps
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }

  // Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = tabs[0].url;
    const youtubeRegex = /^https:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      
      // Enhanced initial display
      outputDiv.innerHTML = `
        <div class="section-title">📹 Video Analysis</div>
        <div class="video-info">
          <span>Video ID:</span>
          <span class="video-id">${videoId}</span>
        </div>
        ${createLoadingElement("Fetching comments from YouTube API...")}
      `;

      try {
        const comments = await fetchComments(videoId);
        
        if (comments.length === 0) {
          outputDiv.innerHTML = `
            <div class="section-title">❌ No Comments Found</div>
            <div class="error">This video has no comments or comments are disabled.</div>
          `;
          return;
        }

        // Update with fetched comments count
        outputDiv.innerHTML = `
          <div class="section-title">📹 Video Analysis</div>
          <div class="video-info">
            <span>Video ID:</span>
            <span class="video-id">${videoId}</span>
          </div>
          <div class="success">✅ Fetched ${formatNumber(comments.length)} comments successfully!</div>
          ${createLoadingElement("Running AI sentiment analysis...")}
        `;

        const predictions = await getSentimentPredictions(comments);

        if (predictions) {
          // Process the predictions to get sentiment counts and sentiment data
          const sentimentCounts = { "1": 0, "0": 0, "-1": 0 };
          const sentimentData = [];
          const totalSentimentScore = predictions.reduce((sum, item) => sum + parseInt(item.sentiment), 0);
          
          predictions.forEach((item, index) => {
            sentimentCounts[item.sentiment]++;
            sentimentData.push({
              timestamp: item.timestamp,
              sentiment: parseInt(item.sentiment)
            });
          });

          // Compute enhanced metrics
          const totalComments = comments.length;
          const uniqueCommenters = new Set(comments.map(comment => comment.authorId)).size;
          const totalWords = comments.reduce((sum, comment) => 
            sum + comment.text.split(/\s+/).filter(word => word.length > 0).length, 0);
          const avgWordLength = (totalWords / totalComments).toFixed(1);
          const avgSentimentScore = (totalSentimentScore / totalComments).toFixed(2);
          const normalizedSentimentScore = (((parseFloat(avgSentimentScore) + 1) / 2) * 10).toFixed(1);

          // Calculate engagement rate
          const engagementRate = ((uniqueCommenters / totalComments) * 100).toFixed(1);

          // Clear loading and add results
          outputDiv.innerHTML = `
            <div class="section-title">📹 Video Analysis</div>
            <div class="video-info">
              <span>Video ID:</span>
              <span class="video-id">${videoId}</span>
            </div>
          `;

          // Add the Enhanced Comment Analysis Summary section
          outputDiv.innerHTML += `
            <div class="section">
              <div class="section-title">📊 Analysis Summary</div>
              <div class="metrics-container">
                <div class="metric">
                  <div class="metric-title">Total Comments</div>
                  <div class="metric-value">${formatNumber(totalComments)}</div>
                </div>
                <div class="metric">
                  <div class="metric-title">Unique Users</div>
                  <div class="metric-value">${formatNumber(uniqueCommenters)}</div>
                </div>
                <div class="metric">
                  <div class="metric-title">Avg Length</div>
                  <div class="metric-value">${avgWordLength}<span style="font-size: 12px; font-weight: 400;"> words</span></div>
                </div>
                <div class="metric">
                  <div class="metric-title">Sentiment Score</div>
                  <div class="metric-value">${normalizedSentimentScore}<span style="font-size: 12px; font-weight: 400;">/10</span></div>
                </div>
              </div>
            </div>
          `;

          // Add the Sentiment Distribution section
          outputDiv.innerHTML += `
            <div class="section">
              <div class="section-title">🎯 Sentiment Distribution</div>
              <div id="chart-container" class="chart-container">
                ${createLoadingElement("Generating sentiment chart...")}
              </div>
            </div>`;

          // Fetch and display the pie chart
          await fetchAndDisplayChart(sentimentCounts);

          // Add the Sentiment Trend Graph section
          outputDiv.innerHTML += `
            <div class="section">
              <div class="section-title">📈 Sentiment Over Time</div>
              <div id="trend-graph-container" class="trend-graph-container">
                ${createLoadingElement("Generating trend analysis...")}
              </div>
            </div>`;

          // Fetch and display the sentiment trend graph
          await fetchAndDisplayTrendGraph(sentimentData);

          // Add the Word Cloud section
          outputDiv.innerHTML += `
            <div class="section">
              <div class="section-title">☁️ Comment Word Cloud</div>
              <div id="wordcloud-container" class="wordcloud-container">
                ${createLoadingElement("Creating word cloud...")}
              </div>
            </div>`;

          // Fetch and display the word cloud
          await fetchAndDisplayWordCloud(comments.map(comment => comment.text));

          // Add enhanced top comments section
          const topComments = predictions.slice(0, 15);
          outputDiv.innerHTML += `
            <div class="section">
              <div class="section-title">💬 Top Comments Analysis</div>
              <ul class="comment-list">
                ${topComments.map((item, index) => {
                  const sentimentInfo = formatSentimentLabel(item.sentiment);
                  const timestamp = timeAgo(item.timestamp);
                  const decodedComment = decodeHTMLEntities(item.comment); // Decode HTML entities
                  
                  return `
                    <li class="comment-item">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #a78bfa;">#${index + 1}</span>
                        <span style="font-size: 11px; color: #94a3b8;">${timestamp}</span>
                      </div>
                      <div style="margin-bottom: 8px; line-height: 1.4;">${decodedComment}</div>
                      <div class="comment-sentiment ${sentimentInfo.class}">
                        ${sentimentInfo.label}
                      </div>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>`;
        }
      } catch (error) {
        console.error("Error in main process:", error);
        outputDiv.innerHTML = `
          <div class="section-title">❌ Error</div>
          <div class="error">An error occurred while processing the video. Please try again.</div>
        `;
      }
    } else {
      outputDiv.innerHTML = `
        <div class="section-title">⚠️ Invalid URL</div>
        <div class="error">Please navigate to a YouTube video page to analyze comments.</div>
      `;
    }
  });

  async function fetchComments(videoId) {
    let comments = [];
    let pageToken = "";
    let attempts = 0;
    const maxAttempts = 10;
    
    try {
      while (comments.length < 500 && attempts < maxAttempts) {
        attempts++;
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&pageToken=${pageToken}&key=${API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("YouTube API quota exceeded or invalid API key");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          data.items.forEach(item => {
            const snippet = item.snippet.topLevelComment.snippet;
            // Decode HTML entities when storing the comment
            const decodedText = decodeHTMLEntities(snippet.textOriginal || snippet.textDisplay);
            
            comments.push({
              text: decodedText, // Store decoded text
              timestamp: snippet.publishedAt,
              authorId: snippet.authorChannelId?.value || 'Unknown'
            });
          });
        }
        
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
    
    return comments;
  }

  async function getSentimentPredictions(comments) {
    try {
      const response = await fetch(`${API_URL}/predict_with_timestamps`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ comments })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching predictions:", error);
      throw error;
    }
  }

  async function fetchAndDisplayChart(sentimentCounts) {
    try {
      const response = await fetch(`${API_URL}/generate_chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment_counts: sentimentCounts })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart: ${response.status}`);
      }
      
      const blob = await response.blob();
      const imgURL = URL.createObjectURL(blob);
      const chartContainer = document.getElementById('chart-container');
      
      chartContainer.innerHTML = `<img src="${imgURL}" alt="Sentiment Distribution Chart" />`;
    } catch (error) {
      console.error("Error fetching chart:", error);
      const chartContainer = document.getElementById('chart-container');
      chartContainer.innerHTML = `<div class="error">Failed to generate chart visualization.</div>`;
    }
  }

  async function fetchAndDisplayWordCloud(comments) {
    try {
      const response = await fetch(`${API_URL}/generate_wordcloud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch word cloud: ${response.status}`);
      }
      
      const blob = await response.blob();
      const imgURL = URL.createObjectURL(blob);
      const wordcloudContainer = document.getElementById('wordcloud-container');
      
      wordcloudContainer.innerHTML = `<img src="${imgURL}" alt="Comment Word Cloud" />`;
    } catch (error) {
      console.error("Error fetching word cloud:", error);
      const wordcloudContainer = document.getElementById('wordcloud-container');
      wordcloudContainer.innerHTML = `<div class="error">Failed to generate word cloud.</div>`;
    }
  }

  async function fetchAndDisplayTrendGraph(sentimentData) {
    try {
      const response = await fetch(`${API_URL}/generate_trend_graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment_data: sentimentData })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trend graph: ${response.status}`);
      }
      
      const blob = await response.blob();
      const imgURL = URL.createObjectURL(blob);
      const trendGraphContainer = document.getElementById('trend-graph-container');
      
      trendGraphContainer.innerHTML = `<img src="${imgURL}" alt="Sentiment Trend Over Time" />`;
    } catch (error) {
      console.error("Error fetching trend graph:", error);
      const trendGraphContainer = document.getElementById('trend-graph-container');
      trendGraphContainer.innerHTML = `<div class="error">Failed to generate trend analysis.</div>`;
    }
  }
});