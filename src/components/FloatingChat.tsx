import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

type ChatRecipient = { type: 'team' | 'person' | 'group'; id: string; name: string; memberIds?: string[] };

interface FloatingChatProps {
  selectedCompany: { id: string; name: string };
  selectedUser: { id: string; name: string };
  departments: Array<{ id: string; name: string; companyId: string }>;
  employees: Array<{ id: string; userId?: string; firstName: string; lastName: string; department?: string; companyId: string; email?: string; }>;
  chatMessages: any[];
  chatGroups?: import('../types').ChatGroup[];
  chatReads?: any[];
  onSendChatMessage: (msg: { companyId: string; threadId: string; senderId: string; senderName: string; message: string }) => void;
  onMarkThreadRead?: (threadId: string) => void;
  onCreateChatGroup?: (group: Omit<import('../types').ChatGroup, 'id' | 'createdAt' | 'companyId' | 'createdBy'>) => void;
  onUpdateChatGroupMembers?: (groupId: string, members: string[]) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  selectedCompany, selectedUser, departments, employees, chatMessages, chatGroups, chatReads, onSendChatMessage, onMarkThreadRead, onCreateChatGroup, onUpdateChatGroupMembers
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<ChatRecipient | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [groupsExpanded, setGroupsExpanded] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const getThreadId = (recipient: ChatRecipient): string => {
    if (recipient.type === 'team') return recipient.id;
    if (recipient.type === 'group') return `group-${recipient.id}`;
    return [selectedUser.id, recipient.id].sort().join('::dm::');
  };

  const getUnreadCount = useCallback((threadId: string): number => {
    if (!chatReads) return 0;
    const lastRead = chatReads.find((r: any) => r.threadId === threadId)?.lastReadAt;
    return chatMessages.filter((m: any) =>
      m.companyId === selectedCompany.id &&
      m.threadId === threadId &&
      m.senderId !== selectedUser.id &&
      (!lastRead || new Date(m.createdAt).getTime() > new Date(lastRead).getTime())
    ).length;
  }, [chatMessages, chatReads, selectedCompany.id, selectedUser.id]);

  // Compute unread per thread
  const unreadByThread = useMemo(() => {
    const acc: Record<string, number> = {};
    if (!chatReads) return acc;
    for (const m of chatMessages) {
      if (m.companyId !== selectedCompany.id || m.senderId === selectedUser.id) continue;
      const lastRead = chatReads.find((r: any) => r.threadId === m.threadId)?.lastReadAt;
      if (!lastRead || new Date(m.createdAt).getTime() > new Date(lastRead).getTime()) {
        acc[m.threadId] = (acc[m.threadId] || 0) + 1;
      }
    }
    return acc;
  }, [chatMessages, chatReads, selectedCompany.id, selectedUser.id]);

  const myEmployeeRecord = useMemo(() => employees.find(e => e.userId === selectedUser.id || e.id === selectedUser.id), [employees, selectedUser.id]);
  const myDeptName = myEmployeeRecord?.department;
  const myDept = useMemo(() => departments.find(d => d.name === myDeptName && d.companyId === selectedCompany.id), [departments, myDeptName, selectedCompany.id]);

  const totalUnreadCount = useMemo(() => {
    let count = 0;
    for (const [threadId, unread] of Object.entries(unreadByThread)) {
      const isMyDM = threadId.includes('::dm::') && threadId.includes(selectedUser.id);
      const isMyTeam = myDept && threadId === myDept.id;
      const isMyGroup = threadId.startsWith('group-');
      
      if (isMyDM || isMyTeam || isMyGroup) {
        count += unread;
      }
    }
    return count;
  }, [unreadByThread, selectedUser.id, myDept]);

  // Mark thread as read when opened or active
  useEffect(() => {
    if (chatRecipient && isOpen && onMarkThreadRead) {
      const threadId = getThreadId(chatRecipient);
      const unread = getUnreadCount(threadId);
      if (unread > 0) onMarkThreadRead(threadId);
    }
  }, [chatRecipient, isOpen, chatMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatRecipient]);

  // Get last message preview for a thread
  const getLastMessage = (threadId: string): { text: string; time: string; from: string; timestamp: number } | null => {
    const msgs = chatMessages
      .filter(m => m.companyId === selectedCompany.id && m.threadId === threadId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (msgs.length === 0) return null;
    const m = msgs[0];
    return { text: m.message, time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), from: m.senderName, timestamp: new Date(m.createdAt).getTime() };
  };

