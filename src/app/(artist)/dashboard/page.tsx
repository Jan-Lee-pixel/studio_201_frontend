"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useState } from "react";

export default function ArtistDashboardPage() {
  const { profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return <div className="p-8 text-gray-500 font-dm-mono text-sm">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-red-500 font-dm-mono text-sm">User profile not found. Please log in again.</div>;
  }

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-header">
        <div className="status-chip">Status Active</div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Welcome back,<br /><span>{profile.fullName}</span></h1>
            <p className="page-subtitle">Manage your portfolio, submit new artworks for exhibition, and track your gallery presence.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button className="btn btn-secondary">
              <svg className="btn-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v12M1 7h12"/></svg>
              New Submission
            </button>
            <button className="btn btn-terracotta">View Portfolio</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row stats-4 mb-20">
        <div className="stat-card accent-terra">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11L5 7l2.5 2.5L9.5 5 12 11H2z"/></svg>
          </div>
          <p className="stat-label">Total Works</p>
          <p className="stat-value">12</p>
          <p className="stat-delta">↑ 2 this month</p>
        </div>
        <div className="stat-card accent-ochre">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>
          </div>
          <p className="stat-label">Under Review</p>
          <p className="stat-value">1</p>
          <p className="stat-sub">Submitted 3 days ago</p>
        </div>
        <div className="stat-card accent-sage">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10l3-4 2 2 2-3 3 5"/></svg>
          </div>
          <p className="stat-label">Exhibitions</p>
          <p className="stat-value">3</p>
          <p className="stat-delta">1 current</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="12" height="9" rx="1"/><path d="M5 3V1M9 3V1M1 7h12"/></svg>
          </div>
          <p className="stat-label">Member Since</p>
          <p className="stat-value" style={{ fontSize: '1.5rem' }}>Feb '26</p>
          <p className="stat-sub">Active member</p>
        </div>
      </div>

      {/* Main grid: Artworks list + Profile sidebar */}
      <div className="grid-3-1">
        {/* Left: Artworks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Artworks List */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Artworks</h2>
              <Link href="#" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            <div className="artwork-list">
              {[
                { title: 'Threshold No. 4', meta: 'Oil on linen · 120 × 90cm · 2025', status: 'Approved', statusClass: 'status-approved', exhibition: 'Exhibition A', bg: '#c8a878,#8a6040' },
                { title: 'Memory Palaces III', meta: 'Mixed media · 80 × 60cm · 2025', status: 'Pending', statusClass: 'status-pending', exhibition: '—', bg: '#b8a090,#7a6858' },
                { title: 'Still Geography', meta: 'Charcoal on paper · 50 × 40cm · 2024', status: 'Approved', statusClass: 'status-approved', exhibition: 'Exhibition B', bg: '#a0b090,#607858' },
                { title: 'Untitled (Dusk Study)', meta: 'Watercolor · 30 × 20cm · 2026', status: 'Draft', statusClass: 'status-draft', exhibition: '—', bg: '#c8c0a8,#988870' },
              ].map((art, i) => (
                <div className="artwork-row" key={i}>
                  <div className="artwork-thumb">
                    <div className="artwork-thumb-gradient" style={{ background: `linear-gradient(135deg, ${art.bg})` }}></div>
                  </div>
                  <div className="artwork-info">
                    <p className="artwork-title">{art.title}</p>
                    <p className="artwork-meta">{art.meta}</p>
                  </div>
                  <span className={`artwork-status ${art.statusClass}`}>{art.status}</span>
                  <span style={{ fontSize: '10px', color: 'var(--warm-mid)' }}>{art.exhibition}</span>
                  <div className="artwork-actions">
                    <button className="action-btn" title="Edit">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z"/></svg>
                    </button>
                    <button className="action-btn" title="View">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z"/><circle cx="6" cy="6" r="1.5"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Artwork Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Submit New Artwork</h2>
              <span className="artwork-status status-review" style={{ fontSize: '8px' }}>Curators review weekly</span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <div className="upload-zone">
                  <div className="upload-icon">⬆</div>
                  <p className="upload-text">Drop artwork image here or click to browse</p>
                  <p className="upload-sub">JPEG, PNG or TIFF — max 20MB — min 2000px on longest edge</p>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Title</label>
                  <input className="form-input" type="text" placeholder="Work title" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Year</label>
                  <input className="form-input" type="text" placeholder="2026" />
                </div>
              </div>
              <div style={{ height: '14px' }}></div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Medium</label>
                  <input className="form-input" type="text" placeholder="e.g. Oil on canvas" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Dimensions</label>
                  <input className="form-input" type="text" placeholder="H × W cm" />
                </div>
              </div>
              <div style={{ height: '14px' }}></div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Artist Statement / Notes for Curators</label>
                <textarea className="form-textarea" placeholder="Describe the work's context, intent, or any relevant details for the curation team…"></textarea>
                <p className="form-hint">This note is private and shared only with Studio 201 curators.</p>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm">Save Draft</button>
              <button className="btn btn-primary btn-sm">Submit for Review</button>
            </div>
          </div>
        </div>

        {/* Right: Profile + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Card */}
          <div className="card">
            <div className="profile-block">
              <div className="profile-avatar-lg">
                {profile.fullName.charAt(0).toUpperCase()}
                <div className="profile-avatar-edit">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1l2 2L3 9H1V7L7 1z"/></svg>
                </div>
              </div>
              <p className="profile-name">{profile.fullName}</p>
              <p className="profile-handle">@{profile.fullName.toLowerCase().replace(/\s/g, '')} · Artist</p>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">12</span>
                  <span className="profile-stat-label">Works</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">3</span>
                  <span className="profile-stat-label">Shows</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">1</span>
                  <span className="profile-stat-label">Current</span>
                </div>
              </div>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value"><Link href={`mailto:${profile.email}`}>{profile.email}</Link></span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{new Date(profile.createdAt).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Based In</span>
                <span className="info-value">Beirut / Manila</span>
              </div>
              <div className="info-item">
                <span className="info-label">Represented</span>
                <span className="info-value">Studio 201</span>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="#" className="btn btn-secondary btn-sm">Edit Profile</Link>
              <Link href="#" className="btn btn-secondary btn-sm">Public Page →</Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Notifications</h2>
              <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: 'var(--terracotta)' }}>2 unread</span>
            </div>
            <div className="notif-item unread">
              <div className="notif-icon terra">✉</div>
              <div className="notif-content">
                <p className="notif-text">Your submission <strong>Memory Palaces III</strong> is under curator review.</p>
                <p className="notif-time">2 hours ago</p>
              </div>
              <div className="unread-dot"></div>
            </div>
            <div className="notif-item unread">
              <div className="notif-icon sage">✓</div>
              <div className="notif-content">
                <p className="notif-text"><strong>Threshold No. 4</strong> has been approved for exhibition.</p>
                <p className="notif-time">Yesterday</p>
              </div>
              <div className="unread-dot"></div>
            </div>
            <div className="notif-item">
              <div className="notif-icon ochre">📅</div>
              <div className="notif-content">
                <p className="notif-text">Reminder: Artist talk scheduled for <strong>28 Feb 2026</strong> at 6PM.</p>
                <p className="notif-time">3 days ago</p>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-header"><h2 className="card-title">Recent Activity</h2></div>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-dot orange"></div>
                <div className="activity-text">Submitted <strong>Memory Palaces III</strong> for review</div>
                <span className="activity-time">2d ago</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-text"><strong>Threshold No. 4</strong> approved by curators</div>
                <span className="activity-time">5d ago</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-text">Profile updated — bio and links</div>
                <span className="activity-time">1w ago</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-text">Account activated and verified</div>
                <span className="activity-time">Feb 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Need Assistance */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--linen)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>ⓘ</div>
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 400, marginBottom: '3px' }}>Need Assistance?</p>
              <p style={{ fontSize: '11px', color: 'var(--warm-mid)' }}>If you have questions about the submission process or exhibition details, our curation team is here to help.</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Contact Gallery</button>
        </div>
      </div>
    </div>
  );
}
