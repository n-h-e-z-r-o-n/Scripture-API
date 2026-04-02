# <p align="center">Scripture-API</p>

<p align="center">
  A highly efficient, serverless-ready REST API for querying Bible verses, chapters, and metadata—built on Next.js App Router.
</p>

<p align="center">
  <a href="#table-of-contents"><img src="https://img.shields.io/badge/Docs-Ready-5f7adb" alt="Docs"></a>
  <a href="#legal--responsible-use"><img src="https://img.shields.io/badge/Legal-Read_Before_Use-d9534f" alt="Legal"></a>
  <a href="#license-recommendation"><img src="https://img.shields.io/badge/License-Guidance-4b9b68" alt="License Guidance"></a>
</p>

## Legal & Responsible Use

> [!CAUTION]
> Read this section before using or deploying the project.
>
> - **Educational, personal, and research use only.**
> - **Copyright on Translations:** While many historical translations (like the KJV or ASV) are in the public domain, contemporary translations (like the NIV, ESV, NLT) are heavily copyrighted by their respective publishers.
> - **Your responsibility:** You are solely responsible for ensuring you have the legal right or appropriate licenses to use, host, and distribute any specific Bible translation datasets within the `/data` directory of your deployment.
> - **No provided datasets:** This repository does not distribute copyrighted religious texts. It is merely a technical routing engine designed to parse any structurally identical valid JSON file.

