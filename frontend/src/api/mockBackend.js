// In-browser mock of the Django API for the static GitHub Pages demo.
// Activated only when VITE_DEMO_MODE === 'true' (see api/client.js).
const KEY = 'nacc_demo_db_v3';

const mkUser = (id, email, first, last, role, role_name) => ({
  id, email, username: email.split('@')[0], first_name: first, last_name: last,
  middle_initial: '', contact_details: '', role, role_name,
  fullname: `${first} ${last}`, status: 'active',
});
const q = (id, text, type, options = [], order = 1, concern_direction = 'higher', concern_options = []) => ({ id, question_text: text, question_type: type, options, order, concern_direction, concern_options });

function seed() {
  const roles = [
    { id: 1, role_name: 'Administrator' },
    { id: 2, role_name: 'Psychologist' },
    { id: 3, role_name: 'Staff' },
  ];
  const users = [
    mkUser(1, 'admin@racco1.gov.ph', 'System', 'Administrator', 1, 'Administrator'),
    mkUser(2, 'psy@racco1.gov.ph', 'Maria', 'Cruz', 2, 'Psychologist'),
    mkUser(3, 'staff@racco1.gov.ph', 'Jose', 'Ramos', 3, 'Staff'),
  ];
  const guardians = [
    { id: 11, fullname: 'Rosario Dela Cruz', gender: 'Female', case_type: 'Foster Care', status: 'active', birth_date: '', address: 'Bauang, La Union' },
    { id: 12, fullname: 'Teresita Mendoza', gender: 'Female', case_type: 'Kinship Care', status: 'active', birth_date: '', address: 'San Fernando, La Union' },
    { id: 13, fullname: 'Elena Aquino', gender: 'Female', case_type: 'Foster Care', status: 'active', birth_date: '', address: 'Agoo, La Union' },
  ];
  const child = (id, fullname, gender, case_type, guardian, birth_date) => ({ id, fullname, gender, case_type, guardian, status: 'active', birth_date, address: 'La Union' });
  const children = [
    child(21, 'Andres B. Lopez', 'Male', 'Residential', null, '2014-03-02'),
    child(22, 'Gabriel T. Mendoza', 'Male', 'Kinship Care', 12, '2016-07-11'),
    child(23, 'Juan Miguel Dela Cruz', 'Male', 'Foster Care', 11, '2016-01-20'),
    child(24, 'Maria Clara Santos', 'Female', 'Adoption', null, '2019-05-09'),
    child(25, 'Paolo Pasco', 'Male', 'Foster Care', null, '2003-11-01'),
    child(26, 'Sofia Reyes Aquino', 'Female', 'Foster Care', 13, '2019-02-14'),
  ];
  const questionnaires = [
    { id: 31, title: 'Child Wellbeing Check', age_group: '5-8', description: 'General wellbeing screen.', status: 'active', questions: [
      q(101, 'The child is calm during sessions.', 'rating_scale', [], 1, 'lower'),
      q(102, 'Does the child sleep well?', 'yes_no', [], 2, 'lower'),
      q(103, 'The child interacts with peers.', 'rating_scale', [], 3, 'lower'),
    ] },
    { id: 32, title: 'Emotional Check-in', age_group: '5-8', description: 'How the child feels.', status: 'active', questions: [
      q(111, 'How are you feeling today?', 'rating_scale', [], 1, 'lower'),
      q(112, 'Which best describes your mood?', 'emotion', ['Happy', 'Sad', 'Scared', 'Angry', 'Calm'], 2, 'higher', ['Sad', 'Scared', 'Angry']),
      q(113, 'Did you feel safe this week?', 'yes_no', [], 3, 'lower'),
    ] },
  ];
  const activity = [
    { id: 41, actor_label: 'System Administrator', action: 'created', category: 'user', entity_type: 'User', entity_label: 'Maria Cruz', entity_id: 2, created_at: new Date(Date.now() - 3600e3).toISOString() },
    { id: 42, actor_label: 'Maria Cruz', action: 'login', category: 'security', entity_type: '', entity_label: '', entity_id: null, created_at: new Date(Date.now() - 1800e3).toISOString() },
  ];
  return { seq: 1000, roles, users, guardians, children, questionnaires, assessments: [], activity,
           settings: { min_confidence_threshold: 80, require_override_on_low_confidence: true } };
}

let db = load();
function load() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) { /* reseed */ }
  const d = seed();
  localStorage.setItem(KEY, JSON.stringify(d));
  return d;
}
function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
function nextId() { db.seq += 1; return db.seq; }
export function resetDemo() { localStorage.removeItem(KEY); db = load(); }

