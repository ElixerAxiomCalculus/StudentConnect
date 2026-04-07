import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitQuestionnaire } from '../UserDashboard/data/api';

/* ─────────────────────────── DESIGN TOKENS ─────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

  .oq-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg, #fff5ee 0%, #ffe0cc 60%, #f0e8ff 100%);
    background-color: #fef5f0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 20px 60px;
    position: relative;
    overflow-x: hidden;
  }

  .oq-blob { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
  .oq-blob-1 { width: 480px; height: 480px; background: rgba(212,67,50,0.08); top: -120px; right: -120px; }
  .oq-blob-2 { width: 360px; height: 360px; background: rgba(255,160,100,0.10); bottom: -90px; left: -90px; }
  .oq-blob-3 { width: 280px; height: 280px; background: rgba(59,89,153,0.07); top: 40%; left: 60%; }

  .oq-card {
    background: rgba(255,255,255,0.90);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border-radius: 28px;
    padding: 48px 52px;
    width: 100%;
    max-width: 760px;
    box-shadow: 0 8px 48px rgba(180,60,40,0.12), 0 2px 8px rgba(0,0,0,0.06);
    border: 1px solid rgba(255,210,185,0.55);
    position: relative;
    z-index: 1;
  }

  /* ── Brand ── */
  .oq-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .oq-logo { width: 42px; height: 42px; background: #d44332; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 15px; letter-spacing: -0.5px; flex-shrink: 0; }
  .oq-brand-name { font-size: 15px; font-weight: 700; color: #1a1a2e; }
  .oq-brand-sub { font-size: 10px; color: #8888a0; letter-spacing: 1.4px; text-transform: uppercase; }

  /* ── Step indicator ── */
  .oq-steps { display: flex; align-items: center; gap: 0; margin-bottom: 24px; flex-wrap: wrap; }
  .oq-step { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #8888a0; }
  .oq-step.active { color: #d44332; }
  .oq-step.done { color: #555566; }
  .oq-step-dot { width: 24px; height: 24px; border-radius: 50%; background: rgba(136,136,160,0.15); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #8888a0; flex-shrink: 0; }
  .oq-step.active .oq-step-dot { background: #d44332; color: white; }
  .oq-step.done .oq-step-dot { background: rgba(212,67,50,0.15); color: #d44332; }
  .oq-step-line { width: 32px; height: 2px; background: rgba(212,67,50,0.14); margin: 0 6px; border-radius: 99px; flex-shrink: 0; }
  .oq-step-line.done { background: #d44332; }

  /* ── Progress ── */
  .oq-progress-wrap { margin-bottom: 28px; }
  .oq-progress-info { display: flex; justify-content: space-between; font-size: 11px; color: #555566; margin-bottom: 7px; }
  .oq-progress-bar { height: 6px; background: rgba(212,67,50,0.10); border-radius: 99px; overflow: hidden; }
  .oq-progress-fill { height: 100%; background: linear-gradient(90deg, #e87748, #b83325); border-radius: 99px; transition: width 0.5s ease; }

  /* ── Typography ── */
  .oq-title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a1a2e; margin-bottom: 6px; }
  .oq-subtitle { font-size: 13.5px; color: #555566; margin-bottom: 28px; line-height: 1.6; }

  /* ── Section label ── */
  .oq-section { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #d44332; margin-bottom: 10px; margin-top: 24px; }
  .oq-divider { height: 1px; background: rgba(212,67,50,0.12); margin: 22px 0; }

  /* ── Form grid ── */
  .oq-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .oq-field { display: flex; flex-direction: column; gap: 6px; }
  .oq-label { font-size: 12px; font-weight: 600; color: #555566; }
  .oq-input {
    padding: 11px 14px;
    border-radius: 11px;
    border: 1.5px solid rgba(212,67,50,0.18);
    background: rgba(255,248,244,0.9);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: #1a1a2e;
    outline: none;
    transition: border-color 0.18s;
    width: 100%;
    box-sizing: border-box;
  }
  .oq-input:focus { border-color: #d44332; background: white; }
  .oq-input::placeholder { color: #8888a0; }
  .oq-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a0' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .oq-textarea { resize: vertical; min-height: 80px; line-height: 1.55; }

  /* ── Year selector ── */
  .oq-year-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .oq-year-btn {
    padding: 14px 8px;
    border-radius: 12px;
    border: 2px solid rgba(212,67,50,0.15);
    background: rgba(255,255,255,0.6);
    cursor: pointer;
    text-align: center;
    transition: all 0.18s;
    user-select: none;
  }
  .oq-year-btn:hover { border-color: rgba(212,67,50,0.4); }
  .oq-year-btn.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-year-num { font-size: 18px; font-weight: 800; color: #1a1a2e; line-height: 1; }
  .oq-year-btn.on .oq-year-num { color: #d44332; }
  .oq-year-label { font-size: 10px; color: #8888a0; margin-top: 4px; font-weight: 500; }
  .oq-year-btn.on .oq-year-label { color: #d44332; }

  /* ── Interest chips ── */
  .oq-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .oq-chip {
    padding: 8px 16px;
    border-radius: 99px;
    border: 1.5px solid rgba(212,67,50,0.18);
    background: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 500;
    color: #555566;
    cursor: pointer;
    transition: all 0.18s;
    user-select: none;
  }
  .oq-chip.on { background: #d44332; border-color: #d44332; color: white; }
  .oq-chip:hover:not(.on) { border-color: #d44332; color: #d44332; }

  /* ── Question card ── */
  .oq-q-card {
    background: rgba(255,255,255,0.65);
    border-radius: 16px;
    padding: 22px 24px;
    margin-bottom: 14px;
    border: 1.5px solid rgba(212,67,50,0.12);
    box-shadow: 0 2px 12px rgba(180,60,40,0.05);
    transition: box-shadow 0.2s;
  }
  .oq-q-card:hover { box-shadow: 0 5px 20px rgba(180,60,40,0.10); }
  .oq-q-num { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #d44332; margin-bottom: 7px; }
  .oq-q-text { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; line-height: 1.45; }

  /* ── Radio options ── */
  .oq-options { display: flex; flex-direction: column; gap: 8px; }
  .oq-option {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px;
    border-radius: 11px;
    border: 1.5px solid rgba(212,67,50,0.16);
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.18s;
    font-size: 13.5px;
    color: #555566;
    font-weight: 500;
    user-select: none;
  }
  .oq-option:hover { border-color: #d44332; color: #1a1a2e; background: rgba(255,255,255,0.85); }
  .oq-option.on { border-color: #d44332; background: rgba(212,67,50,0.08); color: #1a1a2e; }
  .oq-radio {
    width: 17px; height: 17px; border-radius: 50%;
    border: 2px solid rgba(212,67,50,0.28);
    background: white; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }
  .oq-option.on .oq-radio { border-color: #d44332; background: #d44332; }
  .oq-radio-inner { width: 5px; height: 5px; border-radius: 50%; background: white; }
  .oq-opt-emoji { font-size: 17px; line-height: 1; }

  /* ── Emoji scale ── */
  .oq-scale { display: flex; gap: 8px; }
  .oq-scale-item {
    flex: 1; padding: 12px 4px; border-radius: 12px; text-align: center;
    border: 2px solid rgba(212,67,50,0.14);
    background: rgba(255,255,255,0.5);
    cursor: pointer; transition: all 0.18s; user-select: none;
  }
  .oq-scale-item:hover { border-color: #d44332; }
  .oq-scale-item.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-scale-emoji { font-size: 20px; display: block; margin-bottom: 4px; }
  .oq-scale-text { font-size: 9px; font-weight: 600; color: #8888a0; }
  .oq-scale-item.on .oq-scale-text { color: #d44332; }

  /* ── Slider ── */
  .oq-slider-poles { display: flex; justify-content: space-between; font-size: 11px; color: #555566; margin-bottom: 10px; font-weight: 500; }
  .oq-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 6px;
    background: linear-gradient(90deg, #d44332, #f4b08a);
    border-radius: 99px; outline: none; cursor: pointer; display: block;
  }
  .oq-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px;
    border-radius: 50%; background: white;
    border: 3px solid #d44332;
    box-shadow: 0 2px 8px rgba(212,67,50,0.25); cursor: pointer;
  }
  .oq-slider::-moz-range-thumb {
    width: 20px; height: 20px; border-radius: 50%; background: white;
    border: 3px solid #d44332;
    box-shadow: 0 2px 8px rgba(212,67,50,0.25); cursor: pointer;
  }
  .oq-slider-badge { text-align: center; margin-top: 8px; }
  .oq-slider-badge span {
    display: inline-block; background: #d44332; color: white;
    border-radius: 99px; padding: 3px 16px; font-size: 11px; font-weight: 700;
  }

  /* ── Skill / goal grids ── */
  .oq-skill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 9px; }
  .oq-skill-card {
    background: rgba(255,255,255,0.65);
    border: 2px solid transparent;
    border-radius: 14px; padding: 14px 8px;
    text-align: center; cursor: pointer; transition: all 0.18s;
    box-shadow: 0 2px 8px rgba(180,60,40,0.05);
    user-select: none;
  }
  .oq-skill-card:hover { transform: translateY(-2px); border-color: rgba(212,67,50,0.25); }
  .oq-skill-card.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-skill-icon { font-size: 22px; display: block; margin-bottom: 5px; }
  .oq-skill-name { font-size: 11px; font-weight: 600; color: #1a1a2e; }
  .oq-skill-check { width: 14px; height: 14px; border-radius: 50%; background: #d44332; color: white; font-size: 8px; display: flex; align-items: center; justify-content: center; margin: 4px auto 0; opacity: 0; transform: scale(0.5); transition: all 0.2s; }
  .oq-skill-card.on .oq-skill-check { opacity: 1; transform: scale(1); }

  .oq-goal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .oq-goal-card {
    background: rgba(255,255,255,0.65);
    border: 2px solid transparent;
    border-radius: 16px; padding: 16px 14px;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: flex-start; gap: 12px;
    box-shadow: 0 2px 8px rgba(180,60,40,0.05);
    user-select: none;
  }
  .oq-goal-card:hover { transform: translateY(-2px); border-color: rgba(212,67,50,0.25); }
  .oq-goal-card.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-goal-icon { font-size: 24px; flex-shrink: 0; }
  .oq-goal-title { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px; }
  .oq-goal-card.on .oq-goal-title { color: #d44332; }
  .oq-goal-desc { font-size: 10.5px; color: #8888a0; line-height: 1.4; }

  /* ── Days ── */
  .oq-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; }
  .oq-day {
    background: rgba(255,255,255,0.65);
    border: 2px solid transparent;
    border-radius: 10px; padding: 11px 4px;
    text-align: center; cursor: pointer; transition: all 0.18s; user-select: none;
  }
  .oq-day.on { background: #d44332; border-color: #d44332; }
  .oq-day-name { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555566; }
  .oq-day.on .oq-day-name { color: white; }

  /* ── Team size ── */
  .oq-team-row { display: flex; gap: 9px; }
  .oq-team-opt {
    flex: 1; background: rgba(255,255,255,0.65);
    border: 2px solid transparent;
    border-radius: 14px; padding: 16px 8px; text-align: center;
    cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .oq-team-opt.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-team-opt:hover:not(.on) { border-color: rgba(212,67,50,0.25); }
  .oq-team-num { font-size: 18px; font-weight: 800; color: #1a1a2e; }
  .oq-team-opt.on .oq-team-num { color: #d44332; }
  .oq-team-label { font-size: 10px; color: #8888a0; margin-top: 3px; }

  /* ── Match type ── */
  .oq-match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .oq-match-card {
    background: rgba(255,255,255,0.65); border: 2px solid transparent;
    border-radius: 13px; padding: 14px;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 11px; user-select: none;
  }
  .oq-match-card.on { border-color: #d44332; background: rgba(212,67,50,0.08); }
  .oq-match-card:hover:not(.on) { border-color: rgba(212,67,50,0.25); }
  .oq-match-icon { font-size: 22px; }
  .oq-match-title { font-size: 12.5px; font-weight: 700; color: #1a1a2e; }
  .oq-match-card.on .oq-match-title { color: #d44332; }
  .oq-match-desc { font-size: 10.5px; color: #8888a0; }

  /* ── Footer ── */
  .oq-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(212,67,50,0.10); }
  .oq-step-count { font-size: 12px; color: #8888a0; }
  .oq-step-count b { color: #d44332; }
  .oq-btn-back {
    padding: 11px 24px; border-radius: 11px;
    border: 1.5px solid rgba(212,67,50,0.2); background: transparent;
    color: #555566; font-family: 'Inter', sans-serif;
    font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all 0.18s;
  }
  .oq-btn-back:hover { border-color: #d44332; color: #d44332; }
  .oq-btn-next {
    padding: 13px 36px; border-radius: 12px;
    background: linear-gradient(135deg, #e87748, #b83325);
    color: white; border: none; font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer;
    box-shadow: 0 5px 20px rgba(184,51,37,0.30); transition: all 0.2s;
  }
  .oq-btn-next:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(184,51,37,0.40); }
  .oq-btn-next:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* ── Complete screen ── */
  .oq-complete { text-align: center; padding: 20px 0; }
  .oq-complete-icon { font-size: 72px; display: block; margin-bottom: 20px; animation: oqBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  @keyframes oqBounce { from { transform: scale(0.4) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
  .oq-complete-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a1a2e; margin-bottom: 10px; }
  .oq-complete-sub { font-size: 14px; color: #555566; max-width: 480px; margin: 0 auto 32px; line-height: 1.7; }
  .oq-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; text-align: left; }
  .oq-feature-card {
    background: rgba(255,255,255,0.7); border-radius: 14px; padding: 16px 18px;
    border: 1.5px solid rgba(212,67,50,0.14);
    display: flex; align-items: flex-start; gap: 12px;
  }
  .oq-feature-icon { font-size: 24px; flex-shrink: 0; }
  .oq-feature-title { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 3px; }
  .oq-feature-desc { font-size: 11px; color: #8888a0; line-height: 1.45; }
  .oq-btn-finish {
    padding: 15px 52px; border-radius: 14px;
    background: linear-gradient(135deg, #e87748, #b83325);
    color: white; border: none; font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    box-shadow: 0 6px 24px rgba(184,51,37,0.32); transition: all 0.2s;
    display: inline-block;
  }
  .oq-btn-finish:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(184,51,37,0.42); }

  /* ── Error banner ── */
  .oq-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 12.5px; color: #dc2626; font-weight: 500; }

  @media (max-width: 640px) {
    .oq-card { padding: 28px 20px; }
    .oq-grid-2 { grid-template-columns: 1fr; }
    .oq-year-grid { grid-template-columns: repeat(2, 1fr); }
    .oq-goal-grid { grid-template-columns: 1fr; }
    .oq-match-grid { grid-template-columns: 1fr; }
    .oq-feature-grid { grid-template-columns: 1fr; }
    .oq-days { grid-template-columns: repeat(4, 1fr); }
  }
`;

/* ─────────────────────────── STATIC DATA ─────────────────────────── */
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration', 'Design / UX', 'Mathematics & Statistics', 'Physics', 'Other'];
const YEARS = [{ num: '1st', label: 'Freshman' }, { num: '2nd', label: 'Sophomore' }, { num: '3rd', label: 'Junior' }, { num: '4th+', label: 'Senior' }];
const INTERESTS = ['💻 Coding', '🤖 AI / ML', '🎨 Design', '📊 Data Science', '🚀 Startups', '🏆 Hackathons', '🎮 Game Dev', '📱 Mobile Apps', '🌍 Social Impact', '🔬 Research', '📦 Open Source', '☁️ Cloud / DevOps'];

const Q_PERSONALITY = [
  { id: 'q1', num: '01', cat: 'Social Energy', text: 'After a long group project session, how do you feel?', opts: [{ e: '🔋', l: 'Energized! I love working with others' }, { e: '😐', l: 'It depends on how well the group worked' }, { e: '😮‍💨', l: 'Tired — I prefer shorter focused sessions' }, { e: '🎧', l: 'I prefer working alone and syncing later' }] },
  { id: 'q2', num: '02', cat: 'Decision Making', text: "When your team can't agree on a solution, you usually…", opts: [{ e: '📊', l: 'Research and present data to back my idea' }, { e: '🤝', l: 'Look for a compromise everyone agrees on' }, { e: '🎯', l: 'Advocate strongly for what I believe is right' }, { e: '🔄', l: 'Go with the majority — execution matters more' }] },
];
const Q_SCALE = { id: 'q3', num: '03', cat: 'Feedback Style', text: 'How comfortable are you giving honest feedback to teammates?', opts: [{ e: '😬', l: 'Very Uncomfortable' }, { e: '😕', l: 'Uncomfortable' }, { e: '😊', l: 'Neutral / OK' }, { e: '😄', l: 'Comfortable' }, { e: '🗣️', l: 'Very Comfortable' }] };
const SLIDER_LABELS = ['Full Planner', 'Mostly Planned', 'Balanced', 'Mostly Spontaneous', 'Pure Improviser'];
const Q_WORK = [
  { id: 'q5', num: '05', cat: 'Under Pressure', text: 'How do you react when a project deadline is approaching fast?', opts: [{ e: '🧘', l: 'Stay calm and work through tasks step by step' }, { e: '⚡', l: 'Enter hyperfocus mode — deadlines fuel me' }, { e: '😰', l: 'Get stressed but somehow push through' }, { e: '🆘', l: 'Ask for help and redistribute the work' }] },
  { id: 'q6', num: '06', cat: 'Team Frustrations', text: 'What frustrates you the MOST in a group project?', opts: [{ e: '🐌', l: 'People who delay tasks and miss deadlines' }, { e: '🔕', l: 'Teammates who go silent and stop communicating' }, { e: '🧱', l: "When no one is open to trying new approaches" }, { e: '🎭', l: 'Lack of ownership — everyone blames someone else' }] },
];
const Q_COMM = [
  { id: 'q7', num: '07', cat: 'Communication', text: 'Your preferred way to communicate in a team is…', opts: [{ e: '💬', l: 'Quick chats on WhatsApp or Slack' }, { e: '📹', l: 'Regular video calls with structured agenda' }, { e: '📧', l: 'Async updates — I respond when I have time' }, { e: '🤷', l: 'Whatever the team prefers — I adapt easily' }] },
  { id: 'q8', num: '08', cat: 'Natural Role', text: 'In a group project, you naturally tend to be the…', opts: [{ e: '🦁', l: 'Leader — I drive the direction and make decisions' }, { e: '🔨', l: 'Executor — I focus on getting work done efficiently' }, { e: '💡', l: 'Ideator — I bring fresh ideas and creative solutions' }, { e: '🧩', l: 'Supporter — I keep the team motivated and together' }] },
  { id: 'q9', num: '09', cat: 'Handling Mistakes', text: 'When a teammate makes an error that affects the project, you…', opts: [{ e: '🔍', l: 'Analyze what went wrong and offer a concrete fix' }, { e: '🤗', l: 'Encourage them and help them recover' }, { e: '🤐', l: "Don't bring it up — avoid making it awkward" }, { e: '📋', l: 'Note it and discuss in the next team meeting' }] },
];

const SKILLS_OFFER = [{ e: '💻', n: 'Web Dev' }, { e: '🤖', n: 'AI / ML' }, { e: '🎨', n: 'UI / UX' }, { e: '📱', n: 'Mobile Dev' }, { e: '📊', n: 'Data Science' }, { e: '☁️', n: 'Cloud/DevOps' }, { e: '🔐', n: 'Cybersecurity' }, { e: '📢', n: 'Marketing' }, { e: '🎤', n: 'Presentation' }, { e: '✍️', n: 'Content Writing' }];
const SKILLS_SEEK = [{ e: '🎨', n: 'UI / UX' }, { e: '📊', n: 'Data Science' }, { e: '📢', n: 'Marketing' }, { e: '🧪', n: 'Research' }, { e: '📋', n: 'Project Mgmt' }, { e: '💰', n: 'Finance' }, { e: '🤝', n: 'Sales / BD' }, { e: '🎬', n: 'Video Editing' }];
const GOALS = [{ e: '🚀', t: 'Startup / Product', d: 'Build something real and launch it' }, { e: '🏆', t: 'Hackathons', d: 'Compete and win coding competitions' }, { e: '🎓', t: 'Research / Papers', d: 'Do academic research and publish' }, { e: '📖', t: 'Study Partner', d: 'Learn together and prep for exams' }, { e: '🌍', t: 'Social Impact', d: 'Build tech for real-world problems' }, { e: '🎮', t: 'Game Development', d: 'Build fun and engaging games' }];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['🌅 Early Morning', '☀️ Morning', '🌤 Afternoon', '🌆 Evening', '🌙 Night Owl'];
const PROJ_TAGS = ['🏗️ Long-term', '⚡ Quick sprints', '🤝 Ongoing collab', '📅 Weekend builds', '🌐 Remote only', '🏫 In-person OK', '🎯 Goal-oriented', '🧪 Experimental', '💼 Internship-ready'];
const TEAM_SIZES = [{ n: '1:1', l: 'Just us two' }, { n: '3–4', l: 'Small team' }, { n: '5–8', l: 'Medium team' }, { n: '8+', l: 'Large team' }];
const COMMIT_LABELS = ['1–2 hrs/week', '3–5 hrs/week', '6–8 hrs/week', '8–12 hrs/week', '12–20 hrs/week', '20–30 hrs/week', '30–40 hrs/week', '40+ hrs/week'];
const MATCH_TYPES = [{ e: '🔄', t: 'Complementary Skills', d: 'Different strengths, shared goals' }, { e: '🪞', t: 'Similar to Me', d: 'Same interests and working style' }, { e: '🌏', t: 'Diverse Background', d: 'Different department or year' }, { e: '🎲', t: 'Surprise Me!', d: 'Let the algorithm decide' }];
const DASHBOARD_FEATURES = [
  { e: '🤝', t: 'Smart Matching', d: 'AI-powered teammate recommendations based on your profile' },
  { e: '💬', t: 'Real-Time Chat', d: 'Connect instantly with matched students and your teams' },
  { e: '📁', t: 'Projects Hub', d: 'Create projects, assign tasks, and track progress together' },
  { e: '💬', t: 'Forums', d: 'Post questions, share insights, find study partners' },
  { e: '👥', t: 'Groups', d: 'Join or create clubs, study groups and more' },
  { e: '📡', t: 'Live Mode', d: 'Browse student profiles in real-time and connect instantly' },
];

function toggle(set, key) {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
}

/* ─────────────────────────── SUB COMPONENTS ─────────────────────────── */
function RadioQ({ q, selected, onSelect }) {
    return (
        <div className="oq-q-card">
            <div className="oq-q-num">Question {q.num} · {q.cat}</div>
            <div className="oq-q-text">{q.text}</div>
            <div className="oq-options">
                {q.opts.map((opt, i) => (
                    <div key={i} className={`oq-option${selected === i ? ' on' : ''}`} onClick={() => onSelect(q.id, i)}>
                        <div className="oq-radio">{selected === i && <div className="oq-radio-inner" />}</div>
                        <span className="oq-opt-emoji">{opt.e}</span>
                        <span>{opt.l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScaleQ({ q, selected, onSelect }) {
    return (
        <div className="oq-q-card">
            <div className="oq-q-num">Question {q.num} · {q.cat}</div>
            <div className="oq-q-text">{q.text}</div>
            <div className="oq-scale">
                {q.opts.map((opt, i) => (
                    <div key={i} className={`oq-scale-item${selected === i ? ' on' : ''}`} onClick={() => onSelect(q.id, i)}>
                        <span className="oq-scale-emoji">{opt.e}</span>
                        <div className="oq-scale-text">{opt.l}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────── STEP 1 — PROFILE ─────────────────────────── */
function StepProfile({ data, onChange }) {
    const { user } = useAuth();
    const nameParts = (user?.name || '').split(' ');
    const [firstName, setFirstName] = useState(data.firstName || nameParts[0] || '');
    const [lastName, setLastName] = useState(data.lastName || nameParts.slice(1).join(' ') || '');
    const [college, setCollege] = useState(data.college || '');
    const [department, setDepartment] = useState(data.department || '');
    const [yearIndex, setYearIndex] = useState(data.yearIndex ?? -1);
    const [github, setGithub] = useState(data.github || '');
    const [linkedin, setLinkedin] = useState(data.linkedin || '');
    const [interests, setInterests] = useState(data.interests || new Set());
    const [bio, setBio] = useState(data.bio || '');

    useEffect(() => {
        onChange({ firstName, lastName, college, department, yearIndex, github, linkedin, interests, bio });
    }, [firstName, lastName, college, department, yearIndex, github, linkedin, interests, bio]);

    return (
        <div>
            <div className="oq-section">Your Identity</div>
            <div className="oq-grid-2" style={{ marginBottom: 14 }}>
                <div className="oq-field">
                    <label className="oq-label">First Name *</label>
                    <input className="oq-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Sayak" />
                </div>
                <div className="oq-field">
                    <label className="oq-label">Last Name *</label>
                    <input className="oq-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Mukherjee" />
                </div>
                <div className="oq-field">
                    <label className="oq-label">College / University *</label>
                    <input className="oq-input" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. MIT, IIT Delhi" />
                </div>
                <div className="oq-field">
                    <label className="oq-label">Department *</label>
                    <select className="oq-input oq-select" value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">Select department…</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="oq-section">Year of Study *</div>
            <div className="oq-year-grid" style={{ marginBottom: 4 }}>
                {YEARS.map((y, i) => (
                    <div key={i} className={`oq-year-btn${yearIndex === i ? ' on' : ''}`} onClick={() => setYearIndex(i)}>
                        <div className="oq-year-num">{y.num}</div>
                        <div className="oq-year-label">{y.label}</div>
                    </div>
                ))}
            </div>

            <div className="oq-divider" />

            <div className="oq-section">Professional Links <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10, color: '#8888a0' }}>(optional)</span></div>
            <div className="oq-grid-2" style={{ marginBottom: 4 }}>
                <div className="oq-field">
                    <label className="oq-label">GitHub Username</label>
                    <input className="oq-input" value={github} onChange={e => setGithub(e.target.value)} placeholder="your-username" />
                </div>
                <div className="oq-field">
                    <label className="oq-label">LinkedIn URL</label>
                    <input className="oq-input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/you" />
                </div>
            </div>

            <div className="oq-divider" />

            <div className="oq-section">Interests <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10, color: '#8888a0' }}>(pick any)</span></div>
            <div className="oq-chips" style={{ marginBottom: 20 }}>
                {INTERESTS.map((tag, i) => (
                    <div key={i} className={`oq-chip${interests.has(i) ? ' on' : ''}`} onClick={() => setInterests(toggle(interests, i))}>
                        {tag}
                    </div>
                ))}
            </div>

            <div className="oq-field">
                <label className="oq-label">Short Bio <span style={{ fontWeight: 400, color: '#8888a0' }}>(optional)</span></label>
                <textarea className="oq-input oq-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us what you're passionate about, what kind of projects excite you, or what you're looking for in a teammate…" />
            </div>
        </div>
    );
}

/* ─────────────────────────── STEP 2 — PERSONALITY ─────────────────────────── */
function StepPersonality({ data, onChange }) {
    const [answers, setAnswers] = useState(data.answers || { q3: 2 });
    const [sliderVal, setSliderVal] = useState(data.sliderVal ?? 40);

    const handleSelect = useCallback((qId, val) => {
        setAnswers(prev => {
            const next = { ...prev, [qId]: val };
            onChange({ answers: next, sliderVal });
            return next;
        });
    }, [sliderVal, onChange]);

    const handleSlider = useCallback((val) => {
        setSliderVal(val);
        onChange({ answers, sliderVal: val });
    }, [answers, onChange]);

    useEffect(() => {
        onChange({ answers, sliderVal });
    }, []);

    const sliderIndex = Math.round((sliderVal / 100) * (SLIDER_LABELS.length - 1));
    const answered = Object.keys(answers).length;

    return (
        <div>
            <div className="oq-section">Social & Decision Style</div>
            {Q_PERSONALITY.map(q => <RadioQ key={q.id} q={q} selected={answers[q.id]} onSelect={handleSelect} />)}

            <ScaleQ q={Q_SCALE} selected={answers.q3 ?? 2} onSelect={handleSelect} />

            <div className="oq-divider" />
            <div className="oq-section">Work Habits</div>

            <div className="oq-q-card">
                <div className="oq-q-num">Question 04 · Planning Style</div>
                <div className="oq-q-text">When starting a new project, you tend to…</div>
                <div className="oq-slider-poles">
                    <span>🗂️ Plan everything first</span>
                    <span>⚡ Jump in & figure it out</span>
                </div>
                <input type="range" min="0" max="100" value={sliderVal} className="oq-slider" onChange={e => handleSlider(Number(e.target.value))} />
                <div className="oq-slider-badge"><span>{SLIDER_LABELS[sliderIndex]}</span></div>
            </div>

            {Q_WORK.map(q => <RadioQ key={q.id} q={q} selected={answers[q.id]} onSelect={handleSelect} />)}

            <div className="oq-divider" />
            <div className="oq-section">Communication & Role</div>
            {Q_COMM.map(q => <RadioQ key={q.id} q={q} selected={answers[q.id]} onSelect={handleSelect} />)}

            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(212,67,50,0.06)', borderRadius: 10, fontSize: 12, color: '#555566' }}>
                {answered} of 9 questions answered
            </div>
        </div>
    );
}

/* ─────────────────────────── STEP 3 — PREFERENCES ─────────────────────────── */
function StepPreferences({ data, onChange }) {
    const [skillsOffer, setSkillsOffer] = useState(data.skillsOffer || new Set());
    const [skillsSeek, setSkillsSeek] = useState(data.skillsSeek || new Set());
    const [goals, setGoals] = useState(data.goals || new Set());
    const [days, setDays] = useState(data.days || new Set([0, 1, 2, 4]));
    const [hours, setHours] = useState(data.hours || new Set([2]));
    const [projTags, setProjTags] = useState(data.projTags || new Set());
    const [teamSize, setTeamSize] = useState(data.teamSize ?? 1);
    const [commitVal, setCommitVal] = useState(data.commitVal ?? 35);
    const [matchType, setMatchType] = useState(data.matchType ?? 0);

    useEffect(() => {
        onChange({ skillsOffer, skillsSeek, goals, days, hours, projTags, teamSize, commitVal, matchType });
    }, [skillsOffer, skillsSeek, goals, days, hours, projTags, teamSize, commitVal, matchType]);

    const commitIndex = Math.round((commitVal / 100) * (COMMIT_LABELS.length - 1));

    return (
        <div>
            <div className="oq-section">Skills I Can Offer</div>
            <div className="oq-skill-grid" style={{ marginBottom: 6 }}>
                {SKILLS_OFFER.map((s, i) => (
                    <div key={i} className={`oq-skill-card${skillsOffer.has(i) ? ' on' : ''}`} onClick={() => setSkillsOffer(toggle(skillsOffer, i))}>
                        <span className="oq-skill-icon">{s.e}</span>
                        <div className="oq-skill-name">{s.n}</div>
                        <div className="oq-skill-check">✓</div>
                    </div>
                ))}
            </div>

            <div className="oq-section">Skills I'm Looking For in a Partner</div>
            <div className="oq-skill-grid" style={{ marginBottom: 6 }}>
                {SKILLS_SEEK.map((s, i) => (
                    <div key={i} className={`oq-skill-card${skillsSeek.has(i) ? ' on' : ''}`} onClick={() => setSkillsSeek(toggle(skillsSeek, i))}>
                        <span className="oq-skill-icon">{s.e}</span>
                        <div className="oq-skill-name">{s.n}</div>
                        <div className="oq-skill-check">✓</div>
                    </div>
                ))}
            </div>

            <div className="oq-divider" />

            <div className="oq-section">What I Want to Work On *</div>
            <div className="oq-goal-grid" style={{ marginBottom: 4 }}>
                {GOALS.map((g, i) => (
                    <div key={i} className={`oq-goal-card${goals.has(i) ? ' on' : ''}`} onClick={() => setGoals(toggle(goals, i))}>
                        <div className="oq-goal-icon">{g.e}</div>
                        <div>
                            <div className="oq-goal-title">{g.t}</div>
                            <div className="oq-goal-desc">{g.d}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="oq-divider" />

            <div className="oq-section">Days I'm Available</div>
            <div className="oq-days" style={{ marginBottom: 16 }}>
                {DAYS.map((d, i) => (
                    <div key={i} className={`oq-day${days.has(i) ? ' on' : ''}`} onClick={() => setDays(toggle(days, i))}>
                        <div className="oq-day-name">{d}</div>
                    </div>
                ))}
            </div>

            <div className="oq-section">Preferred Working Hours</div>
            <div className="oq-chips" style={{ marginBottom: 16 }}>
                {HOURS.map((h, i) => (
                    <div key={i} className={`oq-chip${hours.has(i) ? ' on' : ''}`} onClick={() => setHours(toggle(hours, i))}>
                        {h}
                    </div>
                ))}
            </div>

            <div className="oq-section">Project Type Preference</div>
            <div className="oq-chips" style={{ marginBottom: 16 }}>
                {PROJ_TAGS.map((t, i) => (
                    <div key={i} className={`oq-chip${projTags.has(i) ? ' on' : ''}`} onClick={() => setProjTags(toggle(projTags, i))}>
                        {t}
                    </div>
                ))}
            </div>

            <div className="oq-divider" />

            <div className="oq-section">Ideal Team Size</div>
            <div className="oq-team-row" style={{ marginBottom: 16 }}>
                {TEAM_SIZES.map((t, i) => (
                    <div key={i} className={`oq-team-opt${teamSize === i ? ' on' : ''}`} onClick={() => setTeamSize(i)}>
                        <div className="oq-team-num">{t.n}</div>
                        <div className="oq-team-label">{t.l}</div>
                    </div>
                ))}
            </div>

            <div className="oq-section">Weekly Time Commitment</div>
            <div style={{ background: 'rgba(255,255,255,0.65)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                <div className="oq-slider-poles">
                    <span>⏱️ 1–2 hrs/week</span>
                    <span>40+ hrs/week 🔥</span>
                </div>
                <input type="range" className="oq-slider" min="0" max="100" value={commitVal} onChange={e => setCommitVal(Number(e.target.value))} />
                <div className="oq-slider-badge"><span>{COMMIT_LABELS[commitIndex]}</span></div>
            </div>

            <div className="oq-section">I Want to Match With</div>
            <div className="oq-match-grid">
                {MATCH_TYPES.map((m, i) => (
                    <div key={i} className={`oq-match-card${matchType === i ? ' on' : ''}`} onClick={() => setMatchType(i)}>
                        <div className="oq-match-icon">{m.e}</div>
                        <div>
                            <div className="oq-match-title">{m.t}</div>
                            <div className="oq-match-desc">{m.d}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────── STEP 4 — COMPLETE ─────────────────────────── */
function StepComplete({ onFinish, submitting }) {
    return (
        <div className="oq-complete">
            <span className="oq-complete-icon">🎉</span>
            <h2 className="oq-complete-title">You're all set!</h2>
            <p className="oq-complete-sub">
                Your profile is ready. StudentConnect will now use your personality and preferences to find your perfect teammates. Here's what's waiting for you:
            </p>
            <div className="oq-feature-grid">
                {DASHBOARD_FEATURES.map((f, i) => (
                    <div key={i} className="oq-feature-card">
                        <div className="oq-feature-icon">{f.e}</div>
                        <div>
                            <div className="oq-feature-title">{f.t}</div>
                            <div className="oq-feature-desc">{f.d}</div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="oq-btn-finish" onClick={onFinish} disabled={submitting}>
                {submitting ? 'Setting up your profile…' : 'Go to Dashboard →'}
            </button>
        </div>
    );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
const STEP_LABELS = ['Profile', 'Personality', 'Preferences', 'Complete'];

export default function OnboardingQuestionnaire() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [profileData, setProfileData] = useState({});
    const [personalityData, setPersonalityData] = useState({});
    const [prefsData, setPrefsData] = useState({});

    const validate = () => {
        if (step === 0) {
            const { firstName, lastName, college, department, yearIndex } = profileData;
            if (!firstName?.trim()) return 'Please enter your first name.';
            if (!lastName?.trim()) return 'Please enter your last name.';
            if (!college?.trim()) return 'Please enter your college or university.';
            if (!department) return 'Please select your department.';
            if (yearIndex == null || yearIndex < 0) return 'Please select your year of study.';
        }
        if (step === 1) {
            const { answers } = personalityData;
            if (!answers) return 'Please answer the personality questions.';
            const required = ['q1', 'q2', 'q5', 'q6', 'q7', 'q8', 'q9'];
            for (const q of required) {
                if (answers[q] == null) return 'Please answer all personality questions.';
            }
        }
        if (step === 2) {
            if (!prefsData.goals || prefsData.goals.size === 0) return 'Please select at least one goal.';
        }
        return '';
    };

    const handleNext = () => {
        const err = validate();
        if (err) { setError(err); return; }
        setError('');
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setError('');
        setStep(s => s - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFinish = async () => {
        setSubmitting(true);
        setError('');
        try {
            // Build payload
            const { answers, sliderVal } = personalityData;
            const payload = {
                profile: {
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    college: profileData.college,
                    department: profileData.department,
                    year: profileData.yearIndex + 1,
                    year_label: YEARS[profileData.yearIndex]?.label,
                    github: profileData.github || '',
                    linkedin: profileData.linkedin || '',
                    interests: [...(profileData.interests || [])].map(i => INTERESTS[i]),
                    bio: profileData.bio || '',
                },
                personality: {
                    q1: answers?.q1 ?? 0,
                    q2: answers?.q2 ?? 0,
                    q3: answers?.q3 ?? 2,
                    q4: sliderVal ?? 40,
                    q5: answers?.q5 ?? 0,
                    q6: answers?.q6 ?? 0,
                    q7: answers?.q7 ?? 0,
                    q8: answers?.q8 ?? 0,
                    q9: answers?.q9 ?? 0,
                },
                preferences: {
                    skills_offer: [...(prefsData.skillsOffer || [])].map(i => SKILLS_OFFER[i]?.n),
                    skills_seek: [...(prefsData.skillsSeek || [])].map(i => SKILLS_SEEK[i]?.n),
                    goals: [...(prefsData.goals || [])].map(i => GOALS[i]?.t),
                    availability_days: [...(prefsData.days || [])].map(i => DAYS[i]),
                    availability_hours: [...(prefsData.hours || [])].map(i => HOURS[i]),
                    project_tags: [...(prefsData.projTags || [])].map(i => PROJ_TAGS[i]),
                    team_size: TEAM_SIZES[prefsData.teamSize ?? 1]?.n,
                    weekly_commitment: COMMIT_LABELS[Math.round(((prefsData.commitVal ?? 35) / 100) * (COMMIT_LABELS.length - 1))],
                    match_type: MATCH_TYPES[prefsData.matchType ?? 0]?.t,
                },
            };

            await submitQuestionnaire(payload);
            updateUser({ questionnaire_completed: true });
            navigate('/dashboard', { replace: true });
        } catch (e) {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    const progress = step === 3 ? 100 : Math.round(((step) / 3) * 100);

    return (
        <>
            <style>{CSS}</style>
            <div className="oq-root">
                <div className="oq-blob oq-blob-1" />
                <div className="oq-blob oq-blob-2" />
                <div className="oq-blob oq-blob-3" />

                <div className="oq-card">
                    {/* Brand */}
                    <div className="oq-brand">
                        <div className="oq-logo">SC</div>
                        <div>
                            <div className="oq-brand-name">StudentConnect</div>
                            <div className="oq-brand-sub">Find your perfect teammate</div>
                        </div>
                    </div>

                    {/* Step indicator */}
                    <div className="oq-steps">
                        {STEP_LABELS.map((label, i) => (
                            <React.Fragment key={i}>
                                <div className={`oq-step${step === i ? ' active' : step > i ? ' done' : ''}`}>
                                    <div className="oq-step-dot">{step > i ? '✓' : i + 1}</div>
                                    {label}
                                </div>
                                {i < STEP_LABELS.length - 1 && (
                                    <div className={`oq-step-line${step > i ? ' done' : ''}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="oq-progress-wrap">
                        <div className="oq-progress-info">
                            <span>
                                {step === 0 && 'Profile Setup'}
                                {step === 1 && 'Personality Questions'}
                                {step === 2 && 'Match Preferences'}
                                {step === 3 && 'All done!'}
                            </span>
                            <span>Step {step + 1} of 4</span>
                        </div>
                        <div className="oq-progress-bar">
                            <div className="oq-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {/* Page header */}
                    {step < 3 && (
                        <>
                            <h1 className="oq-title">
                                {step === 0 && 'Tell us about yourself 👋'}
                                {step === 1 && 'How do you work? 🧠'}
                                {step === 2 && 'Your Match Preferences ⚙️'}
                            </h1>
                            <p className="oq-subtitle">
                                {step === 0 && 'This helps us personalize your experience and find teammates who complement you perfectly.'}
                                {step === 1 && 'No right or wrong answers! Be honest — this helps us match you with people who truly complement your style.'}
                                {step === 2 && 'Tell us what you\'re looking for. The more specific you are, the better your matches will be!'}
                            </p>
                        </>
                    )}

                    {/* Error */}
                    {error && <div className="oq-error">⚠️ {error}</div>}

                    {/* Step content */}
                    {step === 0 && <StepProfile data={profileData} onChange={setProfileData} />}
                    {step === 1 && <StepPersonality data={personalityData} onChange={setPersonalityData} />}
                    {step === 2 && <StepPreferences data={prefsData} onChange={setPrefsData} />}
                    {step === 3 && <StepComplete onFinish={handleFinish} submitting={submitting} />}

                    {/* Footer navigation */}
                    {step < 3 && (
                        <div className="oq-footer">
                            <button className="oq-btn-back" onClick={handleBack} disabled={step === 0} style={{ opacity: step === 0 ? 0.3 : 1 }}>
                                ← Back
                            </button>
                            <div className="oq-step-count">Step <b>{step + 1}</b> of 4</div>
                            <button className="oq-btn-next" onClick={handleNext}>
                                {step === 2 ? '🎯 Finish Setup →' : 'Next →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
