import { questionsOf } from './engine.js';
const KEY = 'study-stage-v1';
export const freshSave = () => ({ version: 1, sound: true, runs: {}, history: {}, introsSeen: [] });
export function readSave(topics, storage) {
  try {
    storage ||= globalThis.localStorage;
    const raw = JSON.parse(storage.getItem(KEY));
    if (raw?.version !== 1) return freshSave();
    const clean = freshSave();
    clean.sound = typeof raw.sound === 'boolean' ? raw.sound : true;
    clean.introsSeen = Array.isArray(raw.introsSeen) ? raw.introsSeen.filter(id => topics.some(t => t.topic === id)) : [];
    for (const topic of topics) {
      const ids = new Set(questionsOf(topic).map(q => q.id));
      const run = raw.runs?.[topic.topic];
      if (run?.topicId === topic.topic && typeof run.id === 'string' && Array.isArray(run.grades)) {
        const seen = new Set();
        const grades = run.grades.filter(g => {
          if (!g || !ids.has(g.questionId) || seen.has(g.questionId) || typeof g.correct !== 'boolean') return false;
          seen.add(g.questionId); return true;
        }).map(g => ({ questionId: g.questionId, correct: g.correct }));
        clean.runs[topic.topic] = { id: run.id, topicId: topic.topic, grades, updatedAt: Number(run.updatedAt) || 0 };
      }
      clean.history[topic.topic] = Array.isArray(raw.history?.[topic.topic]) ? raw.history[topic.topic].filter(h => h && typeof h.id === 'string' && Number.isFinite(h.score) && h.score >= 0 && h.score <= 7500 && Number.isFinite(h.accuracy) && h.accuracy >= 0 && h.accuracy <= 100).slice(-50) : [];
    }
    return clean;
  } catch { return freshSave(); }
}
export function writeSave(save, storage) {
  try { (storage || globalThis.localStorage).setItem(KEY, JSON.stringify(save)); return true; } catch { return false; }
}
export function recordCompletion(save, topic, run, summary) {
  const history = (save.history[topic.topic] || []).filter(item => item.id !== run.id);
  if (summary.complete) history.push({ id: run.id, score: summary.score, accuracy: summary.accuracy, completedAt: Date.now() });
  save.history[topic.topic] = history.slice(-50);
}