  // Create group chat
  const createGroup = () => {
    if (!groupName.trim() || groupMembers.length === 0) return;
    const groupId = `grp-${Date.now()}`;
    const newGroup: ChatRecipient = {
      type: 'group',
      id: groupId,
      name: groupName.trim(),
      memberIds: [selectedUser.id, ...groupMembers],
    };
    setChatRecipient(newGroup);
    setShowGroupCreator(false);
    setGroupName('');
    setGroupMembers([]);
  };

  const companyEmployees = employees.filter(e => e.companyId === selectedCompany.id);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer ${
          isOpen ? 'bg-slate-800' : 'bg-slate-900 hover:bg-slate-800 hover:scale-105'
        }`}
        title="Team Chat"
      >
        <i className={`text-white text-xl ${isOpen ? 'bi bi-x-lg' : 'bi bi-chat-dots-fill'}`}></i>
        {!isOpen && totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[9px] fw-bold rounded-full flex items-center justify-center px-1 animate-bounce">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[440px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
                <i className="bi bi-chat-dots-fill text-xs"></i>
              </div>
              <div>
                <span className="text-[11px] fw-bold text-white block">Team Chat</span>
                <span className="text-[9px] text-white/50">{selectedCompany.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowGroupCreator(!showGroupCreator)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all"
                title="Create Group">
                <i className="bi bi-people-fill text-white/70 text-xs"></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all">
                <i className="bi bi-chevron-down text-white/70 text-xs"></i>
              </button>
            </div>
          </div>

          {/* Group Creator */}
          {showGroupCreator && (
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 space-y-2">
              <div className="text-[10px] fw-bold text-slate-500 uppercase">New Group Chat</div>
              <input
                placeholder="Group name…"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {companyEmployees.filter(e => e.id !== selectedUser.id).map(e => {
                  const fullName = `${e.firstName} ${e.lastName}`;
                  const selected = groupMembers.includes(e.id);
                  return (
                    <label key={e.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={selected}
                        onChange={ev => setGroupMembers(prev => ev.target.checked ? [...prev, e.id] : prev.filter(id => id !== e.id))}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3 w-3" />
                      <span className="text-[11px] text-slate-700">{fullName}</span>
                      <span className="text-[9px] text-slate-400 ml-auto">{e.department || ''}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowGroupCreator(false)} className="flex-1 text-[10px] fw-semibold py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button onClick={createGroup} disabled={!groupName.trim() || groupMembers.length === 0}
                  className="flex-1 text-[10px] fw-bold py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  Create ({groupMembers.length})
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Recipients */}
            <div className="w-48 border-r border-slate-100 flex flex-col shrink-0">
              <div className="px-3 py-2 border-b border-slate-100">
                <input
                  placeholder="Search…"
                  value={chatSearch}
                  onChange={e => setChatSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Teams */}
                <div className="px-3 pt-2.5 pb-1 text-[9px] fw-bold uppercase tracking-widest text-slate-400">Teams</div>
                {departments.filter(d => d.companyId === selectedCompany.id && d.name === myDeptName)
                  .filter(d => !chatSearch || d.name.toLowerCase().includes(chatSearch.toLowerCase()))
                  .sort((a, b) => (getLastMessage(b.id)?.timestamp || 0) - (getLastMessage(a.id)?.timestamp || 0))
                  .map(d => {
                    const tid = d.id;
                    const unread = unreadByThread[tid] || 0;
                    const isActive = chatRecipient?.type === 'team' && chatRecipient.id === d.id;
                    const lastMsg = getLastMessage(tid);
                    return (
                      <button key={`ft-${d.id}`} onClick={() => setChatRecipient({ type: 'team', id: d.id, name: d.name })}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-[11px] cursor-pointer transition-all rounded-md mx-1 ${
                          isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                        }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] fw-bold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>{d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate fw-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{d.name}</div>
                          {lastMsg && <div className={`truncate text-[9px] ${isActive ? 'text-white/50' : 'text-slate-400'}`}>{lastMsg.from.split(' ')[0]}: {lastMsg.text}</div>}
                        </div>
                        {unread > 0 && !isActive && (
                          <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[8px] fw-bold rounded-full flex items-center justify-center shrink-0 px-1">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {/* Groups */}
                <div className="px-3 pt-3 pb-1 text-[9px] fw-bold uppercase tracking-widest text-slate-400 cursor-pointer flex items-center justify-between transition-colors">
                  <div onClick={() => setGroupsExpanded(!groupsExpanded)} className="flex items-center gap-1 hover:text-slate-600">
                    <i className={`bi bi-chevron-${groupsExpanded ? 'down' : 'right'} text-[8px]`}></i> Groups
                  </div>
                  <button onClick={() => {
                    const name = prompt('Enter group name:');
                    if (name && onCreateChatGroup) {
                      onCreateChatGroup({ name, members: [selectedUser.id], type: 'custom' });
                    }
                  }} className="hover:text-slate-600"><i className="bi bi-plus-lg"></i></button>
                </div>
                {groupsExpanded && (chatGroups || []).filter(g => g.companyId === selectedCompany.id && g.members.includes(selectedUser.id))
                  .filter(g => !chatSearch || g.name.toLowerCase().includes(chatSearch.toLowerCase()))
                  .sort((a, b) => (getLastMessage(b.id)?.timestamp || 0) - (getLastMessage(a.id)?.timestamp || 0))
                  .map(g => {
                    const tid = g.id;
                    const lastMsg = getLastMessage(tid);
                    const unread = unreadByThread[tid] || 0;
                    const isActive = chatRecipient?.type === 'group' && chatRecipient.id === tid;
                    return (
                      <button key={`ft-grp-${tid}`} onClick={() => setChatRecipient({ type: 'group', id: tid, name: g.name })}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-[11px] cursor-pointer transition-all rounded-md mx-1 ${
                          isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                        }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'
                        }`}><i className="bi bi-people-fill text-[9px]"></i></span>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate fw-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{g.name}</div>
                          {lastMsg && <div className={`truncate text-[9px] ${isActive ? 'text-white/50' : 'text-slate-400'}`}>{lastMsg.text}</div>}
                        </div>
                        {unread > 0 && !isActive && (
                          <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[8px] fw-bold rounded-full flex items-center justify-center shrink-0 px-1">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {/* People */}
                <div className="px-3 pt-3 pb-1 text-[9px] fw-bold uppercase tracking-widest text-slate-400">People</div>
                {companyEmployees
                  .filter(e => !chatSearch || `${e.firstName} ${e.lastName}`.toLowerCase().includes(chatSearch.toLowerCase()) || e.department?.toLowerCase().includes(chatSearch.toLowerCase()))
                  .sort((a, b) => {
                    const tidA = [selectedUser.id, a.userId || a.id].sort().join('::dm::');
                    const tidB = [selectedUser.id, b.userId || b.id].sort().join('::dm::');
                    return (getLastMessage(tidB)?.timestamp || 0) - (getLastMessage(tidA)?.timestamp || 0);
                  })
                  .map(e => {
                    const fullName = `${e.firstName} ${e.lastName}`;
                    const initials = `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
                    const tid = [selectedUser.id, e.userId || e.id].sort().join('::dm::');
                    const unread = unreadByThread[tid] || 0;
                    const isActive = chatRecipient?.type === 'person' && chatRecipient.id === (e.userId || e.id);
                    const lastMsg = getLastMessage(tid);
                    return (
                      <button key={`fe-${e.id}`} onClick={() => setChatRecipient({ type: 'person', id: e.userId || e.id, name: fullName })}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-[11px] cursor-pointer transition-all rounded-md mx-1 ${
                          isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                        }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] fw-bold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>{initials}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate fw-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{fullName}</div>
                          {lastMsg ? (
                            <div className={`truncate text-[9px] ${isActive ? 'text-white/50' : 'text-slate-400'}`}>{lastMsg.text}</div>
                          ) : (
                            <div className={`truncate text-[9px] ${isActive ? 'text-white/50' : 'text-slate-400'}`}>{e.department || '—'}</div>
                          )}
                        </div>
                        {unread > 0 && !isActive && (
                          <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[8px] fw-bold rounded-full flex items-center justify-center shrink-0 px-1">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Right: Chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {chatRecipient ? (
                <>
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5 bg-white">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] fw-bold text-white ${
                      chatRecipient.type === 'group' ? 'bg-violet-600' : 'bg-slate-900'
                    }`}>
                      {chatRecipient.type === 'group' ? <i className="bi bi-people-fill text-[9px]"></i> :
                        chatRecipient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] fw-bold text-slate-900 truncate">{chatRecipient.name}</div>
                      <div className="text-[9px] text-slate-400">
                        {chatRecipient.type === 'team' ? 'Department channel' : chatRecipient.type === 'group' ? 'Custom Group' : 'Direct message'}
                      </div>
                    </div>
                  </div>
                  {chatRecipient.type === 'group' && onUpdateChatGroupMembers && (
                    <div className="mr-3">
                      <button 
                        onClick={() => {
                          const currentGroup = (chatGroups || []).find(g => g.id === chatRecipient.id);
                          if (!currentGroup) return;
                          const action = prompt('Type "add" to add a user email, or "remove" to remove a user email:');
                          if (action === 'add' || action === 'remove') {
                            const email = prompt(`Enter email to ${action}:`);
                            const emp = employees.find(e => e.companyId === selectedCompany.id && e.email === email);
                            if (!emp) {
                              alert('Employee not found!');
                              return;
                            }
                            const uid = emp.userId || emp.id;
                            let newMembers = [...currentGroup.members];
                            if (action === 'add' && !newMembers.includes(uid)) newMembers.push(uid);
                            if (action === 'remove') newMembers = newMembers.filter(m => m !== uid);
                            onUpdateChatGroupMembers(chatRecipient.id, newMembers);
                          }
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] fw-semibold transition-colors">
                        Manage Members
                      </button>
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
                    {(() => {
                      const threadId = getThreadId(chatRecipient);
                      const isDeptMember = chatRecipient.type === 'team' && chatRecipient.name === myDeptName;
                      const deptMemberUserIds = chatRecipient.type === 'team'
                        ? employees.filter(e => e.department === chatRecipient.name).map(e => e.userId || e.id)
                        : [];

                      const threadMsgs = chatMessages
                        .filter(m => m.companyId === selectedCompany.id && m.threadId === threadId)
                        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                      if (threadMsgs.length === 0) return (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <i className="bi bi-chat-dots text-3xl text-slate-200"></i>
                          <span className="text-[10px] text-slate-400">No messages yet. Say hello!</span>
                        </div>
                      );
                      let lastDate = '';
                      return threadMsgs.map((m: any, i: number) => {
                        const msgDate = new Date(m.createdAt).toLocaleDateString();
                        const showDate = msgDate !== lastDate;
                        lastDate = msgDate;
                        const isMe = m.senderId === selectedUser.id;
                        return (
                          <React.Fragment key={m.id || i}>
                            {showDate && (
                              <div className="flex justify-center py-1">
                                <span className="text-[9px] bg-white border border-slate-200 text-slate-400 px-2 py-0.5 rounded-full">{msgDate}</span>
                              </div>
                            )}
                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[11px] shadow-xs ${
                                isMe ? 'bg-slate-900 text-white rounded-br-md' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'
                              }`}>
                                {!isMe && chatRecipient.type !== 'person' && (
                                  <div className="fw-semibold mb-0.5 text-[9px]" style={{ color: isMe ? 'rgba(255,255,255,0.5)' : '#6366f1' }}>{m.senderName}</div>
                                )}
                                <div className="leading-relaxed">{m.message}</div>
                                <div className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/40' : 'text-slate-300'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isMe && <i className="bi bi-check2-all ml-1"></i>}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()}
                    <div ref={chatBottomRef} />
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 flex gap-2 bg-white">
                    <input
                      placeholder={`Message ${chatRecipient.name}…`}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          onSendChatMessage({
                            companyId: selectedCompany.id,
                            threadId: getThreadId(chatRecipient),
                            senderId: selectedUser.id,
                            senderName: selectedUser.name,
                            message: chatInput.trim(),
                          });
                          setChatInput('');
                        }
                      }}
                      className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      className={`w-9 h-9 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0`}
                      onClick={() => {
                        if (!chatInput.trim() || !chatRecipient) return;
                        onSendChatMessage({
                          companyId: selectedCompany.id,
                          threadId: getThreadId(chatRecipient),
                          senderId: selectedUser.id,
                          senderName: selectedUser.name,
                          message: chatInput.trim(),
                        });
                        setChatInput('');
                      }}
                      disabled={!chatInput.trim()}
                    >
                      <i className="bi bi-send-fill text-[10px]"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <i className="bi bi-chat-left-text text-2xl text-slate-300"></i>
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] fw-semibold text-slate-500">Your Messages</div>
                    <div className="text-[10px] text-slate-400 mt-1">Send private messages to a team or person</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
