import React, { useState, useEffect } from 'react';
import { PresenterBar } from './components/PresenterBar';
import { AgendaSidebar } from './components/AgendaSidebar';
import { HtmlViewer } from './components/Viewers/HtmlViewer';
import { PdfViewer } from './components/Viewers/PdfViewer';
import { ExcelViewer } from './components/Viewers/ExcelViewer';
import { MediaViewer } from './components/Viewers/MediaViewer';
import { ActionItemsModal } from './components/ActionItemsModal';
import { PresenterToolsOverlay } from './components/PresenterToolsOverlay';
import { DanmakuOverlay } from './components/DanmakuOverlay';
import { ReactionsOverlay } from './components/ReactionsOverlay';
import { AttendeeCheerBar } from './components/AttendeeCheerBar';
import { LivePollModal } from './components/LivePollModal';
import { AdminConsole } from './components/Admin/AdminConsole';
import { MeetingConfig, ActionItem, SyncMessage, DrawingStroke, PollState, DanmakuItem } from './types';
import { syncService } from './services/syncService';
import { meetingDatabase } from './services/meetingDatabase';

// Import local JSON agenda
import meetingData from '../content/meetings/2026-11-exec.json';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'live' | 'admin'>('live');
  const [currentMeeting, setCurrentMeeting] = useState<MeetingConfig>(() => {
    const list = meetingDatabase.getMeetings();
    return list[0] || (meetingData as MeetingConfig);
  });

  const config = currentMeeting;

  // App State
  const [role, setRole] = useState<'presenter' | 'attendee'>('presenter');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Presenter Interactive Tools
  const [activeTool, setActiveTool] = useState<'laser' | 'spotlight' | 'pen' | 'none'>('none');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [remotePointer, setRemotePointer] = useState<{ x: number; y: number; active: boolean; tool: 'laser' | 'spotlight' | 'pen' | 'none' } | null>(null);

  // Poll State
  const [poll, setPoll] = useState<PollState | null>(null);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  // Cheer & Danmaku State
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([]);
  const [latestGift, setLatestGift] = useState<{ emoji: string; label: string; sender: string } | null>(null);
  const [interactiveEnabled, setInteractiveEnabled] = useState(true);

  // Default Action items for demo
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: 'act-1',
      title: '財務處於 11/15 前確認各處 Q4 預算挪移與保留款名冊',
      owner: 'Amy (財務處)',
      dueDate: '11/15',
      status: 'in_progress'
    },
    {
      id: 'act-2',
      title: 'IT 部門完成海外據點 VPN 安全連線設定與白名單稽核',
      owner: 'David (資訊部)',
      dueDate: '11/22',
      status: 'pending'
    }
  ]);

  // Handle Sync messages across tabs / devices
  useEffect(() => {
    const unsubscribe = syncService.subscribe((msg: SyncMessage) => {
      switch (msg.type) {
        case 'AGENDA_CHANGE':
          if (role === 'attendee' && typeof msg.currentIndex === 'number') {
            setCurrentIndex(msg.currentIndex);
            // Clear drawings on page turn
            setStrokes([]);
          }
          break;

        case 'ACTION_UPDATE':
          if (msg.actionItems) setActionItems(msg.actionItems);
          break;

        case 'POINTER_MOVE':
          if (role === 'attendee' && msg.pointer) {
            setRemotePointer(msg.pointer);
          }
          break;

        case 'DRAW_STROKE':
          if (role === 'attendee' && msg.stroke) {
            setStrokes((prev) => [...prev, msg.stroke!]);
          }
          break;

        case 'DRAW_CLEAR':
          setStrokes([]);
          break;

        case 'POLL_UPDATE':
          setPoll(msg.poll || null);
          if (msg.poll && msg.poll.isOpen) {
            setIsPollModalOpen(true);
          }
          break;

        case 'POLL_VOTE':
          if (role === 'presenter' && poll && msg.poll) {
            setPoll(msg.poll);
          }
          break;

        case 'DANMAKU_SEND':
          if (msg.danmaku) {
            setDanmakuList((prev) => [...prev, msg.danmaku!]);
          }
          break;

        case 'GIFT_SEND':
          if (msg.gift) {
            setLatestGift(msg.gift);
          }
          break;

        case 'INTERACTIVE_TOGGLE':
          if (typeof msg.interactiveEnabled === 'boolean') {
            setInteractiveEnabled(msg.interactiveEnabled);
          }
          break;

        case 'SYNC_REQUEST':
          if (role === 'presenter') {
            syncService.send({
              type: 'SYNC_RESPONSE',
              currentIndex,
              isLocked,
              actionItems,
              poll,
              interactiveEnabled,
              timestamp: Date.now()
            });
          }
          break;

        case 'SYNC_RESPONSE':
          if (role === 'attendee') {
            if (typeof msg.currentIndex === 'number') setCurrentIndex(msg.currentIndex);
            if (typeof msg.isLocked === 'boolean') setIsLocked(msg.isLocked);
            if (msg.actionItems) setActionItems(msg.actionItems);
            if (msg.poll !== undefined) setPoll(msg.poll);
            if (typeof msg.interactiveEnabled === 'boolean') setInteractiveEnabled(msg.interactiveEnabled);
          }
          break;
      }
    });

    if (role === 'attendee') {
      syncService.send({
        type: 'SYNC_REQUEST',
        timestamp: Date.now()
      });
    }

    return () => unsubscribe();
  }, [role, currentIndex, isLocked, actionItems, poll, interactiveEnabled]);

  // Navigate agenda
  const handleNavigate = (index: number) => {
    setCurrentIndex(index);
    setStrokes([]);
    if (role === 'presenter') {
      syncService.send({
        type: 'AGENDA_CHANGE',
        currentIndex: index,
        timestamp: Date.now()
      });
    }
  };

  // Clear Drawings
  const handleClearDrawing = () => {
    setStrokes([]);
    syncService.send({
      type: 'DRAW_CLEAR',
      timestamp: Date.now()
    });
  };

  // Poll Handlers
  const handleStartPoll = (question: string, optionsText: string[]) => {
    const newPoll: PollState = {
      id: 'poll-' + Date.now(),
      question,
      options: optionsText.map((label, idx) => ({ id: 'opt-' + idx, label, votes: 0 })),
      isOpen: true,
      totalVotes: 0
    };
    setPoll(newPoll);
    syncService.send({
      type: 'POLL_UPDATE',
      poll: newPoll,
      timestamp: Date.now()
    });
  };

  const handleVote = (optionId: string) => {
    if (!poll) return;
    const updatedOptions = poll.options.map((opt) => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    const updatedPoll: PollState = {
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1
    };
    setPoll(updatedPoll);
    syncService.send({
      type: 'POLL_UPDATE',
      poll: updatedPoll,
      timestamp: Date.now()
    });
  };

  const handleClosePoll = () => {
    if (!poll) return;
    const closedPoll: PollState = { ...poll, isOpen: false };
    setPoll(closedPoll);
    syncService.send({
      type: 'POLL_UPDATE',
      poll: closedPoll,
      timestamp: Date.now()
    });
  };

  // Danmaku and Gift Handlers
  const handleSendDanmaku = (text: string) => {
    const newItem: DanmakuItem = {
      id: 'dm-' + Date.now() + '-' + Math.random(),
      text,
      top: Math.floor(Math.random() * 65) + 10,
      color: ['#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 5)]
    };
    setDanmakuList((prev) => [...prev, newItem]);
    syncService.send({
      type: 'DANMAKU_SEND',
      danmaku: newItem,
      timestamp: Date.now()
    });
  };

  const handleSendGift = (emoji: string, label: string) => {
    const gift = { emoji, label, sender: role === 'presenter' ? '主席' : '與會代表' };
    setLatestGift(gift);
    syncService.send({
      type: 'GIFT_SEND',
      gift,
      timestamp: Date.now()
    });
  };

  const handleToggleInteractive = (enabled: boolean) => {
    setInteractiveEnabled(enabled);
    syncService.send({
      type: 'INTERACTIVE_TOGGLE',
      interactiveEnabled: enabled,
      timestamp: Date.now()
    });
  };

  // Action Items handlers
  const handleAddAction = (item: Omit<ActionItem, 'id'>) => {
    const newItem: ActionItem = { ...item, id: 'act-' + Date.now() };
    const updated = [newItem, ...actionItems];
    setActionItems(updated);
    syncService.send({
      type: 'ACTION_UPDATE',
      actionItems: updated,
      timestamp: Date.now()
    });
  };

  const handleToggleAction = (id: string) => {
    const updated = actionItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'completed' ? 'in_progress' : 'completed'
        } as ActionItem;
      }
      return item;
    });
    setActionItems(updated);
    syncService.send({
      type: 'ACTION_UPDATE',
      actionItems: updated,
      timestamp: Date.now()
    });
  };

  const handleDeleteAction = (id: string) => {
    const updated = actionItems.filter(item => item.id !== id);
    setActionItems(updated);
    syncService.send({
      type: 'ACTION_UPDATE',
      actionItems: updated,
      timestamp: Date.now()
    });
  };

  const currentAgenda = config.agendas[currentIndex] || config.agendas[0];

  if (viewMode === 'admin') {
    return (
      <AdminConsole
        onBackToLive={() => setViewMode('live')}
        onSelectMeetingForLive={(m) => {
          setCurrentMeeting(m);
          setCurrentIndex(0);
          setStrokes([]);
          setViewMode('live');
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Presenter Bar */}
      <PresenterBar
        role={role}
        setRole={setRole}
        currentAgenda={currentAgenda}
        currentIndex={currentIndex}
        totalAgendas={config.agendas.length}
        onNavigate={handleNavigate}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        onOpenActions={() => setIsActionModalOpen(true)}
        actionItemCount={actionItems.length}
        onOpenAdmin={() => setViewMode('admin')}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClearDrawing={handleClearDrawing}
        hasDrawings={strokes.length > 0}
        onOpenPoll={() => setIsPollModalOpen(true)}
        isPollOpen={!!poll?.isOpen}
        interactiveEnabled={interactiveEnabled}
        setInteractiveEnabled={handleToggleInteractive}
      />

      {/* Main Workspace: Sidebar + Viewer */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Agenda Sidebar */}
        <AgendaSidebar
          agendas={config.agendas}
          currentIndex={currentIndex}
          onSelectAgenda={handleNavigate}
          disabled={role === 'attendee' && isLocked}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          meetingTitle={config.title}
          meetingDate={config.date}
          chairperson={config.chairperson}
        />

        {/* Central Content Area */}
        <section className="flex-1 flex flex-col overflow-hidden relative">
          {/* Presenter Canvas Tools Overlay (Laser, Spotlight, Pen) */}
          <PresenterToolsOverlay
            role={role}
            activeTool={activeTool}
            strokes={strokes}
            setStrokes={setStrokes}
            remotePointer={remotePointer}
          />

          {/* Danmaku Floating Comments Overlay */}
          <DanmakuOverlay
            danmakuList={danmakuList}
            enabled={interactiveEnabled}
          />

          {/* Floating Reactions & Gifts Overlay */}
          <ReactionsOverlay
            latestGift={latestGift}
            enabled={interactiveEnabled}
          />

          {/* Attendee Cheer & Reaction Bar */}
          <AttendeeCheerBar
            onSendDanmaku={handleSendDanmaku}
            onSendGift={handleSendGift}
            enabled={interactiveEnabled}
          />

          {/* Viewers Container */}
          {currentAgenda.contentType === 'html' && (
            <HtmlViewer
              key={currentAgenda.id}
              src={currentAgenda.contentSrc}
              title={currentAgenda.title}
              description={currentAgenda.description}
            />
          )}

          {currentAgenda.contentType === 'pdf' && (
            <PdfViewer
              key={currentAgenda.id}
              src={currentAgenda.contentSrc}
              title={currentAgenda.title}
              description={currentAgenda.description}
            />
          )}

          {currentAgenda.contentType === 'excel_table' && (
            <ExcelViewer
              key={currentAgenda.id}
              src={currentAgenda.contentSrc}
              title={currentAgenda.title}
              schema={currentAgenda.schema}
              description={currentAgenda.description}
            />
          )}

          {currentAgenda.contentType === 'media' && (
            <MediaViewer
              key={currentAgenda.id}
              src={currentAgenda.contentSrc}
              title={currentAgenda.title}
              description={currentAgenda.description}
            />
          )}
        </section>
      </main>

      {/* Action Items Modal */}
      <ActionItemsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        actionItems={actionItems}
        onAddAction={handleAddAction}
        onToggleAction={handleToggleAction}
        onDeleteAction={handleDeleteAction}
        role={role}
      />

      {/* Live Poll Modal */}
      <LivePollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        poll={poll}
        onStartPoll={handleStartPoll}
        onVote={handleVote}
        onClosePoll={handleClosePoll}
        role={role}
      />
    </div>
  );
};
