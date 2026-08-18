import React, { useState } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, PrimaryBtn, SecBtn, Label, Input } from './shared';
import { Poll, PollOption, PollVote } from '../../types';
import { isHRRole, isEmployeeRole } from '../../permissions';
import { toast } from '../../utils/modal';

export const VotingView: React.FC<ModuleViewsProps> = (props) => {
  const { selectedCompany, selectedUser, employees, polls, pollOptions, pollVotes, onCreatePoll, onClosePoll, onUpdatePoll, onVotePoll } = props;

  const localPolls = polls.filter(p => p.companyId === selectedCompany.id);
  const localOptions = pollOptions.filter(o => o.companyId === selectedCompany.id);
  const localVotes = pollVotes.filter(v => v.companyId === selectedCompany.id);
  const companyEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  const [activeTab, setActiveTab] = useState<'active' | 'create' | 'results'>('active');
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [editEndDate, setEditEndDate] = useState('');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Employee of the Month');
  const [newEndDate, setNewEndDate] = useState('');
  const [newAnonymous, setNewAnonymous] = useState(false);
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);

  const canManage = isHRRole(selectedUser.activeRole);
  const canVote = isEmployeeRole(selectedUser.activeRole);
  const empRecord = employees.find(e => e.email === selectedUser.email) || employees[0];

  const activePolls = localPolls.filter(p => p.status === 'Active');
  const closedPolls = localPolls.filter(p => p.status === 'Closed');

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const handleCreatePoll = () => {
    if (!newTitle.trim() || newOptions.filter(o => o.trim()).length < 2) return;
    onCreatePoll({
      companyId: selectedCompany.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      createdBy: selectedUser.id,
      createdByName: selectedUser.name,
      anonymous: newAnonymous,
      endDate: newEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      options: newOptions.filter(o => o.trim()).map(label => ({ label: label.trim() })),
    });
    setNewTitle('');
    setNewDescription('');
    setNewOptions(['', '']);
    setActiveTab('active');
  };

  const handleEndNow = (pollId: string) => {
    onUpdatePoll(pollId, { status: 'Closed' });
    toast('Poll ended successfully', 'success');
  };

  const handleSetEndDate = (pollId: string) => {
    if (!editEndDate) return;
    onUpdatePoll(pollId, { endDate: editEndDate });
    setEditingPollId(null);
    setEditEndDate('');
    toast('End date updated', 'success');
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (!empRecord) return;
    const alreadyVoted = localVotes.some(v => v.pollId === pollId && v.voterId === empRecord.id);
    if (alreadyVoted) return;
    onVotePoll(pollId, optionId, empRecord.id, `${empRecord.firstName} ${empRecord.lastName}`);
  };

  const getPollResults = (pollId: string) => {
    const opts = localOptions.filter(o => o.pollId === pollId);
    const votes = localVotes.filter(v => v.pollId === pollId);
    const total = votes.length;
    return opts.map(o => ({
      ...o,
      count: o.voteCount,
      pct: total > 0 ? Math.round((o.voteCount / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  };

  const hasVoted = (pollId: string) => localVotes.some(v => v.pollId === pollId && v.voterId === empRecord?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voting & Polls"
        subtitle="Create polls for employee recognition, team decisions, and company-wide voting."
        action={canManage ? <PrimaryBtn icon="bi bi-plus-lg" onClick={() => setActiveTab('create')}>Create Poll</PrimaryBtn> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Polls" value={`${activePolls.length}`} sub="Currently voting" icon="bi bi-check2-square" accent />
        <StatCard label="Total Votes" value={`${localVotes.length}`} sub="All polls combined" icon="bi bi-hand-index-thumb" color="text-violet-600" />
        <StatCard label="Closed Polls" value={`${closedPolls.length}`} sub="Finished voting" icon="bi bi-lock" color="text-slate-500" />
      </div>

      <div className="flex gap-1 border-b border-slate-200 pb-px">
        {(['active', 'create', 'results'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 fs-xs fw-semibold rounded-t-lg transition-all cursor-pointer -mb-px border border-b-0 ${
              activeTab === tab ? 'bg-white border-slate-200 text-slate-900' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'active' ? 'Active Polls' : tab === 'create' ? 'Create Poll' : 'Results'}
          </button>
        ))}
      </div>

      {activeTab === 'active' && (
        <div className="space-y-4">
          {activePolls.length === 0 && (
            <div className="text-center py-12 text-slate-400 fs-sm">No active polls at the moment.</div>
          )}
          {activePolls.map(poll => {
            const opts = localOptions.filter(o => o.pollId === poll.id);
            const voted = hasVoted(poll.id);
            const results = getPollResults(poll.id);
            const isEditing = editingPollId === poll.id;
            return (
              <div key={poll.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge label={poll.category} variant="info" />
                    <h3 className="fs-sm fw-bold text-slate-900 mt-2">{poll.title}</h3>
                    {poll.description && <p className="fs-xs text-slate-500 mt-1">{poll.description}</p>}
                  </div>
                  <div className="text-right">
                    {poll.endDate && (
                      <div className="fs-2xs text-slate-400">
                        {getTimeRemaining(poll.endDate)}
                      </div>
                    )}
                    {poll.anonymous && <div className="fs-2xs text-slate-400 mt-0.5"><i className="bi bi-eye-slash"></i> Anonymous</div>}
                  </div>
                </div>

                {/* HR Controls: End Now + Set Close Date */}
                {canManage && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="fs-[10px] fw-semibold text-slate-500 mr-1">Poll Controls:</span>
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="date"
                          value={editEndDate}
                          onChange={e => setEditEndDate(e.target.value)}
                          className="fs-xs py-1 px-2 w-36"
                        />
                        <button
                          onClick={() => handleSetEndDate(poll.id)}
                          className="px-2 py-1 bg-slate-900 text-white rounded fs-2xs fw-semibold cursor-pointer hover:bg-slate-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingPollId(null); setEditEndDate(''); }}
                          className="px-2 py-1 border border-slate-200 text-slate-500 rounded fs-2xs fw-semibold cursor-pointer hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingPollId(poll.id); setEditEndDate(poll.endDate || ''); }}
                          className="flex items-center gap-1 px-2 py-1 border border-slate-200 text-slate-600 rounded fs-2xs fw-semibold cursor-pointer hover:bg-white transition-all"
                        >
                          <i className="bi bi-calendar-event"></i> Set Close Date
                        </button>
                        <button
                          onClick={() => handleEndNow(poll.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-red-600 rounded fs-2xs fw-semibold cursor-pointer hover:bg-red-100 transition-all"
                        >
                          <i className="bi bi-stop-circle"></i> End Now
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!canVote ? (
                  <div className="space-y-2 mt-4">
                    {results.length > 0 ? results.map(opt => (
                      <div key={opt.id} className="flex flex-wrap items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="fs-xs fw-semibold text-slate-700">{opt.label}</span>
                            <span className="fs-xs text-slate-500">{opt.count} votes ({opt.pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${opt.pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )) : <div className="fs-xs text-slate-400 mt-2">No votes yet.</div>}
                  </div>
                ) : voted ? (
                  <div className="space-y-2 mt-4">
                    <div className="fs-xs fw-semibold text-emerald-600 mb-2"><i className="bi bi-check-circle-fill"></i> You voted</div>
                    {results.map(opt => (
                      <div key={opt.id} className="flex flex-wrap items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="fs-xs fw-semibold text-slate-700">{opt.label}</span>
                            <span className="fs-xs text-slate-500">{opt.count} votes ({opt.pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${opt.pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {opts.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(poll.id, opt.id)}
                        className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-700 fw-semibold fs-xs px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                      >
                        <i className="bi bi-hand-index-thumb"></i> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'create' && canManage && (
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
            <h3 className="section-title text-slate-500 mb-5">Create New Poll</h3>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Employee of the Month - July 2026" />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what this poll is about..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <input
                    list="poll-category-list"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Type or select a category..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                  />
                  <datalist id="poll-category-list">
                    <option>Employee of the Month</option>
                    <option>Best Team</option>
                    <option>Innovation Award</option>
                    <option>Customer Service</option>
                    <option>General Vote</option>
                  </datalist>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="checkbox" id="anonymous-vote" checked={newAnonymous} onChange={e => setNewAnonymous(e.target.checked)} className="rounded border-slate-300" />
                <Label>Anonymous voting (hide voter identities)</Label>
              </div>
              <div>
                <Label>Nominees / Options</Label>
                <div className="space-y-2">
                  {newOptions.map((opt, i) => {
                    const isCustom = opt !== '' && !companyEmployees.some(e => `${e.firstName} ${e.lastName}` === opt);
                    return (
                      <div key={i} className="flex flex-wrap gap-2">
                        <select
                          value={isCustom ? '__custom__' : opt}
                          onChange={e => {
                            const copy = [...newOptions];
                            if (e.target.value === '__custom__') {
                              copy[i] = '';
                            } else {
                              copy[i] = e.target.value;
                            }
                            setNewOptions(copy);
                          }}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer"
                        >
                          <option value="">Select nominee...</option>
                          {companyEmployees.map(emp => (
                            <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                              {emp.firstName} {emp.lastName} — {emp.department}
                            </option>
                          ))}
                          <option value="__custom__">Other (type custom)...</option>
                        </select>
                        {isCustom && (
                          <Input
                            value={opt}
                            onChange={e => {
                              const copy = [...newOptions];
                              copy[i] = e.target.value;
                              setNewOptions(copy);
                            }}
                            placeholder="Type custom nominee..."
                            className="flex-1"
                          />
                        )}
                        {newOptions.length > 2 && (
                          <button
                            onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))}
                            className="px-3 py-2 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setNewOptions([...newOptions, ''])}
                  className="mt-2 fs-xs fw-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  + Add option
                </button>
              </div>
              <PrimaryBtn icon="bi bi-check-lg" onClick={handleCreatePoll}>Publish Poll</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {closedPolls.length === 0 && localPolls.length === 0 && (
            <div className="text-center py-12 text-slate-400 fs-sm">No poll results yet.</div>
          )}
          {[...closedPolls, ...activePolls].map(poll => {
            const results = getPollResults(poll.id);
            const total = localVotes.filter(v => v.pollId === poll.id).length;
            return (
              <div key={poll.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Badge label={poll.category} variant="info" />
                  <Badge label={poll.status} variant={poll.status === 'Active' ? 'success' : 'default'} />
                  <span className="fs-2xs text-slate-400 ml-auto">{total} total votes</span>
                </div>
                <h3 className="fs-sm fw-bold text-slate-900 mb-4">{poll.title}</h3>
                {results.length > 0 && results[0].count > 0 && (
                  <div className="mb-2 fs-xs fw-semibold text-emerald-600">
                    <i className="bi bi-trophy-fill"></i> Winner: {results[0].label} ({results[0].count} votes)
                  </div>
                )}
                <div className="space-y-2">
                  {results.map((opt, i) => (
                    <div key={opt.id} className="flex flex-wrap items-center gap-3">
                      <span className="fs-2xs font-mono text-slate-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="fs-xs fw-semibold text-slate-700">{opt.label}</span>
                          <span className="fs-xs text-slate-500">{opt.count} ({opt.pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${i === 0 && opt.count > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            style={{ width: `${opt.pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {canManage && poll.status === 'Active' && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <SecBtn onClick={() => onClosePoll(poll.id)}>
                      <i className="bi bi-lock"></i> Close Poll
                    </SecBtn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
