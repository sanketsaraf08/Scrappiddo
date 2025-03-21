import os
import time
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from selenium import webdriver
from fastapi.middleware.cors import CORSMiddleware
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from groq import Groq
from typing import Optional

# Set up Groq API client
client = Groq(api_key="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")

# FastAPI app
app = FastAPI(title="Website Scraper API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - for production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global variable to store the latest scraped content
latest_scraped_content = ""
latest_url = ""

# Model for request bodies
class ScrapeRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    user_prompt: str
    use_scraped_content: bool = True

# Function to scrape a website
def scrape_website(url):
    try:
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        # Automatically install and use the correct ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        driver.get(url)
        time.sleep(3)  # Allow some time for JavaScript to load
        page_source = driver.page_source
        driver.quit()

        # Parse with BeautifulSoup
        soup = BeautifulSoup(page_source, "html.parser")
        
        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
            
        # Extract text and clean it
        text = soup.get_text()
        
        # Clean up whitespace and newlines
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping website: {str(e)}")

# API route to scrape website
@app.post("/scrape")
def scrape_endpoint(request: ScrapeRequest):
    global latest_scraped_content, latest_url
    
    scraped_text = scrape_website(request.url)
    latest_scraped_content = scraped_text[:15000]  # Increased limit for more context
    latest_url = request.url
    
    return {
        "content": latest_scraped_content[:1000] + "...",  # Return preview
        "url": latest_url,
        "content_length": len(latest_scraped_content)
    }

# API route to handle AI queries about the scraped content
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    global latest_scraped_content, latest_url
    
    if request.use_scraped_content and not latest_scraped_content:
        return {"response": "No content has been scraped yet. Please scrape a website first."}
    
    # Build prompt with or without the scraped content
    if request.use_scraped_content and latest_scraped_content:
        prompt = f"""
Based on the following content scraped from {latest_url}, please answer this question:
"{request.user_prompt}"

WEBSITE CONTENT:
{latest_scraped_content}

Please only use information contained in the website content to answer the question.
If the answer cannot be found in the content, please say so.
"""
    else:
        # Normal chat without scraped content context
        prompt = request.user_prompt
    
    try:
        # Call the LLM
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            stream=False,
        )
        
        return {"response": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"Error generating response: {str(e)}"}

# API route to check if content has been scraped
@app.get("/scrape/status")
def scrape_status():
    global latest_scraped_content, latest_url
    return {
        "has_content": bool(latest_scraped_content),
        "content_length": len(latest_scraped_content) if latest_scraped_content else 0,
        "url": latest_url if latest_scraped_content else ""
    }

# API route to clear scraped content
@app.post("/scrape/clear")
def clear_scraped_content():
    global latest_scraped_content, latest_url
    latest_scraped_content = ""
    latest_url = ""
    return {"status": "Scraped content cleared successfully"}

# Root endpoint for API health check
@app.get("/")
def read_root():
    return {"status": "API is running", "endpoints": ["/scrape", "/chat", "/scrape/status", "/scrape/clear"]}