let actor = null;
function userFromConfig(config) {
  const auth = config.headers?.Authorization || config.headers?.common?.Authorization || '';
  const m = /demo\.(\d+)/.exec(auth);
  return m ? db.users.find((u) => u.id === Number(m[1])) : null;
}
function logActivity(action, category, entity_type, entity_label, entity_id) {
  db.activity.unshift({
    id: nextId(), actor_label: actor?.fullname || 'System', action, category,
    entity_type, entity_label: entity_label || '', entity_id: entity_id ?? null,
    created_at: new Date().toISOString(),
  });
}

// Mirrors backend assessments/analysis (scoring.py + recommendations.py) for the demo.
function concernFor(question, answer) {
  answer = (answer || '').trim();
  const t = question.question_type;
  if (t === 'rating_scale') {
    const v = parseInt(answer, 10);
    if (Number.isNaN(v) || v < 1 || v > 5) return null;
    return question.concern_direction !== 'lower' ? (v - 1) / 4 : (5 - v) / 4;
  }
  if (t === 'yes_no') {
    const ca = question.concern_direction !== 'lower' ? 'yes' : 'no';
    return answer.toLowerCase() === ca ? 1 : 0;
  }
  if (t === 'multiple_choice' || t === 'emotion') {
    const opts = question.concern_options || [];
    if (!opts.length) return null;
    return opts.includes(answer) ? 1 : 0;
  }
  return null;
}
function scoreQ(questionnaire, responses) {
  const qmap = {};
  (questionnaire.questions || []).forEach((qq) => { qmap[qq.id] = qq; });
  const items = [];
  (responses || []).forEach((r) => {
    const qq = qmap[Number(r.question)];
    if (!qq) return;
    const c = concernFor(qq, String(r.answer == null ? '' : r.answer));
    if (c == null) return;
    items.push([qq, c]);
  });
  const total = (questionnaire.questions || []).length;
  if (!items.length) return { behavioral_score: null, classification: 'Needs Monitoring', scored_count: 0, total_count: total, top_concerns: [], confidence: 0 };
  const score = Math.round((items.reduce((s, [, c]) => s + c, 0) / items.length) * 100 * 100) / 100;
  const classification = score < 34 ? 'Normal' : score < 67 ? 'Needs Monitoring' : 'Needs Counseling Attention';
  const top = items.filter(([, c]) => c >= 0.5).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([qq]) => qq.question_text);
  const coverage = total ? items.length / total : 0;
  return { behavioral_score: score, classification, scored_count: items.length, total_count: total, top_concerns: top, confidence: confidenceFor(coverage, score) };
}
const BOUNDARY_LOW = 34, BOUNDARY_HIGH = 67, BOUNDARY_MARGIN = 15, W_COV = 0.5, W_DEC = 0.5;
function confidenceFor(coverage, behavioral) {
  if (behavioral == null) return 0;
  const margin = Math.min(Math.abs(behavioral - BOUNDARY_LOW), Math.abs(behavioral - BOUNDARY_HIGH));
  const decisiveness = Math.min(margin / BOUNDARY_MARGIN, 1);
  return Math.round(100 * (W_COV * coverage + W_DEC * decisiveness));
}
const REC_TEMPLATES = {
  'Normal': ['Low', 'The child appears to be adjusting well; responses show no significant behavioral concerns.', 'continue routine periodic check-ins'],
  'Needs Monitoring': ['Medium', 'Some responses indicate mild-to-moderate behavioral concerns{focus}.', 'increase observation, schedule a follow-up within 4 weeks, and introduce light supportive measures'],
  'Needs Counseling Attention': ['High', 'Responses indicate notable behavioral concerns requiring attention{focus}.', 'arrange focused counseling support, coordinate with the house parent or guardian, and reassess within 1-2 weeks'],
};
function recommend(result) {
  const [priority, summary, actions] = REC_TEMPLATES[result.classification] || REC_TEMPLATES['Needs Monitoring'];
  const top = result.top_concerns || [];
  const focus = top.length ? `, notably around: ${top.join('; ')}` : '';
  const text = `${summary.replace('{focus}', focus)} Suggested actions: ${actions}. This is decision support, not a diagnosis; the final determination rests with the licensed professional.`;
  return { recommendation_text: text, priority_level: priority };
}

const ok = (data, status = 200) => ({ data, status });
const childOut = (c) => ({ ...c, guardian_name: db.guardians.find((g) => g.id === c.guardian)?.fullname || null });

