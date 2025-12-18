
CREATE TABLE subtask_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subtask_id INTEGER NOT NULL,
  reviewer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subtask_reviews_subtask_id ON subtask_reviews(subtask_id);
