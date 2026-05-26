CREATE TABLE IF NOT EXISTS audit_events (
                                            id BIGSERIAL PRIMARY KEY,
                                            action VARCHAR(100) NOT NULL,
    username VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX idx_action ON audit_events(action);
CREATE INDEX idx_username ON audit_events(username);
CREATE INDEX idx_role ON audit_events(role);
CREATE INDEX idx_timestamp ON audit_events(timestamp);