function handle(method, url, body, config) {
  const id = (re) => { const m = re.exec(url); return m ? Number(m[1]) : null; };

  // --- auth ---
  if (url === '/auth/login/' && method === 'post') {
    const u = db.users.find((x) => x.email === body.email && x.status === 'active');
    if (!u) return ok({ detail: 'No active account found with the given credentials.' }, 401);
    actor = u; logActivity('login', 'security', '', '', null); save();
    return ok({ access: `demo.${u.id}`, refresh: 'demo', user: u });
  }
  if (url === '/auth/me/' && method === 'get') return actor ? ok(actor) : ok({ detail: 'Unauthorized' }, 401);

  // --- roles / users ---
  if (url === '/roles/') return ok(db.roles);
  if (url === '/users/' && method === 'get') return ok(db.users.filter((u) => u.status !== 'archived'));
  if (url === '/users/' && method === 'post') {
    const u = mkUser(nextId(), body.email, body.first_name || '', body.last_name || '', Number(body.role) || null, db.roles.find((r) => r.id === Number(body.role))?.role_name);
    Object.assign(u, { username: body.username || u.username, middle_initial: body.middle_initial || '', contact_details: body.contact_details || '' });
    db.users.push(u); logActivity('created', 'user', 'User', u.fullname || u.email, u.id); save();
    return ok(u, 201);
  }
  if (/^\/users\/(\d+)\/$/.test(url) && method === 'put') {
    const u = db.users.find((x) => x.id === id(/^\/users\/(\d+)\//));
    if (u) { Object.assign(u, body, { role: Number(body.role) || u.role, role_name: db.roles.find((r) => r.id === Number(body.role))?.role_name || u.role_name }); u.fullname = `${u.first_name} ${u.last_name}`.trim(); logActivity('updated', 'user', 'User', u.fullname, u.id); save(); }
    return ok(u);
  }
  if (/^\/users\/(\d+)\/archive\/$/.test(url)) {
    const u = db.users.find((x) => x.id === id(/^\/users\/(\d+)\//));
    if (u) { u.status = 'archived'; logActivity('archived', 'user', 'User', u.fullname, u.id); save(); }
    return ok({ status: 'archived' });
  }

  // --- children / guardians ---
  if (url === '/guardians/' && method === 'get') return ok(db.guardians.filter((g) => g.status !== 'archived'));
  if (url === '/children/' && method === 'get') return ok(db.children.filter((c) => c.status !== 'archived').map(childOut));
  if (url === '/children/' && method === 'post') {
    const c = { id: nextId(), status: 'active', ...body, guardian: body.guardian || null };
    db.children.push(c); logActivity('created', 'record', 'Child', c.fullname, c.id); save();
    return ok(childOut(c), 201);
  }
  if (/^\/children\/(\d+)\/$/.test(url) && method === 'put') {
    const c = db.children.find((x) => x.id === id(/^\/children\/(\d+)\//));
    if (c) { Object.assign(c, body, { guardian: body.guardian || null }); logActivity('updated', 'record', 'Child', c.fullname, c.id); save(); }
    return ok(childOut(c));
  }
  if (/^\/children\/(\d+)\/archive\/$/.test(url)) {
    const c = db.children.find((x) => x.id === id(/^\/children\/(\d+)\//));
    if (c) { c.status = 'archived'; logActivity('archived', 'record', 'Child', c.fullname, c.id); save(); }
    return ok({ status: 'archived' });
  }

  // --- questionnaires ---
  if (url === '/questionnaires/' && method === 'get') return ok(db.questionnaires.filter((x) => x.status !== 'archived'));
  if (url === '/active-questionnaires/') return ok(db.questionnaires.filter((x) => x.status === 'active'));
  if (url === '/questionnaires/extract/' && method === 'post') {
    return ok({ title: 'Behavioral Adjustment Checklist', age_group: '', questions: [
      { question_text: 'The child shows signs of distress.', question_type: 'rating_scale', options: [], order: 1 },
      { question_text: 'Does the child have trouble sleeping?', question_type: 'yes_no', options: [], order: 2 },
      { question_text: 'The child avoids talking about home.', question_type: 'rating_scale', options: [], order: 3 },
      { question_text: 'The child interacts well with peers.', question_type: 'rating_scale', options: [], order: 4 },
    ] });
  }
  if (/^\/questionnaires\/(\d+)\/$/.test(url) && method === 'get') return ok(db.questionnaires.find((x) => x.id === id(/^\/questionnaires\/(\d+)\//)));
  const writeQuestions = (qs) => (qs || []).map((qq, i) => ({ id: nextId(), question_text: qq.question_text, question_type: qq.question_type, options: qq.options || [], order: qq.order || i + 1 }));
  if (url === '/questionnaires/' && method === 'post') {
    const item = { id: nextId(), title: body.title, age_group: body.age_group || '', description: body.description || '', status: body.status || 'draft', questions: writeQuestions(body.questions) };
    db.questionnaires.unshift(item); logActivity('created', 'record', 'Questionnaire', item.title, item.id); save();
    return ok(item, 201);
  }
  if (/^\/questionnaires\/(\d+)\/$/.test(url) && method === 'put') {
    const item = db.questionnaires.find((x) => x.id === id(/^\/questionnaires\/(\d+)\//));
    if (item) { Object.assign(item, { title: body.title, age_group: body.age_group || '', description: body.description || '', status: body.status || item.status, questions: writeQuestions(body.questions) }); logActivity('updated', 'record', 'Questionnaire', item.title, item.id); save(); }
    return ok(item);
  }
  if (/^\/questionnaires\/(\d+)\/archive\/$/.test(url)) {
    const item = db.questionnaires.find((x) => x.id === id(/^\/questionnaires\/(\d+)\//));
    if (item) { item.status = 'archived'; logActivity('archived', 'record', 'Questionnaire', item.title, item.id); save(); }
    return ok({ status: 'archived' });
  }

  // --- assessments / activity ---
  if (url === '/analysis-settings/' && method === 'get') return ok(db.settings);
  if (url === '/analysis-settings/' && method === 'put') {
    if (!actor || actor.role_name !== 'Administrator') return ok({ detail: 'Admin only' }, 403);
    db.settings = { min_confidence_threshold: Number(body.min_confidence_threshold), require_override_on_low_confidence: !!body.require_override_on_low_confidence };
    save();
    return ok(db.settings);
  }
  if (url === '/assessments/analyze/' && method === 'post') {
    const qn = db.questionnaires.find((x) => x.id === Number(body.questionnaire));
    const result = scoreQ(qn || { questions: [] }, body.responses || []);
    const flagged = db.settings.require_override_on_low_confidence && result.confidence < db.settings.min_confidence_threshold;
    return ok({ ...result, ...recommend(result), min_confidence_threshold: db.settings.min_confidence_threshold, require_override: db.settings.require_override_on_low_confidence, flagged });
  }
  if (url === '/assessments/' && method === 'post') {
    const qn = db.questionnaires.find((x) => x.id === Number(body.questionnaire));
    const c = db.children.find((x) => x.id === Number(body.child));
    const result = scoreQ(qn || { questions: [] }, body.responses || []);
    const rec = recommend(result);
    const flagged = db.settings.require_override_on_low_confidence && result.confidence < db.settings.min_confidence_threshold;
    if (flagged && !body.override_acknowledged) {
      return ok({ detail: 'Below confidence threshold; override required.', code: 'override_required', confidence: result.confidence, threshold: db.settings.min_confidence_threshold }, 400);
    }
    const a = {
      id: nextId(), child: body.child, child_name: c?.fullname || '', child_case_type: c?.case_type || '',
      questionnaire: body.questionnaire, questionnaire_title: qn?.title || '', assessment_type: body.assessment_type || '',
      classification: body.classification || '', notes: body.notes || '', respondent_mode: body.respondent_mode || 'staff',
      psychologist: actor?.id, psychologist_name: actor?.fullname || '', status: 'completed',
      assessment_date: new Date().toISOString().slice(0, 10),
      result: { behavioral_score: result.behavioral_score, classification: result.classification, generated_date: new Date().toISOString(), priority_level: rec.priority_level, recommendation_text: rec.recommendation_text, confidence: result.confidence, overridden: flagged },
    };
    db.assessments.unshift(a);
    logActivity('created', 'record', 'Assessment', c?.fullname || 'child', a.id);
    save();
    return ok(a, 201);
  }
  if (url === '/assessments/' && method === 'get') {
    let list = db.assessments;
    if (actor && actor.role_name === 'Psychologist') list = list.filter((a) => a.psychologist === actor.id);
    return ok(list);
  }
  if (url.startsWith('/activity/') && method === 'get') {
    const cat = config.params?.category;
    let list = db.activity;
    if (cat) list = list.filter((e) => e.category === cat);
    return ok(list.slice(0, 50));
  }

  return ok({ detail: 'Not found (demo)' }, 404);
}

export function mockAdapter(config) {
  actor = userFromConfig(config) || actor;
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').split('?')[0];
  let body = {};
  if (config.data && typeof config.data === 'string') { try { body = JSON.parse(config.data); } catch (e) { body = {}; } }
  const wait = url === '/questionnaires/extract/' ? 600 : 120;
  return new Promise((resolve) => {
    setTimeout(() => {
      const r = handle(method, url, body, config);
      resolve({ data: r.data, status: r.status, statusText: 'OK', headers: {}, config, request: {} });
    }, wait);
  });
}
