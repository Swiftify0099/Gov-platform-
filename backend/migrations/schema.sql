-- ============================================
-- EXAM PREP PLATFORM — DATABASE SCHEMA
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------
-- ENUMS
-- -----------------------------------------------

CREATE TYPE user_role AS ENUM ('super_admin', 'institute_admin', 'student');
CREATE TYPE exam_stream AS ENUM ('MPSC', 'UPSC', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'ALL_INDIA_SERVICES');
CREATE TYPE language_code AS ENUM ('en', 'mr', 'hi');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE assignment_status AS ENUM ('draft', 'scheduled', 'live', 'completed', 'cancelled');
CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted', 'auto_submitted', 'timed_out');
CREATE TYPE payment_gateway AS ENUM ('razorpay', 'phonepe');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE violation_type AS ENUM (
    'multiple_faces', 'no_face', 'phone_detected',
    'book_detected', 'tab_switch', 'devtools_open',
    'face_mismatch', 'fullscreen_exit'
);
CREATE TYPE plan_duration AS ENUM ('monthly', 'quarterly', 'half_yearly', 'yearly');

-- -----------------------------------------------
-- INSTITUTES
-- -----------------------------------------------

CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(15),
    email VARCHAR(255),
    logo_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- USERS
-- -----------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    profile_photo_path VARCHAR(500),
    profile_photo_url VARCHAR(500),
    language_preference language_code DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_institute ON users(institute_id);

-- -----------------------------------------------
-- STUDENT PROFILES
-- -----------------------------------------------

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_streams exam_stream[] DEFAULT '{}',
    date_of_birth DATE,
    gender VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    profile_completed BOOLEAN DEFAULT FALSE,
    total_exams_taken INTEGER DEFAULT 0,
    total_score DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- COURSES / CLASSES / BATCHES
-- -----------------------------------------------

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exam_stream exam_stream,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (course_id, student_id)
);

-- -----------------------------------------------
-- QUESTIONS
-- -----------------------------------------------

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    language language_code DEFAULT 'en',
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answers INTEGER[] NOT NULL,
    marks DECIMAL(5, 2) DEFAULT 1.0,
    negative_marks DECIMAL(5, 2) DEFAULT 0.0,
    difficulty difficulty_level DEFAULT 'Medium',
    topic VARCHAR(255),
    explanation TEXT,
    exam_stream exam_stream,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_institute ON questions(institute_id);
CREATE INDEX idx_questions_stream ON questions(exam_stream);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_text_gin ON questions USING gin(to_tsvector('english', text));

-- -----------------------------------------------
-- ASSIGNMENTS
-- -----------------------------------------------

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_stream exam_stream,
    status assignment_status DEFAULT 'draft',
    scheduled_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_marks DECIMAL(8, 2) NOT NULL,
    passing_marks DECIMAL(8, 2) NOT NULL,
    negative_marking_enabled BOOLEAN DEFAULT FALSE,
    show_result_immediately BOOLEAN DEFAULT TRUE,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_options BOOLEAN DEFAULT FALSE,
    max_attempts INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assignment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    UNIQUE (assignment_id, question_id)
);

-- -----------------------------------------------
-- SUBMISSIONS
-- -----------------------------------------------

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status submission_status DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER,
    total_score DECIMAL(8, 2) DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    violation_count INTEGER DEFAULT 0,
    face_verified BOOLEAN DEFAULT FALSE,
    rank INTEGER,
    percentile DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);

CREATE TABLE submission_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    selected_options INTEGER[] DEFAULT '{}',
    is_correct BOOLEAN,
    marks_awarded DECIMAL(5, 2) DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (submission_id, question_id)
);

-- -----------------------------------------------
-- VIOLATIONS
-- -----------------------------------------------

CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    violation_type violation_type NOT NULL,
    description TEXT,
    screenshot_path VARCHAR(500),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    violation_number INTEGER NOT NULL
);

CREATE INDEX idx_violations_submission ON violations(submission_id);
CREATE INDEX idx_violations_student ON violations(student_id);

-- -----------------------------------------------
-- SUBSCRIPTION PLANS
-- -----------------------------------------------

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration plan_duration NOT NULL,
    features JSONB DEFAULT '[]',
    max_students INTEGER,
    max_assignments INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- PAYMENTS
-- -----------------------------------------------

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    institute_id UUID REFERENCES institutes(id),
    plan_id UUID REFERENCES subscription_plans(id),
    gateway payment_gateway NOT NULL,
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- COUPON CODES
-- -----------------------------------------------

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID REFERENCES institutes(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- SUPPORT / FEEDBACK
-- -----------------------------------------------

CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) DEFAULT 'general',
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- PLATFORM SETTINGS
-- -----------------------------------------------

CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, description) VALUES
('active_payment_gateway', 'razorpay', 'Active payment gateway: razorpay or phonepe'),
('face_match_threshold', '0.6', 'Face similarity threshold (0-1)'),
('max_violations', '3', 'Max violations before auto-submit'),
('face_check_interval', '10', 'Face check interval in seconds'),
('otp_resend_cooldown', '60', 'OTP resend cooldown in seconds'),
('maintenance_mode', 'false', 'Platform maintenance mode');

-- -----------------------------------------------
-- NOTIFICATIONS
-- -----------------------------------------------

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- AUDIT LOG
-- -----------------------------------------------

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------
-- TRIGGERS: auto-update updated_at
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutes_updated_at BEFORE UPDATE ON institutes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
