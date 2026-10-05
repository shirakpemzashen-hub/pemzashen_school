import fs from 'fs';

// Page-level labels from data.ts (exact Armenian titles)
const pageLabels = {
  staffLeadership:       "Տնօրինություն",
  staffTeachers:         "Ուusuцchakan казм",
  staffQualification:    "Которакавиром",
  staffResearch:         "Гитакан горdzенdrутюн",
  resourcesClassrooms:   "Дасасенjакнер",
  resourcesLaboratories: "Лабораторianер",
  resourcesComputerRoom: "Хамакарgчайін сенjак",
  resourcesGym:          "Марzадахліж",
  resourcesMedicalRoom:  "Буzhкет",
  resourcesCafeteria:    "Чашаран",
  studentsAdvanced:      "Аrаджадем ашакертнер",
  studentsAwardWinners:  "Мрканакакирнер",
  studentsAlumni:        "Нщанавор шрджанавартнер",
  creativityLiterature:  "Грakan ашхатанкнер",
  creativityDrawing:     "Нкарджутюн",
  creativityPhotography: "Лусанкарчутюн",
  creativityHandmade:    "Dzерqи ашхатанкнер",
  competitionsOlympiads: "Олimpiаданер",
  competitionsEssays:    "Шарадрутjуннери мрцуjт",
  competitionsQuizzes:   "Виктоjаjнанер",
};

// Read the actual section/page titles from data.ts by running a small eval
// Since data.ts is TS, we'll extract titles via regex
const dataTs = fs.readFileSync('app/data.ts', 'utf8');
function extractTitle(afterSlug) {
  const re = new RegExp(`slug:\\s*"${afterSlug}",[\\s\\S]*?title:\\s*"([^"]+)"`);
  const m = dataTs.match(re);
  return m ? m[1] : null;
}

const staffTitle       = extractTitle('staff') || 'Անձнакаzм';
const resourcesTitle   = extractTitle('resources') || 'Шenk і ресурснер';
const studentsTitle    = extractTitle('students') || 'Ашакертнер';
const creativityTitle  = extractTitle('creativity') || 'Стегdzagortsаваthунер';
const competitionsTitle= extractTitle('competitions') || 'Мрцуjтнер';

// leadership slug appears in staff section, so extract properly
const staffLeadershipTitle = extractTitle('leadership') || 'Тнorrenututyun';
const staffTeachersTitle   = extractTitle('teachers') || 'Ousouцchain казм';
const staffQualTitle       = extractTitle('qualification') || 'Которакавиром';
const staffResearchTitle   = extractTitle('research') || 'Гитакан горdzенdrутюн';
const classroomsTitle      = extractTitle('classrooms') || 'Дасасенjакнер';
const labTitle             = extractTitle('laboratories') || 'Лабораторianер';
const compRoomTitle        = extractTitle('computer-room') || 'Хамакарgчайін сенjак';
const gymTitle             = extractTitle('gym') || 'Марzадахліж';
const medTitle             = extractTitle('medical-room') || 'Буzhкет';
const cafTitle             = extractTitle('cafeteria') || 'Чашаран';
const advancedTitle        = extractTitle('advanced') || 'Аrаджадем ашакертнер';
const awardTitle           = extractTitle('award-winners') || 'Мрканакакирнер';
const alumniTitle          = extractTitle('alumni') || 'Нщанавор шрджанавартнер';
const literatureTitle      = extractTitle('literature') || 'Грakan ашхатанкнер';
const drawingTitle         = extractTitle('drawing') || 'Нкарджутюн';
const photoTitle           = extractTitle('photography') || 'Лусанкарчутюн';
const handmadeTitle        = extractTitle('handmade') || 'Dzерqи ашхатанкнер';
const olympiadsTitle       = extractTitle('olympiads') || 'Олimpiаданер';
const essaysTitle          = extractTitle('essays') || 'Шарадрутjуннери мрцуjт';
const quizzesTitle         = extractTitle('quizzes') || 'Виктоjаjнанер';

const hyAdditions = {
  staff: staffTitle,
  staffLeadership: staffLeadershipTitle,
  staffTeachers: staffTeachersTitle,
  staffQualification: staffQualTitle,
  staffResearch: staffResearchTitle,
  resources: resourcesTitle,
  resourcesClassrooms: classroomsTitle,
  resourcesLaboratories: labTitle,
  resourcesComputerRoom: compRoomTitle,
  resourcesGym: gymTitle,
  resourcesMedicalRoom: medTitle,
  resourcesCafeteria: cafTitle,
  students: studentsTitle,
  studentsAdvanced: advancedTitle,
  studentsAwardWinners: awardTitle,
  studentsAlumni: alumniTitle,
  creativity: creativityTitle,
  creativityLiterature: literatureTitle,
  creativityDrawing: drawingTitle,
  creativityPhotography: photoTitle,
  creativityHandmade: handmadeTitle,
  competitions: competitionsTitle,
  competitionsOlympiads: olympiadsTitle,
  competitionsEssays: essaysTitle,
  competitionsQuizzes: quizzesTitle,
};

