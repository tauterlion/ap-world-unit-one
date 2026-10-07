export const VALUES = [100, 200, 300, 400, 500];
export const questionsOf = topic => topic.categories.flatMap(category => category.questions);
export function createRun(topicId, id = globalThis.crypto.randomUUID()) {
  return { id, topicId, grades: [], updatedAt: Date.now() };
}
export function grade(run, question, correct) {
  if (typeof correct !== 'boolean') throw new Error('A grade must be correct or incorrect.');
  if (run.grades.some(result => result.questionId === question.id)) return run;
  return { ...run, updatedAt: Date.now(), grades: [...run.grades, { questionId: question.id, correct }] };
}
export function undo(run) {
  return { ...run, updatedAt: Date.now(), grades: run.grades.slice(0, -1) };
}
export function summarize(topic, run) {
  const questions = questionsOf(topic);
  const valid = new Map(questions.map(q => [q.id, q]));
  const results = new Map(run.grades.filter(g => valid.has(g.questionId)).map(g => [g.questionId, g.correct]));
  const answered = results.size;
  const correct = [...results.values()].filter(Boolean).length;
  const score = [...results].reduce((sum, [id, right]) => sum + (right ? valid.get(id).value : 0), 0);
  const categories = topic.categories.map(category => {
    const done = category.questions.filter(q => results.has(q.id));
    const right = done.filter(q => results.get(q.id)).length;
    return { name: category.name, correct: right, answered: done.length, accuracy: done.length ? Math.round(right / done.length * 100) : 0 };
  });
  return { score, correct, incorrect: answered - correct, answered, accuracy: answered ? Math.round(correct / answered * 100) : 0,
    complete: answered === questions.length, categories,
    missed: questions.filter(q => results.has(q.id) && !results.get(q.id)),
    strongest: categories.filter(c => c.answered && c.accuracy === Math.max(...categories.map(c => c.accuracy))).map(c => c.name),
    weakest: categories.filter(c => c.answered && c.accuracy === Math.min(...categories.filter(c => c.answered).map(c => c.accuracy))).map(c => c.name) };
}
export function validateTopic(topic) {
  if (!topic.topic || !topic.title || topic.categories?.length !== 5) throw new Error('A board requires five categories.');
  const ids = new Set();
  for (const category of topic.categories) {
    if (!category.name || category.questions.length !== 5) throw new Error('A category requires five questions.');
    category.questions.forEach((q, index) => {
      if (!q.id || ids.has(q.id) || q.value !== VALUES[index] || q.category !== category.name || !q.prompt || !q.answer || !q.explanation || !q.source?.printedPages?.length) throw new Error(`Invalid question: ${q.id}`);
      if (q.stimulus && !['text', 'table', 'image', 'map'].includes(q.stimulus.type)) throw new Error(`Invalid stimulus: ${q.id}`);
      if (q.stimulus?.type === 'text' && !q.stimulus.content) throw new Error(`Missing stimulus text: ${q.id}`);
      if (['image','map'].includes(q.stimulus?.type) && (!q.stimulus.src || !q.stimulus.alt)) throw new Error(`Missing image or alt text: ${q.id}`);
      if (q.stimulus?.type === 'table' && (!q.stimulus.headers?.length || !q.stimulus.rows?.length || q.stimulus.rows.some(row => row.length !== q.stimulus.headers.length))) throw new Error(`Malformed stimulus table: ${q.id}`);
      ids.add(q.id);
    });
  }
  return topic;
}
