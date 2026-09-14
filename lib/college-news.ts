export const COLLEGE_NEWS_TOPICS = {
  admissions: {
    category: 'admission',
    label: 'College Admissions',
    title: 'Nepal College Admissions 2026: Open Forms and Deadlines',
    description: 'Verified +2 and Bachelor admission announcements from Nepal colleges, with deadlines, eligibility reminders and direct official sources.',
    answer: 'This page tracks admission announcements published by verified Nepal college websites. Always confirm the final deadline, fee, eligibility and required documents on the linked official source before applying.',
  },
  'entrance-results': {
    category: 'entrance_result',
    label: 'Entrance Results',
    title: 'Nepal College Entrance Results, IOE and IOM Updates',
    description: 'Nepal college entrance results, merit-list updates and IOE/IOM student achievement reports with source links.',
    answer: 'Entrance result and rank claims remain under editorial review until the original result notice or institution evidence supports the student name, rank, programme and year.',
  },
  scholarships: {
    category: 'scholarship',
    label: 'College Scholarships',
    title: 'Nepal College Scholarships for +2 and Bachelor Students',
    description: 'Current scholarship announcements from Nepal colleges with eligibility reminders and links to the original application source.',
    answer: 'Scholarship amounts and conditions can change. SikshyaNepal links each summary to its source so students can verify coverage, eligibility, documents and the deadline before applying.',
  },
  events: {
    category: 'event',
    label: 'Campus Events',
    title: 'Nepal College Hackathons, Competitions and Campus Events',
    description: 'Discover verified hackathons, workshops, competitions and student events happening at colleges across Nepal.',
    answer: 'This page collects student opportunities announced by verified college websites. Check the linked college notice for registration rules, venue, date and participation costs.',
  },
  achievements: {
    category: 'achievement',
    label: 'College Achievements',
    title: 'Verified Nepal College Awards and Student Achievements',
    description: 'Evidence-backed college awards, competition wins, entrance ranks and academic achievements from Nepal.',
    answer: 'Awards, ranks, results and placement statistics are not automatically published. An editor must verify the exact claim against primary evidence before it appears here.',
  },
} as const

export type CollegeNewsTopic = keyof typeof COLLEGE_NEWS_TOPICS

export function isCollegeNewsTopic(value: string): value is CollegeNewsTopic {
  return value in COLLEGE_NEWS_TOPICS
}