## <span id="table-of-contents">Table of Contents</span>

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Deployment Notes](#deployment-notes)
- [Clone vs Fork Guidance](#clone-vs-fork-guidance)
- [License Recommendation](#license-recommendation)
- [Documentation](#documentation)

## Overview

`Scripture-API` is a high-performance Next.js API service designed to provide instantaneous JSON responses for local Bible translation datasets. It lazily loads datasets into server memory, negating the need for a database, and exposes highly structured dynamic REST endpoints for books, chapters, daily verses, and robust search functionality.

## Key Features

- **Blazing Fast**: Serves data directly from local memory using Next.js App Router, requiring no external database lookup.
- **Dynamic Translation Support**: Automatically parses any `.json` file placed into the `/data` directory and serves it dynamically at `/api/[bible]/`.
- **Comprehensive API**: Granular fetching mechanisms including endpoints for books, chapters, passages, metadata, statistics, and full-text search.
- **Serverless Ready**: Designed cleanly to be deployed directly to Vercel and leverage Edge caching mechanisms out of the box.

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/) 18+ recommended
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/n-h-e-z-r-o-n/Scripture-API.git
cd Scripture-API
npm install
npm run dev
```

Server default runs at: `http://localhost:3000`

## Usage Examples

```bash
# Check available Bible versions
curl "http://localhost:3000/api/versions"

# Fetch a book from the KJV Bible
curl "http://localhost:3000/api/KJV/book?book=Genesis"

# Fetch a specific verse from the ASV
curl "http://localhost:3000/api/ASV/verse?book=John&chapter=3&verse=16"

# Global Search in the KJV
curl "http://localhost:3000/api/KJV/search?q=faith"
```

## Deployment Notes

- Deploy seamlessly using [Vercel](https://vercel.com).
- No database variables are required since this utilizes the local `/data` directory. 
- You can heavily cache responses by using Next.js standard cache control semantics to limit processing compute on serverless environments.
- Be extremely mindful of the copyright status of files you upload or commit into your `/data` folder on public remote repositories.

## Clone vs Fork Guidance

If you only want a personal version with private tweaks, prefer `git clone` over a public fork.

- **Clone** keeps your copy local/private and reduces unnecessary visibility.
- **Fork** creates a public descendant graph and increases discoverability.
- If you plan to contribute, fork and open a PR as usual.

## License Recommendation

This repository handles its own software engine under **MIT** (simple, permissive, and includes strong no-warranty language).

If you want stricter policy options:
- **Apache-2.0**: adds explicit patent terms plus no-warranty clauses.
- **AGPL-3.0**: requires source disclosure for networked modifications.

No open-source license removes all liability. Your README disclaimers, deployment policy, and operational controls still matter. Any data you parse through the engine is subject to independent copyright.

---

## <span id="documentation">📚 API Documentation</span>

The endpoints exposed below feature examples using the standard [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

<details>
<summary>

### `GET` Available Versions

</summary>

#### Endpoint

```bash
/api/versions
```

#### Request Sample

```javascript
const resp = await fetch("/api/versions");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  versions: ["KJV", "ASV"]
}
```

[🔼 Back to Top](#table-of-contents)

</details>


<details>
<summary>

### `GET` Bible Metadata

</summary>

#### Endpoint

```bash
/api/[bible]/metadata
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/metadata");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  name: "King James Version",
  abbreviation: "KJV",
  language: "English"
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Fetch a Chapter

</summary>

#### Endpoint

```bash
/api/[bible]/chapter?book={bookName}&chapter={chapterNumber}
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/chapter?book=Genesis&chapter=1");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Genesis",
  chapter: 1,
  verses: [
    {
      verse: 1,
      text: "In the beginning God created the heaven and the earth."
    },
    // ...
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Fetch a Verse

</summary>

#### Endpoint

```bash
/api/[bible]/verse?book={bookName}&chapter={chapterNumber}&verse={verseNumber}
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/verse?book=John&chapter=3&verse=16");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "John",
  chapter: 3,
  verse: 16,
  text: "For God so loved the world..."
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Search the Bible

</summary>

#### Endpoint

```bash
/api/[bible]/search?q={query}
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/search?q=grace");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  query: "grace",
  results: [
    {
      book: "Genesis",
      chapter: 6,
      verse: 8,
      text: "But Noah found grace in the eyes of the LORD."
    },
    // ...
  ],
  total: 170
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Global API Health

</summary>

#### Endpoint

```bash
/api/health
```

#### Request Sample

```javascript
const resp = await fetch("/api/health");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  status: "OK",
  uptime: 123456
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Bible Health Check

</summary>

#### Endpoint

```bash
/api/[bible]/health
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/health");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  bible: "KJV",
  status: "available"
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Book Order

</summary>

#### Endpoint

```bash
/api/[bible]/bookOrder
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/bookOrder");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  order: ["Genesis", "Exodus", "Leviticus", "..."]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` All Books Index

</summary>

#### Endpoint

```bash
/api/[bible]/books
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/books");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  books: ["Genesis", "Exodus", "Leviticus", "..."]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Fetch an Entire Book

</summary>

#### Endpoint

```bash
/api/[bible]/book?book={bookName}
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/book?book=Jude");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Jude",
  chapters: [
    {
      chapter: 1,
      verses: [ /* array of verses */ ]
    }
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Fetch a Passage

</summary>

#### Endpoint

```bash
/api/[bible]/passage?ref={passageReference}
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/passage?ref=John 3:16-18");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  reference: "John 3:16-18",
  text: [
    { verse: 16, text: "For God so loved..." },
    { verse: 17, text: "For God sent not..." },
    { verse: 18, text: "He that believeth..." }
  ]
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Random Verse

</summary>

#### Endpoint

```bash
/api/[bible]/random
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/random");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Proverbs",
  chapter: 3,
  verse: 5,
  text: "Trust in the LORD with all thine heart..."
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Verse of the Day

</summary>

#### Endpoint

```bash
/api/[bible]/daily
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/daily");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Psalms",
  chapter: 118,
  verse: 24,
  text: "This is the day which the LORD hath made..."
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Translation Summary

</summary>

#### Endpoint

```bash
/api/[bible]/summary
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/summary");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  totalBooks: 66,
  totalChapters: 1189,
  totalVerses: 31102
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Book Summary

</summary>

#### Endpoint

```bash
/api/[bible]/summary/[book]
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/summary/Genesis");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Genesis",
  totalChapters: 50,
  totalVerses: 1533
}
```

[🔼 Back to Top](#table-of-contents)

</details>

<details>
<summary>

### `GET` Chapter Summary

</summary>

#### Endpoint

```bash
/api/[bible]/summary/[book]/[chapter]
```

#### Request Sample

```javascript
const resp = await fetch("/api/KJV/summary/Genesis/1");
const data = await resp.json();
console.log(data);
```

#### Response Schema

```javascript
{
  book: "Genesis",
  chapter: 1,
  verses: 31
}
```

[🔼 Back to Top](#table-of-contents)

</details>
