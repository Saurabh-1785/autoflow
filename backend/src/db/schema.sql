-- raw_feedback: stores every scraped review/tweet/post
CREATE TABLE raw_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    text TEXT NOT NULL,
    author_id VARCHAR(255),
    author_tier VARCHAR(50) DEFAULT 'free',
    sentiment VARCHAR(20),
    sentiment_score FLOAT,
    is_duplicate BOOLEAN DEFAULT false,
    cluster_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- feedback_clusters: NLP-generated topic groups
CREATE TABLE feedback_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_label VARCHAR(255),
    keywords TEXT[],
    mention_count INT DEFAULT 0,
    avg_sentiment FLOAT,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- brds: AI-generated Business Requirement Documents
CREATE TABLE brds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID REFERENCES feedback_clusters(id),
    title VARCHAR(500),
    problem_statement TEXT,
    target_audience TEXT,
    business_value TEXT,
    proposed_solution TEXT,
    success_metrics TEXT[],
    out_of_scope TEXT[],
    source_evidence TEXT[],
    wsjf_bv FLOAT,
    wsjf_tc FLOAT,
    wsjf_rr FLOAT,
    wsjf_effort FLOAT,
    wsjf_final_score FLOAT,
    confidence_score FLOAT,
    confidence_reason TEXT,
    critic_score FLOAT,
    critic_issues JSONB,
    status VARCHAR(50) DEFAULT 'pending_generation',
    reviewer_email VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    original_ai_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- epics: agile epics derived from approved BRDs
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brd_id UUID REFERENCES brds(id),
    epic_ref VARCHAR(20),
    title VARCHAR(500),
    description TEXT,
    total_points INT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_stories: individual stories within an epic
CREATE TABLE user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epic_id UUID REFERENCES epics(id),
    story_ref VARCHAR(20),
    title VARCHAR(500),
    story_text TEXT,
    story_points INT,
    priority VARCHAR(20),
    needs_clarification BOOLEAN DEFAULT false,
    acceptance_criteria TEXT[],
    definition_of_done TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pipeline_status: current state of the automation pipeline
CREATE TABLE pipeline_status (
    id SERIAL PRIMARY KEY,
    stage VARCHAR(100),
    last_run TIMESTAMPTZ,
    items_processed INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'idle',
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pipeline_status (stage, status) VALUES ('ingestion', 'idle');

CREATE INDEX idx_raw_feedback_cluster ON raw_feedback(cluster_id);
CREATE INDEX idx_brds_status ON brds(status);
CREATE INDEX idx_brds_wsjf ON brds(wsjf_final_score DESC NULLS LAST);
CREATE INDEX idx_epics_brd ON epics(brd_id);
