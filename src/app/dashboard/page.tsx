'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface Slot {
  id: string;
  issue_date: string;
  issue_topic: string;
  price_usd: number;
  status: 'available' | 'booked';
}

interface Booking {
  id: string;
  sponsor_name: string;
  sponsor_email: string;
  ad_headline: string;
  ad_body: string;
  ad_target_url: string;
  amount_paid_usd: number;
  paid_at: string;
  slots?: {
    issue_date: string;
    issue_topic: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [creator, setCreator] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for creating a new slot
  const [newDate, setNewDate] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newPrice, setNewPrice] = useState('250');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------------------------------------------
  // เพิ่ม State สำหรับฟอร์ม Edit Profile
  // ----------------------------------------------------
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editSubs, setEditSubs] = useState<number | string>(0);
  const [editOpenRate, setEditOpenRate] = useState<number | string>(0);
  const [editAudience, setEditAudience] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  async function checkAuthAndFetchData() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setUserEmail(session.user.email || null);
    await fetchDashboardData(session.user.id);
  }

  async function fetchDashboardData(userId: string) {
    try {
      const { data: creatorData } = await supabase
        .from('creators')
        .select('*')
        .eq('id', userId)
        .single();

      if (!creatorData) {
        router.replace('/onboarding');
        return;
      }
      setCreator(creatorData);

      // ดึงข้อมูลเดิมมาใส่ฟอร์ม Edit Profile เตรียมไว้
      setEditName(creatorData.newsletter_name || '');
      setEditTagline(creatorData.tagline || '');
      setEditSubs(creatorData.subscriber_count || 0);
      setEditOpenRate(creatorData.avg_open_rate || 0);
      setEditAudience(creatorData.audience_tags?.[0] || '');

      const { data: slotsData } = await supabase
        .from('slots')
        .select('*')
        .eq('creator_id', creatorData.id)
        .order('issue_date', { ascending: true });

      setSlots(slotsData || []);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, slots(issue_date, issue_topic)')
        .eq('creator_id', creatorData.id)
        .order('paid_at', { ascending: false });

      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // ----------------------------------------------------
  // ฟังก์ชันกดเซฟอัปเดต Profile
  // ----------------------------------------------------
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('creators')
        .update({
          newsletter_name: editName,
          tagline: editTagline,
          subscriber_count: parseInt(editSubs.toString()) || 0,
          avg_open_rate: parseFloat(editOpenRate.toString()) || 0,
          audience_tags: [editAudience] // เซฟเป็น Array
        })
        .eq('id', creator.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setIsEditingProfile(false);
      
      // ดึงข้อมูลใหม่มาแสดงทันที
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchDashboardData(session.user.id);

    } catch (err: any) {
      alert(`Failed to update profile: ${err.message}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!creator || !newDate || !newTopic) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('slots').insert({
        creator_id: creator.id,
        issue_date: newDate,
        issue_topic: newTopic,
        price_usd: parseFloat(newPrice),
        status: 'available',
      });

      if (error) throw error;

      setNewDate('');
      setNewTopic('');
      setNewPrice('250');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchDashboardData(session.user.id);
      
      alert('Slot created successfully!');
    } catch (err: any) {
      alert(`Failed to create slot: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(slotId: string, currentStatus: 'available' | 'booked') {
    const nextStatus = currentStatus === 'available' ? 'booked' : 'available';
    try {
      const { error } = await supabase.from('slots').update({ status: nextStatus }).eq('id', slotId);
      if (error) throw error;
      setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: nextStatus } : s)));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      const { error } = await supabase.from('slots').delete().eq('id', slotId);
      if (error) throw error;
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: any) {
      alert(`Failed to delete slot: ${err.message}`);
    }
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid_usd || 0), 0);
  const bookedCount = slots.filter((s) => s.status === 'booked').length;
  const availableCount = slots.filter((s) => s.status === 'available').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center font-mono text-sm">
        Verifying session & loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {creator?.newsletter_name || 'Creator'} — Dashboard
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Manage newsletter inventory, review ad creatives, and track sponsorship revenue.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            {userEmail && (
              <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                {userEmail}
              </span>
            )}
            <a
              href={`/${creator?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 px-4 py-2 rounded-md transition-colors font-mono"
            >
              ↗ View Public Page
            </a>
            <button
              onClick={handleSignOut}
              className="text-xs bg-neutral-900 border border-red-900/60 hover:bg-red-950/60 text-red-300 px-3.5 py-2 rounded-md transition-colors font-mono"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">Total Revenue</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">
              ${totalRevenue.toLocaleString()} <span className="text-sm font-normal text-neutral-500">USD</span>
            </p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">Booked Slots</span>
            <p className="text-3xl font-extrabold text-white mt-2">
              {bookedCount} <span className="text-sm font-normal text-neutral-500">issues</span>
            </p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">Available Slots</span>
            <p className="text-3xl font-extrabold text-white mt-2">
              {availableCount} <span className="text-sm font-normal text-neutral-500">issues</span>
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* SECTION ใหม่: Profile & Media Kit Settings               */}
        {/* ------------------------------------------------------- */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white">Media Kit & Profile Settings</h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded transition-colors font-mono"
            >
              {isEditingProfile ? 'Cancel' : 'Edit Profile ✎'}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm mt-4 border-t border-neutral-800 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Newsletter Name</label>
                  <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Tagline</label>
                  <input type="text" value={editTagline} onChange={e => setEditTagline(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Subscribers Count</label>
                  <input type="number" required value={editSubs} onChange={e => setEditSubs(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Avg Open Rate (%)</label>
                  <input type="number" step="0.1" required value={editOpenRate} onChange={e => setEditOpenRate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Primary Audience (e.g. Founders, Gamers, SaaS)</label>
                  <input type="text" placeholder="e.g. SaaS Founders" required value={editAudience} onChange={e => setEditAudience(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isUpdatingProfile} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 px-6 rounded transition-colors disabled:opacity-50 text-xs shadow-lg shadow-emerald-900/20">
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm bg-neutral-950/50 p-4 rounded-lg border border-neutral-800/50">
              <div>
                <span className="block text-xs text-neutral-500 font-mono mb-1">Subscribers</span>
                <span className="font-medium text-white">{creator?.subscriber_count?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 font-mono mb-1">Open Rate</span>
                <span className="font-medium text-emerald-400">{creator?.avg_open_rate || 0}%</span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs text-neutral-500 font-mono mb-1">Audience</span>
                <span className="font-medium text-white">{creator?.audience_tags?.[0] || 'General'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section: Create Slot & Slot Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create New Slot Form */}
          <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-lg h-fit">
            <h2 className="text-base font-semibold text-white mb-4">Create New Slot</h2>
            <form onSubmit={handleCreateSlot} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-mono">Issue Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-mono">Topic / Feature</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Dive into AI Agent Frameworks"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-mono">Price ($ USD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-neutral-200 text-black font-medium py-2 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : '+ Create Slot'}
              </button>
            </form>
          </div>

          {/* Manage All Slots */}
          <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 p-6 rounded-lg">
            <h2 className="text-base font-semibold text-white mb-4">Inventory Overview ({slots.length})</h2>
            <div className="divide-y divide-neutral-800 max-h-[440px] overflow-y-auto pr-2">
              {slots.length === 0 ? (
                <p className="text-sm text-neutral-500 py-4">No slots configured yet.</p>
              ) : (
                slots.map((slot) => (
                  <div key={slot.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-mono text-xs text-neutral-400">{slot.issue_date}</div>
                      <div className="font-medium text-white">{slot.issue_topic}</div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <span className="font-mono text-neutral-300 font-semibold mr-1">${slot.price_usd}</span>
                      
                      <button
                        onClick={() => handleToggleStatus(slot.id, slot.status)}
                        title="Click to toggle status"
                        className={`text-xs px-2.5 py-1 rounded font-mono transition-colors border ${
                          slot.status === 'booked'
                            ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/80'
                            : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/80'
                        }`}
                      >
                        {slot.status === 'booked' ? 'Booked' : 'Available'}
                      </button>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-xs text-neutral-500 hover:text-red-400 hover:bg-neutral-800 p-1.5 rounded transition-colors font-mono"
                        title="Delete slot"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section: Submissions */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-lg">
          <h2 className="text-base font-semibold text-white mb-4">
            Sponsor Submissions ({bookings.length})
          </h2>

          {bookings.length === 0 ? (
            <div className="text-sm text-neutral-500 py-10 text-center border border-dashed border-neutral-800 rounded font-mono">
              No paid sponsor bookings received yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                      <span>Issue Date: {booking.slots?.issue_date || '-'}</span>
                      <span className="text-emerald-400 font-bold">${booking.amount_paid_usd} USD</span>
                    </div>

                    <div className="border-t border-neutral-800/60 pt-2">
                      <p className="text-xs text-neutral-400">
                        Sponsor: <span className="text-white font-medium">{booking.sponsor_name}</span> ({booking.sponsor_email})
                      </p>
                    </div>

                    <div className="bg-neutral-900/70 p-3 rounded border border-neutral-800 mt-2 space-y-1">
                      <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Ad Copy:</p>
                      <h4 className="font-semibold text-white text-sm">{booking.ad_headline}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{booking.ad_body}</p>
                      <a
                        href={booking.ad_target_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline block pt-1 truncate"
                      >
                        🔗 {booking.ad_target_url}
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => {
                        const copyText = `${booking.ad_headline}\n\n${booking.ad_body}\n\n${booking.ad_target_url}`;
                        navigator.clipboard.writeText(copyText);
                        alert('Ad copy copied to clipboard!');
                      }}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded transition-colors font-mono"
                    >
                      Copy Ad Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}