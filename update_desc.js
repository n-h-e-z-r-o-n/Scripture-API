const fs = require('fs');

const path = 'C:\\Users\\user\\Desktop\\Next app\\Scripture-API\\public\\index.html';
let html = fs.readFileSync(path, 'utf8');

const regex = /<div class="endpoint-path">[\s\S]*?<span class="method">GET<\/span>\s*([^<]+)\s*<\/div>[\s\S]*?<\/div>\s*<div class="endpoint-desc">\s*([\s\S]*?)<\/div>/g;

let match;
let newHtml = html;

const newDescriptions = {
  '/api/versions': 'Lists all available Bible translation datasets loaded on the server.',
  '/api/metadata': 'Returns system-level metadata and configuration for the API.',
  '/api/health': 'Checks if the API engine is alive and reports system uptime.',
  '/api/{bible}/summary': 'Aggregates metadata for the entire specified Bible translation.',
  '/api/{bible}/summary/{book}': 'Returns total chapters and verse configurations for a specific book.',
  '/api/{bible}/bookOrder': 'Returns the chronological order of books for the specified translation.',
  '/api/{bible}/summary/{book}/{chapter}': 'Provides verse count and metadata for a specific chapter.',
  '/api/{bible}/book': 'Fetches metadata and an overview of chapters for the specified book.',
  '/api/{bible}/chapter': 'Retrieves all verses within a specific chapter.',
  '/api/{bible}/verse': 'Fetches the exact text of a specified verse.',
  '/api/{bible}/search?q={query}': 'Executes a global text search across the specified translation.',
  'GET /api/{bible}/search?q={query}': 'Executes a global text search across the specified translation.',
  '/api/{bible}/topic/{keyword}': 'Retrieves a curated list of verses relating to a specific topic or theme.',
  '/api/{bible}/books': 'Returns a simple list of all books available in the active translation.',
  '/api/{bible}/random': 'Fetches a strictly random verse from the active translation.',
  '/api/{bible}/random/{book}': 'Fetches a strictly random verse from the specified book.',
  '/api/{bible}/random/old-testament': 'Fetches a random verse exclusively from the Old Testament (39 books).',
  '/api/{bible}/random/new-testament': 'Fetches a random verse exclusively from the New Testament (27 books).',
  '/api/{bible}/passage?book={book}&chapter={chapter}&start={start}&end={end}': 'Retrieves a contiguous block of verses across a chapter.',
  'GET /api/{bible}/passage?book={book}&chapter={chapter}&start={start}&end={end}': 'Retrieves a contiguous block of verses across a chapter.',
  '/app/api/[bible]/ref/[reference]': 'Parses human-readable strings (e.g., "John 3:16") into verse text.',
  '/api/[bible]/ref/[reference]': 'Parses human-readable strings (e.g., "John 3:16") into verse text.'
};

html = html.replace(regex, (match, endpointPath, oldDesc) => {
  let cleanPath = endpointPath.trim().replace(/^GET\s*/g, '').trim();
  if (newDescriptions[cleanPath]) {
    return match.replace(oldDesc, newDescriptions[cleanPath] + '\n');
  }
  return match;
});

// Fix any leftover "GET GET" in endpoint paths
html = html.replace(/<span class="method">GET<\/span>\s*GET\s*/g, '<span class="method">GET</span> ');

fs.writeFileSync(path, html);
console.log('Successfully updated HTML descriptions.');
