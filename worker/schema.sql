-- Drop existing tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;

-- Create the users table to store Slack users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    slack_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create the topics table to store voting topics
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Create the votes table to store individual votes with user tracking
CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(topic_id, user_id) -- Ensure one vote per user per topic
);

-- Create the comments table to store topic comments
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
