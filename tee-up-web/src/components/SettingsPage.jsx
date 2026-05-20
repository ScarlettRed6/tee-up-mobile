import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Ticket,
  Mail,
  Flag,
  Package,
  MessageCircle,
} from 'lucide-react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { fetchMyReports } from '../api/reportsApi';
import './SettingsPage.css';

const NAV_ITEMS = [
  { id: 'support', label: 'Contact support', icon: LifeBuoy, hint: 'Get help from our team' },
  { id: 'faq', label: 'FAQs', icon: HelpCircle, hint: 'Common questions' },
  { id: 'tickets', label: 'My tickets', icon: Ticket, hint: 'Reports you submitted' },
];

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'How do I buy or sell equipment?',
    answer:
      'Browse the marketplace, open a listing to message the seller or make an offer, and use Sell to post your own gear. You can save drafts before publishing.',
  },
  {
    id: 'faq-2',
    question: 'When can I leave a review?',
    answer:
      'In Messages, after you and the other person have each sent at least three messages, use Rate in the chat header to share your experience.',
  },
  {
    id: 'faq-3',
    question: 'How do I report someone?',
    answer:
      'On a listing page, use the report control. In chat, open More → Report user. Add details so our team can review.',
  },
  {
    id: 'faq-4',
    question: 'What do ticket statuses mean?',
    answer:
      'Pending — waiting for review. In review — being looked at. Resolved or dismissed — a decision was made. Check My tickets for updates.',
  },
];

function formatReportDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getReportSubject(report) {
  if (report.reported_listing_id) {
    const title = report.listing_title?.trim();
    return { type: 'Listing', label: title || 'Listing report', isListing: true };
  }
  if (report.reported_user_id) {
    const name = report.reported_user_name?.trim();
    return { type: 'User', label: name || 'User report', isListing: false };
  }
  return { type: 'Report', label: 'General report', isListing: false };
}

function normalizeStatus(status) {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'complete') return 'complete';
  return s;
}

function statusLabel(status) {
  const s = normalizeStatus(status);
  const labels = {
    pending: 'Pending review',
    reviewed: 'Under review',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
    complete: 'Closed',
  };
  return labels[s] || s;
}

export default function SettingsPage({
  user,
  onBack,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onViewAllNotifications,
  onNotificationClick,
  onOpenProfile,
  onLogout,
  onGoHome,
}) {
  const [activeSection, setActiveSection] = useState('support');
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0]?.id ?? null);
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setReportsLoading(true);
    setReportsError('');
    fetchMyReports()
      .then((data) => {
        if (!cancelled) setMyReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setMyReports([]);
          setReportsError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              err?.message ||
              'Could not load your tickets.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setReportsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeNav = NAV_ITEMS.find((n) => n.id === activeSection) ?? NAV_ITEMS[0];

  return (
    <div className="settings-page">
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
      />

      <main className="settings-page-main">
        <div className="settings-page-container">
          <Button variant="ghost" size="sm" className="settings-back-link" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to profile
          </Button>

          <header className="settings-hero">
            <div className="settings-hero-text">
              <h1 className="settings-hero-title">Help &amp; support</h1>
              <p className="settings-hero-subtitle">
                Contact us, read FAQs, or follow up on reports you&apos;ve filed.
              </p>
            </div>
          </header>

          <div className="settings-shell">
            <nav className="settings-nav" aria-label="Settings sections">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const count = item.id === 'tickets' && !reportsLoading ? myReports.length : null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`settings-nav-item${isActive ? ' settings-nav-item-active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="settings-nav-icon-wrap" aria-hidden>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="settings-nav-copy">
                      <span className="settings-nav-label">
                        {item.label}
                        {count != null && count > 0 ? (
                          <span className="settings-nav-badge">{count}</span>
                        ) : null}
                      </span>
                      <span className="settings-nav-hint">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="settings-content">
              <div className="settings-content-head">
                <activeNav.icon className="settings-content-head-icon" aria-hidden />
                <div>
                  <h2 className="settings-content-title">{activeNav.label}</h2>
                  <p className="settings-content-desc">{activeNav.hint}</p>
                </div>
              </div>

              {activeSection === 'support' && (
                <div className="settings-content-body">
                  <div className="settings-support-card">
                    <div className="settings-support-icon-ring">
                      <MessageCircle className="h-7 w-7" aria-hidden />
                    </div>
                    <div className="settings-support-copy">
                      <h3>We&apos;re here to help</h3>
                      <p>
                        Live chat with support is on the way. For urgent safety concerns, file a
                        report from a listing or conversation — it goes straight to our review queue.
                      </p>
                      <div className="settings-support-email">
                        <Mail className="h-5 w-5" aria-hidden />
                        <div>
                          <span className="settings-support-email-label">Email (coming soon)</span>
                          <span className="settings-support-email-value">support@teeup.app</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" disabled className="settings-support-cta">
                        Message support
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'faq' && (
                <div className="settings-content-body settings-faq-list">
                  {FAQ_ITEMS.map((item) => {
                    const isOpen = openFaqId === item.id;
                    return (
                      <div key={item.id} className={`settings-faq-item${isOpen ? ' is-open' : ''}`}>
                        <button
                          type="button"
                          className="settings-faq-trigger"
                          onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                          aria-expanded={isOpen}
                        >
                          <span>{item.question}</span>
                          <ChevronDown className="settings-faq-chevron" aria-hidden />
                        </button>
                        {isOpen ? <p className="settings-faq-answer">{item.answer}</p> : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection === 'tickets' && (
                <div className="settings-content-body settings-tickets-body">
                  {reportsError ? (
                    <p className="settings-alert settings-alert-error" role="alert">
                      {reportsError}
                    </p>
                  ) : null}

                  {reportsLoading ? (
                    <p className="settings-muted-center">Loading your tickets…</p>
                  ) : myReports.length === 0 ? (
                    <div className="settings-empty-state">
                      <div className="settings-empty-icon">
                        <Flag className="h-8 w-8" aria-hidden />
                      </div>
                      <h3>No tickets yet</h3>
                      <p>When you report a listing or user, it will appear here with live status updates.</p>
                    </div>
                  ) : (
                    <div className="settings-tickets-table-wrap">
                      <table className="settings-tickets-table">
                        <thead>
                          <tr>
                            <th scope="col">Subject</th>
                            <th scope="col">Reason</th>
                            <th scope="col">Status</th>
                            <th scope="col">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myReports.map((report) => {
                            const statusKey = normalizeStatus(report.status);
                            const subject = getReportSubject(report);
                            return (
                              <tr key={report.report_id}>
                                <td>
                                  <div className="settings-ticket-subject">
                                    <span className="settings-ticket-subject-icon" aria-hidden>
                                      {subject.isListing ? (
                                        <Package className="h-4 w-4" />
                                      ) : (
                                        <Flag className="h-4 w-4" />
                                      )}
                                    </span>
                                    <div className="settings-ticket-subject-text">
                                      <span className="settings-ticket-type">{subject.type}</span>
                                      <span className="settings-ticket-name">{subject.label}</span>
                                      <span className="settings-ticket-id">#{report.report_id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="settings-ticket-reason-cell">{report.reason}</td>
                                <td>
                                  <span className={`settings-status-pill settings-status-${statusKey}`}>
                                    {statusLabel(report.status)}
                                  </span>
                                </td>
                                <td className="settings-ticket-date">
                                  {formatReportDate(report.created_at)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
