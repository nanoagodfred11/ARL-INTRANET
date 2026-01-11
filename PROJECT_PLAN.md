# Adamus Resources Limited - Intranet Project Plan

## 1. Project Overview

**Project Name:** ARL Intranet Portal
**Organization:** Adamus Resources Limited
**Project Type:** Internal Web Application (Intranet)
**Version:** 1.0

### 1.1 Project Description
Development of a modern, responsive intranet portal to replace the existing WordPress-based intranet. The new platform will serve as the central hub for company communications, safety information, employee engagement, and operational resources for all on-site personnel.

### 1.2 Project Team
| Role | Resource |
|------|----------|
| Developer | 1 Full-stack Developer |
| AI Assistant | Claude (Development Support) |

---

## 2. Objectives

1. Deliver a modern, user-friendly intranet accessible to all on-site personnel
2. Centralize company communications, news, and announcements
3. Prioritize safety information dissemination (toolbox talks, alerts, tips)
4. Enhance employee engagement through interactive features (polls, games, suggestions)
5. Provide quick access to essential resources (contacts, apps, canteen menu)
6. Integrate AI-powered assistance for navigation and information retrieval

---

## 3. Scope

### 3.1 In-Scope Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | News & Announcements | Company-wide news with rich text, images, and categorization |
| 2 | Events & Photo Gallery | Event listings and photo albums for company/site activities |
| 3 | Safety Tips & Videos | Multimedia safety content with video uploads |
| 4 | Mini Games | Engagement games (quizzes, hazard hunt, memory match, etc.) |
| 5 | Daily Toolbox Talk | Daily safety briefings with multimedia support |
| 6 | Safety & Incident Alerts | Critical alerts with popup banners and page listings |
| 7 | Contact Directory | Searchable company telephone/contact directory |
| 8 | Gold Industry News | Automated news feed via RSS/API integration |
| 9 | AI Chatbot | Claude-powered assistant for navigation and FAQs |
| 10 | Interactive Site Map | Dynamic mine site map with clickable locations |
| 11 | Anonymous Suggestion Box | Employee ideas/feedback (anonymous, admin-traceable) |
| 12 | Polls | Simple single-question polls for employee feedback |
| 13 | Company Apps Links | Directory of company application links |
| 14 | Canteen Menu | Daily and weekly menu display |
| 15 | Admin Portal | Content management system with OTP authentication |

### 3.2 Out-of-Scope (Deferred)
- Standard Operating Procedures (SOPs)
- Board Room Booking System
- Departmental Statistics Dashboard
- Active Directory Integration
- Third-party System Integrations
- Content Migration from WordPress

---

## 4. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React Router V7 (Full-stack) |
| UI Library | HeroUI |
| Database | MongoDB |
| Authentication | Phone OTP + JWT |
| AI Integration | Claude API (Anthropic) |
| Video Storage | Local Server Upload |
| News Feed | RSS/External API |
| Hosting | On-Premise Server |

---

## 5. Architecture Overview

### 5.1 Application Structure
```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIC INTRANET                       │
│            (Open Access - Internal Network)              │
├─────────────────────────────────────────────────────────┤
│  News │ Events │ Safety │ Directory │ Games │ Chatbot   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     ADMIN PORTAL                         │
│              (Phone OTP + JWT Authentication)            │
├─────────────────────────────────────────────────────────┤
│  Content Management │ User Management │ Analytics        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND API                         │
│                   (React Router V7)                      │
├─────────────────────────────────────────────────────────┤
│                       MongoDB                            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 User Access Model
| User Type | Access Method | Permissions |
|-----------|---------------|-------------|
| General Users | Internal network (no login) | View all public content |
| Superadmin | Phone OTP + JWT | Full CRUD, user management, system config |

---

## 6. Phase Breakdown

### Phase 1: Foundation & Core Communication
**Objective:** Establish project infrastructure and core communication features

**Deliverables:**
- Project scaffolding and development environment
- Database schema and connection
- Admin portal with OTP authentication
- Superadmin role and permissions
- News & Announcements module
- Company Contact Directory
- Company Apps Links page
- Responsive base layout and navigation
- Mobile-friendly design implementation

---

### Phase 2: Safety & Daily Operations
**Objective:** Implement safety-critical features for daily operations

**Deliverables:**
- Daily Toolbox Talk module with multimedia
- Safety Tips & Videos section
- Video upload and playback functionality
- Safety & Incident Alerts system
- Alert popup/banner system
- Canteen Menu (daily/weekly options)

---

### Phase 3: Engagement & Feedback
**Objective:** Build employee engagement and feedback mechanisms

**Deliverables:**
- Events management and display
- Photo Gallery with album organization
- Photo upload functionality
- Simple Polls system
- Anonymous Suggestion Box
- Admin traceability for suggestions

---

### Phase 4: Advanced Features
**Objective:** Implement complex integrations and interactive features

**Deliverables:**
- AI Chatbot with Claude integration
- Interactive Site Map (dynamic, clickable)
- Gold Industry News (RSS/API integration)
- Mini Games suite:
  - Safety Quiz
  - Hazard Hunt
  - Word Scramble
  - Memory Match
  - Trivia Challenge
  - Leaderboard system

---

## 7. Assumptions

1. On-premise server infrastructure is available and configured
2. Internal network access controls are managed by IT
3. Brand guidelines, logos, and color schemes are provided
4. Superadmin phone numbers are pre-registered for OTP
5. Claude API access is available for chatbot integration
6. Mine site map assets (images/data) will be provided
7. RSS feeds or APIs for gold industry news are available
8. Content creators will be trained on admin portal usage

---

## 8. Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Single developer dependency | High | Medium | Comprehensive documentation; Claude AI support |
| On-premise server limitations | Medium | Low | Performance testing; optimize assets |
| Video storage capacity | Medium | Medium | Implement file size limits; compression |
| RSS/API feed reliability | Low | Medium | Fallback to manual entry; caching |
| Claude API availability | Medium | Low | Graceful degradation; cached responses |
| Scope creep | High | Medium | Strict change control; phase boundaries |

---

## 9. Success Criteria

1. All Phase 1-4 features deployed and functional
2. Intranet accessible to all on-site personnel via internal network
3. Admin portal secured with OTP authentication
4. Mobile-responsive design tested on common devices
5. Video uploads and playback functioning correctly
6. AI chatbot responding accurately to common queries
7. Safety alerts displaying as popups site-wide
8. All content manageable through admin portal

---

## 10. Deliverables Summary

| Phase | Key Deliverables |
|-------|------------------|
| Phase 1 | Admin Portal, News, Directory, Apps Links, Base UI |
| Phase 2 | Toolbox Talk, Safety Videos, Alerts, Canteen Menu |
| Phase 3 | Events, Photo Gallery, Polls, Suggestion Box |
| Phase 4 | AI Chatbot, Site Map, Gold News, Mini Games |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Developer | Initial project plan |
