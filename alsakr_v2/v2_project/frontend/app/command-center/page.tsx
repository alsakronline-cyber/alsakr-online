"use client";

import React from 'react';
import { AgentSidebar } from './components/AgentSidebar';
import { Header } from './components/Header';
import { MatrixLog } from './components/MatrixLog';
import { ActionPanel } from './components/ActionPanel';

export default function CommandCenter() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0F172A]">
      {/* Header */}
      <Header />

      {/* Main Layout: 3-Column Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Agent Sidebar */}
        <div className="w-72">
          <AgentSidebar />
        </div>

        {/* Center: Matrix Log */}
        <div className="flex-1">
          <MatrixLog />
        </div>

        {/* Right: Action Panel */}
        <div className="w-96">
          <ActionPanel />
        </div>
      </div>
    </div>
  );
}