// Russian translations
const ruAdditions = {
  staff: "Персонал",
  staffLeadership: "Руководство",
  staffTeachers: "Педагогический состав",
  staffQualification: "Квалификация",
  staffResearch: "Научная деятельность",
  resources: "Здание и ресурсы",
  resourcesClassrooms: "Классные комнаты",
  resourcesLaboratories: "Лаборатории",
  resourcesComputerRoom: "Компьютерный класс",
  resourcesGym: "Спортивный зал",
  resourcesMedicalRoom: "Медицинский кабинет",
  resourcesCafeteria: "Столовая",
  students: "Ученики",
  studentsAdvanced: "Отличники",
  studentsAwardWinners: "Призёры",
  studentsAlumni: "Известные выпускники",
  creativity: "Творчество",
  creativityLiterature: "Литературные работы",
  creativityDrawing: "Рисование",
  creativityPhotography: "Фотография",
  creativityHandmade: "Поделки",
  competitions: "Конкурсы",
  competitionsOlympiads: "Олимпиады",
  competitionsEssays: "Конкурсы сочинений",
  competitionsQuizzes: "Викторины",
};

// English translations
const enAdditions = {
  staff: "Staff",
  staffLeadership: "Leadership",
  staffTeachers: "Teaching Staff",
  staffQualification: "Qualification",
  staffResearch: "Research Activities",
  resources: "Building & Resources",
  resourcesClassrooms: "Classrooms",
  resourcesLaboratories: "Laboratories",
  resourcesComputerRoom: "Computer Room",
  resourcesGym: "Gym",
  resourcesMedicalRoom: "Medical Room",
  resourcesCafeteria: "Cafeteria",
  students: "Students",
  studentsAdvanced: "Advanced Students",
  studentsAwardWinners: "Award Winners",
  studentsAlumni: "Notable Alumni",
  creativity: "Creativity",
  creativityLiterature: "Literary Works",
  creativityDrawing: "Drawing",
  creativityPhotography: "Photography",
  creativityHandmade: "Handmade Works",
  competitions: "Competitions",
  competitionsOlympiads: "Olympiads",
  competitionsEssays: "Essay Competitions",
  competitionsQuizzes: "Quizzes",
};

function addNavKeys(filePath, additions) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check if keys already added
  if (data.nav.staff) {
    process.stdout.write(`${filePath}: keys already present, skipping.\n`);
    return;
  }

  // Insert after councilsMethodological, before learning
  const nav = data.nav;
  const keys = Object.keys(nav);
  const insertAfterCouncils = keys.indexOf('councilsMethodological');
  const insertAfterEvents = keys.indexOf('eventsEvents');

  // Rebuild nav with insertions
  const newNav = {};
  for (let i = 0; i <= insertAfterCouncils; i++) {
    newNav[keys[i]] = nav[keys[i]];
  }
  // Insert staff + resources after councils
  for (const key of ['staff','staffLeadership','staffTeachers','staffQualification','staffResearch',
    'resources','resourcesClassrooms','resourcesLaboratories','resourcesComputerRoom',
    'resourcesGym','resourcesMedicalRoom','resourcesCafeteria']) {
    newNav[key] = additions[key];
  }
  // Continue: learning through eventsEvents
  for (let i = insertAfterCouncils + 1; i <= insertAfterEvents; i++) {
    newNav[keys[i]] = nav[keys[i]];
  }
  // Insert students, creativity, competitions after events
  for (const key of ['students','studentsAdvanced','studentsAwardWinners','studentsAlumni',
    'creativity','creativityLiterature','creativityDrawing','creativityPhotography','creativityHandmade',
    'competitions','competitionsOlympiads','competitionsEssays','competitionsQuizzes']) {
    newNav[key] = additions[key];
  }
  // Remaining keys (contact, contactFeedback, contactMap)
  for (let i = insertAfterEvents + 1; i < keys.length; i++) {
    newNav[keys[i]] = nav[keys[i]];
  }

  data.nav = newNav;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  process.stdout.write(`${filePath}: updated.\n`);
}

addNavKeys('messages/hy.json', hyAdditions);
addNavKeys('messages/ru.json', ruAdditions);
addNavKeys('messages/en.json', enAdditions);

process.stdout.write('Done.\n');
