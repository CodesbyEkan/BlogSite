# BLOG SITE

## DESCRIPTION

The primary goal was to build a functional blog site without a database, using EJS and Express routing templates. This goal was achieved through the cooperation of the members of Group 4

## ARCHETECTURE

**TOOLS AND TECH**

- Node.js
- Express.js
- EJS (Embedded JavaScript templates)
- VS Code (Editor)
- Git & GitHub

**STRUCTURE**

```
BLOGSITE/
    > controllers --> Logic
    > data
    > public --> Template
    > routes --> API endpoints
    > utils
    .gitignore
    index.js
    package-lock.json
    package.joson
    README.md
```

**EJS TEMPLATE**

## HOW IT WORKS

This project is a simple backend application built with _Express.js_ to serve a homepage and manage posts. Below is an overview of how the code works:

### 1. Router Setup

- We create a router using express.Router()
- All routes are defined in pageRouter
- Each route is connected to a _controller function_ that handles the logic

**API Endpoint / Routes**
GET/ --> Returns the homepage content

_Controller:_ viewHomePage

GET/post --> Returns a list of all posts

_Controller:_ viewPost

GET /post/:id --> Returns a single post by its Id

_URL Parameter:_ id — EACH ID of the post

_Example Usage:_ GET /post/12

_Controller:_ filterPost

### 2. Controllers

- _viewHomePage_: Handles requests to /, Sends back homepage content, such as welcome messages or featured posts
- _viewPost_: Handles requests to /post, Retrieves all posts from the database (or data source) and sends them as JSON
- _filterPost_: Handles requests to /post/:id, Finds the post that matches the given ID and returns its full details

### 3. Request Flow

1. _Incoming Request_ --> The request hits the Express server
2. _Router Matches Endpoint_ --> Express looks up the route in pageRouter
3. _Controller Handles Logic_ --> The appropriate controller processes the request and retrieves data
4. _Response Sent_ --> Data is sent back to the client (JSON or rendered page)

_Example:_

- User visits / --> viewHomePage sends homepage content
- User visits /post --> viewPost returns all posts
- User visits /post/12 --> filterPost returns the post with ID 12

## HELP

Please contact any of the members listed below and provide details of your issue for assistance.

## DEVELOPERS

This project was developed by Group 4 Back-End students at TECHCRUSH.

**CONTACTS**

- <Ekanvicky@gmail.com>
- <mustaphabusari2005@gmail.com>
- <peterfavored05@gmail.com>
- <glotejuosho@gmail.com>
- <soniaaac26@gmail.com>
- <ibilolaabiola75@gmail.com>
- <ibangura310@gmail.com>
- <sundayoladele2@gmail.com>
- <ayodejiaronimo@gmail.com>

## VERSION HISTORY

1.0.0

- Initial Release
